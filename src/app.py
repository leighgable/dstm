import os
import glob
from google import genai
from PIL import Image
from io import BytesIO
from IPython.display import display

API_KEY = os.environ.get("GEMINI_API_KEY")
# -----------------

client = genai.Client(api_key=API_KEY)

import re
import glob

prompt = "Create a dress for a twirling character from the movie Brazil."

def select_best_images(prompt, image_dir='images'):
    """Selects top 2 images matching prompt words via regex."""
    # Extract words, ignore short ones/stopwords if desired, but here just basic splitting
    words = [w.lower() for w in re.findall(r'\b\w+\b', prompt) if len(w) > 3]
    
    if not words:
        # Fallback: return up to 2 random or first images if no significant words
        all_images = glob.glob(os.path.join(image_dir, '*.png'))
        return all_images[:2]

    pattern = '|'.join(map(re.escape, words))
    regex = re.compile(pattern, re.IGNORECASE)
    
    scores = []
    for filepath in glob.glob(os.path.join(image_dir, '*.png')):
        filename = os.path.basename(filepath)
        matches = len(regex.findall(filename))
        scores.append((matches, filepath))
    
    # Sort by matches (descending), then pick top 2
    scores.sort(key=lambda x: x[0], reverse=True)
    best_images = [filepath for score, filepath in scores[:2]]
    return best_images

# Select images based on prompt
image_files = select_best_images(prompt)
print(f"Selected images: {image_files}")

images = [Image.open(f) for f in image_files]

if not images:
    print("No images found for context.")
else:
    print(f"Using {len(images)} images for context.")

print("Generating image...")

# Call the API to generate the image
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents=[prompt, *images],
)

image_parts = [
    part.inline_data.data
    for part in response.candidates[0].content.parts
    if part.inline_data
]
 
if image_parts:
    image = Image.open(BytesIO(image_parts[0]))
    image.save('generated_dress.png')
    display(image)
