import os
import wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DURATION = 30.0
N = int(SR * DURATION)


def midi_to_hz(m):
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


def env_adsr(length, attack=0.05, decay=0.1, sustain=0.75, release=0.25):
    e = np.ones(length, dtype=np.float32) * sustain
    a_n = min(int(attack * SR), length)
    d_n = min(int(decay * SR), max(0, length - a_n))
    r_n = min(int(release * SR), length)
    if a_n > 0:
        e[:a_n] = np.linspace(0.0, 1.0, a_n, dtype=np.float32) ** 0.8
    if d_n > 0:
        e[a_n : a_n + d_n] = np.linspace(1.0, sustain, d_n, dtype=np.float32)
    if r_n > 0:
        e[-r_n:] *= np.linspace(1.0, 0.0, r_n, dtype=np.float32) ** 1.4
    return e


def rich_string_pad(freq, dur, detune_cents=9.0, cutoff=2200.0):
    L = int(dur * SR)
    t = np.arange(L, dtype=np.float32) / SR
    left = np.zeros(L, dtype=np.float32)
    right = np.zeros(L, dtype=np.float32)
    # 5-voice ensemble unison (Zelig electro-string warmth)
    offsets = [-detune_cents, -detune_cents * 0.45, 0.0, detune_cents * 0.45, detune_cents]
    pans = [0.15, 0.35, 0.5, 0.65, 0.85]
    rng = np.random.default_rng(int(freq * 100))
    for c, pan in zip(offsets, pans):
        f = freq * (2.0 ** (c / 1200.0))
        vib = 1.0 + 0.0018 * np.sin(2.0 * np.pi * 5.2 * t + rng.uniform(0, 6.28))
        ph = 2.0 * np.pi * np.cumsum(f * vib) / SR + rng.uniform(0, 6.28)
        # Band-limited warm bowed waveform (fundamental + soft harmonics)
        sig = (
            0.58 * np.sin(ph)
            + 0.27 * np.sin(2.0 * ph)
            + 0.14 * np.sin(3.0 * ph)
            + 0.07 * np.sin(4.0 * ph)
            + 0.04 * np.sin(5.0 * ph)
        )
        left += sig * np.sqrt(1.0 - pan)
        right += sig * np.sqrt(pan)
    sos = butter(3, min(cutoff, SR * 0.45), btype="low", fs=SR, output="sos")
    left = sosfilt(sos, left).astype(np.float32)
    right = sosfilt(sos, right).astype(np.float32)
    return left * 0.35, right * 0.35


def crystal_bell(freq, dur):
    L = int(dur * SR)
    t = np.arange(L, dtype=np.float32) / SR
    # Felt marimba + glass harmonic partial ratios
    sig = (
        0.65 * np.sin(2 * np.pi * freq * t) * np.exp(-t * 2.4)
        + 0.25 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 4.2)
        + 0.14 * np.sin(2 * np.pi * freq * 3.005 * t) * np.exp(-t * 6.5)
        + 0.08 * np.sin(2 * np.pi * freq * 4.01 * t) * np.exp(-t * 9.0)
    )
    attack = np.minimum(1.0, t / 0.006)
    out = (sig * attack).astype(np.float32)
    return out


def sub_impact(dur=1.8, f_start=92.0, f_end=36.71):
    L = int(dur * SR)
    t = np.arange(L, dtype=np.float32) / SR
    freqs = f_end + (f_start - f_end) * np.exp(-t * 9.5)
    ph = 2.0 * np.pi * np.cumsum(freqs) / SR
    sub = np.tanh(1.55 * np.sin(ph)) * np.exp(-t * 2.1)
    # Soft transient thump
    thump = np.sin(2 * np.pi * (160 * np.exp(-t * 28.0)) * t) * np.exp(-t * 24.0) * 0.45
    attack = np.minimum(1.0, t / 0.004)
    return ((sub + thump) * attack).astype(np.float32)


def silk_whoosh(dur=1.4, f0=180.0, f1=2600.0, pan_dir=1.0, seed=7):
    L = int(dur * SR)
    rng = np.random.default_rng(seed)
    t = np.arange(L, dtype=np.float32) / SR
    u = t / dur
    noise = rng.standard_normal(L).astype(np.float32)
    # Render 8 overlapping frequency bands along trajectory for smooth filter sweep
    swept = np.zeros(L, dtype=np.float32)
    steps = 10
    for i in range(steps):
        center_u = i / (steps - 1)
        win = np.clip(1.0 - np.abs(u - center_u) * (steps - 1), 0.0, 1.0)
        fc = f0 * ((f1 / f0) ** (np.sin(np.pi * center_u) ** 0.85))
        sos = butter(2, [max(45.0, fc * 0.6), min(SR * 0.45, fc * 1.65)], btype="band", fs=SR, output="sos")
        swept += sosfilt(sos, noise) * win
    bell = np.sin(np.pi * u) ** 1.6
    swept *= bell * 0.55
    pan = np.clip(0.5 + 0.38 * pan_dir * (2.0 * u - 1.0), 0.05, 0.95)
    return (swept * np.sqrt(1.0 - pan)).astype(np.float32), (swept * np.sqrt(pan)).astype(np.float32)


def add_stereo(mix_l, mix_r, sig_l, sig_r, start_s, gain=1.0):
    idx = int(start_s * SR)
    if idx >= N:
        return
    end = min(N, idx + len(sig_l))
    n = end - idx
    if n <= 0:
        return
    mix_l[idx:end] += sig_l[:n] * gain
    mix_r[idx:end] += sig_r[:n] * gain


def build_score(out_wav="public/audio/content24-zelig-score.wav"):
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    mix_l = np.zeros(N, dtype=np.float32)
    mix_r = np.zeros(N, dtype=np.float32)

    # 1. ACT I (0.0s - 6.2s): Intimate Iris Awakening (D2 sub drone + crystalline D5-A5-E6 harmonics)
    for midi, gain in [(38, 0.34), (50, 0.22), (57, 0.16), (64, 0.13)]:
        sl, sr_c = rich_string_pad(midi_to_hz(midi), 6.5, detune_cents=7.0, cutoff=1150.0)
        env = env_adsr(len(sl), attack=1.4, decay=0.8, sustain=0.85, release=1.2)
        add_stereo(mix_l, mix_r, sl * env, sr_c * env, 0.05, gain)

    # Subtle eye glint chimes (0.9s, 2.7s, 4.1s)
    for t_s, midi, g, pan in [(0.9, 74, 0.14, 0.35), (2.5, 81, 0.16, 0.65), (3.9, 88, 0.15, 0.5)]:
        b = crystal_bell(midi_to_hz(midi), 2.4)
        add_stereo(mix_l, mix_r, b * np.sqrt(1 - pan), b * np.sqrt(pan), t_s, g)

    # Accelerating pupil zoom riser (4.0s -> 6.1s) + Portal Sub Impact at 5.95s
    wl, wr = silk_whoosh(2.2, f0=120.0, f1=3800.0, pan_dir=1.0, seed=11)
    add_stereo(mix_l, mix_r, wl, wr, 4.0, 0.85)
    imp = sub_impact(2.0, f_start=98.0, f_end=36.71)
    add_stereo(mix_l, mix_r, imp, imp, 5.95, 0.52)

    # 2. ACT II (6.1s - 13.2s): Flowing Silk Ribbons — Electro-String Ostinato (Dm9 -> BbMaj7)
    chords_act2 = [
        (6.0, 3.6, [38, 50, 57, 60, 64]),   # Dm9
        (9.6, 3.8, [34, 46, 53, 57, 62]),   # BbMaj7
    ]
    for st, dur, notes in chords_act2:
        for midi in notes:
            sl, sr_c = rich_string_pad(midi_to_hz(midi), dur + 0.6, detune_cents=10.0, cutoff=2400.0)
            env = env_adsr(len(sl), attack=0.55, decay=0.4, sustain=0.82, release=0.85)
            add_stereo(mix_l, mix_r, sl * env, sr_c * env, st, 0.20)

    # Flowing 16th-note electro-arp pulse (125 BPM -> 0.12s step)
    arp_notes = [62, 65, 69, 72, 76, 72, 69, 65]
    t_cursor = 6.2
    step_i = 0
    while t_cursor < 20.1:
        # Rise in pitch & brightness during Act III (13.2s -> 20.1s)
        transpose = 0 if t_cursor < 13.2 else (2 if t_cursor < 16.8 else 5)
        midi = arp_notes[step_i % len(arp_notes)] + transpose
        b = crystal_bell(midi_to_hz(midi), 0.36)
        prog = (t_cursor - 6.2) / 14.0
        pan = 0.5 + 0.32 * np.sin(step_i * 0.9)
        gain = 0.085 + 0.075 * prog
        add_stereo(mix_l, mix_r, b * np.sqrt(1 - pan), b * np.sqrt(pan), t_cursor, gain)
        t_cursor += 0.125
        step_i += 1

    # Silk ribbon sweeps in Act II
    for ts, pdir, sd in [(7.2, 1.0, 21), (10.3, -1.0, 22)]:
        wl, wr = silk_whoosh(1.6, 220.0, 2200.0, pdir, sd)
        add_stereo(mix_l, mix_r, wl, wr, ts, 0.55)

    # 3. ACT III (13.2s - 20.4s): Titanium & Crystal Prism Convergence (5 AI Streams Locking In!)
    imp2 = sub_impact(1.6, 95.0, 41.2)
    add_stereo(mix_l, mix_r, imp2, imp2, 13.2, 0.45)
    wl3, wr3 = silk_whoosh(1.1, 260.0, 3200.0, -1.0, 33)
    add_stereo(mix_l, mix_r, wl3, wr3, 12.9, 0.70)

    chords_act3 = [
        (13.2, 3.6, [40, 52, 59, 62, 67]),  # Em7
        (16.8, 3.7, [45, 57, 64, 67, 73]),  # A7sus4 -> D tension!
    ]
    for st, dur, notes in chords_act3:
        for midi in notes:
            sl, sr_c = rich_string_pad(midi_to_hz(midi), dur + 0.5, detune_cents=11.0, cutoff=3200.0)
            env = env_adsr(len(sl), attack=0.45, decay=0.3, sustain=0.90, release=0.7)
            add_stereo(mix_l, mix_r, sl * env, sr_c * env, st, 0.23)

    # 5 Flagship AI Model Prism Lock Chimes (14.0, 14.7, 15.4, 16.1, 16.8s)
    prism_locks = [(14.0, 74, 0.25), (14.7, 77, 0.38), (15.4, 81, 0.50), (16.1, 84, 0.62), (16.8, 88, 0.75)]
    for ts, midi, pan in prism_locks:
        b = crystal_bell(midi_to_hz(midi), 1.9)
        add_stereo(mix_l, mix_r, b * np.sqrt(1 - pan), b * np.sqrt(pan), ts, 0.22)

    # Driving warm heartbeat kick pulse from 13.2s -> 20.0s (0.5s beat = 120 BPM)
    beat_t = 13.2
    while beat_t < 19.9:
        k = sub_impact(0.45, 84.0, 41.2)
        add_stereo(mix_l, mix_r, k, k, beat_t, 0.24)
        beat_t += 0.5

    # Massive Convergence Riser (18.2s -> 20.4s)
    wl4, wr4 = silk_whoosh(2.25, 180.0, 5200.0, 1.0, 44)
    add_stereo(mix_l, mix_r, wl4, wr4, 18.2, 0.95)

    # 4. ACT IV (20.4s - 26.8s): Grand Hero Reveal — Content24 AI Hub Monolith (D Major Add9 Soaring Climax!)
    imp_hero = sub_impact(2.6, 108.0, 36.71)
    add_stereo(mix_l, mix_r, imp_hero, imp_hero, 20.4, 0.62)
    wl_curtain, wr_curtain = silk_whoosh(2.0, 400.0, 2900.0, -1.0, 55)
    add_stereo(mix_l, mix_r, wl_curtain, wr_curtain, 20.45, 0.65)

    hero_chords = [
        (20.4, 3.3, [38, 50, 57, 62, 66, 74]),  # D Major ( radiant triumph! )
        (23.7, 3.3, [35, 47, 54, 59, 62, 69]),  # Bm9 -> warm emotional lift
    ]
    for st, dur, notes in hero_chords:
        for midi in notes:
            sl, sr_c = rich_string_pad(midi_to_hz(midi), dur + 0.7, detune_cents=12.0, cutoff=3900.0)
            env = env_adsr(len(sl), attack=0.30, decay=0.4, sustain=0.88, release=0.9)
            add_stereo(mix_l, mix_r, sl * env, sr_c * env, st, 0.22)

    # Shimmering UI workflow activation notes at 23.6s
    for idx_n, m in enumerate([74, 78, 81, 86]):
        b = crystal_bell(midi_to_hz(m), 1.5)
        add_stereo(mix_l, mix_r, b * 0.7, b * 0.7, 23.6 + idx_n * 0.09, 0.16)

    # 5. ACT V (26.8s - 30.0s): Iconic Minimal Platinum End Card + 3-Note Zelig Sonic Logo!
    wl_end, wr_end = silk_whoosh(0.95, 320.0, 2400.0, 1.0, 66)
    add_stereo(mix_l, mix_r, wl_end, wr_end, 26.45, 0.48)

    # Warm resolving Dadd9 halo chord
    for midi, g in [(38, 0.26), (50, 0.20), (57, 0.18), (64, 0.16), (66, 0.17)]:
        sl, sr_c = rich_string_pad(midi_to_hz(midi), 3.15, detune_cents=8.0, cutoff=2600.0)
        env = env_adsr(len(sl), attack=0.2, decay=0.5, sustain=0.65, release=1.5)
        add_stereo(mix_l, mix_r, sl * env, sr_c * env, 26.80, g)

    # Signature 3-Note Content24 Sonic Mnemonic ("Con - tent - 24!")
    mnemonic = [(26.95, 69, 0.30, 0.42), (27.19, 74, 0.32, 0.50), (27.46, 78, 0.38, 0.58)]
    for ts, m, g, pan in mnemonic:
        b = crystal_bell(midi_to_hz(m), 2.4)
        b_oct = crystal_bell(midi_to_hz(m + 12), 2.4) * 0.35
        sig = b + b_oct
        add_stereo(mix_l, mix_r, sig * np.sqrt(1 - pan), sig * np.sqrt(pan), ts, g)
    imp_end = sub_impact(1.9, 78.0, 36.71)
    add_stereo(mix_l, mix_r, imp_end, imp_end, 27.46, 0.32)

    # Lush Stereo Concert-Hall Delay / Reverb Network (cross-feedback stereo reflections)
    rev_l = mix_l.copy()
    rev_r = mix_r.copy()
    for delay_ms, fb in [(47, 0.24), (89, 0.19), (149, 0.14), (233, 0.09)]:
        d = int(delay_ms * 0.001 * SR)
        rev_l[d:] += mix_r[:-d] * fb
        rev_r[d:] += mix_l[:-d] * fb

    out_l = 0.78 * mix_l + 0.28 * rev_l
    out_r = 0.78 * mix_r + 0.28 * rev_r

    # Clean master fade-in (40ms) and smooth tail fade-out (last 0.45s) + soft mastering limiter
    fade_in = np.linspace(0.0, 1.0, int(0.04 * SR), dtype=np.float32)
    fade_out = np.linspace(1.0, 0.0, int(0.45 * SR), dtype=np.float32) ** 1.5
    out_l[: len(fade_in)] *= fade_in
    out_r[: len(fade_in)] *= fade_in
    out_l[-len(fade_out) :] *= fade_out
    out_r[-len(fade_out) :] *= fade_out

    peak = max(float(np.max(np.abs(out_l))), float(np.max(np.abs(out_r))), 1e-6)
    scale = 0.90 / peak
    stereo = np.stack([np.tanh(out_l * scale * 1.08) * 0.92, np.tanh(out_r * scale * 1.08) * 0.92], axis=1)
    pcm = (np.clip(stereo, -1.0, 1.0) * 32767.0).astype(np.int16)

    with wave.open(out_wav, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())

    print(f"Synthesized Zelig soundtrack -> {out_wav} ({os.path.getsize(out_wav) / (1024*1024):.2f} MB)")


if __name__ == "__main__":
    build_score()
