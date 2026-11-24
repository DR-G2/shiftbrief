# ShiftBrief demo recording

This folder is for the ≤3 minute #BuildHybridAI demo video.

- `record_demo.py` drives a local Vite preview in Chrome and records the screen.
- `narration.txt` is the spoken script. It is honest when only the labelled local-preview path is available.
- Generated media (`*.mp4`, `*.webm`, `*.mp3`, `*.wav`) is gitignored.

The recording on this machine uses **labelled local-preview mode**, because a personal Firebase project and App Check keys are not configured here. The live Gemini Nano / hybrid path should be re-recorded once Firebase is configured and the app is hosted.

To regenerate:

```bash
cd /workspace/tyrion/opps/buildhybridai-shiftbrief
npm run build
python3 demo/record_demo.py
```
