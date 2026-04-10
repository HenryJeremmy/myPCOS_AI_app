from app.services.food_detector import food_detector

TEST_IMAGE_PATH = "/Users/henrychijioke/myPCOS_model_Training/test_images/1_66.jpg"


def main() -> None:
    detections = food_detector.predict(TEST_IMAGE_PATH)

    print("Model loaded successfully.")
    print(f"Total detections: {len(detections)}")

    for index, detection in enumerate(detections, start=1):
        print(f"\nDetection {index}")
        print(f"Label: {detection['label']}")
        print(f"Confidence: {detection['confidence']:.4f}")
        print(f"Bounding box: {detection['bbox']}")


if __name__ == "__main__":
    main()
