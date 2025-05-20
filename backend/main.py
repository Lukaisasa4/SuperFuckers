from fastapi import FastAPI, HTTPException
import requests

app = FastAPI()

# Coordenadas de las ciudades
CIUDADES = {
    "Donostia": {"lat": 43.3128, "lon": -1.9750},
    "Bilbao": {"lat": 43.2630, "lon": -2.9350},
    "Vitoria-Gasteiz": {"lat": 42.8467, "lon": -2.6727},
    "Pasaia": {"lat": 43.3251, "lon": -1.9315}
}

@app.get("/api/tiempo-ciudades")
def obtener_tiempo_ciudades():
    resultados = {}

    for ciudad, coords in CIUDADES.items():
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={coords['lat']}"
            f"&longitude={coords['lon']}"
            f"&current_weather=true"
            f"&timezone=Europe%2FMadrid"
        )

        try:
            response = requests.get(url)
            response.raise_for_status()
            datos = response.json()

            clima = datos.get("current_weather", {})
            resultados[ciudad] = {
                "temperatura": clima.get("temperature"),
                "viento": clima.get("windspeed"),
                "hora": clima.get("time")
            }
        except Exception as e:
            resultados[ciudad] = {"error": str(e)}

    return resultados
