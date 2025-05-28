from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
import requests

# Si usas SQLAlchemy, importa tus modelos y SessionLocal aquí
# from database import SessionLocal, engine
# from models import Location, Weather

app = FastAPI()

# Permitir CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()
    pass  # Elimina esto y descomenta lo de arriba si usas SQLAlchemy

@app.get("/weather")
def get_weather(
    location: str,
    history_days: int = Query(7, ge=1, le=30),
    # db: Session = Depends(get_db)
):
    # --- Si tienes base de datos, aquí iría la lógica de búsqueda y guardado ---
    # Para ejemplo simple, solo usamos la API externa

    # Geocodificación
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1"
    res = requests.get(geo_url).json()
    if not res.get("results"):
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    result = res["results"][0]
    lat, lon = result["latitude"], result["longitude"]

    # Llama a la API de Open-Meteo con los nuevos parámetros
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,surface_pressure"
        f"&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
        f"&past_days={history_days}&forecast_days=7"
    )
    data = requests.get(url).json()

    # Datos horarios para hoy (añadimos viento, humedad y presión)
    today_data = {
        "temperatures": data["hourly"]["temperature_2m"][:24],
        "hours": data["hourly"]["time"][:24],
        "codes": data["hourly"]["weathercode"][:24],
        "winds": data["hourly"].get("windspeed_10m", [None]*24)[:24],
        "humidity": data["hourly"].get("relativehumidity_2m", [None]*24)[:24],
        "pressure": data["hourly"].get("surface_pressure", [None]*24)[:24],
    }

    # Historial de los últimos N días (history_days)
    history = []
    for i in range(history_days):
        history.append({
            "date": data["daily"]["time"][i],
            "temp_max": data["daily"]["temperature_2m_max"][i],
            "temp_min": data["daily"]["temperature_2m_min"][i],
            "code": data["daily"]["weathercode"][i]
        })

    # Predicción para los próximos 7 días
    forecast = []
    for i in range(history_days, history_days + 7):
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

    return {
        "latitude": lat,
        "longitude": lon,
        "today": today_data,
        "history": history,
        "forecast": forecast,
        "background": background
    }