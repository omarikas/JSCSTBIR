
import numpy as np
import json

# Step 1: Load the .npy file
npy_file_path = './data/sketches/hotairballoon.npy'  # Replace with the path to your .npy file
data = np.load(npy_file_path)

# Step 2: Convert the data to a list
data_list = data.tolist()  # Convert the NumPy array to a Python list

# Step 3: Save the list as a JSON file
json_file_path = 'path_to_your_json_file.json'  # Replace with the desired path for the JSON file

# Use the json library to save the data as a JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(data_list, json_file)

print(f"The data has been saved as a JSON file at {json_file_path}")
