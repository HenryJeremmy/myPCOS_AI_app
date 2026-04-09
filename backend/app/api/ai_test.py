from fastapi import APIRouter

from app.services.food_detector import food_detector

router = APIRouter(prefix="/ai-test", tags=["ai-test"])

TEST_IMAGE_PATH = "/Users/henrychijioke/myPCOS_model_Training/test_images/1_66.jpg"


@router.get("/predict")
def test_prediction():
    detections = food_detector.predict(TEST_IMAGE_PATH)

    return {
        "message": "Test prediction completed successfully",
        "image_path": TEST_IMAGE_PATH,
        "total_detections": len(detections),
        "detections": detections,
    }
