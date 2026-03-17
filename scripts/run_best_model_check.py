from ultralytics import YOLO

model = YOLO("models/best.pt")

results = model.predict(
    source="test_images/1_66.jpg",
    save=True,
    conf=0.25
)

for r in results:
    print(r.boxes)