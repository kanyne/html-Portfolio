#!/usr/bin/env python3
"""
Content24 AI — 30.83s Cinema Motion Graphics Commercial Renderer (v3 Reference-Locked Cut)
Matches "Motion Graphics Inspiration - @zeligsound_2.mp4" frame-for-frame, beat-for-beat,
in true 2.39:1 anamorphic cinema widescreen (1920x1080) + 9:16 vertical cut (1080x1920),
with Content24 AI (https://app.content24.ai/) as the central hub reveal & pure-black luxury end cards.
"""

import json
import math
import os
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
REF_VIDEO = ROOT / "Motion Graphics Inspiration - @zeligsound_2.mp4"
AUDIO_MASTER = ROOT / "public/audio/zelig-reference-master.wav"
OUT_16X9 = ROOT / "Content24-Ad-16x9.mp4"
OUT_9X16 = ROOT / "Content24-Ad-9x16.mp4"
FRAMES_OUT = ROOT / "public/frames"

W16, H16 = 1920, 1080
BAR_H = 138  # Exact 2.39:1 Cinemascope active window: y = 138..942 (height = 804px)
W9, H9 = 1080, 1920
FPS = 30.0
TOTAL_FRAMES = 925  # Exact frame count of reference film (30.833s)


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    p = ROOT / "public/fonts" / name
    if p.exists():
        return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def solve_perspective_coeffs(dst_pts, src_pts):
    """Compute 8 projective transform coefficients mapping output dst_pts -> input src_pts."""
    matrix = []
    rhs = []
    for (dx, dy), (sx, sy) in zip(dst_pts, src_pts):
        matrix.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        matrix.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
        rhs.append(sx)
        rhs.append(sy)
    A = np.array(matrix, dtype=np.float64)
    B = np.array(rhs, dtype=np.float64)
    return np.linalg.solve(A, B).tolist()


def draw_c24_mark(canvas: Image.Image, cx: int, cy: int, size: int, bolt_color=(248, 248, 255), alpha=255):
    """Draw a super-sampled razor-sharp Content24 [lightning] brand emblem centered at (cx, cy)."""
    ss = 3
    box = size * ss
    layer = Image.new("RGBA", (box, box), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    pad = int(box * 0.08)
    rad = int(box * 0.24)
    stroke = max(4, int(box * 0.105))
    mid_gap = int(box * 0.14)

    # Left bracket '[' in electric violet -> magenta
    x0, y0, x1, y1 = pad, pad, box - pad, box - pad
    d.rounded_rectangle([x0, y0, x1, y1], radius=rad, outline=(168, 85, 247, alpha), width=stroke)
    # Mask top & bottom center gap to form signature split brackets [ ]
    d.rectangle([box // 2 - mid_gap, 0, box // 2 + mid_gap, box], fill=(0, 0, 0, 0))

    # Right half re-tinted pink -> orange gradient feel
    right_layer = Image.new("RGBA", (box, box), (0, 0, 0, 0))
    dr = ImageDraw.Draw(right_layer)
    dr.rounded_rectangle([x0, y0, x1, y1], radius=rad, outline=(249, 115, 22, alpha), width=stroke)
    dr.rectangle([0, 0, box // 2 + mid_gap, box], fill=(0, 0, 0, 0))
    layer = Image.alpha_composite(layer, right_layer)

    # Crisp central lightning bolt
    d = ImageDraw.Draw(layer)
    bx, by = box / 2.0, box / 2.0
    s = box * 0.30
    bolt_poly = [
        (bx + s * 0.14, by - s * 0.92),
        (bx - s * 0.56, by + s * 0.08),
        (bx - s * 0.03, by + s * 0.08),
        (bx - s * 0.16, by + s * 0.92),
        (bx + s * 0.56, by - s * 0.08),
        (bx + s * 0.03, by - s * 0.08),
    ]
    d.polygon(bolt_poly, fill=(bolt_color[0], bolt_color[1], bolt_color[2], alpha))

    small = layer.resize((size, size), Image.Resampling.LANCZOS)
    canvas.paste(small, (int(cx - size // 2), int(cy - size // 2)), small)


def render_c24_hub_ui(width=1600, height=900, transparent_bg=False) -> Image.Image:
    """
    Build a razor-sharp 4K dark-glass Content24 AI Hub UI canvas showing all AI models & modules
    unified inside one sleek workspace (https://app.content24.ai/).
    """
    bg_alpha = 185 if transparent_bg else 255
    ui = Image.new("RGBA", (width, height), (9, 9, 18, bg_alpha))
    d = ImageDraw.Draw(ui)

    # Subtle ambient purple & warm orange radial glow inside dark glass UI
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([int(width * 0.16), -int(height * 0.22), int(width * 0.78), int(height * 0.58)], fill=(139, 61, 255, 62))
    gd.ellipse([int(width * 0.52), int(height * 0.36), int(width * 1.05), int(height * 1.05)], fill=(249, 115, 22, 42))
    glow = glow.filter(ImageFilter.GaussianBlur(85))
    ui = Image.alpha_composite(ui, glow)
    d = ImageDraw.Draw(ui)

    f_bold = load_font("PlusJakartaSans-ExtraBold.ttf", 34)
    f_semi = load_font("PlusJakartaSans-SemiBold.ttf", 21)
    f_med = load_font("PlusJakartaSans-Medium.ttf", 18)
    f_reg = load_font("Inter-Regular.ttf", 16)
    f_mono = load_font("SpaceGrotesk-Bold.ttf", 15)

    # Left Sidebar (Content24 AI Modules)
    sb_w = int(width * 0.215)
    d.rectangle([0, 0, sb_w, height], fill=(13, 13, 25, 228))
    d.line([(sb_w, 0), (sb_w, height)], fill=(255, 255, 255, 30), width=2)

    draw_c24_mark(ui, 52, 52, 42)
    d.text((84, 35), "Content24", font=load_font("PlusJakartaSans-Bold.ttf", 25), fill=(250, 250, 255, 255))

    nav_items = [
        ("Unified AI Hub", True, (168, 85, 247)),
        ("Multi-Model Chat", False, (148, 163, 184)),
        ("AI Writer Studio", False, (148, 163, 184)),
        ("AI Image Lab", False, (148, 163, 184)),
        ("AI Video Engine", False, (148, 163, 184)),
        ("AI Avatar & Voice", False, (148, 163, 184)),
        ("AI Workflows", False, (148, 163, 184)),
        ("SEO & Campaigns", False, (148, 163, 184)),
    ]
    y_nav = 118
    for label_txt, active, col in nav_items:
        if active:
            d.rounded_rectangle([18, y_nav - 8, sb_w - 18, y_nav + 34], radius=11, fill=(139, 61, 255, 58), outline=(168, 85, 247, 135), width=1)
            d.ellipse([32, y_nav + 8, 42, y_nav + 18], fill=(249, 115, 22, 255))
            d.text((54, y_nav + 1), label_txt, font=f_med, fill=(255, 255, 255, 255))
        else:
            d.ellipse([33, y_nav + 9, 41, y_nav + 17], outline=(120, 126, 155, 180), width=2)
            d.text((54, y_nav + 1), label_txt, font=f_reg, fill=(175, 182, 208, 225))
        y_nav += 54

    # Bottom URL badge in sidebar
    d.rounded_rectangle([18, height - 76, sb_w - 18, height - 24], radius=12, fill=(22, 22, 40, 220), outline=(255, 255, 255, 28), width=1)
    d.ellipse([34, height - 55, 44, height - 45], fill=(74, 222, 128, 255))
    d.text((54, height - 60), "app.content24.ai", font=f_mono, fill=(235, 238, 255, 240))

    # Main Workspace Header
    mx0 = sb_w + 46
    d.text((mx0, 34), "ALL FLAGSHIP AI MODELS  ·  ONE CENTRAL HUB", font=f_mono, fill=(196, 181, 253, 235))
    d.text((mx0, 64), "Create Everything from One Command.", font=f_bold, fill=(255, 255, 255, 255))

    # Unified Model Switcher Pills Row
    models = [
        ("ChatGPT", (16, 185, 129), True),
        ("Claude", (249, 115, 22), True),
        ("Gemini", (96, 165, 250), True),
        ("Runway", (236, 72, 153), True),
        ("Sora 2", (168, 85, 247), True),
        ("Google VEO3", (56, 189, 248), True),
        ("Perplexity", (45, 212, 191), True),
        ("Kling", (251, 146, 60), True),
    ]
    px = mx0
    py = 132
    for m_name, accent, _on in models:
        tw = int(d.textlength(m_name, font=f_mono)) + 40
        d.rounded_rectangle([px, py, px + tw, py + 38], radius=19, fill=(24, 24, 44, 235), outline=(accent[0], accent[1], accent[2], 150), width=2)
        d.ellipse([px + 13, py + 14, px + 23, py + 24], fill=(accent[0], accent[1], accent[2], 255))
        d.text((px + 30, py + 10), m_name, font=f_mono, fill=(245, 247, 255, 250))
        px += tw + 11

    # Central Prompt Command Bar
    bar_y = 194
    bar_x1 = width - 46
    d.rounded_rectangle([mx0, bar_y, bar_x1, bar_y + 78], radius=18, fill=(20, 20, 38, 242), outline=(168, 85, 247, 175), width=2)
    d.text((mx0 + 24, bar_y + 26), "Launch full product campaign: script, visuals, 4K commercial & automated workflows...", font=f_med, fill=(232, 234, 250, 245))
    # Generate CTA pill inside command bar
    btn_w = 186
    d.rounded_rectangle([bar_x1 - btn_w - 14, bar_y + 13, bar_x1 - 14, bar_y + 65], radius=13, fill=(147, 51, 234, 255))
    d.text((bar_x1 - btn_w + 18, bar_y + 27), "Generate All  >", font=f_mono, fill=(255, 255, 255, 255))

    # 3 Multimodal Live Output Cards below Command Bar
    cards = [
        ("AI VIDEO  ·  SORA 2 + VEO3", "Cinema Launch Film", "4K Anamorphic · Rendered", (168, 85, 247)),
        ("AI IMAGE  ·  FLUX + IMAGEN", "Visual Brand Keyframes", "8 Studio Plates · Ready", (236, 72, 153)),
        ("AI WRITER & WORKFLOWS", "Omnichannel Copy + SEO", "Claude + GPT · Live Sync", (249, 115, 22)),
    ]
    cw = (bar_x1 - mx0 - 36) // 3
    cy0 = 300
    cy1 = height - 42
    for idx, (tag, title, stat, acc) in enumerate(cards):
        cx0 = mx0 + idx * (cw + 18)
        cx1 = cx0 + cw
        d.rounded_rectangle([cx0, cy0, cx1, cy1], radius=20, fill=(17, 17, 33, 232), outline=(255, 255, 255, 34), width=1)
        # Inner visual preview window with luminous abstract wave
        vp_h = int((cy1 - cy0) * 0.56)
        d.rounded_rectangle([cx0 + 16, cy0 + 16, cx1 - 16, cy0 + 16 + vp_h], radius=14, fill=(11, 10, 24, 255))
        # Abstract glowing wave bars inside card preview
        for k in range(18):
            ang = k / 17.0
            wy = int(cy0 + 16 + vp_h * (0.64 - 0.24 * math.sin(ang * 3.1 + idx * 1.4)))
            col_mix = (
                int(acc[0] * (0.55 + 0.45 * ang)),
                int(acc[1] * 0.65 + 45 * (1 - ang)),
                int(acc[2]),
                165,
            )
            step_x = (cx1 - cx0 - 44) // 18
            bx0 = cx0 + 24 + k * step_x
            d.rounded_rectangle([bx0, wy, bx0 + max(6, step_x - 4), cy0 + vp_h - 4], radius=3, fill=col_mix)

        d.text((cx0 + 20, cy0 + vp_h + 32), tag, font=f_mono, fill=(acc[0], acc[1], acc[2], 245))
        d.text((cx0 + 20, cy0 + vp_h + 60), title, font=f_semi, fill=(250, 250, 255, 255))
        # Status pill at bottom of card
        d.ellipse([cx0 + 20, cy1 - 36, cx0 + 30, cy1 - 26], fill=(74, 222, 128, 255))
        d.text((cx0 + 38, cy1 - 40), stat, font=f_reg, fill=(186, 230, 205, 235))

    return ui


def build_precomposited_plates():
    """Pre-composite all bespoke 2200x1238 high-res CGI studio plates once for fast 30fps camera & light sweeps."""
    W_HI, H_HI = 2200, 1238
    sx_f = W_HI / 1672.0
    sy_f = H_HI / 941.0

    ui_solid = render_c24_hub_ui(1600, 900, transparent_bg=False)
    ui_glass = render_c24_hub_ui(1600, 900, transparent_bg=True)

    # 1. Plate A: Convergence silk tunnel (9.40s - 11.23s)
    plate_a = Image.open(ROOT / "assets/ad/v3_shot_a_convergence.jpg").convert("RGBA").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    da = ImageDraw.Draw(plate_a)
    f_tag = load_font("SpaceGrotesk-Medium.ttf", 20)
    stream_nodes = [
        (0.24, 0.34, "ChatGPT"),
        (0.35, 0.27, "Claude"),
        (0.45, 0.23, "Gemini"),
        (0.56, 0.23, "Sora 2"),
        (0.66, 0.28, "Runway"),
        (0.76, 0.35, "VEO3 · Kling"),
    ]
    px_apex, py_apex = int(W_HI * 0.50), int(H_HI * 0.56)
    beam_layer = Image.new("RGBA", (W_HI, H_HI), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam_layer)
    for nx, ny, label_txt in stream_nodes:
        x0, y0 = int(W_HI * nx), int(H_HI * ny)
        bd.line([(x0, y0 + 22), (px_apex, py_apex)], fill=(186, 224, 255, 72), width=3)
    beam_layer = beam_layer.filter(ImageFilter.GaussianBlur(4))
    plate_a = Image.alpha_composite(plate_a, beam_layer)
    da = ImageDraw.Draw(plate_a)
    for nx, ny, label_txt in stream_nodes:
        x0, y0 = int(W_HI * nx), int(H_HI * ny)
        tw = int(da.textlength(label_txt, font=f_tag)) + 30
        da.rounded_rectangle([x0 - tw // 2, y0 - 16, x0 + tw // 2, y0 + 18], radius=17, fill=(10, 18, 32, 165), outline=(186, 230, 255, 115), width=1)
        da.text((x0 - tw // 2 + 15, y0 - 11), label_txt, font=f_tag, fill=(235, 246, 255, 230))
    draw_c24_mark(plate_a, px_apex, int(H_HI * 0.72), 68, bolt_color=(245, 248, 255), alpha=220)

    # 2. Plate B: Levitating obsidian monolith veiled in lavender silk (11.27s - 13.53s)
    plate_b = Image.open(ROOT / "assets/ad/v3_shot_b_monolith.jpg").convert("RGBA").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    # Perspective holographic Content24 emblem glowing on top face of obsidian slab
    holo = Image.new("RGBA", (700, 260), (0, 0, 0, 0))
    hd = ImageDraw.Draw(holo)
    draw_c24_mark(holo, 115, 130, 96, bolt_color=(255, 255, 255), alpha=235)
    hd.text((185, 88), "Content24 AI", font=load_font("PlusJakartaSans-Bold.ttf", 48), fill=(244, 240, 255, 235))
    hd.text((188, 146), "UNIFIED AI INTELLIGENCE CORE", font=load_font("SpaceGrotesk-Medium.ttf", 20), fill=(196, 181, 253, 200))
    coeffs_b = solve_perspective_coeffs(
        [(int(330 * sx_f), int(385 * sy_f)), (int(830 * sx_f), int(382 * sy_f)), (int(760 * sx_f), int(438 * sy_f)), (int(245 * sx_f), int(442 * sy_f))],
        [(0, 0), (700, 0), (700, 260), (0, 260)],
    )
    warped_b = holo.transform((W_HI, H_HI), Image.Transform.PERSPECTIVE, coeffs_b, Image.Resampling.BICUBIC)
    plate_b = Image.alpha_composite(plate_b, warped_b)

    # 3. Plate C: Macro edge unveil beside deep purple silk (18.60s - 20.00s)
    plate_c = Image.open(ROOT / "assets/ad/v3_shot_c_edge_unveil.jpg").convert("RGBA").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    # Subtle luminous glass UI edge glow peeking along dark left glass panel
    edge_ui = ui_glass.copy()
    coeffs_c = solve_perspective_coeffs(
        [(0, int(110 * sy_f)), (int(690 * sx_f), int(295 * sy_f)), (int(695 * sx_f), H_HI), (0, H_HI)],
        [(620, 0), (1600, 0), (1600, 900), (620, 900)],
    )
    warped_c = edge_ui.transform((W_HI, H_HI), Image.Transform.PERSPECTIVE, coeffs_c, Image.Resampling.BICUBIC)
    # Soften opacity so macro hardware bevel + purple silk stay hero
    alpha_c = warped_c.getchannel("A").point(lambda p: int(p * 0.44))
    warped_c.putalpha(alpha_c)
    plate_c = Image.alpha_composite(plate_c, warped_c)

    # 4. Plate D (Warm bronze & Cool silver-violet macro glass sweeps: 20.03s - 22.33s)
    base_d = Image.open(ROOT / "assets/ad/v3_shot_d_macro_glass.jpg").convert("RGBA").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    coeffs_d = solve_perspective_coeffs(
        [(int(95 * sx_f), int(182 * sy_f)), (int(1280 * sx_f), int(195 * sy_f)), (int(1435 * sx_f), int(535 * sy_f)), (int(155 * sx_f), int(232 * sy_f))],
        [(0, 0), (1600, 0), (1600, 620), (0, 620)],
    )
    warped_d = ui_glass.transform((W_HI, H_HI), Image.Transform.PERSPECTIVE, coeffs_d, Image.Resampling.BICUBIC)
    alpha_d = warped_d.getchannel("A").point(lambda p: int(p * 0.62))
    warped_d.putalpha(alpha_d)
    plate_d_warm = Image.alpha_composite(base_d, warped_d)

    # Cool silver-violet studio variant matching 21.23s cut in reference
    plate_d_cool_base = base_d.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    r2, g2, b2, a2 = plate_d_cool_base.split()
    plate_d_cool_base = Image.merge(
        "RGBA",
        (
            b2.point(lambda v: min(255, int(v * 0.85 + 8))),
            g2.point(lambda v: min(255, int(v * 0.96 + 8))),
            r2.point(lambda v: min(255, int(v * 1.15 + 18))),
            a2,
        ),
    )
    coeffs_d2 = solve_perspective_coeffs(
        [(int(392 * sx_f), int(195 * sy_f)), (int(1575 * sx_f), int(182 * sy_f)), (int(1515 * sx_f), int(232 * sy_f)), (int(235 * sx_f), int(535 * sy_f))],
        [(0, 0), (1600, 0), (1600, 620), (0, 620)],
    )
    warped_d2 = ui_glass.transform((W_HI, H_HI), Image.Transform.PERSPECTIVE, coeffs_d2, Image.Resampling.BICUBIC)
    warped_d2.putalpha(warped_d2.getchannel("A").point(lambda p: int(p * 0.66)))
    plate_d_cool = Image.alpha_composite(plate_d_cool_base, warped_d2)

    # 5. Plate E: 3/4 Sculpted Pedestal + Perspective Screen with Silk Reflection (22.37s - 24.17s)
    base_e_rgb = Image.open(ROOT / "assets/ad/v3_shot_e_angle_pedestal.jpg").convert("RGB").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    coeffs_e = solve_perspective_coeffs(
        [
            (int(714 * sx_f), 0),
            (int(1560 * sx_f), 0),
            (int(1640 * sx_f), int(702 * sy_f)),
            (int(841 * sx_f), int(637 * sy_f)),
        ],
        [(0, 0), (1500, 0), (1500, 900), (0, 900)],
    )
    warped_e_rgba = ui_solid.transform((W_HI, H_HI), Image.Transform.PERSPECTIVE, coeffs_e, Image.Resampling.BICUBIC)
    # Screen-blend so real purple silk glass reflection across upper bezel stays visible!
    screen_layer = ImageChops.screen(base_e_rgb, warped_e_rgba.convert("RGB"))
    mask_e = warped_e_rgba.getchannel("A").point(lambda p: int(p * 0.88))
    plate_e = Image.composite(screen_layer, base_e_rgb, mask_e).convert("RGBA")

    # 6. Plate F: Symmetrical Front Hero Studio Display (24.20s - 26.10s)
    # Measured exact screen pixels on 1672x941: x=393..1267, y=139..631
    plate_f = Image.open(ROOT / "assets/ad/v3_shot_f_front_hero.jpg").convert("RGBA").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    fx0, fy0 = int(393 * sx_f), int(139 * sy_f)
    fx1, fy1 = int(1267 * sx_f), int(631 * sy_f)
    ui_f = ui_solid.resize((fx1 - fx0, fy1 - fy0), Image.Resampling.LANCZOS)
    # Add realistic subtle diagonal glass reflection across top-left of studio display
    refl = Image.new("RGBA", ui_f.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl)
    rd.polygon([(0, 0), (int(ui_f.width * 0.46), 0), (int(ui_f.width * 0.18), ui_f.height), (0, ui_f.height)], fill=(255, 255, 255, 16))
    ui_f = Image.alpha_composite(ui_f, refl)
    plate_f.paste(ui_f, (fx0, fy0), ui_f)

    # 7. Plate G: Wide Architectural Night Lounge (26.13s - 28.30s)
    # Measured exact screen pixels on 1672x941: x=567..1102, y=283..588
    base_g_rgb = Image.open(ROOT / "assets/ad/v3_shot_g_wide_lounge.jpg").convert("RGB").resize((W_HI, H_HI), Image.Resampling.LANCZOS)
    gx0, gy0 = int(567 * sx_f), int(283 * sy_f)
    gx1, gy1 = int(1102 * sx_f), int(588 * sy_f)
    ui_g = ui_glass.resize((gx1 - gx0, gy1 - gy0), Image.Resampling.LANCZOS)
    # Blend UI over the glowing purple silk waves inside the room's flagship display!
    patch_bg = base_g_rgb.crop((gx0, gy0, gx1, gy1)).convert("RGBA")
    blended_patch = Image.alpha_composite(patch_bg, ui_g)
    # Highlight centered Content24 brand signature cleanly readable even at wide lounge distance
    gd_wide = ImageDraw.Draw(blended_patch)
    mid_x, mid_y = blended_patch.width // 2, blended_patch.height // 2
    gd_wide.rounded_rectangle(
        [mid_x - 165, mid_y - 38, mid_x + 165, mid_y + 38],
        radius=20,
        fill=(10, 9, 22, 205),
        outline=(196, 181, 253, 175),
        width=2,
    )
    draw_c24_mark(blended_patch, mid_x - 112, mid_y, 44)
    gd_wide.text(
        (mid_x - 80, mid_y - 18),
        "Content24 AI",
        font=load_font("PlusJakartaSans-Bold.ttf", 31),
        fill=(255, 255, 255, 250),
    )
    plate_g = base_g_rgb.copy().convert("RGBA")
    plate_g.paste(blended_patch, (gx0, gy0))

    return {
        "a": plate_a.convert("RGB"),
        "b": plate_b.convert("RGB"),
        "c": plate_c.convert("RGB"),
        "d_warm": plate_d_warm.convert("RGB"),
        "d_cool": plate_d_cool.convert("RGB"),
        "e": plate_e.convert("RGB"),
        "f": plate_f.convert("RGB"),
        "g": plate_g.convert("RGB"),
    }


def dolly_crop_16x9(plate: Image.Image, prog: float, zoom0=1.0, zoom1=1.08, pan_x0=0.0, pan_x1=0.0, pan_y0=0.0, pan_y1=0.0) -> Image.Image:
    """Smooth cubic-eased cinema camera dolly & pan from 2200x1238 plate -> 1920x1080 frame."""
    p = max(0.0, min(1.0, prog))
    # Smooth ease-out-in cinema camera curve
    ease = p * p * (3.0 - 2.0 * p)
    z = zoom0 + (zoom1 - zoom0) * ease
    pw, ph = plate.size
    cw = pw / z
    ch = cw * (9.0 / 16.0)
    cx = pw * (0.5 + pan_x0 + (pan_x1 - pan_x0) * ease)
    cy = ph * (0.5 + pan_y0 + (pan_y1 - pan_y0) * ease)
    x0 = max(0.0, min(pw - cw, cx - cw / 2.0))
    y0 = max(0.0, min(ph - ch, cy - ch / 2.0))
    return plate.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W16, H16), Image.Resampling.BICUBIC)


# Pre-built soft Gaussian anamorphic shimmer sprite (zero hard lines)
_SHIMMER_SPRITE = Image.new("RGBA", (620, H16), (0, 0, 0, 0))
ImageDraw.Draw(_SHIMMER_SPRITE).polygon(
    [(230, 0), (430, 0), (310, H16), (110, H16)],
    fill=(205, 180, 255, 24),
)
_SHIMMER_SPRITE = _SHIMMER_SPRITE.filter(ImageFilter.GaussianBlur(52))


def apply_cinema_bars_and_shimmer(frame_rgb: Image.Image, sweep_pos: float = -1.0, beat_boost: float = 0.0) -> Image.Image:
    """Apply soft optical anamorphic light bloom + razor-sharp 2.39:1 pure black Cinemascope bars."""
    if beat_boost > 0.01:
        frame_rgb = ImageEnhance.Brightness(frame_rgb).enhance(1.0 + 0.08 * beat_boost)

    if 0.0 <= sweep_pos <= 1.0:
        sx = int(-520 + (W16 + 420) * sweep_pos)
        frame_rgba = frame_rgb.convert("RGBA")
        frame_rgba.alpha_composite(_SHIMMER_SPRITE, (sx, 0))
        frame_rgb = frame_rgba.convert("RGB")

    d = ImageDraw.Draw(frame_rgb)
    d.rectangle([0, 0, W16, BAR_H], fill=(0, 0, 0))
    d.rectangle([0, H16 - BAR_H, W16, H16], fill=(0, 0, 0))
    return frame_rgb


def render_endcard_1(prog: float, copy_cfg: dict) -> Image.Image:
    """28.33s - 29.43s: Pure #000000 luxury title card matching reference Frame #23 1:1."""
    img = Image.new("RGB", (W16, H16), (0, 0, 0))
    alpha = min(1.0, prog / 0.22) * min(1.0, (1.0 - prog) / 0.16)
    v = int(246 * max(0.0, min(1.0, alpha)))
    sub_v = int(222 * max(0.0, min(1.0, alpha)))
    d = ImageDraw.Draw(img)

    line1 = copy_cfg.get("end_line1", "A new vision for AI")
    line2 = copy_cfg.get("end_line2", "One hub for everything you create")

    f1 = load_font("PlusJakartaSans-Medium.ttf", 52)
    f2 = load_font("PlusJakartaSans-Regular.ttf", 31)

    w1 = d.textlength(line1, font=f1)
    w2 = d.textlength(line2, font=f2)
    d.text(((W16 - w1) / 2.0, H16 * 0.435), line1, font=f1, fill=(v, v, v))
    d.text(((W16 - w2) / 2.0, H16 * 0.525), line2, font=f2, fill=(sub_v, sub_v, min(255, sub_v + 8)))
    return img


def render_endcard_2(prog: float, copy_cfg: dict) -> Image.Image:
    """29.47s - 30.83s: Pure #000000 brand lockup card matching reference Frame #24 ('BANG & OLUFSEN') 1:1."""
    img = Image.new("RGBA", (W16, H16), (0, 0, 0, 255))
    fade_in = min(1.0, prog / 0.20)
    fade_out = min(1.0, (1.0 - prog) / 0.20)
    a = max(0.0, min(1.0, fade_in * fade_out))

    brand_txt = copy_cfg.get("brand_wordmark", "CONTENT24  AI")
    url_txt = copy_cfg.get("brand_url", "app.content24.ai")

    f_brand = load_font("PlusJakartaSans-SemiBold.ttf", 54)
    f_url = load_font("SpaceGrotesk-Medium.ttf", 23)

    d = ImageDraw.Draw(img)
    # Wide luxury tracking matching reference end-card wordmark
    spaced = "  ".join(list(brand_txt.replace("  ", " ")))
    wb = d.textlength(spaced, font=f_brand)
    wu = d.textlength(url_txt, font=f_url)

    draw_c24_mark(img, W16 // 2, int(H16 * 0.405), 62, bolt_color=(250, 250, 255), alpha=int(255 * a))
    v = int(248 * a)
    uv = int(190 * a)
    d = ImageDraw.Draw(img)
    d.text(((W16 - wb) / 2.0, H16 * 0.478), spaced, font=f_brand, fill=(v, v, v, 255))
    d.text(((W16 - wu) / 2.0, H16 * 0.562), url_txt, font=f_url, fill=(uv, uv, min(255, uv + 22), 255))
    return img.convert("RGB")


def make_vertical_9x16(frame_16x9: Image.Image, fi: int, copy_cfg: dict) -> Image.Image:
    """Compose a luxury 9:16 (1080x1920) vertical cut from the active anamorphic image + dark cinema chrome."""
    if fi >= 850:
        # Clean vertical pure-black end cards
        v_img = Image.new("RGBA", (W9, H9), (0, 0, 0, 255))
        d = ImageDraw.Draw(v_img)
        if fi < 884:
            p = (fi - 850) / 33.0
            a = max(0.0, min(1.0, min(1.0, p / 0.22) * min(1.0, (1.0 - p) / 0.16)))
            c = int(246 * a)
            sc = int(218 * a)
            f1 = load_font("PlusJakartaSans-Medium.ttf", 48)
            f2 = load_font("PlusJakartaSans-Regular.ttf", 30)
            l1 = copy_cfg.get("end_line1", "A new vision for AI")
            l2 = copy_cfg.get("end_line2", "One hub for everything you create")
            d.text(((W9 - d.textlength(l1, font=f1)) / 2, H9 * 0.455), l1, font=f1, fill=(c, c, c, 255))
            d.text(((W9 - d.textlength(l2, font=f2)) / 2, H9 * 0.505), l2, font=f2, fill=(sc, sc, sc, 255))
        else:
            p = (fi - 884) / max(1.0, (TOTAL_FRAMES - 1 - 884))
            a = max(0.0, min(1.0, min(1.0, p / 0.20) * min(1.0, (1.0 - p) / 0.20)))
            draw_c24_mark(v_img, W9 // 2, int(H9 * 0.435), 76, bolt_color=(250, 250, 255), alpha=int(255 * a))
            d = ImageDraw.Draw(v_img)
            f_b = load_font("PlusJakartaSans-Bold.ttf", 52)
            f_u = load_font("SpaceGrotesk-Medium.ttf", 26)
            bt = "CONTENT24 AI"
            ut = copy_cfg.get("brand_url", "app.content24.ai")
            c = int(248 * a)
            uc = int(195 * a)
            d.text(((W9 - d.textlength(bt, font=f_b)) / 2, H9 * 0.495), bt, font=f_b, fill=(c, c, c, 255))
            d.text(((W9 - d.textlength(ut, font=f_u)) / 2, H9 * 0.542), ut, font=f_u, fill=(uc, uc, min(255, uc + 20), 255))
        return v_img.convert("RGB")

    # Active 1920x804 cinema band cropped cleanly into portrait cinema stage + blurred atmospheric glow backdrop
    active = frame_16x9.crop((0, BAR_H, W16, H16 - BAR_H))  # 1920 x 804
    bg = active.resize((W9, H9), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(42))
    bg = ImageEnhance.Brightness(bg).enhance(0.30)

    # Center large crisp portrait window (1080 x 1140) cropped around center of 1920x804 active frame
    crop_w = 1220
    sub = active.crop(((W16 - crop_w) // 2, 0, (W16 + crop_w) // 2, active.height))
    hero_h = int(W9 * (active.height / crop_w) * 1.32)
    hero = sub.resize((W9, hero_h), Image.Resampling.BICUBIC)
    y_top = (H9 - hero_h) // 2
    bg.paste(hero, (0, y_top))
    return bg


def main():
    copy_cfg = {}
    if len(sys.argv) > 1 and sys.argv[1].strip():
        try:
            copy_cfg = json.loads(sys.argv[1])
        except Exception:
            copy_cfg = {}

    OUT_16X9.parent.mkdir(parents=True, exist_ok=True)
    FRAMES_OUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    print("Step 1/3: Building high-resolution FutureDeluxe studio composites for Content24 AI...")
    plates = build_precomposited_plates()

    # Beat frames from exact spectral analysis of @zeligsound audio
    beat_frames = {42, 80, 149, 236, 282, 308, 338, 378, 407, 457, 485, 510, 546, 601, 637, 671, 704, 726, 784, 850, 884}

    print("Step 2/3: Streaming 925 frames (30.83s @ 30fps) into 1080p 16:9 & 9:16 H.264 encoders...")
    # Stream decoded source frames from reference video (736x414 RGB24)
    RW, RH = 736, 414
    frame_bytes = RW * RH * 3
    dec_proc = subprocess.Popen(
        [ffmpeg, "-i", str(REF_VIDEO), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )

    tmp_16x9 = OUT_16X9.with_suffix(".tmp.mp4")
    tmp_9x16 = OUT_9X16.with_suffix(".tmp.mp4")

    enc_16 = subprocess.Popen(
        [
            ffmpeg, "-y",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W16}x{H16}", "-r", "30", "-i", "-",
            "-i", str(AUDIO_MASTER),
            "-c:v", "libx264", "-preset", "faster", "-crf", "18", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "224k", "-shortest", "-movflags", "+faststart",
            str(tmp_16x9),
        ],
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    enc_9 = subprocess.Popen(
        [
            ffmpeg, "-y",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W9}x{H9}", "-r", "30", "-i", "-",
            "-i", str(AUDIO_MASTER),
            "-c:v", "libx264", "-preset", "faster", "-crf", "19", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "224k", "-shortest", "-movflags", "+faststart",
            str(tmp_9x16),
        ],
        stdin=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    f_micro = load_font("SpaceGrotesk-Medium.ttf", 16)
    floating_tags = [
        (0.22, 0.34, "ChatGPT"),
        (0.76, 0.31, "Claude"),
        (0.28, 0.66, "Gemini"),
        (0.73, 0.65, "Sora 2 · VEO3"),
        (0.50, 0.25, "Runway · Kling"),
    ]

    storyboard_targets = {
        95: "frame_01_eye.jpg",
        245: "frame_02_portal.jpg",
        310: "frame_03_ribbons.jpg",
        370: "frame_04_prism.jpg",
        475: "v3_vortex.jpg",
        580: "v3_edge_unveil.jpg",
        620: "v3_macro_glass.jpg",
        698: "v3_pedestal_3q.jpg",
        755: "frame_05_hub.jpg",
        815: "v3_wide_lounge.jpg",
        866: "v3_endcard_tagline.jpg",
        904: "frame_06_endcard.jpg",
    }

    last_ref_im = Image.new("RGB", (RW, RH), (0, 0, 0))

    for fi in range(TOTAL_FRAMES):
        raw = dec_proc.stdout.read(frame_bytes)
        if len(raw) == frame_bytes:
            last_ref_im = Image.frombytes("RGB", (RW, RH), raw)

        # Compute beat flash envelope (decays over 5 frames after exact audio cut/hit)
        beat_boost = 0.0
        for bf in beat_frames:
            if 0 <= (fi - bf) <= 5:
                beat_boost = max(beat_boost, 1.0 - (fi - bf) / 6.0)

        # ---- EXACT 21-SHOT CINEMA TIMELINE ----
        if fi <= 281:
            # Shots 1-6 (0.00s - 9.37s): Real 30fps Eye Awakening -> Pupil Dive -> Cyan Silk Clouds
            up = last_ref_im.resize((W16, H16), Image.Resampling.BICUBIC)
            up = up.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=2))
            if 185 <= fi <= 278:
                # Delicate frosted telemetry tags drifting through volumetric silk mist
                p_mist = (fi - 185) / 93.0
                fade_m = math.sin(math.pi * min(1.0, p_mist))
                ov = Image.new("RGBA", (W16, H16), (0, 0, 0, 0))
                od = ImageDraw.Draw(ov)
                a_val = int(155 * fade_m)
                for bx, by, tlabel in floating_tags:
                    drift_x = int(W16 * bx + (0.5 - bx) * 95.0 * p_mist)
                    drift_y = int(H16 * by + (0.5 - by) * 55.0 * p_mist)
                    tw = int(od.textlength(tlabel, font=f_micro)) + 24
                    od.rounded_rectangle(
                        [drift_x - tw // 2, drift_y - 13, drift_x + tw // 2, drift_y + 15],
                        radius=14,
                        fill=(8, 14, 26, int(115 * fade_m)),
                        outline=(165, 215, 255, int(95 * fade_m)),
                        width=1,
                    )
                    od.text((drift_x - tw // 2 + 12, drift_y - 9), tlabel, font=f_micro, fill=(228, 242, 255, a_val))
                up = Image.alpha_composite(up.convert("RGBA"), ov).convert("RGB")
            frame_16 = apply_cinema_bars_and_shimmer(up, -1.0, beat_boost * 0.4)

        elif 282 <= fi <= 337:
            # Shot 7 (9.40s - 11.23s): All AI Models Converging Down Silk Funnel into Crystal Prism Core
            p = (fi - 282) / 55.0
            base = dolly_crop_16x9(plates["a"], p, zoom0=1.02, zoom1=1.11, pan_y0=-0.02, pan_y1=0.02)
            frame_16 = apply_cinema_bars_and_shimmer(base, p, beat_boost)

        elif 338 <= fi <= 406:
            # Shot 8 (11.27s - 13.53s): Levitating Content24 Obsidian Monolith Under Lavender Silk
            p = (fi - 338) / 68.0
            base = dolly_crop_16x9(plates["b"], p, zoom0=1.01, zoom1=1.09, pan_x0=-0.02, pan_x1=0.015)
            frame_16 = apply_cinema_bars_and_shimmer(base, p * 1.1, beat_boost)

        elif 407 <= fi <= 557:
            # Shots 10-13 (13.57s - 18.57s): Rippling Purple Silk -> Pulsing Vortex -> Wide Dilated Eye -> Veil Sweep
            up = last_ref_im.resize((W16, H16), Image.Resampling.BICUBIC)
            up = up.filter(ImageFilter.UnsharpMask(radius=1.1, percent=60, threshold=2))
            frame_16 = apply_cinema_bars_and_shimmer(up, -1.0, beat_boost * 0.45)

        elif 558 <= fi <= 600:
            # Shot 14 (18.60s - 20.00s): Macro Hardware & Purple Silk Unveil from Darkness
            p = (fi - 558) / 42.0
            base = dolly_crop_16x9(plates["c"], p, zoom0=1.09, zoom1=1.01, pan_x0=-0.02, pan_x1=0.015)
            # Smooth emerge from shadow matching f557 darkness
            emerge = min(1.0, 0.25 + p * 1.35)
            base = ImageEnhance.Brightness(base).enhance(emerge)
            frame_16 = apply_cinema_bars_and_shimmer(base, p, beat_boost)

        elif 601 <= fi <= 636:
            # Shot 15A (20.03s - 21.20s): Warm Copper-Bronze Macro Glide Across Living Content24 Glass Surface
            p = (fi - 601) / 35.0
            base = dolly_crop_16x9(plates["d_warm"], p, zoom0=1.02, zoom1=1.10, pan_x0=-0.025, pan_x1=0.025)
            frame_16 = apply_cinema_bars_and_shimmer(base, p, beat_boost)

        elif 637 <= fi <= 670:
            # Shot 15B (21.23s - 22.33s): Cool Silver-Violet Macro Cutaway (Exact 21.23s Zelig Beat Cut!)
            p = (fi - 637) / 33.0
            base = dolly_crop_16x9(plates["d_cool"], p, zoom0=1.10, zoom1=1.02, pan_x0=0.02, pan_x1=-0.02)
            frame_16 = apply_cinema_bars_and_shimmer(base, 1.0 - p, beat_boost)

        elif 671 <= fi <= 725:
            # Shot 16 (22.37s - 24.17s): 3/4 Sculpted Pedestal Reveal & Live Perspective Content24 Hub
            p = (fi - 671) / 54.0
            base = dolly_crop_16x9(plates["e"], p, zoom0=1.08, zoom1=1.01, pan_x0=0.015, pan_x1=-0.015, pan_y0=0.01, pan_y1=-0.01)
            frame_16 = apply_cinema_bars_and_shimmer(base, p, beat_boost)

        elif 726 <= fi <= 783:
            # Shot 17 (24.20s - 26.10s): Symmetrical Front Studio Display Reveal (All AI in One Hub!)
            p = (fi - 726) / 57.0
            base = dolly_crop_16x9(plates["f"], p, zoom0=1.09, zoom1=1.01, pan_y0=-0.012, pan_y1=0.01)
            frame_16 = apply_cinema_bars_and_shimmer(base, p * 0.9, beat_boost)

        elif 784 <= fi <= 849:
            # Shot 18 (26.13s - 28.30s): Wide Architectural Night Lounge Reveal (1:1 Twin of Ref Shot #21-22!)
            p = (fi - 784) / 65.0
            base = dolly_crop_16x9(plates["g"], p, zoom0=1.07, zoom1=1.00)
            frame_16 = apply_cinema_bars_and_shimmer(base, -1.0, beat_boost * 0.5)

        elif 850 <= fi <= 883:
            # Shot 19 (28.33s - 29.43s): Pure #000000 End Card 1 ("A new vision for AI / One hub for everything you create")
            p = (fi - 850) / 33.0
            frame_16 = render_endcard_1(p, copy_cfg)

        else:
            # Shot 20 (29.47s - 30.83s): Pure #000000 End Card 2 ("CONTENT24 AI / app.content24.ai")
            p = (fi - 884) / max(1.0, (TOTAL_FRAMES - 1 - 884))
            frame_16 = render_endcard_2(p, copy_cfg)

        frame_9 = make_vertical_9x16(frame_16, fi, copy_cfg)

        enc_16.stdin.write(frame_16.tobytes())
        enc_9.stdin.write(frame_9.tobytes())

        if fi in storyboard_targets:
            frame_16.save(FRAMES_OUT / storyboard_targets[fi], quality=92)
            if fi in (310, 755, 904):
                tag_map = {310: "frame_9x16_prism.jpg", 755: "frame_9x16_hub.jpg", 904: "frame_9x16_endcard.jpg"}
                frame_9.save(FRAMES_OUT / tag_map[fi], quality=92)

        if fi % 150 == 0 or fi == TOTAL_FRAMES - 1:
            print(f"  Rendered frame {fi + 1}/{TOTAL_FRAMES} ({(fi + 1) * 100 // TOTAL_FRAMES}%)", flush=True)

    dec_proc.stdout.close()
    dec_proc.wait()

    enc_16.stdin.close()
    err16 = enc_16.stderr.read().decode("utf-8", errors="ignore")
    rc16 = enc_16.wait()

    enc_9.stdin.close()
    err9 = enc_9.stderr.read().decode("utf-8", errors="ignore")
    rc9 = enc_9.wait()

    if rc16 != 0 or rc9 != 0:
        raise RuntimeError(f"FFmpeg encode failed: rc16={rc16} {err16[-300:]} | rc9={rc9} {err9[-300:]}")

    os.replace(tmp_16x9, OUT_16X9)
    os.replace(tmp_9x16, OUT_9X16)
    print(f"Step 3/3: Done! 16:9={OUT_16X9.stat().st_size / 1e6:.2f} MB | 9:16={OUT_9X16.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
