#!/usr/bin/env python3
"""Record a <=3 minute ShiftBrief demo with TTS voiceover.

This script records the labelled local-preview path on a local Vite preview
server. It does not claim a live Gemini Nano or cloud call.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import time
from pathlib import Path

import edge_tts
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEMO = Path(__file__).resolve().parent
NARRATION = DEMO / "narration.txt"
AUDIO = DEMO / "narration.mp3"
RAW_DIR = DEMO / "raw"
WEBM = None
OUT = DEMO / "shiftbrief-demo-local-preview.mp4"
URL = os.environ.get("SHIFTBRIEF_URL", "http://localhost:8765/")
VOICE = os.environ.get("SHIFTBRIEF_VOICE", "en-GB-SoniaNeural")

# Cue times are filled after TTS is built (seconds from start of audio).
CUES: dict[str, float] = {}


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kwargs)


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    )
    return float(out.strip())


async def synth_segment(text: str, dest: Path, voice: str) -> None:
    communicate = edge_tts.Communicate(text, voice, rate="-8%")
    await communicate.save(str(dest))


def build_narration() -> float:
    text = NARRATION.read_text().strip()
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    # Map first lines to cue names so the screen recording can follow the voice.
    cue_names = [
        "intro",
        "honesty",
        "consent",
        "short_setup",
        "short_result",
        "long_setup",
        "long_result",
        "close",
    ]
    if len(paragraphs) != len(cue_names):
        raise SystemExit(f"Expected {len(cue_names)} narration paragraphs, got {len(paragraphs)}")

    parts_dir = DEMO / "parts"
    if parts_dir.exists():
        shutil.rmtree(parts_dir)
    parts_dir.mkdir()

    silence = parts_dir / "silence.mp3"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            "0.85",
            "-q:a",
            "9",
            str(silence),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    concat_list = []
    elapsed = 0.35  # leading pad later
    for i, (name, para) in enumerate(zip(cue_names, paragraphs)):
        dest = parts_dir / f"{i:02d}-{name}.mp3"
        asyncio.run(synth_segment(para, dest, VOICE))
        dur = ffprobe_duration(dest)
        CUES[name] = elapsed
        elapsed += dur
        concat_list.append(dest)
        if i < len(paragraphs) - 1:
            concat_list.append(silence)
            elapsed += 0.85

    list_file = parts_dir / "concat.txt"
    list_file.write_text("".join(f"file '{p.resolve()}'\n" for p in concat_list))
    # leading half-second of silence so the first frame is visible
    lead = parts_dir / "lead.mp3"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            "0.35",
            "-q:a",
            "9",
            str(lead),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    list_file.write_text(
        f"file '{lead.resolve()}'\n" + "".join(f"file '{p.resolve()}'\n" for p in concat_list)
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(AUDIO),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    duration = ffprobe_duration(AUDIO)
    print(f"Narration {duration:.1f}s; cues: " + ", ".join(f"{k}={v:.1f}" for k, v in CUES.items()))
    if duration > 175:
        raise SystemExit(f"Narration is {duration:.1f}s; keep the voiceover under 3 minutes with margin.")
    return duration


def wait_until(start: float, cue: str, extra: float = 0.15) -> None:
    target = start + CUES[cue] + extra
    remaining = target - time.monotonic()
    if remaining > 0:
        time.sleep(remaining)


def record_screen(audio_duration: float) -> Path:
    if RAW_DIR.exists():
        shutil.rmtree(RAW_DIR)
    RAW_DIR.mkdir()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--disable-dev-shm-usage", "--hide-scrollbars"],
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=str(RAW_DIR),
            record_video_size={"width": 1440, "height": 900},
            device_scale_factor=1,
        )
        page = context.new_page()
        page.add_init_script("localStorage.removeItem('shiftbrief.consent');")
        page.goto(URL, wait_until="networkidle")
        start = time.monotonic()

        wait_until(start, "honesty", 0.2)

        if page.locator("#consent").is_visible():
            wait_until(start, "consent", 0.3)
            page.locator("#accept-consent").click()
            page.wait_for_timeout(600)

        wait_until(start, "short_setup", 0.2)
        page.locator("#load-short").click()
        page.wait_for_timeout(800)
        mid_short = start + (CUES["short_setup"] + CUES["short_result"]) / 2
        remaining = mid_short - time.monotonic()
        if remaining > 0:
            time.sleep(remaining)
        page.locator("#run").click()
        page.locator("#output .brief").filter(has_text="Night shift brief, ward 4").wait_for(timeout=8000)
        page.wait_for_timeout(400)

        wait_until(start, "long_setup", 0.2)
        page.locator("#load-long").click()
        page.wait_for_timeout(700)
        mid_long = start + (CUES["long_setup"] + CUES["long_result"]) / 2
        remaining = mid_long - time.monotonic()
        if remaining > 0:
            time.sleep(remaining)
        page.locator("#run").click()
        page.locator("#output .brief").filter(has_text="Morning handover, medical ward").wait_for(timeout=8000)

        # hold until audio ends, plus a short tail
        remaining = (start + audio_duration + 1.2) - time.monotonic()
        if remaining > 0:
            time.sleep(remaining)

        video_path = Path(page.video.path())
        context.close()
        browser.close()
        return video_path


def mux(video: Path, audio_duration: float) -> None:
    video_duration = ffprobe_duration(video)
    # Pad the video if the recording is slightly short of the voiceover.
    pad = max(0.0, audio_duration + 0.4 - video_duration)
    filter_v = "format=yuv420p"
    if pad > 0.05:
        filter_v = f"tpad=stop_mode=clone:stop_duration={pad:.2f},format=yuv420p"
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video),
            "-i",
            str(AUDIO),
            "-vf",
            filter_v,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(OUT),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    final = ffprobe_duration(OUT)
    print(f"Wrote {OUT} ({final:.1f}s, video in {video_duration:.1f}s, pad {pad:.2f}s)")
    if final > 180:
        raise SystemExit(f"Output is {final:.1f}s, over the 3-minute limit.")


def main() -> None:
    # Confirm the local app is up.
    try:
        import urllib.request

        urllib.request.urlopen(URL, timeout=3).read(200)
    except Exception as exc:
        raise SystemExit(f"Local app is not reachable at {URL}. Start `npm run preview` first. ({exc})")

    duration = build_narration()
    video = record_screen(duration)
    mux(video, duration)
    print("Cues used:", CUES)


if __name__ == "__main__":
    main()
