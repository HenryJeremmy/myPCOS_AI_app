from datetime import datetime, timezone

from app.models.user import User
from app.services.auth import hash_password


def login_and_get_token(client, email: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_auth_me_returns_first_name_for_authenticated_user(client, test_db):
    user = User(
        first_name="Henry",
        last_name="Jeremmy",
        email="profile@example.com",
        hashed_password=hash_password("Secret123"),
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    token = login_and_get_token(client, "profile@example.com", "Secret123")

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@example.com"
    assert data["first_name"] == "Henry"
