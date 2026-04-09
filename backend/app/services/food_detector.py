from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from ultralytics import YOLO


MODEL_PATH = Path("/Users/henrychijioke/myPCOS_model_Training/models/best.pt")
DATA_YAML_PATH = Path("/Users/henrychijioke/myPCOS_model_Training/data.yaml")


class FoodDetectorService:
    def __init__(self, model_path: Path, data_yaml_path: Path) -> None:
        self.model_path = model_path
        self.data_yaml_path = data_yaml_path
        self.model: YOLO | None = None
        self.class_names = self._load_class_names()
        self.is_available = False
        self.load_error: str | None = None

        self._load_model()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            self.load_error = f"Model weights not found at {self.model_path}"
            return

        try:
            self.model = YOLO(str(self.model_path))
            self.is_available = True
        except Exception as exc:
            self.load_error = str(exc)

    def _load_class_names(self) -> dict[int, str]:
        if not self.data_yaml_path.exists():
            return {}

        with self.data_yaml_path.open("r", encoding="utf-8") as file:
            data = yaml.safe_load(file)

        names = data.get("names", {})
        return {int(class_id): str(name) for class_id, name in names.items()}

    def predict(self, image_path: str, confidence_threshold: float = 0.25) -> list[dict[str, Any]]:
        if self.model is None:
            raise RuntimeError(self.load_error or "Food detector model is unavailable.")

        results = self.model.predict(
            source=image_path,
            conf=confidence_threshold,
            save=False,
            verbose=False,
        )

        detections: list[dict[str, Any]] = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()

                detections.append(
                    {
                        "class_id": class_id,
                        "label": self.class_names.get(class_id, f"class_{class_id}"),
                        "confidence": confidence,
                        "bbox": {
                            "x1": float(xyxy[0]),
                            "y1": float(xyxy[1]),
                            "x2": float(xyxy[2]),
                            "y2": float(xyxy[3]),
                        },
                    }
                )

        return detections


food_detector = FoodDetectorService(
    model_path=MODEL_PATH,
    data_yaml_path=DATA_YAML_PATH,
)
