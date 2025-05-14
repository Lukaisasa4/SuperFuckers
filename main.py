from db import init_db, guardar_consulta
from weather import obtener_prediccion_por_municipio

def main():
    init_db()
    print("🌤 VISOR METEOROLÓGICO AEMET – EUSKADI")
    municipio = input("Introduce el nombre del municipio (ej. Bilbao): ").capitalize()

    guardar_consulta(municipio)
    obtener_prediccion_por_municipio(municipio)

if __name__ == "__main__":
    main()
