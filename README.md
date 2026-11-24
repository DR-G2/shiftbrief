# ShiftBrief

A clinician shift-handover assistant for **#BuildHybridAI 2026**.

ShiftBrief turns messy, unofficial handover notes into a structured brief: identifier, current issues, pending tasks, and watch-outs. **Short notes prefer an on-device model** (Gemini Nano via Firebase AI Logic in Chrome) so a routine handover can stay on the device. **Longer notes, or an explicit “prefer cloud” request, use a cloud model** through the same SDK. The app then shows the official `inferenceSource` (`ON_DEVICE` or `IN_CLOUD`) so you can see which path actually ran.

This is an original, personal, open-source project. It is not affiliated with any employer or other product. Do not put company brands, internal data, or official exam content in this repository or in a demo.

**Contest:** https://firebasehybridaihackathon.devpost.com/  
**Official rules:** https://firebasehybridaihackathon.devpost.com/rules  
**Hybrid web docs (18 Nov 2026):** https://firebase.google.com/docs/ai-logic/hybrid/web/get-started  
**Deadline:** 30 Nov 2026, 2:00 p.m. Pacific Time = **1 Dec 2026, 3:30 a.m. IST (Asia/Calcutta)**

Licence: Apache License 2.0 (preferred by the contest). You keep ownership of the project. By submitting you also accept Google’s promotional licence and publicity terms — read `docs/MR_G_CHECKLIST.md` before you click submit.

## What this is not

ShiftBrief is **not** a medical device, not a diagnostic tool, and not a substitute for a clinician’s own handover. Do not paste real patient identifiers into the app, a demo, or this repository. Sample notes are fictitious.

## Why hybrid inference belongs here

Ward networks fail at the exact moment a shift changes. A short, routine note should be structured **on the device** (private, free, still works when the network is poor). A long, multi-bay handover needs a stronger cloud pass. That is a product reason to use Firebase AI Logic hybrid modes, not just the default SDK fallback.

## Features

- Intentional routing: `PREFER_ON_DEVICE` for short notes, `PREFER_IN_CLOUD` for long notes, `ONLY_IN_CLOUD` when you ask for a deeper pass
- Live `inferenceSource` from the SDK, shown in the UI
- Structured JSON brief (`responseSchema`)
- Firebase App Check (optional; initialised only when `VITE_RECAPTCHA_SITE_KEY` is set)
- Firebase Remote Config for the on-device character threshold
- `initializeDeviceModel()` after a user click, with download progress
- Chrome 139+ desktop capability hint and Prompt API flag reminder
- First-run consent, copy, and recent briefs stored **only in this browser**
- No cloud database of notes (privacy)

## Repository layout

- `src/ai.js` — imports and **calls** Firebase AI Logic (`getGenerativeModel`, `initializeDeviceModel`, `generateContent`)
- `src/firebase.js` — Firebase App, optional App Check, AI Logic backend
- `src/remote-config.js` — Remote Config threshold
- `src/hybrid.js` — routing rules
- `src/main.js` — product UI
- `docs/DEVPOST_SUBMISSION.md` — text to paste into Devpost
- `docs/DEMO_SCRIPT.md` — ≤3 minute YouTube demo script
- `docs/MR_G_CHECKLIST.md` — exact human steps, keys, licence terms, and timeline
- `docs/ARCHITECTURE.md` — how the system is put together
- `docs/RUBRIC.md` — mapped to official judging criteria

## Local development

Requirements: Node 18+, and for on-device inference **Chrome on desktop, version 139 or higher**.

1. Enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and restart Chrome.
2. Copy `.env.example` to `.env.local` and fill in a **personal** Firebase web-app config (see the checklist).
3. Install and run:

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173 in Chrome desktop. The first time you click **Structure this brief**, the app calls `initializeDeviceModel()` (required after a user gesture). The on-device model download can take several minutes.

Without `.env.local`, the UI still opens and can show a **labelled local preview**. That preview is not a contest-valid AI path. Judges must test a build with Firebase configured.

## Hybrid fallback

- If Firebase web config is missing, the UI uses a clearly labelled **local preview**. That path is a rule-based sketch, not a live model, and is not the contest AI path.
- When Firebase AI Logic is configured, short notes use `PREFER_ON_DEVICE` and long notes (or “prefer cloud”) use `PREFER_IN_CLOUD`. If the on-device model is unavailable, `PREFER_ON_DEVICE` falls back to the cloud through the official SDK, and the UI still shows `inferenceSource`.
- **App Check is optional** in this project. The app initialises App Check only when `VITE_RECAPTCHA_SITE_KEY` is set. If reCAPTCHA v3 classic is unavailable in the Firebase console, leave the key unset and turn enforcement off so the judged demo can call AI Logic.

```bash
npm run build
npm run preview
```

## What a tester needs

- A current Chrome desktop browser (139+)
- The Prompt API flag above if they want to see the on-device path
- The hosted demo URL (recommended) or this repo plus `npm install && npm run dev` after creating their own Firebase project
- The project is free. No login is required. Do not enter real personal data.

Do not commit App Check debug tokens, production secrets, or personal data. The public Firebase web config may be present in a hosted client bundle. A reCAPTCHA **site** key is only needed if you initialise App Check; keep debug tokens and secret keys out of git.

## Built during the contest window

This project was created during the #BuildHybridAI 2026 submission period (11–30 Nov 2026). There is no pre-existing public product.

## Official docs used

- Firebase AI Logic hybrid web get-started and configuration options (updated 18 Nov 2026)
- Structured output with `responseSchema`
- App Check is optional: reCAPTCHA provider only if `VITE_RECAPTCHA_SITE_KEY` is set; debug tokens on localhost only
- Default cloud model: `gemini-3.5-flash-lite` (JS SDK v13+)
