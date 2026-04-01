from fastapi.testclient import TestClient


def create_and_verify_user(client: TestClient, email: str, password: str):
    signup_payload = {
        "first_name": "Henry",
        "last_name": "Jeremmy",
        "email": email,
        "password": password,
        "confirm_password": password,
    }

    signup_response = client.post("/api/v1/auth/signup", json=signup_payload)
    assert signup_response.status_code in (200, 201)

    resend_response = client.post("/api/v1/auth/resend-otp", json={"email": email})
    assert resend_response.status_code == 200

    # In test mode, OTP may be stored in DB and not actually emailed.
    # So login before verification should fail if verification is enforced.
    return signup_response


def login_and_get_token(client: TestClient, email: str, password: str) -> str:
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    return data["access_token"]


def test_create_meal_entry_requires_auth(client):
    response = client.post(
        "/api/v1/logs/meals",
        json={
            "meal_type": "breakfast",
            "foods_text": "oatmeal and banana",
            "notes": "light breakfast",
        },
    )
    assert response.status_code in (401, 403)


def test_create_meal_entry_success(client, test_db):
    email = "mealuser@example.com"
    password = "Secret123"

    # Create verified user directly in test flow if needed
    from app.models.user import User
    from app.services.auth import hash_password
    from datetime import datetime, timezone

    user = User(
        first_name="Henry",
        last_name="Jeremy",
        email=email,
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    token = login_and_get_token(client, email, password)

    response = client.post(
        "/api/v1/logs/meals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "meal_type": "breakfast",
            "foods_text": "oatmeal and banana",
            "notes": "light breakfast",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["meal_type"] == "breakfast"
    assert data["foods_text"] == "oatmeal and banana"
    assert data["user_id"] == user.id
    assert "created_at" in data


def test_create_symptom_entry_success(client, test_db):
    email = "symptomuser@example.com"
    password = "Secret123"

    from app.models.user import User
    from app.services.auth import hash_password
    from datetime import datetime, timezone

    user = User(
        first_name="Henry",
        last_name="Jeremy",
        email=email,
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    token = login_and_get_token(client, email, password)

    response = client.post(
        "/api/v1/logs/symptoms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "fatigue": True,
            "cravings": False,
            "bloating": True,
            "mood_change": False,
            "notes": "noticed bloating after breakfast",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["fatigue"] is True
    assert data["bloating"] is True
    assert data["user_id"] == user.id
    assert "created_at" in data


def test_create_lifestyle_entry_success(client, test_db):
    email = "lifestyleuser@example.com"
    password = "Secret123"

    from app.models.user import User
    from app.services.auth import hash_password
    from datetime import datetime, timezone

    user = User(
        first_name="Henry",
        last_name="Jeremy",
        email=email,
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    token = login_and_get_token(client, email, password)

    response = client.post(
        "/api/v1/logs/lifestyle",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "sleep_hours": 6.5,
            "exercise_minutes": 30,
            "water_litres": 2.0,
            "stress_level": "medium",
            "mood": "okay",
            "activity_notes": "walked after lunch",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["sleep_hours"] == 6.5
    assert data["exercise_minutes"] == 30
    assert data["user_id"] == user.id
    assert "created_at" in data