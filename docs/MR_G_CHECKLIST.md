# What you must do yourself — ShiftBrief entry
**Deadline: 1 December 2026, 3:30 a.m. IST (Asia/Calcutta)**  
That is 30 November 2026, 2:00 p.m. Pacific Time, the official close.

Tyrion can keep polishing code in this folder. Tyrion cannot create your accounts, complete identity checks, push to GitHub under your name, upload YouTube, or click Submit on Devpost. Use **personal** Google, Firebase, GitHub, Devpost, and YouTube accounts that you control. Do not use accounts, repos, domains, data, or branding from any other company or project.

Judging runs 10–16 December 2026, 9:00 a.m.–2:00 p.m. PT. Winners are due on or around 21 December 2026, 12:00 p.m. PT. The project must stay available free of charge until judging ends.

---

## Licence terms you accept when you submit

You already approved entering, which includes open-sourcing the project and Google’s promotional licence. Read these terms again before you click Submit. Official source: https://firebasehybridaihackathon.devpost.com/rules (Sections 12 and 14).

**Open-source requirement.** The GitHub (or GitLab) repository must be public and must include an open-source licence file that GitHub can detect in the About section. Apache License 2.0 is already in `LICENSE` and is the contest’s preferred licence.

**You keep ownership.** “As between Google and the entrant, all Submissions remain the intellectual property of the individuals or organizations that developed them. The entrant retains ownership of all intellectual and industrial property rights (including moral rights) in and to any project materials, or videos provided for the Contest.”

**Licence you grant to Google (non-exclusive, you still own the work):**

> “As a condition of entry, entrant grants Google, its subsidiaries, agents and partner companies, a perpetual, irrevocable, worldwide, royalty-free, and non-exclusive license to use, reproduce, adapt, modify, publish, distribute, publicly perform, create a derivative work from, and publicly display such Project(s) (1) for the purposes of allowing Google and its affiliates and the Judges to evaluate the Project for purposes of the Contest, and (2) in connection with advertising and promotion via communication to the public or other groups, including, but not limited to, the right to make screenshots, animations and video clips available for promotional purposes.”

**Publicity (Section 14).** By participating you also consent to promotion of the submission and to use of personal information about you (including name, likeness, photograph, voice, opinions, comments, and hometown and country of residence) for promotional purposes, worldwide, without further payment, unless prohibited by law.

**Binding agreement.** Submitting the entry constitutes agreement to the Official Rules, including arbitration in San Jose, California, and Devpost’s terms and privacy policy.

If any of that is unacceptable, do not submit.

---

## Suggested timeline (IST)

Work backwards from the deadline. Do not leave submit until late on 30 November.

| When (IST) | What you do |
|---|---|
| **Tonight / Wednesday 25 Nov, morning** | Create the personal Firebase project, register a web app, turn on AI Logic (Gemini Developer API), copy keys into `.env.local`. App Check is optional: only set `VITE_RECAPTCHA_SITE_KEY` if a provider is registered; otherwise leave enforcement off. Create a **new public** GitHub repo (empty, Apache-2.0 will come from this folder). |
| **Wednesday 25 Nov, by 11:30 p.m. IST** | Optional only: Google Account Quota sprint 3 closes 25 Nov, 10:00 a.m. PT. ShiftBrief uses text inference, which the contest says is free within usage limits. You do **not** need this quota unless you later add billed image-generation features (this app does not). |
| **Thursday 26 Nov** | Run the app in Chrome 139+ desktop, enable the Prompt API flag, confirm a short sample shows `ON_DEVICE` or a clear fallback, and a long sample shows a cloud path. Fix anything that breaks. |
| **Friday 27 Nov** | `npm run build`, deploy to **Firebase Hosting** on the same personal project. Record the ≤3 minute demo (script in `DEMO_SCRIPT.md`). Upload to **your** YouTube account as a **public** video. |
| **Saturday 28 Nov** | Open Devpost, register for #BuildHybridAI, paste `DEVPOST_SUBMISSION.md`, add repo URL, video URL, hosted URL, screenshots. Save a draft. |
| **Sunday 29 Nov, afternoon or evening IST** | Final pass on a clean Chrome profile. Submit on Devpost. Keep a buffer before Monday 1 Dec, 3:30 a.m. IST. After submit, check the project page still lists a public repo, public video, and a working hosted demo. |

---

## Step-by-step: accounts and keys

### A. Personal Firebase project and web app

1. Sign in at https://console.firebase.google.com/ with your personal Google account.
2. Create a **new** project (Google Analytics is optional; the official AI Logic guide says it is not required). Suggested project name: `shiftbrief-personal`.
3. In the console: **AI Services > AI Logic > Get started**. Choose the **Gemini Developer API** (official recommendation for getting started at no cost).
4. Register a **Web** app. Copy the web config values into `/workspace/tyrion/opps/buildhybridai-shiftbrief/.env.local` using `.env.example` as the template:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. **App Check is optional** for this entry. The app initialises App Check only when `VITE_RECAPTCHA_SITE_KEY` is set. If reCAPTCHA v3 classic is deprecated or no provider is registered, do **not** set a site key, and turn **enforcement off** for Firebase AI Logic so the judged demo can call the API.
6. If you later register a supported App Check provider, add your Hosting domain (do **not** add `localhost` to reCAPTCHA allowed domains), put the site key in `VITE_RECAPTCHA_SITE_KEY`, and then enforce App Check.
7. Only if App Check is initialised: on localhost you may set `VITE_APPCHECK_DEBUG_TOKEN=true`, copy the printed debug token from DevTools, and register it under **App Check > Apps > Manage debug tokens**. Never commit that token and never ship it in the hosted build.
8. Optional but useful: in Remote Config, create a parameter `device_char_limit` with default `700`, and publish.

### B. Chrome on your computer (for the on-device demo)

1. Use Chrome desktop 139 or higher (`chrome://settings/help`).
2. Set `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` to Enabled and restart Chrome.
3. The first on-device call may download the local model and can take several minutes. Start that download on Thursday, not during the recording.

### C. New public GitHub repository

1. On github.com, signed into your personal account, create a **new public** repository named `shiftbrief` (or similar). Do **not** push into any existing company or other-project repository.
2. Add the Apache-2.0 licence file (already in this folder) so GitHub shows the licence in About.
3. Push this folder (including `LICENSE`, source, and docs). Do **not** commit `.env.local`, debug tokens, or `node_modules`.
4. In the repo About section, confirm the licence is visible.

Suggested commands once the empty repo exists (replace the URL with yours):

```bash
cd /workspace/tyrion/opps/buildhybridai-shiftbrief
git init
git add LICENSE README.md package.json package-lock.json vite.config.js firebase.json index.html .gitignore .env.example src docs
git status   # confirm .env.local is not listed
git commit -m "ShiftBrief: hybrid handover assistant for BuildHybridAI 2026"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shiftbrief.git
git push -u origin main
```

You must run the push yourself.

### D. Hosted demo (strongly encouraged; judges may test it)

1. Install the Firebase CLI if needed: `npm install -g firebase-tools` (or `npx firebase-tools`).
2. `npx firebase login` with the same personal Google account.
3. `npx firebase init hosting` in this folder, point at the personal project, public directory `dist`. A `firebase.json` is already provided.
4. `npm run build && npx firebase deploy --only hosting`
5. Confirm the site loads, App Check works (no debug token in the production bundle), and both samples run.

### E. Demo video

1. Follow `DEMO_SCRIPT.md`. Maximum 3 minutes. English (or English subtitles). Show the real app running, including the on-device and cloud paths if you can.
2. Record with a phone, OBS Studio, or your operating system’s screen recorder. No copyrighted music.
3. Upload to **your** YouTube channel as a **public** video. Copy the URL.

### F. Devpost submission

1. Create or use a personal Devpost account: https://firebasehybridaihackathon.devpost.com/
2. Register for the hackathon if you have not already.
3. Enter a submission. Paste the fields from `DEVPOST_SUBMISSION.md`. Platform: **Web / Chrome**.
4. Add the public repo URL, the public YouTube URL, and the hosted demo URL.
5. Confirm the repo contains a detectable open-source licence and that `src/ai.js` imports and calls Firebase AI Logic.
6. Submit before 1 Dec 2026, 3:30 a.m. IST.

---

## Blockers Tyrion cannot clear

- Your personal Firebase, GitHub, YouTube, and Devpost logins and any CAPTCHA or identity check
- App Check debug-token safelisting and reCAPTCHA setup
- The Chrome on-device model download on your machine
- Recording and uploading the video
- Pushing the public repo and clicking Submit
- Any fees if you exceed free-tier or quota limits (text inference is intended to stay in the free tier; you are responsible for charges if you turn on billed APIs)

If Firebase AI Logic or Hosting refuses the personal account, stop and say so — do not switch to a company project.
