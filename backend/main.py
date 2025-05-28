from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
import requests

from database import SessionLocal, engine
from models import Location, Weather

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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/weather")
def get_weather(
    location: str,
    history_days: int = Query(30, ge=1, le=30),
    db: Session = Depends(get_db)
):
    # Buscar la ubicación en la base de datos
    loc = db.query(Location).filter(Location.name == location).first()

    # Si no existe, buscar coordenadas y guardarlas
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
        lat, lon = loc.latitude, loc.longitude

    # Llama a la API de Open-Meteo con más variables
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,surface_pressure"
        f"&daily=temperature_2m_max,temperature_2m_min,weathercode"
        f"&timezone=auto&past_days={history_days}&forecast_days=7"
    )
    data = requests.get(url).json()

    # Guardar en base de datos los datos históricos si no existen
    for i in range(min(30, history_days)):
        history_date = date.fromisoformat(data["daily"]["time"][i])
        existing_weather = db.query(Weather).filter(
            Weather.date == history_date,
            Weather.location_id == loc.id
        ).first()
        if not existing_weather:
            avg_temp = (data["daily"]["temperature_2m_max"][i] + data["daily"]["temperature_2m_min"][i]) / 2
            weather = Weather(
                date=history_date,
                temperature=avg_temp,
                condition=str(data["daily"]["weathercode"][i]),
                location_id=loc.id
            )
            db.add(weather)
    db.commit()

    # Datos horarios para hoy
    today_data = {
        "temperatures": data["hourly"]["temperature_2m"][:24],
        "hours": data["hourly"]["time"][:24],
        "codes": data["hourly"]["weathercode"][:24],
        "winds": data["hourly"].get("windspeed_10m", [None]*24)[:24],
        "humidity": data["hourly"].get("relativehumidity_2m", [None]*24)[:24],
        "pressure": data["hourly"].get("surface_pressure", [None]*24)[:24],
    }

    # Historial
    history = []
    for i in range(history_days):
        history.append({
            "date": data["daily"]["time"][i],
            "temp_max": data["daily"]["temperature_2m_max"][i],
            "temp_min": data["daily"]["temperature_2m_min"][i],
            "code": data["daily"]["weathercode"][i]
        })

    # Predicción
    forecast = []
    for i in range(history_days, history_days + 7):
        forecast.append({
            "date": data["daily"]["time"][i],
            "temp_max": data["daily"]["temperature_2m_max"][i],
            "temp_min": data["daily"]["temperature_2m_min"][i],
            "code": data["daily"]["weathercode"][i]
        })

    # Fondo visual
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
