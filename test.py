
from PIL import Image
import numpy as np

# Assuming 'image_array' is your 1D array representing the 28x28 image
image_arrayy = np.load("./data/sketches/castle.npy") # Example random 1D array
for  i in range(500):
    image_array=image_arrayy[i]
# Reshape to 2D array
    image_2d = image_array.reshape(28, 28)

# Convert to PIL image
    image_pil = Image.fromarray(image_2d.astype(np.uint8))

# Define the desired size for scaling
    new_size = (256, 256)  # Scale to 56x56

# Scale the image
    scaled_image_pil = image_pil.resize(new_size, Image.BILINEAR)  # You can choose other interpolation methods like Image.BICUBIC

# Save the scaled image
    scaled_image_pil.save("./data/sketchespng/castle/"+str(i)+".png")  # You can specify the format (.png, .jpg, etc.)
