from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "service": "mypcos-backend",
        "ai_inference_enabled": settings.ai_inference_enabled,
    }
