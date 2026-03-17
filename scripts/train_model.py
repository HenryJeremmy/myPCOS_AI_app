from ultralytics import YOLO

# Load YOLO11 small model
model = YOLO("yolo11s.pt")

# Train
model.train(
    data="data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,
    project="runs",
    name="myPCOS_food_detector"
)