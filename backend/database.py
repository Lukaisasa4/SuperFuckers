import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

#Esta función carga las variables de entorno desde un archivo .env al entorno del sistema.

load_dotenv()

#Usa os.getenv para leer las variables de entorno necesarias para la conexión a la base de datos.

MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")

# Crea la URL de conexión a la base de datos MySQL usando las variables de entorno.

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

# Crea el motor de la base de datos y la sesión local para interactuar con ella.

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)