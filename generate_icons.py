from PIL import Image, ImageDraw

def create_icon(size: int, filename: str):
    # Pure black background
    img = Image.new('RGB', (size, size), color=(0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Simple geometry logo: A triangle intersecting a circle
    circle_bbox = [size*0.25, size*0.25, size*0.75, size*0.75]
    triangle_coords = [
        (size*0.5, size*0.15),   # Top
        (size*0.2, size*0.8),    # Bottom Left
        (size*0.8, size*0.8)     # Bottom Right
    ]
    
    # Draw geometric pattern in white
    d.polygon(triangle_coords, fill=None, outline=(255, 255, 255), width=max(2, size // 30))
    d.ellipse(circle_bbox, fill=None, outline=(255, 255, 255), width=max(2, size // 30))
    
    img.save(f"public/{filename}")
    print(f"Generated {filename}")

if __name__ == "__main__":
    create_icon(192, "icon-192x192.png")
    create_icon(512, "icon-512x512.png")
