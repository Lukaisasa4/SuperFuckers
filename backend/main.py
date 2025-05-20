from fastapi import FastAPI
import requests
from datetime import datetime

def obtener_descripcion_weathercode(codigo):
    # Algunos códigos de Open-Meteo pueden ser combinaciones o no estar en el diccionario
    if codigo in WEATHER_CODES:
        return WEATHER_CODES[codigo]
    # Rango de nubes (1-3)
    if 1 <= codigo <= 3:
        return WEATHER_CODES[3]
    # Llovizna
    if 51 <= codigo <= 55:
        return WEATHER_CODES[55]
    # Lluvia
    if 61 <= codigo <= 65:
        return WEATHER_CODES[65]
    # Chubascos
    if 80 <= codigo <= 82:
        return WEATHER_CODES[82]
    return ("Desconocido", "❓")

app = FastAPI()

CIUDADES = {
    "Donostia": {"lat": 43.3128, "lon": -1.9750},
    "Bilbao": {"lat": 43.2630, "lon": -2.9350},
    "Vitoria-Gasteiz": {"lat": 42.8467, "lon": -2.6727},
    "Pasaia": {"lat": 43.3251, "lon": -1.9315}
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

def obtener_indice_hora_actual(lista_tiempos):
    ahora = datetime.now().strftime("%Y-%m-%dT%H:00")
    if ahora in lista_tiempos:
        return lista_tiempos.index(ahora)
    return 0  # Fallback

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
            indice_actual = obtener_indice_hora_actual(datos["hourly"]["time"])

            cod_clima = clima_actual.get("weathercode", -1)
            descripcion, emoji = WEATHER_CODES.get(cod_clima, ("Desconocido", "❓"))

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
