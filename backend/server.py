from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import aiomysql
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de base de datos
db_config = {
    "host": "localhost",
    "user": "TU_USUARIO",
    "password": "TU_CONTRASEÑA",
    "db": "reto99",
    "autocommit": True,
}

# Datos de ciudades
cities = {
    "bilbao": {"nombre": "Bilbao", "latitude": 43.2630, "longitude": -2.9350, "altitude": 19},
    "vitoria-gasteiz": {"nombre": "Vitoria-Gasteiz", "latitude": 42.8467, "longitude": -2.6716, "altitude": 525},
    "donostia-san-sebastian": {"nombre": "Donostia / San Sebastián", "latitude": 43.3128, "longitude": -1.9748, "altitude": 6},
    "barakaldo": {"nombre": "Barakaldo", "latitude": 43.2956, "longitude": -2.9972, "altitude": 39},
    "getxo": {"nombre": "Getxo", "latitude": 43.3569, "longitude": -3.0116, "altitude": 50},
    "portugalete": {"nombre": "Portugalete", "latitude": 43.3204, "longitude": -3.0197, "altitude": 20},
    "irun": {"nombre": "Irun", "latitude": 43.3381, "longitude": -1.7890, "altitude": 10},
    "basauri": {"nombre": "Basauri", "latitude": 43.2386, "longitude": -2.8852, "altitude": 70},
    "durango": {"nombre": "Durango", "latitude": 43.1704, "longitude": -2.6336, "altitude": 121},
    "eibar": {"nombre": "Eibar", "latitude": 43.1849, "longitude": -2.4713, "altitude": 121},
}

def get_closest_hour_index(times):
    now = datetime.utcnow()
    now_hour = now.replace(minute=0, second=0, microsecond=0).isoformat(timespec="minutes")
    try:
        return times.index(now_hour)
    except ValueError:
        now_time = datetime.fromisoformat(now_hour)
        min_diff = float("inf")
        idx = 0
        for i, t in enumerate(times):
            t_time = datetime.fromisoformat(t)
            diff = abs((t_time - now_time).total_seconds())
            if diff < min_diff:
                min_diff = diff
                idx = i
        return idx

async def get_connection():
    return await aiomysql.connect(**db_config)

@app.get("/api/tiempo-{ciudad}")
async def tiempo(ciudad: str):
    ciudad = ciudad.lower()
    coords = cities.get(ciudad)
    if not coords:
        raise HTTPException(status_code=404, detail="Ciudad no encontrada")

    url = (f"https://api.open-meteo.com/v1/forecast?"
           f"latitude={coords['latitude']}&longitude={coords['longitude']}&"
           f"current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&"
           f"hourly=temperature_2m,relative_humidity_2m,pressure_msl&timezone=Europe%2FMadrid")

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        datos = response.json()

    clima = datos.get("current_weather", {})
    daily = datos.get("daily", {})
    hourly = datos.get("hourly", {})

    humedad = presion = None
    if "time" in hourly and "relative_humidity_2m" in hourly and "pressure_msl" in hourly:
        idx = get_closest_hour_index(hourly["time"])
        humedad = hourly["relative_humidity_2m"][idx]
        presion = hourly["pressure_msl"][idx]

    return {
        "temperatura": clima.get("temperature"),
        "viento": clima.get("windspeed"),
        "estadoCodigo": clima.get("weathercode"),
        "humedad": humedad,
        "presion": presion,
        "maxima": daily.get("temperature_2m_max", [None])[0],
        "minima": daily.get("temperature_2m_min", [None])[0],
        "salidaSol": daily.get("sunrise", [None])[0],
        "puestaSol": daily.get("sunset", [None])[0],
    }

@app.get("/api/guardar-tiempo")
async def guardar_tiempo():
    resultados = []
    conn = await get_connection()
    async with conn.cursor() as cur:
        for key, city in cities.items():
            nombre, latitude, longitude = city["nombre"], city["latitude"], city["longitude"]
            url = (f"https://api.open-meteo.com/v1/forecast?"
                   f"latitude={latitude}&longitude={longitude}&"
                   f"current_weather=true&hourly=temperature_2m,relative_humidity_2m,pressure_msl,precipitation,winddirection_10m&"
                   f"timezone=Europe%2FMadrid")

            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    data = response.json()

                clima = data.get("current_weather", {})
                idx = get_closest_hour_index(data.get("hourly", {}).get("time", []))
                humedad = data.get("hourly", {}).get("relative_humidity_2m", [None])[idx]
                precipitacion = data.get("hourly", {}).get("precipitation", [None])[idx]
                viento_direccion = str(clima.get("winddirection")) if "winddirection" in clima else None
                fecha_hora = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

                await cur.execute("SELECT id FROM ubicaciones WHERE nombre=%s", (nombre,))
                row = await cur.fetchone()
                if not row:
                    resultados.append({"ciudad": nombre, "estado": "NO ENCONTRADA EN DB"})
                    continue
                id_ubicacion = row[0]

                # Insertar en tiempo_actual
                await cur.execute("""
                    INSERT INTO tiempo_actual (id_ubicacion, fecha_hora, temperatura, humedad, viento_velocidad, viento_direccion, precipitacion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (id_ubicacion, fecha_hora, clima.get("temperature"), humedad, clima.get("windspeed"), viento_direccion, precipitacion))

                # Insertar en historico
                await cur.execute("""
                    INSERT INTO historico (id_ubicacion, fecha_hora, temperatura, humedad, viento_velocidad, viento_direccion, precipitacion)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (id_ubicacion, fecha_hora, clima.get("temperature"), humedad, clima.get("windspeed"), viento_direccion, precipitacion))

                resultados.append({"ciudad": nombre, "estado": "GUARDADO"})
            except Exception as e:
                resultados.append({"ciudad": nombre, "estado": "ERROR", "mensaje": str(e)})

    conn.close()
    return resultados

async def guardar_resumen_diario():
    conn = await get_connection()
    fecha_ayer = datetime.utcnow() - timedelta(days=1)
    fecha = fecha_ayer.strftime("%Y-%m-%d")

    async with conn.cursor() as cur:
        for key, city in cities.items():
            nombre = city["nombre"]

            await cur.execute("SELECT id FROM ubicaciones WHERE nombre=%s", (nombre,))
            row = await cur.fetchone()
            if not row:
                print(f"❌ Ubicación no encontrada en DB: {nombre}")
                continue
            id_ubicacion = row[0]

            await cur.execute("""
                SELECT
                    AVG(temperatura) AS temperatura_media,
                    AVG(humedad) AS humedad_media,
                    AVG(viento_velocidad) AS viento_velocidad_media,
                    SUM(precipitacion) AS precipitacion_total
                FROM historico
                WHERE id_ubicacion=%s AND DATE(fecha_hora)=%s
            """, (id_ubicacion, fecha))

            resumen = await cur.fetchone()
            if not resumen or resumen[0] is None:
                print(f"⚠️ Sin datos para resumen en {nombre} para fecha {fecha}")
                continue

            await cur.execute("""
                INSERT INTO resumen_diario (id_ubicacion, fecha, temperatura_media, humedad_media, viento_velocidad_media, precipitacion_total)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    temperatura_media=_
