from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.core.config import settings
from app.api.logging import router as logging_router
from app.api.ai_test import router as ai_test_router
from app.api.ai_inference import router as ai_inference_router



app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for the myPCOS web application.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(logging_router, prefix=settings.api_prefix)
app.include_router(ai_test_router, prefix=settings.api_prefix)
app.include_router(ai_inference_router, prefix=settings.api_prefix)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }


