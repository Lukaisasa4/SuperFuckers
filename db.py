import sqlite3

def init_db():
    conn = sqlite3.connect('aemet_data.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS consultas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            municipio TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def guardar_consulta(municipio):
    conn = sqlite3.connect('aemet_data.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO consultas (municipio)
        VALUES (?)
    ''', (municipio,))
    conn.commit()
    conn.close()
