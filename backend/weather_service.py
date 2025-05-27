import requests
from datetime import datetime, timedelta
import pytz

def get_coordinates(location):
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}"
    res = requests.get(geo_url)
    data = res.json()
    if not data.get("results"):
        return None
    coords = data["results"][0]
    return coords["latitude"], coords["longitude"]

def get_weather_emoji(code):
    weather_emojis = {
        0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
        45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️",
        55: "🌧️", 56: "🌧️", 57: "🌧️", 61: "🌧️",
        63: "🌧️", 65: "🌧️", 66: "🌧️", 67: "🌧️",
        71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
        80: "🌧️", 81: "🌧️", 82: "🌧️", 85: "❄️",
        86: "❄️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
    }
    return weather_emojis.get(code, "❓")

def get_weather_background(code):
    backgrounds = {
        0: "sunny", 1: "partly-cloudy", 2: "cloudy", 3: "overcast",
        45: "fog", 48: "fog", 51: "light-rain", 53: "light-rain",
        55: "rain", 56: "rain", 57: "rain", 61: "rain",
        63: "rain", 65: "rain", 66: "rain", 67: "rain",
        71: "snow", 73: "snow", 75: "snow", 77: "snow",
        80: "rain", 81: "rain", 82: "rain", 85: "snow",
        86: "snow", 95: "storm", 96: "storm", 99: "storm"
    }
    return backgrounds.get(code, "default")

def get_weather_data(location):
    coords = get_coordinates(location)
    if not coords:
        return {"error": "Ubicación no encontrada"}
    lat, lon = coords

    today = datetime.utcnow().date()
    start_hist = today - timedelta(days=7)
    end_fore = today + timedelta(days=7)

    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        f"&hourly=temperature_2m,weathercode&daily=temperature_2m_max,weathercode&timezone=auto"
        f"&start_date={start_hist}&end_date={end_fore}"
    )
    res = requests.get(url)
    data = res.json()

    hourly_data = [
        {"time": t[-5:], "temp": temp, "emoji": get_weather_emoji(code)}
        for t, temp, code in zip(data["hourly"]["time"], data["hourly"]["temperature_2m"], data["hourly"]["weathercode"])
        if t.startswith(str(today))
    ]

    background_code = data["hourly"]["weathercode"][0] if data["hourly"]["weathercode"] else 0

    history = [
        {"date": d, "temp": t, "emoji": get_weather_emoji(c)}
        for d, t, c in zip(data["daily"]["time"][:7], data["daily"]["temperature_2m_max"][:7], data["daily"]["weathercode"][:7])
    ]
    forecast = [
        {"date": d, "temp": t, "emoji": get_weather_emoji(c)}
        for d, t, c in zip(data["daily"]["time"][7:], data["daily"]["temperature_2m_max"][7:], data["daily"]["weathercode"][7:])
    ]

    return {
        "today": hourly_data,
        "history": history,
        "forecast": forecast,
        "background": get_weather_background(background_code)
    }