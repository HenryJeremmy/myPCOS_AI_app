def test_signup_login_and_me_flow(client):
    signup_payload = {"email": "test@ex.com", "password": "Secret123"}

    r = client.post("/api/v1/auth/signup", json=signup_payload)
    assert r.status_code == 201
    assert r.json()["email"] == "test@ex.com"

    login_payload = {"username": "test@ex.com", "password": "Secret123"}
    r = client.post("/api/v1/auth/login", data=login_payload)
    assert r.status_code == 200

    data = r.json()
    assert data["token_type"] == "bearer"
    token = data["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "test@ex.com"