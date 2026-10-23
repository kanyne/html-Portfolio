import json
import math
import multiprocessing as mp
import os
import subprocess
import sys
import time
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

FPS = 30
DURATION = 30.0
TOTAL_FRAMES = int(FPS * DURATION)

DEFAULT_COPY = {
    "act1_tag": "01  /  PERCEPTION",
    "act1_title": "Every great idea starts with a vision.",
    "act1_sub": "Why scatter yours across a dozen AI tools?",
    "act2_tag": "02  /  MULTIMODAL STUDIO",
    "act2_title": "Write. Design. Film. Automate.",
    "act3_tag": "03  /  CONVERGENCE",
    "act3_title_1": "Every flagship AI.",
    "act3_title_2": "One unified hub.",
    "act4_tag": "THE ALL-IN-ONE AI PLATFORM",
    "act4_title": "Meet Content24 AI",
    "act4_sub": "GPT-5 · Claude · Gemini · Runway · Perplexity · Sora — in one workspace.",
    "act5_tagline": "EVERYTHING AI.  ONE HUB.",
    "act5_cta": "app.content24.ai",
}

# Shared worker state initialized once per forked process
CTX = {}


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def smoothstep(e0, e1, x):
    t = clamp((x - e0) / max(1e-6, (e1 - e0)))
    return t * t * (3.0 - 2.0 * t)


def ease_out_expo(t):
    t = clamp(t)
    return 1.0 if t >= 0.999 else 1.0 - (2.0 ** (-10.0 * t))


def ease_in_out_cubic(t):
    t = clamp(t)
    return 4 * t * t * t if t < 0.5 else 1 - ((-2 * t + 2) ** 3) / 2


def load_font(name, size):
    return ImageFont.truetype(os.path.join("public/fonts", name), size)


def make_pill_sprite(w, h, radius, fill_rgba, border_rgba, border_w=2, accent_rgb=None, title="", subtitle="", title_font=None, sub_font=None):
    S = 2
    W2, H2, R2 = w * S, h * S, radius * S
    canvas = Image.new("RGBA", (W2, H2), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([2, 2, W2 - 3, H2 - 3], radius=R2, fill=fill_rgba, outline=border_rgba, width=border_w * S)

    text_x = 34 * S
    if accent_rgb is not None:
        dot_r = 7 * S
        cx = 26 * S
        cy = H2 // 2
        glow = Image.new("RGBA", (W2, H2), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse([cx - dot_r * 2, cy - dot_r * 2, cx + dot_r * 2, cy + dot_r * 2], fill=(*accent_rgb, 125))
        glow = glow.filter(ImageFilter.GaussianBlur(7 * S))
        canvas = Image.alpha_composite(canvas, glow)
        d = ImageDraw.Draw(canvas)
        d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=(*accent_rgb, 255))
        text_x = 46 * S

    if title and subtitle and title_font and sub_font:
        tf = ImageFont.truetype(title_font.path, title_font.size * S)
        sf = ImageFont.truetype(sub_font.path, sub_font.size * S)
        tb = d.textbbox((0, 0), title, font=tf)
        sb = d.textbbox((0, 0), subtitle, font=sf)
        total_th = (tb[3] - tb[1]) + 7 * S + (sb[3] - sb[1])
        top_y = (H2 - total_th) // 2 - tb[1]
        d.text((text_x, top_y), title, font=tf, fill=(252, 252, 255, 255))
        d.text((text_x, top_y + (tb[3] - tb[1]) + 8 * S), subtitle, font=sf, fill=(192, 198, 220, 236))
    elif title and title_font:
        tf = ImageFont.truetype(title_font.path, title_font.size * S)
        tb = d.textbbox((0, 0), title, font=tf)
        top_y = (H2 - (tb[3] - tb[1])) // 2 - tb[1]
        d.text((text_x, top_y), title, font=tf, fill=(252, 252, 255, 255))

    return canvas.resize((w, h), Image.Resampling.LANCZOS)


def zoom_pan_plate(src_img, W, H, fx, fy, zoom=1.0, dx=0.0, dy=0.0, dst_fx=0.5, dst_fy=0.5):
    sw, sh = src_img.size
    base = max(W / sw, H / sh)
    scale = base * zoom
    inv_s = 1.0 / scale
    a = inv_s
    c = fx * sw - (W * dst_fx + dx) * inv_s
    e = inv_s
    f = fy * sh - (H * dst_fy + dy) * inv_s
    return src_img.transform((W, H), Image.Transform.AFFINE, (a, 0.0, c, 0.0, e, f), resample=Image.Resampling.BILINEAR)


def radial_zoom_blur(src_img, W, H, fx, fy, zoom, blur_strength=0.12, samples=4, dx=0.0, dy=0.0, dst_fx=0.5, dst_fy=0.5):
    if blur_strength <= 0.002:
        return zoom_pan_plate(src_img, W, H, fx, fy, zoom=zoom, dx=dx, dy=dy, dst_fx=dst_fx, dst_fy=dst_fy)
    acc = None
    weights = np.linspace(1.0, 0.55, samples, dtype=np.float32)
    weights /= weights.sum()
    for i in range(samples):
        u = (i / max(1, samples - 1)) - 0.5
        z_i = zoom * (1.0 + u * blur_strength * 2.2)
        im_i = zoom_pan_plate(src_img, W, H, fx, fy, zoom=z_i, dx=dx, dy=dy, dst_fx=dst_fx, dst_fy=dst_fy)
        arr_i = np.asarray(im_i, dtype=np.float32)
        acc = arr_i * weights[i] if acc is None else (acc + arr_i * weights[i])
    r_shift = zoom_pan_plate(src_img, W, H, fx, fy, zoom=zoom * (1.0 + blur_strength * 0.35), dx=dx, dy=dy, dst_fx=dst_fx, dst_fy=dst_fy)
    acc[..., 0] = 0.72 * acc[..., 0] + 0.28 * np.asarray(r_shift, dtype=np.float32)[..., 0]
    return Image.fromarray(np.clip(acc, 0, 255).astype(np.uint8), "RGB")


def find_perspective_coeffs(dst_pts, src_pts):
    matrix = []
    for p1, p2 in zip(dst_pts, src_pts):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0] * p1[0], -p2[0] * p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1] * p1[0], -p2[1] * p1[1]])
    A = np.array(matrix, dtype=np.float64)
    B = np.array(src_pts, dtype=np.float64).reshape(8)
    return tuple(np.linalg.solve(A, B).tolist())


def paste_alpha(base_rgb, overlay_rgba, x, y, opacity=1.0):
    if opacity <= 0.004:
        return base_rgb
    ow, oh = overlay_rgba.size
    W, H = base_rgb.size
    if x >= W or y >= H or x + ow <= 0 or y + oh <= 0:
        return base_rgb
    sx0 = max(0, -x)
    sy0 = max(0, -y)
    dx0 = max(0, x)
    dy0 = max(0, y)
    cw = min(ow - sx0, W - dx0)
    ch = min(oh - sy0, H - dy0)
    if cw <= 0 or ch <= 0:
        return base_rgb
    sub_over = overlay_rgba.crop((sx0, sy0, sx0 + cw, sy0 + ch))
    if opacity < 0.996:
        r, g, b, a = sub_over.split()
        a = a.point(lambda p: int(p * opacity))
        sub_over = Image.merge("RGBA", (r, g, b, a))
    sub_base = base_rgb.crop((dx0, dy0, dx0 + cw, dy0 + ch)).convert("RGBA")
    comp = Image.alpha_composite(sub_base, sub_over).convert("RGB")
    base_rgb.paste(comp, (dx0, dy0))
    return base_rgb


def build_monolith_frame(screen_img, mono_w, mono_h, url_label, header_font, badge_font):
    """Build sleek dark anodized aluminum + glass browser monolith with 100% vector icons & zero left-sidebar clipping."""
    S = 2
    W2, H2 = mono_w * S, mono_h * S
    R2 = 22 * S
    bar_h = 44 * S

    card = Image.new("RGBA", (W2, H2), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle([0, 0, W2 - 1, H2 - 1], radius=R2, fill=(14, 13, 26, 255))

    content_w = W2 - 12 * S
    content_h = H2 - bar_h - 6 * S
    sw, sh = screen_img.size
    sc = max(content_w / sw, content_h / sh)
    nw, nh = int(sw * sc), int(sh * sc)
    resized = screen_img.resize((nw, nh), Image.Resampling.LANCZOS)
    # Keep crop_x = 0 so the entire left [bolt] Content24 sidebar logo & navigation remain 100% unclipped!
    screen_crop = resized.crop((0, 0, content_w, content_h))

    mask = Image.new("L", (content_w, content_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, content_w - 1, content_h - 1], radius=14 * S, fill=255)
    card.paste(screen_crop, (6 * S, bar_h), mask)

    d = ImageDraw.Draw(card)
    dot_y = bar_h // 2
    for idx_c, col in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = (22 + idx_c * 18) * S
        d.ellipse([cx - 5 * S, dot_y - 5 * S, cx + 5 * S, dot_y + 5 * S], fill=(*col, 235))

    # Center URL bar with crisp vector padlock icon
    pill_w = min(int(mono_w * 0.44) * S, W2 - 260 * S)
    px0 = (W2 - pill_w) // 2
    d.rounded_rectangle([px0, 8 * S, px0 + pill_w, bar_h - 8 * S], radius=9 * S, fill=(28, 26, 48, 255), outline=(92, 82, 148, 160), width=S)
    hf = ImageFont.truetype(header_font.path, header_font.size * S)
    ub = d.textbbox((0, 0), url_label, font=hf)
    tw_url = ub[2] - ub[0]
    lock_w = 11 * S
    start_ux = (W2 - (lock_w + 9 * S + tw_url)) // 2
    # Vector padlock shackle + body
    ly_mid = bar_h // 2
    d.arc([start_ux + 2 * S, ly_mid - 7 * S, start_ux + 9 * S, ly_mid], 180, 0, fill=(167, 243, 208, 240), width=2 * S)
    d.rounded_rectangle([start_ux, ly_mid - 2 * S, start_ux + lock_w, ly_mid + 6 * S], radius=2 * S, fill=(167, 243, 208, 240))
    d.text((start_ux + lock_w + 9 * S, (bar_h - (ub[3] - ub[1])) // 2 - ub[1]), url_label, font=hf, fill=(232, 232, 248, 255))

    # Right live status pill with crisp vector glowing emerald dot
    if mono_w >= 760:
        bf = ImageFont.truetype(badge_font.path, badge_font.size * S)
        live_txt = "ALL AI MODELS ACTIVE"
        lb = d.textbbox((0, 0), live_txt, font=bf)
        lw = (lb[2] - lb[0]) + 34 * S
        lx0 = W2 - lw - 18 * S
        d.rounded_rectangle([lx0, 9 * S, lx0 + lw, bar_h - 9 * S], radius=9 * S, fill=(88, 28, 135, 200), outline=(192, 132, 252, 210), width=S)
        dcx = lx0 + 13 * S
        d.ellipse([dcx - 4 * S, dot_y - 4 * S, dcx + 4 * S, dot_y + 4 * S], fill=(74, 222, 128, 255))
        d.text((lx0 + 23 * S, (bar_h - (lb[3] - lb[1])) // 2 - lb[1]), live_txt, font=bf, fill=(246, 230, 255, 255))

    # Signature purple -> pink -> orange specular outer border
    xs = np.linspace(0.0, 1.0, W2, dtype=np.float32)[None, :]
    r_ch = 168 * (1 - xs) + 249 * xs
    g_ch = 85 * (1 - xs) + 115 * xs
    b_ch = 247 * (1 - xs) + 22 * xs
    grad_rgb = np.stack([np.broadcast_to(r_ch, (H2, W2)), np.broadcast_to(g_ch, (H2, W2)), np.broadcast_to(b_ch, (H2, W2))], axis=2).astype(np.uint8)
    bmask = Image.new("L", (W2, H2), 0)
    ImageDraw.Draw(bmask).rounded_rectangle([1, 1, W2 - 2, H2 - 2], radius=R2, outline=225, width=3 * S)
    border_rgba = Image.merge("RGBA", (*Image.fromarray(grad_rgb, "RGB").split(), bmask))
    card = Image.alpha_composite(card, border_rgba)

    return card.resize((mono_w, mono_h), Image.Resampling.LANCZOS)


def draw_centered_text(frame_rgb, text, y, font, fill_rgba, W, shadow=True):
    dummy = ImageDraw.Draw(frame_rgb)
    bb = dummy.textbbox((0, 0), text, font=font)
    tw, th = bb[2] - bb[0] + 16, bb[3] - bb[1] + 16
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ox, oy = 8 - bb[0], 8 - bb[1]
    if shadow:
        d.text((ox, oy + 3), text, font=font, fill=(0, 0, 0, int(fill_rgba[3] * 0.65)))
    d.text((ox, oy), text, font=font, fill=fill_rgba)
    paste_alpha(frame_rgb, layer, (W - tw) // 2, y - 8, opacity=1.0)


def draw_left_text(frame_rgb, text, x, y, font, fill_rgba, shadow=True):
    dummy = ImageDraw.Draw(frame_rgb)
    bb = dummy.textbbox((0, 0), text, font=font)
    tw, th = bb[2] - bb[0] + 16, bb[3] - bb[1] + 16
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ox, oy = 8 - bb[0], 8 - bb[1]
    if shadow:
        d.text((ox, oy + 3), text, font=font, fill=(0, 0, 0, int(fill_rgba[3] * 0.68)))
    d.text((ox, oy), text, font=font, fill=fill_rgba)
    paste_alpha(frame_rgb, layer, x - 8, y - 8, opacity=1.0)


def init_context(aspect, copy_cfg):
    cfg = {**DEFAULT_COPY, **(copy_cfg or {})}
    is_wide = aspect == "16:9"
    W, H = (1920, 1080) if is_wide else (1080, 1920)

    p_iris = Image.open("assets/ad/scene1-iris.jpg").convert("RGB")
    p_ribbons = Image.open("assets/ad/scene2-ribbons.jpg").convert("RGB")
    p_prism = Image.open("assets/ad/scene2b-prism.jpg").convert("RGB")
    p_stage = Image.open("assets/ad/scene3-monolith.jpg").convert("RGB")

    ui_dash = Image.open("assets/ad/c24-dashboard.png").convert("RGB")
    ui_flow = Image.open("assets/ad/c24-workflows.png").convert("RGB")
    logo_dark = Image.open("public/media/c24-logo-dark.png").convert("RGBA")
    icon_light = Image.open("public/media/c24-icon-light.png").convert("RGBA")

    f_tag = load_font("SpaceGrotesk-Bold.ttf", 20 if is_wide else 23)
    f_h1 = load_font("PlusJakartaSans-ExtraBold.ttf", 60 if is_wide else 52)
    f_h2 = load_font("PlusJakartaSans-Bold.ttf", 52 if is_wide else 48)
    f_sub = load_font("Inter-Regular.ttf", 25 if is_wide else 24)
    f_card_t = load_font("PlusJakartaSans-Bold.ttf", 24 if is_wide else 27)
    f_card_s = load_font("Inter-Regular.ttf", 17 if is_wide else 19)
    f_url = load_font("SpaceGrotesk-Medium.ttf", 16 if is_wide else 15)
    f_badge = load_font("SpaceGrotesk-Bold.ttf", 13)
    f_end_tag = load_font("SpaceGrotesk-Bold.ttf", 24 if is_wide else 25)
    f_end_cta = load_font("PlusJakartaSans-Bold.ttf", 24 if is_wide else 25)

    cap_items = [
        ("AI Writer & SEO", "Articles, ad copy & brand voice", (168, 85, 247)),
        ("AI Image Studio", "4K visuals, edits & retouching", (236, 72, 153)),
        ("AI Video & Cinema", "Sora, Veo & synced audio cuts", (249, 115, 22)),
        ("AI Avatars & Audio", "Lifelike presenters & voiceovers", (56, 189, 248)),
        ("AI Workflows", "Automated multi-channel pipelines", (52, 211, 153)),
    ]
    cw_card = 450 if is_wide else 840
    ch_card = 114 if is_wide else 134
    cap_sprites = [
        make_pill_sprite(cw_card, ch_card, 22, (14, 13, 28, 218), (*col, 185), 2, col, t_s, s_s, f_card_t, f_card_s)
        for t_s, s_s, col in cap_items
    ]

    model_items = [
        ("OpenAI  ·  GPT-5", "Reasoning & Copy", (96, 165, 250)),
        ("Anthropic  ·  Claude", "Nuance & Strategy", (167, 139, 250)),
        ("Google  ·  Gemini", "Multimodal & Search", (244, 114, 182)),
        ("Runway  ·  Perplexity", "Motion & Live Web", (226, 232, 240)),
        ("Sora  ·  Veo  ·  Kling", "Cinema Video Synthesis", (251, 146, 60)),
    ]
    mw_card = 360 if is_wide else 430
    mh_card = 88 if is_wide else 102
    model_sprites = [
        make_pill_sprite(
            mw_card, mh_card, 18, (10, 12, 24, 232), (*col, 200), 2, col, t_s, s_s,
            load_font("PlusJakartaSans-Bold.ttf", 21 if is_wide else 22),
            load_font("Inter-Regular.ttf", 15 if is_wide else 16),
        )
        for t_s, s_s, col in model_items
    ]

    mono_w = 1140 if is_wide else 960
    mono_h = 620 if is_wide else 680
    mono_dash = build_monolith_frame(ui_dash, mono_w, mono_h, "app.content24.ai / dashboard", f_url, f_badge)
    mono_flow = build_monolith_frame(ui_flow, mono_w, mono_h, "app.content24.ai / ai-workflows", f_url, f_badge)

    halo_w, halo_h = mono_w + 260, mono_h + 220
    halo = Image.new("RGBA", (halo_w, halo_h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([40, 50, halo_w // 2 + 80, halo_h - 50], fill=(147, 51, 234, 125))
    hd.ellipse([halo_w // 2 - 80, 50, halo_w - 40, halo_h - 50], fill=(249, 115, 22, 115))
    halo = halo.filter(ImageFilter.GaussianBlur(58))

    # Pre-baked top dark gradient scrim & bottom dark gradient scrim for AAA typography contrast
    top_h = int(H * 0.28)
    ty_arr = np.linspace(1.0, 0.0, top_h, dtype=np.float32)[:, None]
    top_scrim = Image.merge(
        "RGBA",
        (
            Image.new("L", (W, top_h), 6),
            Image.new("L", (W, top_h), 7),
            Image.new("L", (W, top_h), 16),
            Image.fromarray(np.broadcast_to((ty_arr ** 1.5 * 172).astype(np.uint8), (top_h, W))),
        ),
    )
    bot_h = int(H * 0.34)
    by_arr = np.linspace(0.0, 1.0, bot_h, dtype=np.float32)[:, None]
    bot_scrim = Image.merge(
        "RGBA",
        (
            Image.new("L", (W, bot_h), 6),
            Image.new("L", (W, bot_h), 7),
            Image.new("L", (W, bot_h), 16),
            Image.fromarray(np.broadcast_to((by_arr ** 1.6 * 182).astype(np.uint8), (bot_h, W))),
        ),
    )

    # Platinum architectural End Card background
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist_norm = np.sqrt(((xx - W * 0.5) / (W * 0.65)) ** 2 + ((yy - H * 0.48) / (H * 0.65)) ** 2)
    plat_val = np.clip(247.0 - 20.0 * (dist_norm ** 1.35), 214.0, 249.0)
    plat_rgb = np.stack([plat_val, plat_val, np.clip(plat_val + 3.0, 0, 255)], axis=2).astype(np.uint8)
    end_bg = Image.fromarray(plat_rgb, "RGB")
    pad_m = 56 if is_wide else 48
    ImageDraw.Draw(end_bg).rectangle([pad_m, pad_m, W - pad_m, H - pad_m], outline=(214, 217, 228), width=2)

    target_lw = int(W * (0.42 if is_wide else 0.74))
    target_lh = int(logo_dark.height * (target_lw / logo_dark.width))
    end_logo_base = logo_dark.resize((target_lw, target_lh), Image.Resampling.LANCZOS)

    # CTA Pill with crisp 2x supersampled VECTOR right arrow (zero missing glyph!)
    cta_w = 400 if is_wide else 440
    cta_h = 66 if is_wide else 74
    S = 2
    cta_sp = Image.new("RGBA", (cta_w * S, cta_h * S), (0, 0, 0, 0))
    gx = np.linspace(0, 1, cta_w * S, dtype=np.float32)[None, :]
    gr = np.broadcast_to(139 * (1 - gx) + 249 * gx, (cta_h * S, cta_w * S))
    gg = np.broadcast_to(61 * (1 - gx) + 115 * gx, (cta_h * S, cta_w * S))
    gb = np.broadcast_to(255 * (1 - gx) + 22 * gx, (cta_h * S, cta_w * S))
    g_img = Image.fromarray(np.stack([gr, gg, gb], axis=2).astype(np.uint8), "RGB")
    g_mask = Image.new("L", (cta_w * S, cta_h * S), 0)
    ImageDraw.Draw(g_mask).rounded_rectangle([0, 0, cta_w * S - 1, cta_h * S - 1], radius=33 * S, fill=255)
    cta_sp.paste(g_img, (0, 0), g_mask)
    cd = ImageDraw.Draw(cta_sp)
    cf2 = ImageFont.truetype(f_end_cta.path, f_end_cta.size * S)
    cta_label = cfg["act5_cta"]
    cbb = cd.textbbox((0, 0), cta_label, font=cf2)
    tw_cta = cbb[2] - cbb[0]
    arr_len = 22 * S
    total_w_cta = tw_cta + 16 * S + arr_len
    sx_cta = (cta_w * S - total_w_cta) // 2
    cd.text((sx_cta, (cta_h * S - (cbb[3] - cbb[1])) // 2 - cbb[1]), cta_label, font=cf2, fill=(255, 255, 255, 255))
    ax0 = sx_cta + tw_cta + 16 * S
    ay0 = (cta_h * S) // 2
    cd.line([(ax0, ay0), (ax0 + arr_len, ay0)], fill=(255, 255, 255, 255), width=3 * S)
    cd.line([(ax0 + arr_len - 8 * S, ay0 - 7 * S), (ax0 + arr_len, ay0)], fill=(255, 255, 255, 255), width=3 * S)
    cd.line([(ax0 + arr_len - 8 * S, ay0 + 7 * S), (ax0 + arr_len, ay0)], fill=(255, 255, 255, 255), width=3 * S)
    cta_sprite = cta_sp.resize((cta_w, cta_h), Image.Resampling.LANCZOS)

    CTX.update(locals())


def render_single_frame(fi):
    c = CTX
    W, H, is_wide, cfg = c["W"], c["H"], c["is_wide"], c["cfg"]
    t = fi / FPS

    if t < 6.2:
        if t < 3.9:
            zoom = 1.02 + 0.10 * ease_in_out_cubic(t / 3.9)
            blur_s = 0.0
        else:
            u = (t - 3.9) / 2.3
            zoom = 1.12 * (13.5 ** (u ** 2.35))
            blur_s = 0.20 * smoothstep(0.05, 0.92, u)

        frame = radial_zoom_blur(c["p_iris"], W, H, fx=0.5229, fy=0.4576, zoom=zoom, blur_strength=blur_s)

        glint_op = smoothstep(1.8, 2.7, t) * (1.0 - smoothstep(3.8, 4.5, t)) * 0.44
        if glint_op > 0.01:
            iw = int(96 * zoom)
            ih = int(c["icon_light"].height * (iw / c["icon_light"].width))
            ic = c["icon_light"].resize((iw, ih), Image.Resampling.BILINEAR)
            paste_alpha(frame, ic, W // 2 - iw // 2, H // 2 - ih // 2, opacity=glint_op)

        txt_op = smoothstep(0.55, 1.35, t) * (1.0 - smoothstep(3.85, 4.45, t))
        if txt_op > 0.01:
            paste_alpha(frame, c["bot_scrim"], 0, H - c["bot_h"], opacity=txt_op)
            draw_left_text(frame, cfg["act1_tag"], int(W * 0.07), int(H * 0.065), c["f_tag"], (216, 180, 254, int(240 * txt_op)))
            base_y = int(H * (0.76 if is_wide else 0.77))
            draw_centered_text(frame, cfg["act1_title"], base_y, c["f_h1"], (255, 255, 255, int(252 * txt_op)), W)
            draw_centered_text(frame, cfg["act1_sub"], base_y + (80 if is_wide else 74), c["f_sub"], (208, 214, 235, int(238 * txt_op)), W)

        open_fade = smoothstep(0.0, 0.85, t)
        if open_fade < 0.999:
            frame = ImageEnhance.Brightness(frame).enhance(open_fade)
        if t > 5.75:
            u2 = smoothstep(5.75, 6.2, t)
            f_next = radial_zoom_blur(c["p_ribbons"], W, H, 0.50, 0.50, zoom=1.35 - 0.20 * u2, blur_strength=0.14 * (1.0 - u2))
            frame = Image.blend(frame, f_next, u2)

    elif t < 13.2:
        u = (t - 6.2) / 7.0
        entry_blur = 0.14 * (1.0 - smoothstep(6.2, 6.85, t))
        whip_out = 0.16 * smoothstep(12.75, 13.2, t)
        zoom = 1.15 - 0.10 * ease_out_expo(min(1.0, (t - 6.2) / 1.8)) + 0.08 * u
        pan_x = (u - 0.5) * (95.0 if is_wide else 55.0)
        frame = radial_zoom_blur(c["p_ribbons"], W, H, 0.50, 0.50, zoom=zoom, blur_strength=entry_blur + whip_out, dx=pan_x)

        head_op = smoothstep(6.45, 7.1, t) * (1.0 - smoothstep(12.55, 13.05, t))
        if head_op > 0.01:
            paste_alpha(frame, c["top_scrim"], 0, 0, opacity=head_op * 0.85)
            draw_left_text(frame, cfg["act2_tag"], int(W * 0.07), int(H * 0.065), c["f_tag"], (249, 168, 212, int(245 * head_op)))
            draw_left_text(frame, cfg["act2_title"], int(W * 0.07), int(H * 0.105), c["f_h1"], (255, 255, 255, int(254 * head_op)))

        fade_all_out = 1.0 - smoothstep(12.55, 13.05, t)
        cw_card, ch_card = c["cw_card"], c["ch_card"]
        for idx_c, sp in enumerate(c["cap_sprites"]):
            t_in = 6.75 + idx_c * 0.42
            p_in = ease_out_expo((t - t_in) / 0.75)
            op_c = clamp(p_in) * fade_all_out
            if op_c <= 0.01:
                continue
            lift = int((1.0 - p_in) * 34)
            if is_wide:
                if idx_c < 3:
                    row_w = 3 * cw_card + 2 * 34
                    cx = (W - row_w) // 2 + idx_c * (cw_card + 34)
                    cy = int(H * 0.47) + lift
                else:
                    row_w = 2 * cw_card + 34
                    cx = (W - row_w) // 2 + (idx_c - 3) * (cw_card + 34)
                    cy = int(H * 0.625) + lift
            else:
                cx = (W - cw_card) // 2
                cy = int(H * 0.27) + idx_c * (ch_card + 26) + lift
            paste_alpha(frame, sp, cx, cy, opacity=op_c)

        if t > 12.85:
            u3 = smoothstep(12.85, 13.2, t)
            dst_x = 0.50 if is_wide else 0.72
            f_next = radial_zoom_blur(c["p_prism"], W, H, 0.5736, 0.5090, zoom=1.22 - 0.12 * u3, blur_strength=0.14 * (1.0 - u3), dst_fx=dst_x)
            frame = Image.blend(frame, f_next, u3)

    elif t < 20.4:
        u = (t - 13.2) / 7.2
        entry_b = 0.13 * (1.0 - smoothstep(13.2, 13.75, t))
        crescendo_b = 0.22 * smoothstep(19.65, 20.4, t)
        zoom = 1.06 + 0.14 * ease_in_out_cubic(u) + 0.55 * (smoothstep(19.6, 20.4, t) ** 2)
        dst_x = 0.50 if is_wide else 0.72
        frame = radial_zoom_blur(c["p_prism"], W, H, fx=0.5736, fy=0.5090, zoom=zoom, blur_strength=entry_b + crescendo_b, dst_fx=dst_x)

        fade_out_3 = 1.0 - smoothstep(19.55, 20.1, t)
        h_op = smoothstep(13.45, 14.1, t) * fade_out_3
        apex_px = W // 2 if is_wide else int(W * 0.72)
        apex_py = H // 2 if is_wide else int(H * 0.52)

        if is_wide:
            tx = int(W * 0.60)
            ty = int(H * 0.17)
            if h_op > 0.01:
                draw_left_text(frame, cfg["act3_tag"], tx, ty, c["f_tag"], (196, 181, 253, int(245 * h_op)))
                draw_left_text(frame, cfg["act3_title_1"], tx, ty + 42, c["f_h2"], (255, 255, 255, int(254 * h_op)))
                draw_left_text(frame, cfg["act3_title_2"], tx, ty + 108, c["f_h2"], (253, 186, 116, int(254 * h_op)))
        else:
            if h_op > 0.01:
                paste_alpha(frame, c["top_scrim"], 0, 0, opacity=h_op * 0.92)
                draw_left_text(frame, cfg["act3_tag"], int(W * 0.07), int(H * 0.065), c["f_tag"], (196, 181, 253, int(245 * h_op)))
                draw_left_text(frame, cfg["act3_title_1"], int(W * 0.07), int(H * 0.105), c["f_h1"], (255, 255, 255, int(254 * h_op)))
                draw_left_text(frame, cfg["act3_title_2"], int(W * 0.07), int(H * 0.148), c["f_h1"], (253, 186, 116, int(254 * h_op)))

        # Draw photon rays & core ring on compact overlay region
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        mw_card, mh_card = c["mw_card"], c["mh_card"]
        for idx_m, (_, _, col) in enumerate(c["model_items"]):
            t_lock = 13.85 + idx_m * 0.62
            if t > t_lock and fade_out_3 > 0.02:
                if is_wide:
                    sy = int(H * (0.14 + idx_m * 0.165)) + mh_card // 2
                    sx = int(W * 0.06) + mw_card
                else:
                    sy = int(H * 0.27) + idx_m * (mh_card + 28) + mh_card // 2
                    sx = int(W * 0.06) + mw_card
                d.line([(sx, sy), (apex_px, apex_py)], fill=(*col, int(105 * fade_out_3)), width=2)
                pulse_u = ((t - t_lock) * 0.95) % 1.0
                px = int(sx + (apex_px - sx) * pulse_u)
                py = int(sy + (apex_py - sy) * pulse_u)
                pr = 6
                d.ellipse([px - pr * 2, py - pr * 2, px + pr * 2, py + pr * 2], fill=(*col, int(120 * fade_out_3)))
                d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(255, 255, 255, int(245 * fade_out_3)))

        core_op = smoothstep(14.6, 16.5, t) * fade_out_3
        if core_op > 0.01:
            pulse_r = int(56 + 8 * math.sin(t * 7.0))
            d.ellipse([apex_px - pulse_r, apex_py - pulse_r, apex_px + pulse_r, apex_py + pulse_r], fill=(168, 85, 247, int(105 * core_op)), outline=(255, 225, 255, int(225 * core_op)), width=3)

        frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")

        if core_op > 0.01:
            ic_w = 56
            ic_h = int(c["icon_light"].height * (ic_w / c["icon_light"].width))
            ic = c["icon_light"].resize((ic_w, ic_h), Image.Resampling.LANCZOS)
            paste_alpha(frame, ic, apex_px - ic_w // 2, apex_py - ic_h // 2, opacity=core_op)

        for idx_m, sp in enumerate(c["model_sprites"]):
            t_lock = 13.85 + idx_m * 0.62
            p_in = ease_out_expo((t - t_lock) / 0.65)
            op_m = clamp(p_in) * fade_out_3
            if op_m <= 0.01:
                continue
            slide_x = int((1.0 - p_in) * -48)
            bx = int(W * 0.06) + slide_x
            by = int(H * (0.14 + idx_m * 0.165)) if is_wide else int(H * 0.27) + idx_m * (mh_card + 28)
            paste_alpha(frame, sp, bx, by, opacity=op_m)

        if t > 19.95:
            fl = smoothstep(19.95, 20.4, t)
            frame = Image.blend(frame, Image.new("RGB", (W, H), (252, 244, 255)), fl * 0.88)

    elif t < 26.8:
        u = (t - 20.4) / 6.4
        zoom = 1.14 - 0.13 * ease_out_expo(min(1.0, u * 1.45))
        frame = zoom_pan_plate(c["p_stage"], W, H, fx=0.50, fy=0.50, zoom=zoom)

        wf_mix = smoothstep(23.35, 24.15, t)
        mono_w, mono_h = c["mono_w"], c["mono_h"]
        active_mono = Image.blend(c["mono_dash"], c["mono_flow"], wf_mix) if wf_mix > 0.005 else c["mono_dash"]

        rise_p = ease_out_expo((t - 20.45) / 1.55)
        tilt_inset = (1.0 - rise_p) * (mono_w * 0.065)
        scale_m = 0.90 + 0.10 * rise_p
        cur_w = int(mono_w * scale_m)
        cur_h = int(mono_h * scale_m)
        if tilt_inset > 1.0:
            dst_quad = [(tilt_inset, 0), (cur_w - tilt_inset, 0), (cur_w, cur_h), (0, cur_h)]
            src_quad = [(0, 0), (mono_w, 0), (mono_w, mono_h), (0, mono_h)]
            warped_mono = active_mono.transform((cur_w, cur_h), Image.Transform.PERSPECTIVE, find_perspective_coeffs(dst_quad, src_quad), resample=Image.Resampling.BILINEAR)
        else:
            warped_mono = active_mono.resize((cur_w, cur_h), Image.Resampling.BILINEAR) if cur_w != mono_w else active_mono

        mx = (W - cur_w) // 2
        my = int(H * (0.255 if is_wide else 0.275)) + int((1.0 - rise_p) * 52)
        mono_op = smoothstep(20.42, 21.05, t)

        paste_alpha(frame, c["halo"], (W - c["halo_w"]) // 2, my - 95, opacity=0.85 * mono_op)

        refl_h = min(int(cur_h * 0.30), max(10, H - (my + cur_h + 14)))
        if refl_h > 20:
            bottom_strip = warped_mono.crop((0, cur_h - refl_h, cur_w, cur_h)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(5))
            ry = np.linspace(1.0, 0.0, refl_h, dtype=np.float32)[:, None]
            r_alpha = Image.fromarray(np.broadcast_to((ry ** 1.8 * 78 * mono_op).astype(np.uint8), (refl_h, cur_w)))
            r_ch, g_ch, b_ch, _ = bottom_strip.split()
            paste_alpha(frame, Image.merge("RGBA", (r_ch, g_ch, b_ch, r_alpha)), mx, my + cur_h + 12, opacity=1.0)

        paste_alpha(frame, warped_mono, mx, my, opacity=mono_op)

        h4_op = smoothstep(20.65, 21.35, t)
        if h4_op > 0.01:
            top_tag_y = int(H * (0.048 if is_wide else 0.085))
            draw_centered_text(frame, cfg["act4_tag"], top_tag_y, c["f_tag"], (249, 168, 212, int(245 * h4_op)), W)
            draw_centered_text(frame, cfg["act4_title"], top_tag_y + (36 if is_wide else 44), c["f_h1"], (255, 255, 255, int(255 * h4_op)), W)
            draw_centered_text(frame, cfg["act4_sub"], top_tag_y + (112 if is_wide else 118), c["f_sub"], (214, 219, 238, int(238 * h4_op)), W)

        if t < 20.95:
            fl_d = 1.0 - smoothstep(20.4, 20.95, t)
            frame = Image.blend(frame, Image.new("RGB", (W, H), (252, 244, 255)), fl_d * 0.82)

        if t > 26.35:
            frame = Image.blend(frame, c["end_bg"], smoothstep(26.35, 26.8, t))

    else:
        frame = c["end_bg"].copy()
        u = (t - 26.8) / 3.2
        p_logo = ease_out_expo(u / 0.42)
        sc_l = 0.92 + 0.08 * p_logo
        lw = int(c["end_logo_base"].width * sc_l)
        lh = int(c["end_logo_base"].height * sc_l)
        cur_logo = c["end_logo_base"].resize((lw, lh), Image.Resampling.LANCZOS)

        if 27.05 < t < 28.55:
            sheen_u = (t - 27.05) / 1.50
            lx_grid = np.linspace(0.0, 1.0, lw, dtype=np.float32)[None, :]
            band = np.exp(-(((lx_grid - sheen_u) / 0.11) ** 2)) * 95.0
            arr_l = np.array(cur_logo, dtype=np.float32)
            arr_l[..., :3] = np.clip(arr_l[..., :3] + band[..., None], 0.0, 255.0)
            cur_logo = Image.fromarray(arr_l.astype(np.uint8), "RGBA")

        logo_y = int(H * (0.35 if is_wide else 0.39)) - lh // 2
        paste_alpha(frame, cur_logo, (W - lw) // 2, logo_y, opacity=smoothstep(26.8, 27.25, t))

        sub_op = smoothstep(27.25, 27.85, t)
        if sub_op > 0.01:
            tag_y = logo_y + lh + (46 if is_wide else 56)
            draw_centered_text(frame, cfg["act5_tagline"], tag_y, c["f_end_tag"], (30, 27, 58, int(235 * sub_op)), W, shadow=False)

        cta_p = ease_out_expo((t - 27.55) / 0.65)
        if cta_p > 0.01:
            cta_y = logo_y + lh + (112 if is_wide else 128) + int((1.0 - cta_p) * 20)
            paste_alpha(frame, c["cta_sprite"], (W - c["cta_w"]) // 2, cta_y, opacity=clamp(cta_p))

    return fi, frame.tobytes()


def render_commercial(aspect="16:9", out_mp4="public/videos/content24-ad-16x9.mp4", audio_wav="public/audio/content24-zelig-score.wav", copy_cfg=None, save_stills=False):
    os.makedirs(os.path.dirname(out_mp4), exist_ok=True)
    if save_stills:
        os.makedirs("public/frames", exist_ok=True)

    init_context(aspect, copy_cfg)
    W, H, is_wide = CTX["W"], CTX["H"], CTX["is_wide"]

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{W}x{H}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_wav,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "256k",
        "-shortest",
        "-movflags", "+faststart",
        out_mp4,
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    still_times = (
        {
            "frame_01_eye.jpg": 2.4,
            "frame_02_portal.jpg": 5.3,
            "frame_03_ribbons.jpg": 10.2,
            "frame_04_prism.jpg": 17.6,
            "frame_05_hub.jpg": 24.4,
            "frame_06_endcard.jpg": 28.6,
        }
        if is_wide
        else {
            "frame_9x16_prism.jpg": 17.6,
            "frame_9x16_hub.jpg": 24.4,
            "frame_9x16_endcard.jpg": 28.6,
        }
    )
    still_frames = {int(ts * FPS): fname for fname, ts in still_times.items()}

    t0_wall = time.time()
    workers = max(2, mp.cpu_count())
    with mp.get_context("fork").Pool(processes=workers) as pool:
        for fi, raw_bytes in pool.imap(render_single_frame, range(TOTAL_FRAMES), chunksize=12):
            if save_stills and fi in still_frames:
                Image.frombytes("RGB", (W, H), raw_bytes).save(os.path.join("public/frames", still_frames[fi]), quality=93)
            proc.stdin.write(raw_bytes)

    proc.stdin.close()
    stderr_out = proc.stderr.read().decode("utf-8", errors="ignore")
    rc = proc.wait()
    if rc != 0:
        raise RuntimeError(f"FFmpeg failed ({rc}): {stderr_out[-600:]}")

    elapsed = time.time() - t0_wall
    mb = os.path.getsize(out_mp4) / (1024 * 1024)
    print(f"Rendered {aspect} ({W}x{H}) -> {out_mp4} [{mb:.2f} MB] in {elapsed:.1f}s")


if __name__ == "__main__":
    cfg_arg = json.loads(sys.argv[1]) if len(sys.argv) > 1 else None
    mode = sys.argv[2] if len(sys.argv) > 2 else "both"
    if not os.path.exists("public/audio/content24-zelig-score.wav"):
        from synthesize_soundtrack import build_score
        build_score()
    if mode in ("16:9", "both"):
        render_commercial("16:9", "public/videos/content24-ad-16x9.mp4", copy_cfg=cfg_arg, save_stills=True)
    if mode in ("9:16", "both"):
        render_commercial("9:16", "public/videos/content24-ad-9x16.mp4", copy_cfg=cfg_arg, save_stills=True)
    print("ALL_RENDERS_COMPLETE")
