import os
import shutil
import pandas as pd

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
excel_file = os.path.join(project_root, 'data', 'Food_Classes_Selection.xlsx')
raw_dataset = os.path.join(project_root, 'dataset_raw')
selected_dataset = os.path.join(project_root, 'dataset_selected')

os.makedirs(selected_dataset, exist_ok=True)

df = pd.read_excel(excel_file)

for _, row in df.iterrows():
    original_id = str(int(row['Original Dataset ID']))
    food_name = str(row['Food name']).strip().replace('/', '_')
    target_images = int(row['Target images'])
    source_folder = os.path.join(raw_dataset, original_id)
    dest_folder = os.path.join(selected_dataset, original_id)
    os.makedirs(dest_folder, exist_ok=True)

    bb_file = os.path.join(source_folder, 'bb_info.txt')
    if os.path.exists(bb_file):
        shutil.copy(bb_file, os.path.join(dest_folder, 'bb_info.txt'))

    images = [f for f in os.listdir(source_folder) if f.lower().endswith('.jpg')]
    images = images[:target_images]

    for img in images:
        shutil.copy(os.path.join(source_folder, img), os.path.join(dest_folder, img))

    print(f'Copied {len(images)} images for class {original_id} - {food_name}')

print('Image selection completed.')