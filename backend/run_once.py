from database import engine
from models import Base

#Esta línea crea todas las tablas definidas con las clases ORM (Location, Weather, etc.) en la base de datos, si no existen aún.
Base.metadata.create_all(bind=engine)