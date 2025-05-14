import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("AEMET_API_KEY")
BASE_URL = "https://opendata.aemet.es/opendata/api"
