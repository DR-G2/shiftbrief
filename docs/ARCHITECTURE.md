# ShiftBrief architecture

## Goal

Give a clinician a complete, trustworthy handover-briefing tool that uses **on-device inference when a short note can stay private**, and **cloud inference when the note is long or the local model is missing**. The hybrid split is a product decision, implemented with Firebase AI Logic inference modes, not a post-hoc label.

## Runtime flow

1. The web app boots, shows a consent gate, and reports Chrome / Firebase / model status.
2. Remote Config supplies `device_char_limit` (default 700 characters) if fetch succeeds.
3. On **Structure this brief** (a user gesture):
   - Routing in `src/hybrid.js` chooses a mode:
     - short note → `InferenceMode.PREFER_ON_DEVICE`
     - long note → `InferenceMode.PREFER_IN_CLOUD`
     - checkbox “Prefer cloud for a deeper pass” → `InferenceMode.ONLY_IN_CLOUD`
   - `src/ai.js` creates or reuses a `GenerativeModel` with that mode, a JSON `responseSchema`, `gemini-3.5-flash-lite` as the cloud model, and on-device Prompt API options.
   - The app calls `initializeDeviceModel()` after that click, with a progress callback, as required by the official web guide. If the intended target is on-device, it waits so the request is less likely to fall back only because the model is still downloading.
   - It then calls `generateContent()` with the briefing prompt and the notes.
   - The UI displays `response.inferenceSource` (`ON_DEVICE` or `IN_CLOUD`).
4. Notes and recent briefs stay in the browser (`localStorage`). They are not written to Firestore. Cloud inference is used only for the prompt itself when that route is chosen or when the on-device model is unavailable.

## Why these Firebase products

- **Firebase AI Logic** (required): imported and called at runtime in `src/ai.js` and initialised in `src/firebase.js`.
- **App Check** (optional in this entry): initialised only when `VITE_RECAPTCHA_SITE_KEY` is set, using `ReCaptchaV3Provider`. Official debug-token pattern on localhost only, never committed. Leave the key unset and turn enforcement off if a reCAPTCHA provider is not available (the console currently treats reCAPTCHA v3 classic as deprecated).
- **Remote Config** (encouraged): live threshold for the on-device / cloud split, with a local default if fetch fails.

Authentication and Firestore were deliberately omitted so unofficial handover notes are not stored on a server.

## Platforms

Web (Chrome) is the contest platform. On-device inference requires Chrome desktop 139+ and the Prompt API flag `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`. Other browsers can still use the cloud path if Firebase is configured.

## Security and privacy

- No real patient identifiers in samples, demos, or git.
- No production secret keys or App Check debug tokens in the repo.
- App Check may be left **unenforced** for the judged demo when no reCAPTCHA provider is registered. If you do enable App Check, enforce it and do not ship `FIREBASE_APPCHECK_DEBUG_TOKEN` in hosted builds.

## Limits (official)

- On-device path is single-turn text (no chat), structured JSON supported.
- On-device maximum token limit is 9216 tokens.
- `initializeDeviceModel()` must follow a user gesture.
- If the on-device model is still downloading, `PREFER_ON_DEVICE` may fall back to cloud; the UI reports the actual source.
- Default cloud model in JS SDK v13+ is `gemini-3.5-flash-lite`.
