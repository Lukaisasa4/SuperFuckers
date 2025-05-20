from pydantic import BaseModel
from typing import Optional

class Prediccion(BaseModel):
    municipio: str
    descripcion: Optional[str]
    temperatura: Optional[float]
