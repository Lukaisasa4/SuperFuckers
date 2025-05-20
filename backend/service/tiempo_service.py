from cliente.euskalmet_client import obtener_datos_euskalmet
from model.prediccion import Prediccion

async def obtener_prediccion(municipio: str) -> Prediccion:
    datos_json = await obtener_datos_euskalmet(municipio)

    return Prediccion(
        municipio=municipio,
        descripcion=datos_json.get("description", "Sin descripción"),
        temperatura=datos_json.get("temperature", {}).get("value", None)
    )
