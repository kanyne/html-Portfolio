import os
import numpy as np
from PIL import Image, ImageFilter

os.makedirs("public/media", exist_ok=True)

src = Image.open("assets/ad/c24-logo-ref.jpg").convert("RGB")
arr = np.array(src, dtype=np.float32)

# Distance from pure white background (255, 255, 255)
dist = np.max(255.0 - arr, axis=2)

# Find tight bounding box of non-white pixels
ys, xs = np.where(dist > 18.0)
pad = 16
y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + pad)
x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + pad)

crop = arr[y0:y1, x0:x1]
crop_dist = dist[y0:y1, x0:x1]

# Smooth anti-aliased alpha matte un-premultiplying white background
alpha = np.clip((crop_dist - 10.0) / 55.0, 0.0, 1.0)
# Unmix white: C_orig = (C - (1 - alpha)*255) / alpha
safe_a = np.maximum(alpha[..., None], 0.05)
unmixed = np.clip((crop - (1.0 - alpha[..., None]) * 255.0) / safe_a, 0.0, 255.0)

# 1) Official Dark-Wordmark Logo (for light B&O end card)
rgba_dark = np.zeros((crop.shape[0], crop.shape[1], 4), dtype=np.uint8)
rgba_dark[..., :3] = unmixed.astype(np.uint8)
rgba_dark[..., 3] = (alpha * 255.0).astype(np.uint8)
Image.fromarray(rgba_dark, "RGBA").save("public/media/c24-logo-dark.png")

# 2) Official Light-Wordmark Logo (keeps vibrant purple-pink-orange bracket, turns dark navy #1E1B3A bolt + wordmark crisp white!)
# Detect colorful gradient pixels vs dark navy pixels via HSV saturation / brightness
r, g, b = unmixed[..., 0], unmixed[..., 1], unmixed[..., 2]
maxc = np.maximum(np.maximum(r, g), b)
minc = np.minimum(np.minimum(r, g), b)
sat = (maxc - minc) / np.maximum(maxc, 1.0)
# Dark navy has low maxc (< 95) whereas bracket gradient has maxc > 160 & high saturation
navy_weight = np.clip((125.0 - maxc) / 55.0, 0.0, 1.0)
light_rgb = unmixed * (1.0 - navy_weight[..., None]) + np.array([250.0, 250.0, 255.0]) * navy_weight[..., None]

rgba_light = np.zeros_like(rgba_dark)
rgba_light[..., :3] = np.clip(light_rgb, 0, 255).astype(np.uint8)
rgba_light[..., 3] = (alpha * 255.0).astype(np.uint8)
Image.fromarray(rgba_light, "RGBA").save("public/media/c24-logo-light.png")

# 3) Extract just the [bolt] icon mark on the left (up to gap before 'C' of Content24)
col_ink = (alpha > 0.25).sum(axis=0)
# Find the whitespace column between bracket icon (~first 20% width) and 'C'
search_start = int(crop.shape[1] * 0.14)
search_end = int(crop.shape[1] * 0.28)
split_x = search_start + int(np.argmin(col_ink[search_start:search_end]))

icon_dark = rgba_dark[:, :split_x]
icon_light = rgba_light[:, :split_x]
Image.fromarray(icon_dark, "RGBA").save("public/media/c24-icon-dark.png")
Image.fromarray(icon_light, "RGBA").save("public/media/c24-icon-light.png")

print(f"Extracted logo size={crop.shape[1]}x{crop.shape[0]}, icon split_x={split_x}")
