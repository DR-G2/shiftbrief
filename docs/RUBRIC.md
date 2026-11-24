# Rubric check against official judging criteria
Source: https://firebasehybridaihackathon.devpost.com/ (Judging Criteria) and the Official Rules, Section 6.

Scoring is qualitative. This is a compliance and design checklist, not a prediction of a prize.

## Formal requirements (must-pass)

| Requirement | Status in this folder | Still needs you |
|---|---|---|
| Gen AI app using Firebase AI Logic | Yes — imported and called in `src/ai.js` / `src/firebase.js` | Personal Firebase project so the call can succeed for judges |
| Web (Chrome) + Gemini Nano via Firebase AI Logic | Yes — platform is Chrome web | Chrome 139+ and Prompt API flag on the demo machine |
| App Check (debug tokens allowed in submissions) | Yes — debug on localhost only; reCAPTCHA v3 for hosted | You create the site key and register the debug token |
| Encouraged extra Firebase products | Remote Config is used. Firestore/Auth omitted on purpose (notes stay in the browser) | Optional: publish `device_char_limit` in your project |
| Public GitHub/GitLab repo with detectable open-source licence | Apache-2.0 `LICENSE` is in the folder | You create and push a **public** repo |
| Firebase AI Logic actually called in code, not only named in the README | Yes | — |
| Text description covering use of Firebase AI Logic, features, value | `DEVPOST_SUBMISSION.md` | You paste it |
| Demo video ≤3 min, public on YouTube, English or English subtitles, shows the app running | Script ready | You record and upload |
| Hosted URL strongly encouraged; project free to use until judging ends (16 Dec 2026, 2:00 p.m. PT) | `firebase.json` ready | You deploy Firebase Hosting |
| Original work, solely owned, no third-party IP issues | Original code + Apache-2.0 + Firebase SDK | Do not add copyrighted assets or anyone else’s data |
| No production secrets or PII in the repo or submission | `.env.local` is gitignored; samples are fictitious | Do not commit `.env.local` or debug tokens |
| India is not in the excluded-territory list; individual entry allowed | Eligible if you are above the age of majority and not in an excluded place | You register on Devpost yourself |

## Judging criteria

**Technological implementation.** The app uses official inference modes, calls `initializeDeviceModel()` after a user gesture, uses structured output, reports `inferenceSource`, and combines AI Logic with App Check and Remote Config. Weakness until you configure Firebase: judges cannot see a live on-device call from this folder alone.

**Design.** The flow is a complete product: consent, warning, samples, routing explanation, structured brief, copy, local history, status, and progress. It is not only a “hello world” generateContent demo.

**Potential impact.** The audience is specific (clinicians writing unofficial handover notes). The problem is concrete (rushed handover, poor network, privacy). The demo must show the structured brief actually helping with short and long notes.

**Quality of the idea.** Hybrid is used for a reason: short notes stay on-device; long notes go to the cloud. That is closer to a real workflow than a generic summarizer. The idea is adjacent to the official “notes app” example, so the write-up and demo must emphasise the clinical constraints (no identifiers, no clinical decisions, explicit routing) rather than generic summarisation.

## Known residual risks

- On-device inference only works on Chrome desktop 139+ with the flag and a downloaded model. Have an honest fallback line in the video if needed.
- App Check misconfiguration will block cloud inference for judges. Test the hosted URL on a fresh browser before submit.
- The public promotional licence is broad; do not include anything you are not willing to have Google use for contest promotion.
