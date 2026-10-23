#!/usr/bin/env python3
"""
Analyze an uploaded user reference video:
1. Probe duration, dimensions, FPS, audio stream via imageio-ffmpeg.
2. Transcode any container/codec (.mov HEVC, .mp4, .webm, .mkv) into a compact,
   browser-universal H.264 + AAC MP4 at uploads/reference.mp4.
3. Extract 24 evenly spaced HD frames (uploads/frames/frame_01.jpg .. frame_24.jpg)
   and build a timestamped 4x6 contact sheet (uploads/contact_sheet.jpg).
4. Compute visual scene-cut timestamps & audio loudness/beat peaks (uploads/analysis.json).
"""

import json
import os
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = ROOT / "uploads"
FRAMES_DIR = UPLOADS_DIR / "frames"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def probe_video(input_path: str) -> dict:
    proc = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", input_path],
        capture_output=True,
        text=True,
    )
    info = proc.stderr or ""
    dur = 0.0
    m_dur = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", info)
    if m_dur:
        dur = int(m_dur.group(1)) * 3600 + int(m_dur.group(2)) * 60 + float(m_dur.group(3))

    width, height = 1280, 720
    m_dim = re.search(r"Stream #.*Video:.*?\s(\d{2,5})x(\d{2,5})(?:[\s,\[])", info)
    if m_dim:
        width, height = int(m_dim.group(1)), int(m_dim.group(2))

    fps = 30.0
    m_fps = re.search(r"(\d+(?:\.\d+)?)\s*fps", info)
    if m_fps:
        fps = float(m_fps.group(1))

    has_audio = bool(re.search(r"Stream #.*Audio:", info))
    return {
        "duration": round(dur, 3),
        "width": width,
        "height": height,
        "aspect": "9:16" if height > width else ("1:1" if abs(width - height) < 40 else "16:9"),
        "fps": round(fps, 2),
        "hasAudio": has_audio,
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "Missing input video path"}))
        sys.exit(1)

    raw_path = sys.argv[1]
    orig_name = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(raw_path)

    if not os.path.exists(raw_path):
        print(json.dumps({"ok": False, "error": f"File not found: {raw_path}"}))
        sys.exit(1)

    if FRAMES_DIR.exists():
        shutil.rmtree(FRAMES_DIR)
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    meta = probe_video(raw_path)
    dur = max(meta["duration"], 0.5)

    # 1. Transcode into browser-universal H.264 MP4 (capped at 1280 long edge so fast & compact)
    out_mp4 = UPLOADS_DIR / "reference.mp4"
    scale_filter = (
        "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))',"
        "pad=ceil(iw/2)*2:ceil(ih/2)*2"
    )
    cmd_mp4 = [
        FFMPEG,
        "-y",
        "-i",
        raw_path,
        "-vf",
        scale_filter,
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        str(out_mp4),
    ]
    subprocess.run(cmd_mp4, check=True, capture_output=True)

    # 2. Extract 24 evenly spaced frames across full video duration
    num_frames = 24 if dur >= 4.0 else max(6, int(dur * 4))
    timestamps = [round((i + 0.35) * dur / num_frames, 2) for i in range(num_frames)]
    extracted = []

    for idx, ts in enumerate(timestamps, start=1):
        ts_clamped = min(max(0.0, ts), max(0.0, dur - 0.08))
        fname = f"frame_{idx:02d}.jpg"
        fpath = FRAMES_DIR / fname
        subprocess.run(
            [
                FFMPEG,
                "-y",
                "-ss",
                f"{ts_clamped:.3f}",
                "-i",
                str(out_mp4),
                "-frames:v",
                "1",
                "-q:v",
                "3",
                str(fpath),
            ],
            capture_output=True,
        )
        if fpath.exists():
            # Measure dominant RGB palette & brightness on each frame
            im = Image.open(fpath).convert("RGB")
            arr = np.asarray(im.resize((64, 64)), dtype=np.float32)
            mean_rgb = [int(x) for x in arr.mean(axis=(0, 1))]
            hex_col = "#{:02X}{:02X}{:02X}".format(*mean_rgb)
            luma = round(float(0.2126 * mean_rgb[0] + 0.7152 * mean_rgb[1] + 0.0722 * mean_rgb[2]), 1)
            extracted.append(
                {
                    "index": idx,
                    "timestamp": round(ts_clamped, 2),
                    "url": f"/uploads/frames/{fname}",
                    "avgHex": hex_col,
                    "luma": luma,
                }
            )

    # 3. Detect scene cuts at 10fps low-res RGB stream
    scene_cuts = [0.0]
    raw_rgb = subprocess.run(
        [
            FFMPEG,
            "-i",
            str(out_mp4),
            "-vf",
            "fps=10,scale=96:54",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-",
        ],
        capture_output=True,
    ).stdout
    frame_bytes = 96 * 54 * 3
    n_small = len(raw_rgb) // frame_bytes
    if n_small > 2:
        small = np.frombuffer(raw_rgb[: n_small * frame_bytes], dtype=np.uint8).reshape((n_small, 54, 96, 3)).astype(np.float32)
        diffs = np.abs(small[1:] - small[:-1]).mean(axis=(1, 2, 3))
        med = float(np.median(diffs)) + 1e-5
        thresh = max(18.0, med * 3.2)
        last_cut = 0.0
        for i, d in enumerate(diffs):
            t_sec = round((i + 1) / 10.0, 2)
            if float(d) >= thresh and (t_sec - last_cut) >= 0.45:
                scene_cuts.append(t_sec)
                last_cut = t_sec
                # Also extract exact post-cut shot frame
                shot_name = f"cut_{len(scene_cuts):02d}_{int(t_sec*100):04d}cs.jpg"
                subprocess.run(
                    [
                        FFMPEG,
                        "-y",
                        "-ss",
                        f"{min(t_sec + 0.08, max(0.0, dur - 0.05)):.3f}",
                        "-i",
                        str(out_mp4),
                        "-frames:v",
                        "1",
                        "-q:v",
                        "3",
                        str(FRAMES_DIR / shot_name),
                    ],
                    capture_output=True,
                )

    # 4. Build 4-column contact sheet with timestamps stamped onto each frame
    cols = 4
    rows = max(1, (len(extracted) + cols - 1) // cols)
    is_vert = meta["height"] > meta["width"]
    tile_w = 360
    tile_h = 640 if is_vert else 204
    sheet = Image.new("RGB", (cols * tile_w, rows * tile_h), (10, 10, 16))
    draw = ImageDraw.Draw(sheet)
    font_path = ROOT / "public/fonts/SpaceGrotesk-Bold.ttf"
    font = ImageFont.truetype(str(font_path), 16) if font_path.exists() else ImageFont.load_default()

    for idx_zero, item in enumerate(extracted):
        r, c = divmod(idx_zero, cols)
        p = FRAMES_DIR / f"frame_{item['index']:02d}.jpg"
        if p.exists():
            im = Image.open(p).convert("RGB").resize((tile_w - 4, tile_h - 4), Image.Resampling.LANCZOS)
            sheet.paste(im, (c * tile_w + 2, r * tile_h + 2))
            tag = f"#{item['index']:02d}  {item['timestamp']:05.2f}s"
            draw.rectangle([c * tile_w + 8, r * tile_h + 8, c * tile_w + 132, r * tile_h + 32], fill=(5, 6, 12))
            draw.text((c * tile_w + 14, r * tile_h + 11), tag, fill=(255, 255, 255), font=font)

    sheet_path = UPLOADS_DIR / "contact_sheet.jpg"
    sheet.save(sheet_path, quality=88)

    # 5. Audio energy & beat peaks (if audio track present)
    audio_peaks = []
    if meta["hasAudio"]:
        wav_tmp = UPLOADS_DIR / "_tmp_audio.wav"
        subprocess.run(
            [FFMPEG, "-y", "-i", str(out_mp4), "-ac", "1", "-ar", "16000", str(wav_tmp)],
            capture_output=True,
        )
        if wav_tmp.exists():
            try:
                with wave.open(str(wav_tmp), "rb") as wf:
                    raw_pcm = wf.readframes(wf.getnframes())
                    samples = np.frombuffer(raw_pcm, dtype=np.int16).astype(np.float32) / 32768.0
                hop = 1600  # 0.1s windows
                n_win = len(samples) // hop
                if n_win > 3:
                    rms = np.sqrt(np.mean(samples[: n_win * hop].reshape((n_win, hop)) ** 2, axis=1))
                    onset = np.maximum(0.0, rms[1:] - rms[:-1])
                    p_thresh = float(np.percentile(onset, 86))
                    last_p = -1.0
                    for i, val in enumerate(onset):
                        t_p = round((i + 1) * 0.1, 2)
                        if float(val) > max(0.02, p_thresh) and (t_p - last_p) >= 0.35:
                            audio_peaks.append(t_p)
                            last_p = t_p
            finally:
                wav_tmp.unlink(missing_ok=True)

    result = {
        "ok": True,
        "originalName": orig_name,
        "savedVideo": "/uploads/reference.mp4",
        "contactSheet": "/uploads/contact_sheet.jpg",
        "sizeBytes": out_mp4.stat().st_size,
        **meta,
        "sceneCuts": scene_cuts,
        "audioBeatPeaks": audio_peaks[:40],
        "frames": extracted,
    }
    (UPLOADS_DIR / "analysis.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result))


if __name__ == "__main__":
    main()
