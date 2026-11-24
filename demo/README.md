# ShiftBrief demo recording

This folder is for the ≤3 minute #BuildHybridAI demo video.

- `record_demo.py` drives Chrome against the live hosted app (or `SHIFTBRIEF_URL`) and records the screen, then muxes a TTS voiceover from `narration.txt`.
- `narration.txt` is the spoken script. It is honest about the official on-device / cloud fallback.
- Generated media (`*.mp4`, `*.webm`, `*.mp3`, `*.wav`, `parts/`, `raw/`) is gitignored.

The current recording is:

`demo/shiftbrief-demo-live.mp4`

It was captured against https://shiftbrief-108d9.web.app. Short notes request `PREFER_ON_DEVICE`. When Chrome does not provide Gemini Nano, the official SDK falls back to the cloud and the UI shows `inferenceSource`. Do not present a cloud fallback as an on-device Nano call.

To regenerate:

```bash
# one-time: python venv with edge-tts and playwright
python3 -m venv demo/.venv
demo/.venv/bin/pip install edge-tts playwright
demo/.venv/bin/playwright install chromium

SHIFTBRIEF_URL=https://shiftbrief-108d9.web.app/ \
  demo/.venv/bin/python demo/record_demo.py
```

The script writes `demo/shiftbrief-demo-live.mp4` (H.264 + AAC, target ≤3 minutes).
