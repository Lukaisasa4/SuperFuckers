from fastapi import APIRouter, HTTPException
from service.tiempo_service import obtener_prediccion
from model.prediccion import Prediccion
import asyncio

router = APIRouter()

@router.get("/{municipio}", response_model=Prediccion)
async def prediccion_municipio(municipio: str):
    try:
        return await obtener_prediccion(municipio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
