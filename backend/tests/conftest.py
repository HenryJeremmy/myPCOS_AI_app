# import pytest
# from fastapi.testclient import TestClient
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.pool import StaticPool

# from app.main import app
# from app.db.base import Base
# from app.api.auth import get_db

# SQLALCHEMY_DATABASE_URL = "sqlite://"

# test_engine = create_engine(
#     SQLALCHEMY_DATABASE_URL,
#     connect_args={"check_same_thread": False},
#     poolclass=StaticPool,
# )

# TestingSessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=test_engine,
# )


# def override_get_db():
#     db = TestingSessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# @pytest.fixture(scope="function")
# def client():
#     Base.metadata.create_all(bind=test_engine)
#     app.dependency_overrides[get_db] = override_get_db

#     with TestClient(app) as c:
#         yield c

#     app.dependency_overrides.clear()
#     Base.metadata.drop_all(bind=test_engine)



import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.api.auth import get_db

SQLALCHEMY_DATABASE_URL = "sqlite://"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()