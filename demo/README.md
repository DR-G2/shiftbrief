# ShiftBrief demo recording

This folder is for the ≤3 minute #BuildHybridAI demo video.

- `record_demo.py` drives a local Vite preview in Chrome and records the screen, then muxes a TTS voiceover from `narration.txt`.
- `narration.txt` is the spoken script. It is honest when only the labelled local-preview path is available.
- Generated media (`*.mp4`, `*.webm`, `*.mp3`, `*.wav`, `parts/`, `raw/`) is gitignored.

The recording produced on this machine is:

`demo/shiftbrief-demo-local-preview.mp4`

It uses **labelled local-preview mode**, because a personal Firebase project and App Check keys are not configured here. The live Gemini Nano / hybrid path should be re-recorded once Firebase is configured and the app is hosted. Do not present this preview as a live model call.

To regenerate:

```bash
# one-time: python venv with edge-tts and playwright
python3 -m venv demo/.venv
demo/.venv/bin/pip install edge-tts playwright
demo/.venv/bin/playwright install chromium

npm run build
npm run preview            # serves dist on http://localhost:8765/

# in another shell
demo/.venv/bin/python demo/record_demo.py
```

The script writes `demo/shiftbrief-demo-local-preview.mp4` (H.264 + AAC, target ≤3 minutes).
