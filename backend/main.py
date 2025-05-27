# Importaciones necesarias
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Location, Weather
from datetime import date, timedelta
import requests
from fastapi.middleware.cors import CORSMiddleware



# Crear la instancia de la aplicación FastAPI
app = FastAPI()

# Configuración del middleware CORS para permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las URLs
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los headers
)

# Función para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Cierra la sesión después de usarla

# Función para obtener datos del clima desde la API de Open-Meteo
def get_weather_from_openmeteo(lat, lon):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&hourly=temperature_2m,weathercode&"
        f"daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=7&forecast_days=7"
    )
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error al obtener clima")
    return response.json()

# Ruta para obtener el clima actual, histórico y de predicción para una ubicación
@app.get("/weather")
def get_weather(location: str, db: Session = Depends(get_db)):
    # Buscar la ubicación en la base de datos
    loc = db.query(Location).filter(Location.name == location).first()

    # Si no existe, buscar coordenadas con la API de geocodificación y guardarla
    if not loc:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"
        res = requests.get(geo_url).json()
        if not res.get("results"):
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")
        result = res["results"][0]
        lat, lon = result["latitude"], result["longitude"]
        loc = Location(name=location, latitude=lat, longitude=lon)
        db.add(loc)
        db.commit()
        db.refresh(loc)
    else:
        # Si existe, tomar coordenadas desde la base de datos
        lat, lon = loc.latitude, loc.longitude
        
        
        # Obtener datos meteorológicos desde Open-Meteo
    data = get_weather_from_openmeteo(lat, lon)
        
        # Guardar en la base de datos los datos históricos si no existen ya
    for i in range(7):
        history_date = date.fromisoformat(data["daily"]["time"][i])
        existing_weather = db.query(Weather).filter(
            Weather.date == history_date,
            Weather.location_id == loc.id
        ).first()
        if not existing_weather:
            weather = Weather(
                date=history_date,
                temperature=(data["daily"]["temperature_2m_max"][i] + data["daily"]["temperature_2m_min"][i]) / 2,
                condition=str(data["daily"]["weathercode"][i]),
                location_id=loc.id
            )
            db.add(weather)
    db.commit()  # Guardar todos los cambios de golpe


    

    # Procesar datos de las próximas 24 horas
    today_data = {
        "temperatures": data["hourly"]["temperature_2m"][:24],
        "hours": data["hourly"]["time"][:24],
        "codes": data["hourly"]["weathercode"][:24]
    }

    # Historial de los últimos 7 días
    history = []
    for i in range(7):
        history.append({
            "date": data["daily"]["time"][i],
            "temp_max": data["daily"]["temperature_2m_max"][i],
            "temp_min": data["daily"]["temperature_2m_min"][i],
            "code": data["daily"]["weathercode"][i]
        })

    # Predicción para los próximos 7 días
    forecast = []
    for i in range(7, 14):
        forecast.append({
            "date": data["daily"]["time"][i],
            "temp_max": data["daily"]["temperature_2m_max"][i],
            "temp_min": data["daily"]["temperature_2m_min"][i],
            "code": data["daily"]["weathercode"][i]
        })

    # Selección de fondo visual según el código meteorológico actual
    current_code = today_data["codes"][0]
    if current_code in [0, 1]:
        background = "sunny"
    elif current_code in [2, 3]:
        background = "cloudy"
    elif 51 <= current_code <= 67:
        background = "rain"
    elif 95 <= current_code <= 99:
        background = "storm"
    elif 71 <= current_code <= 77:
        background = "snow"
    else:
        background = "default"

    # Respuesta JSON con toda la información necesaria
    return {
        "latitude": lat,
        "longitude": lon,
        "today": today_data,
        "history": history,
        "forecast": forecast,
        "background": background
    }

# Ruta para añadir una nueva ubicación manualmente
@app.post("/add_location/")
def add_location(name: str, lat: float, lon: float, db: Session = Depends(get_db)):
    existing = db.query(Location).filter(Location.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="La ubicación ya existe")
    loc = Location(name=name, latitude=lat, longitude=lon)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

# Ruta para añadir manualmente un registro de clima para una ubicación y fecha
@app.post("/add_weather/")
def add_weather(name: str, temp: float, condition: str, date_str: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.name == name).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    weather = Weather(date=date.fromisoformat(date_str), temperature=temp, condition=condition, location_id=loc.id)
    db.add(weather)
    db.commit()
    db.refresh(weather)
    return weather

# Ruta para obtener todo el historial meteorológico registrado manualmente de una ubicación
@app.get("/weather_history/{name}")
def get_weather_history(name: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.name == name).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return loc.weather_data
