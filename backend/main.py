from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/weather")
def get_weather(
    location: str,
    history_days: int = Query(7, ge=1, le=30),
):
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
        f"&hourly=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,surface_pressure,"
        f"apparent_temperature,uv_index,precipitation"
        f"&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
        f"&past_days={history_days}&forecast_days=7"
    )
    data = requests.get(url).json()

    # Guardar en la base de datos los datos históricos si no existen ya (solo para los últimos 7 días)
    for i in range(min(7, history_days)):
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
    db.commit()

    # Procesar datos de las próximas 24 horas
    today_data = {
        "temperatures": data["hourly"]["temperature_2m"][:24],
        "hours": data["hourly"]["time"][:24],
        "codes": data["hourly"]["weathercode"][:24],
        "winds": data["hourly"].get("windspeed_10m", [None]*24)[:24],
        "humidity": data["hourly"].get("relativehumidity_2m", [None]*24)[:24],
        "pressure": data["hourly"].get("surface_pressure", [None]*24)[:24],
        "apparent_temperature": data["hourly"].get("apparent_temperature", [None]*24)[:24],
        "uv_index": data["hourly"].get("uv_index", [None]*24)[:24],
        "precipitation": data["hourly"].get("precipitation", [None]*24)[:24],
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