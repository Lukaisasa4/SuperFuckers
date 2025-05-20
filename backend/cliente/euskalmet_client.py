import httpx

async def obtener_datos_euskalmet(municipio: str):
    url = f"https://api.euskalmet.euskadi.eus/api/forecast/municipality/{municipio}?lang=es"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
