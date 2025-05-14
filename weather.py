import requests
from config import API_KEY, BASE_URL

def obtener_prediccion_por_municipio(nombre_municipio):
    # Endpoint de predicción por municipio
    search_url = f"{BASE_URL}/prediccion/especifica/municipio/diaria/20059/?api_key={API_KEY}"  # Ejemplo: Bilbao (20059)
    print(f"Consultando predicción para {nombre_municipio}...")

    response = requests.get(search_url)
    if response.status_code == 200:
        datos_url = response.json()['datos']
        prediccion_response = requests.get(datos_url)
        datos = prediccion_response.json()[0]

        pred = datos['prediccion']['dia'][0]
        estado_cielo = pred['estadoCielo'][0]['descripcion']
        precipitacion = pred['probPrecipitacion'][0]['value']
        tormenta = "Sí" if "tormenta" in estado_cielo.lower() else "No"

        print(f"\n📍 Municipio: {nombre_municipio}")
        print(f"☁️ Estado del cielo: {estado_cielo}")
        print(f"🌧 Probabilidad de precipitación: {precipitacion}%")
        print(f"⛈ ¿Tormenta? {tormenta}")
    else:
        print(f"❌ Error al obtener predicción: {response.status_code}")
