from fastapi.testclient import TestClient

from app.main import app


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "mypcos-backend"
    assert "ai_inference_enabled" in data
