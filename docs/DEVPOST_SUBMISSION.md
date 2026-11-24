# Devpost submission text — paste these fields
Paste these fields into Devpost. Language: English. Platform: **Web / Chrome**. The project is free of charge. Replace only the YouTube URL after the demo is uploaded.

## Project name
ShiftBrief

## Tagline / elevator pitch (short)
On-device first shift handover: structure a short clinical brief on the device, and use the cloud only when the note is long.

## Platform
Web / Chrome

## Built with (suggested tags)
Firebase AI Logic, Gemini Nano, Chrome Prompt API, Firebase App Check, Firebase Remote Config, Firebase Hosting, JavaScript, Vite

## Repository URL
`https://github.com/DR-G2/shiftbrief`  
(public; Apache-2.0 licence visible in About)

## Demo video URL (public YouTube)
`https://www.youtube.com/watch?v=YOUR_VIDEO_ID`

## Hosted project / website URL (strongly encouraged)
`https://shiftbrief-108d9.web.app`

## About / text description (required)

ShiftBrief is a web app for clinicians who have to hand over a shift in a hurry, often on a ward computer or a laptop with unreliable Wi-Fi.

You paste unofficial, already de-identified handover notes. ShiftBrief returns a structured brief: an identifier line, current issues, pending tasks, and what the incoming clinician should watch for. A short note is intended to be summarised **on-device** with Gemini Nano, through Firebase AI Logic, so a routine handover can stay on the device — private, free, and usable when the network is poor. If Chrome does not provide the on-device model, `PREFER_ON_DEVICE` falls back to the cloud and the UI shows `inferenceSource: IN_CLOUD` honestly. A long or messy multi-bay note, or an explicit request for a deeper pass, is sent to a cloud model through the **same** SDK. The app then displays the official `inferenceSource` (`ON_DEVICE` or `IN_CLOUD`) so it is obvious which path actually ran.

The product is deliberately narrow. It does not diagnose, prescribe, or write in the official record. Every screen carries a warning that the clinician remains responsible, and that real identifiers must not be entered. Recent briefs are stored only in the browser. There is no server-side note database.

Hybrid inference is the point of the build, not a feature sticker. The official example of a notes app that summarises short text on-device and sends long documents to the cloud is the starting point; ShiftBrief makes that split a clinical workflow: short, routine notes prefer `PREFER_ON_DEVICE`; longer handovers prefer `PREFER_IN_CLOUD`; a checkbox forces `ONLY_IN_CLOUD`. Routing is visible. Structured JSON (`responseSchema`) keeps the brief consistent on both paths.

## How Firebase AI Logic was used (required)

- The web SDK is imported and called at runtime in `src/ai.js` (`getAI` is initialised in `src/firebase.js`; `getGenerativeModel`, `initializeDeviceModel`, and `generateContent` run in the brief path).
- Inference modes are chosen on purpose: `PREFER_ON_DEVICE`, `PREFER_IN_CLOUD`, or `ONLY_IN_CLOUD`.
- `initializeDeviceModel()` runs after a user click, with download progress, as required by the official web guide.
- Cloud model: `gemini-3.5-flash-lite`. Responses use structured JSON via `responseSchema`.
- The UI reads `response.inferenceSource`.
- Firebase App Check is optional in this build: it is initialised only when `VITE_RECAPTCHA_SITE_KEY` is set. The hosted demo at https://shiftbrief-108d9.web.app currently leaves AI Logic App Check **unenforced**, because a reCAPTCHA v3 classic provider is not registered. Enforcement is set to auto-re-enable on 21 January 2027, after judging. Debug tokens, when used, are localhost-only and are not shipped in the hosted build.
- Firebase Remote Config supplies the on-device character threshold, with a local default if fetch fails.

## Summary of features and functionality

- First-run consent and a persistent “not a medical device” banner
- Short and long fictitious samples
- Character count and a “prefer cloud” control
- Structured brief: headline, identifier, issues, pending tasks, watch-outs, caution
- Copy to clipboard
- Recent briefs in localStorage only
- Status line for Firebase, Chrome desktop 139+, and on-device model initialisation
- Download progress when the local model is fetched

## Value proposition

Hospital Wi-Fi fails at the moment a shift changes. A handover tool that can still structure a short note on-device, and only go to the cloud when the note is long, is a practical use of hybrid inference. The audience is clinicians writing unofficial practice briefs. The app is a writing aid, not a medical device.

## What was built during the submission period

This is a new project, created during the #BuildHybridAI 2026 submission period (11–30 November 2026). Everything in the public repository — routing, Firebase AI Logic integration, App Check, Remote Config, the product UI, documentation, and this submission text — was built in that window. There is no pre-existing public product to update.

## Testing instructions for judges

1. Open https://shiftbrief-108d9.web.app in **Chrome desktop 139 or higher** (on-device inference is not supported in other browsers).
2. If you want to see the on-device path, enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and restart Chrome. The first on-device call may download a local model and can take several minutes.
3. Accept the consent notice. Use only the built-in fictitious samples (or other invented, de-identified text). Do not enter real personal data.
4. Run **Short sample** and confirm a structured brief appears. Note the reported `inferenceSource`. If the local model is still downloading, `PREFER_ON_DEVICE` may fall back to cloud; the UI will say so honestly.
5. Run **Long sample** or tick **Prefer cloud for a deeper pass** and confirm the cloud path and a multi-item brief.
6. The app is free and does not require an account.
7. To run from source: clone the public repo, copy `.env.example` to `.env.local` with your own Firebase web config, then `npm install && npm run dev`. Do not commit secrets.

## Images / screenshots (optional)

After the hosted demo works, capture:

1. Short-note brief with an on-device (or honest fallback) badge
2. Long-note brief with a cloud badge
3. The warning banner and consent state

## Additional notes

- Submission materials are in English.
- Licence: Apache License 2.0.
- Individual entry, personal project.
