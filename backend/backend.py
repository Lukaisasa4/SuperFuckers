from fastapi import FastAPI, HTTPException
import requests

app = FastAPI()

API_KEY = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBcVqdF67cHHH/gY/Sl7QbqcUJDN1E6JsSJd/eiLPpG1bB9qoxE0RO4SWZmYwzhqo7y1w6z59MO2pzutwZqBvd5PaRiJF2VxdfGhODvdFaepEy0Q6f0cL3fLNudYaVTK5HIZUwCd6m4DDqUeOkFrhG55dhbmW9fRxW6AOVrmMnCvL4DAgniffI4h8dmGvSZ1KlnEvSlTPLOTH/ap94GlacPFyCRlsXrI4MAqAxN3TdtbVpcxMPu3fv3piA9+Wpz86qB/L2/HX16ayGhOCDCPOHLqo4iu478qri2wBp1zzNIAyksWsCUYvwMbtjgA3GJpCqMEkLofOcAvOGB2eeWv4vAgMBAAECggEACsSEhroKwbXToqVTnCVVoTSSAy70IiHQf/IbxAdX/GHJMoLIdnLcGoftz978LuIQF8P6HkvwUg38nvSHy+XPp0pXb0Jq1muCoYiSDYNDZAXujyWT6tGCSMRoOH3SP/1EtjDoXQQvoJpaHrDwOvIIz+mUQ5ghkaqlKTFBAdPzMPkSNPBOiIJBfwN4RMhkWJPv+BViCIHgTl71bW3m/GykFoYMtiBpNLHtGrHYeW0f9FEo7INgdFa/KisXIjg9t51lSSJqPhb3OnQ4DeefZZLEohkjhg6Xm8uK8gepDmA1jsTcvhT9ZrJ+SC3ZNhE/r65FV+/l9phDvPgCgupVPvy2AQKBgQDOWmcwBmhFFAzfsgulvUpCnmEpN7m336LOjc0X4YX44trQDUw6zCC8uIK6Fdr6I+Vq18U28BiK1TtcNinuZh2vgPpTw7dEpbuyV6WU5e8VS8Z8pDlw+t1QtMlTd/VtnLXlP6sG5reHvfJa7MI7eWp1/URkMrzZY/QzHnp7P9q//QKBgQDv+8iHyp7AF0qhpeO2S4y+V7KQyb2sLwHpT7KNmbGF7FGaMu7x5tXL8wMLfcZ83sm/gRi9RC8H/LmZrIhbNFHHH4fFVx2FbJG7KCh3mZSpHl7NEwwJ/71M4GmZbvx7DOBdFS8hCsRVaYlib0VHAaZrFPmD1IcvL1+hUnBHyQfAmwKBgERVzcwqowcVP7oolRDa4ae0GUr0CE2rAphSfzPEXIByZ7H0ZWUnSkQU+j2zlSO3FXdPYyDxW79GI/VCfppTOMtw8/UfYCacl87UlaH8jzNHN8D5BYizmuzqIa3BkQYumlIDxphveSG7tnGD7EKTz7ypFaf04XNAVZNEKZ19JOzlAoGAIbx2g0hjqsNbdX/5k/3o6jUv4BTMOjFdhmvywN8zSo1fJ1szpgP6WDJwYiQrTBCRsf82+BxmtCu997F+dbvUJzbygjZt6vzJO9M4ZR/M+z1OvGuKDLnL5cvCbJRin/W+cLdyqaV21j8A1jqoNYQw3erT7Mlqu6JgQjBxolXLZjMCgYEAlfAZgNxTM/bC7ExTd9qv4cCiHVBYoprHKomfm8CI0WV0hvZgfmvWIx1lG//vDoCuKuxCitwD3j4/PHLrw0uIqAPbiE0HL4kihslPUbdIhWVdszrY/URabYXeXmR22YVIpTJKoRCs/xLyIUWd7+TYgIDYUwH0Dz6MDsi3st1sB/c="  # Pon aquí tu clave de Euskalmet

@app.get("/api/tiempo")
def obtener_tiempo():
    url = f"https://opendata.euskadi.eus/contenidos/ds_meteorologia_estaciones/actual.json"
    headers = {"Authorization": f"Bearer {API_KEY}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        # Busca la estación Donostia - Igueldo (ajusta el nombre según API real)
        donosti = next((e for e in data if e.get("nombre") == "DONOSTIA-SAN SEBASTIÁN, IGUELDO"), None)

        if not donosti:
            raise HTTPException(status_code=404, detail="Estación no encontrada")

        return {
            "temperatura": donosti.get("temperatura_actual"),
            "humedad": donosti.get("humedad_relativa"),
            "presion": donosti.get("presion_atmosferica")
        }

    except requests.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error en la API externa: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error desconocido: {e}")
