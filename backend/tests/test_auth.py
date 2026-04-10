# from app.models.user import User

# def test_signup_login_and_me_flow(client):
#     signup_payload = {
#         "first_name": "Henry",
#         "last_name": "Jeremmy",
#         "email": "test@ex.com",
#         "password": "Secret123",
#     }

#     r = client.post("/api/v1/auth/signup", json=signup_payload)
#     assert r.status_code == 201
#     assert r.json()["email"] == "test@ex.com"

#     # login should fail before email verification
#     login_payload = {"username": "test@ex.com", "password": "Secret123"}
#     r = client.post("/api/v1/auth/login", data=login_payload)
#     assert r.status_code == 400

#     # get OTP from the test database
#     user = test_db.query(User).filter(User.email == "test@ex.com").first()
#     assert user is not None
#     assert user.otp_code is not None

#     verify_payload = {"email": "test@ex.com", "otp_code": user.otp_code}
#     r = client.post("/api/v1/auth/verify-email", json=verify_payload)
#     assert r.status_code == 200

#     # login should now succeed
#     r = client.post("/api/v1/auth/login", data=login_payload)
#     assert r.status_code == 200

#     data = r.json()
#     assert data["token_type"] == "bearer"
#     token = data["access_token"]

#     r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
#     assert r.status_code == 200
#     assert r.json()["email"] == "test@ex.com"

from app.models.user import User

def test_signup_login_and_me_flow(client, test_db):
    signup_payload = {
        "first_name": "Henry",
        "last_name": "Jeremmy",
        "email": "test@ex.com",
        "password": "Secret123",
    }

    r = client.post("/api/v1/auth/signup", json=signup_payload)
    assert r.status_code == 201
    assert r.json()["email"] == "test@ex.com"

    login_payload = {"username": "test@ex.com", "password": "Secret123"}
    r = client.post("/api/v1/auth/login", data=login_payload)
    assert r.status_code == 400

    user = test_db.query(User).filter(User.email == "test@ex.com").first()
    assert user is not None
    assert user.otp_code is not None

    verify_payload = {"email": "test@ex.com", "otp_code": user.otp_code}
    r = client.post("/api/v1/auth/verify-email", json=verify_payload)
    assert r.status_code == 200

    r = client.post("/api/v1/auth/login", data=login_payload)
    assert r.status_code == 200

    data = r.json()
    assert data["token_type"] == "bearer"
    token = data["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "test@ex.com"