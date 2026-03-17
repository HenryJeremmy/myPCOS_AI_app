import os
import cv2
import pandas as pd
from sklearn.model_selection import train_test_split
import shutil
from collections import defaultdict

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
excel_file = os.path.join(project_root, "data", "Food_Classes_Selection.xlsx")
selected_dataset = os.path.join(project_root, "dataset_selected")
yolo_dataset = os.path.join(project_root, "dataset_yolo")

# Load Excel
df = pd.read_excel(excel_file)
df.columns = df.columns.str.strip()

print("Using columns:", df.columns.tolist())

# Map original dataset ID -> new YOLO class ID
class_map = {
    str(int(row["Original Dataset ID"])): int(row["New ID"])
    for _, row in df.iterrows()
}

print("Class map:", class_map)

# Dictionary to merge all labels belonging to the same image
# key = image base name, value = {"img_path": ..., "labels": [...]}
merged_data = {}

for original_id, new_class_id in class_map.items():
    folder = os.path.join(selected_dataset, original_id)
    bb_file = os.path.join(folder, "bb_info.txt")

    print(f"\nChecking class folder: {folder}")

    if not os.path.exists(folder):
        print(f"  Folder missing: {folder}")
        continue

    if not os.path.exists(bb_file):
        print(f"  bb_info.txt missing in: {folder}")
        continue

    with open(bb_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    valid_count = 0

    for line in lines:
        parts = line.strip().split()

        if not parts:
            continue

        # Skip header
        if parts[0].lower() == "img":
            continue

        # Expected format: img x1 y1 x2 y2
        if len(parts) < 5:
            continue

        img_stem = parts[0]              # e.g. 6089
        img_name = img_stem + ".jpg"     # actual file name
        img_path = os.path.join(folder, img_name)

        if not os.path.exists(img_path):
            continue

        img = cv2.imread(img_path)
        if img is None:
            continue

        h, w, _ = img.shape

        try:
            x1, y1, x2, y2 = map(int, parts[1:5])
        except ValueError:
            continue

        # Convert to YOLO normalized format
        x_center = ((x1 + x2) / 2) / w
        y_center = ((y1 + y2) / 2) / h
        bw = (x2 - x1) / w
        bh = (y2 - y1) / h

        label_line = f"{new_class_id} {x_center:.6f} {y_center:.6f} {bw:.6f} {bh:.6f}"

        # Use the image stem as unique key so duplicates across folders merge
        unique_key = img_stem

        if unique_key not in merged_data:
            merged_data[unique_key] = {
                "img_path": img_path,
                "img_name": img_name,
                "labels": []
            }

        # Add label if not already present
        if label_line not in merged_data[unique_key]["labels"]:
            merged_data[unique_key]["labels"].append(label_line)

        valid_count += 1

    print(f"  Valid annotations found for class {original_id}: {valid_count}")

# Convert merged dictionary to list
all_images = list(merged_data.values())

print(f"\nTotal unique merged images: {len(all_images)}")

if len(all_images) == 0:
    raise ValueError("No valid images found after merging. Check dataset_selected folders and bb_info.txt format.")

# Split dataset
train_data, temp_data = train_test_split(all_images, test_size=0.3, random_state=42)
val_data, test_data = train_test_split(temp_data, test_size=0.33, random_state=42)

splits = {
    "train": train_data,
    "val": val_data,
    "test": test_data
}

# Clear old output folders if needed
for split_name in splits.keys():
    img_dir = os.path.join(yolo_dataset, "images", split_name)
    label_dir = os.path.join(yolo_dataset, "labels", split_name)
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(label_dir, exist_ok=True)

# Write images and merged labels
for split_name, split_items in splits.items():
    img_dir = os.path.join(yolo_dataset, "images", split_name)
    label_dir = os.path.join(yolo_dataset, "labels", split_name)

    for item in split_items:
        dst_img = os.path.join(img_dir, item["img_name"])
        shutil.copy(item["img_path"], dst_img)

        label_file = os.path.join(label_dir, os.path.splitext(item["img_name"])[0] + ".txt")
        with open(label_file, "w", encoding="utf-8") as f:
            for label in item["labels"]:
                f.write(label + "\n")

print("YOLO merged dataset conversion completed.")