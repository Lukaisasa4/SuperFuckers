from fastapi import FastAPI
from fastapi.responses import JSONResponse
import requests
from datetime import datetime

app = FastAPI()

CIUDADES = {
    "bilbao": {"lat": 43.2630, "lon": -2.9350, "alt": 19},
    "vitoria-gasteiz": {"lat": 42.8467, "lon": -2.6716, "alt": 525},
    "donostia": {"lat": 43.3128, "lon": -1.9748, "alt": 6},
    "barakaldo": {"lat": 43.2956, "lon": -2.9972, "alt": 39},
    "getxo": {"lat": 43.3569, "lon": -3.0116, "alt": 50},
    "portugalete": {"lat": 43.3204, "lon": -3.0197, "alt": 20},
    "irun": {"lat": 43.3381, "lon": -1.7890, "alt": 10},
    "basauri": {"lat": 43.2386, "lon": -2.8852, "alt": 70},
    "durango": {"lat": 43.1704, "lon": -2.6336, "alt": 121},
    "eibar": {"lat": 43.1849, "lon": -2.4713, "alt": 121},
    "sestao": {"lat": 43.3094, "lon": -3.0075, "alt": 26},
    "santurtzi": {"lat": 43.3283, "lon": -3.0323, "alt": 23},
    "lezama": {"lat": 43.2739, "lon": -2.8434, "alt": 65},
    "tolosa": {"lat": 43.1345, "lon": -2.0705, "alt": 75},
    "zarautz": {"lat": 43.2843, "lon": -2.1696, "alt": 5}
}


WEATHER_CODES = {
    0: ("Despejado", "☀️"),
    1: ("Principalmente despejado", "🌤️"),
    2: ("Parcialmente nublado", "⛅"),
    3: ("Nublado", "☁️"),
    45: ("Niebla", "🌫️"),
    48: ("Niebla con escarcha", "🌫️❄️"),
    51: ("Llovizna ligera", "🌦️"),
    53: ("Llovizna moderada", "🌦️"),
    55: ("Llovizna densa", "🌧️"),
    61: ("Lluvia ligera", "🌦️"),
    63: ("Lluvia moderada", "🌧️"),
    65: ("Lluvia intensa", "🌧️"),
    80: ("Chubascos ligeros", "🌦️"),
    81: ("Chubascos moderados", "🌧️"),
    82: ("Chubascos violentos", "⛈️")
}

def obtener_descripcion_weathercode(codigo):
    if codigo in WEATHER_CODES:
        return WEATHER_CODES[codigo]
    if 1 <= codigo <= 3:
        return WEATHER_CODES[3]
    if 51 <= codigo <= 55:
        return WEATHER_CODES[55]
    if 61 <= codigo <= 65:
        return WEATHER_CODES[65]
    if 80 <= codigo <= 82:
        return WEATHER_CODES[82]
    return ("Desconocido", "❓")

@app.get("/api/tiempo-ciudades")
def obtener_tiempo_ciudades():
    resultados = {}

    for ciudad, coords in CIUDADES.items():
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={coords['lat']}&longitude={coords['lon']}"
            f"&current_weather=true"
            f"&hourly=relative_humidity_2m,pressure_msl,windspeed_10m"
            f"&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset"
            f"&timezone=Europe%2FMadrid"
        )

        try:
            response = requests.get(url)
            response.raise_for_status()
            datos = response.json()

            clima_actual = datos.get("current_weather", {})
            time_list = datos["hourly"]["time"]
            ahora = datetime.now().strftime("%Y-%m-%dT%H:00")
            indice_actual = time_list.index(ahora) if ahora in time_list else 0

            cod_clima = clima_actual.get("weathercode", -1)
            descripcion, emoji = obtener_descripcion_weathercode(cod_clima)

            resultados[ciudad] = {
                "🌦️ Estado": f"{emoji} {descripcion}",
                "Temperatura": f"{clima_actual.get('temperature', 'N/A')} °C",
                "Humedad": f"{datos['hourly']['relative_humidity_2m'][indice_actual]} %",
                "Presión": f"{datos['hourly']['pressure_msl'][indice_actual]} hPa",
                "Viento": f"{datos['hourly']['windspeed_10m'][indice_actual]} km/h",
                "Máxima": f"{datos['daily']['temperature_2m_max'][0]} °C",
                "Mínima": f"{datos['daily']['temperature_2m_min'][0]} °C",
                "Salida del Sol": datos['daily']['sunrise'][0][11:16],
                "Puesta del Sol": datos['daily']['sunset'][0][11:16]
            }
        except Exception as e:
            resultados[ciudad] = {"error": str(e)}

    return resultados


@app.get("/api/semana-{ciudad}")
def obtener_semana(ciudad: str):
    ciudad = ciudad.lower()
    if ciudad not in CIUDADES:
        return JSONResponse(status_code=404, content={"error": "Ciudad no encontrada"})

    coords = CIUDADES[ciudad]
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={coords['lat']}&longitude={coords['lon']}"
        f"&daily=temperature_2m_max,temperature_2m_min,weathercode"
        f"&timezone=Europe%2FMadrid"
    )

    try:
        response = requests.get(url)
        response.raise_for_status()
        datos = response.json()

        dias = datos["daily"]["time"]
        maximas = datos["daily"]["temperature_2m_max"]
        minimas = datos["daily"]["temperature_2m_min"]
        codigos = datos["daily"]["weathercode"]

        resultado = []
        for i in range(7):
            descripcion, emoji = obtener_descripcion_weathercode(codigos[i])
            resultado.append({
                "fecha": dias[i],
                "estado": f"{emoji} {descripcion}",
                "max": f"{maximas[i]} °C",
                "min": f"{minimas[i]} °C"
            })

        return resultado

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
