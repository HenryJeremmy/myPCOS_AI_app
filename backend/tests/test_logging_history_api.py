from datetime import datetime, timezone

from app.models.user import User
from app.models.meal_entry import MealEntry
from app.models.symptom_entry import SymptomEntry
from app.models.lifestyle_entry import LifestyleEntry
from app.services.auth import hash_password


def create_verified_user(test_db, email: str, password: str, first_name: str = "Henry"):
    user = User(
        first_name=first_name,
        last_name="Jeremmy",
        email=email,
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


def login_and_get_token(client, email: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]



def test_authenticated_user_can_list_their_own_meal_entries(client, test_db):
    user = create_verified_user(test_db, "meals@example.com", "Secret123")

    test_db.add(
        MealEntry(
            user_id=user.id,
            meal_type="breakfast",
            foods_text="oats and banana",
            image_url=None,
            notes="morning meal",
            created_at=datetime.now(timezone.utc),
        )
    )
    test_db.commit()

    token = login_and_get_token(client, "meals@example.com", "Secret123")
    response = client.get(
        "/api/v1/logs/meals",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["meal_type"] == "breakfast"
    assert "created_at" in data[0]


def test_authenticated_user_can_list_their_own_symptom_entries(client, test_db):
    user = create_verified_user(test_db, "symptoms@example.com", "Secret123")

    test_db.add(
        SymptomEntry(
            user_id=user.id,
            fatigue=True,
            cravings=False,
            bloating=True,
            mood_change=False,
            notes="felt bloated after lunch",
            created_at=datetime.now(timezone.utc),
        )
    )
    test_db.commit()

    token = login_and_get_token(client, "symptoms@example.com", "Secret123")
    response = client.get(
        "/api/v1/logs/symptoms",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["bloating"] is True
    assert "created_at" in data[0]


def test_authenticated_user_can_list_their_own_lifestyle_entries(client, test_db):
    user = create_verified_user(test_db, "lifestyle@example.com", "Secret123")

    test_db.add(
        LifestyleEntry(
            user_id=user.id,
            sleep_hours=7.5,
            exercise_minutes=30,
            water_litres=2.0,
            stress_level="medium",
            mood="okay",
            activity_notes="walked after lunch",
            created_at=datetime.now(timezone.utc),
        )
    )
    test_db.commit()

    token = login_and_get_token(client, "lifestyle@example.com", "Secret123")
    response = client.get(
        "/api/v1/logs/lifestyle",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sleep_hours"] == 7.5
    assert "created_at" in data[0]


def test_user_cannot_see_another_users_meal_entries(client, test_db):
    owner = create_verified_user(test_db, "owner@example.com", "Secret123", first_name="Owner")
    stranger = create_verified_user(test_db, "stranger@example.com", "Secret123", first_name="Stranger")

    test_db.add(
        MealEntry(
            user_id=owner.id,
            meal_type="dinner",
            foods_text="rice and chicken",
            image_url=None,
            notes="owner meal",
            created_at=datetime.now(timezone.utc),
        )
    )
    test_db.commit()

    token = login_and_get_token(client, "stranger@example.com", "Secret123")
    response = client.get(
        "/api/v1/logs/meals",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    assert response.status_code == 200
    data = response.json()
    assert data == []
  
