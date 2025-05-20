from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_prediccion():
    response = client.get("/api/tiempo/donostia")
    assert response.status_code == 200
    assert "municipio" in response.json()
