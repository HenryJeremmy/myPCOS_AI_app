from io import BytesIO
from pathlib import Path
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/heic",
    "image/heif",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".heif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/predict")
async def predict_uploaded_image(file: UploadFile = File(...)):
    if not settings.ai_inference_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI meal prediction is not enabled on this backend deployment."
            ),
        )

    file_suffix = Path(file.filename or "upload.jpg").suffix.lower()

    if (
        file.content_type not in ALLOWED_IMAGE_TYPES
        and file_suffix not in ALLOWED_EXTENSIONS
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a JPG, PNG, or HEIC image.",
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum allowed size is 5MB.",
        )

    try:
        from PIL import Image, UnidentifiedImageError
        from pillow_heif import register_heif_opener
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image processing dependencies are not installed on this backend instance.",
        ) from exc

    register_heif_opener()

    try:
        image = Image.open(BytesIO(contents))
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid readable image.",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        image.save(temp_file, format="JPEG")
        temp_file_path = temp_file.name

    try:
        from app.services.food_detector import food_detector

        detections = food_detector.predict(temp_file_path)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    finally:
        Path(temp_file_path).unlink(missing_ok=True)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "total_detections": len(detections),
        "detections": detections,
    }
