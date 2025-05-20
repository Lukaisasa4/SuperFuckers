from fastapi import FastAPI
import requests

app = FastAPI()

@app.get("/api/tiempo")
def get_tiempo():
    url = "https://www.euskadi.eus/contenidos/opendata/tiempo_actual/opendata/tiempo_actual.json"
    res = requests.get(url)
    return res.json()
