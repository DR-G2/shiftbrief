# ShiftBrief demo script (maximum 3 minutes)

Upload a **public** YouTube video, in English or with English subtitles. Show the real app running on Chrome desktop. Use only the fictitious samples. Do not show real patient information, secret keys, or any other product’s branding.

Suggested recording: 1920×1080, browser zoom comfortable, DevTools closed unless you briefly show `inferenceSource`.

## Script

**0:00–0:20 — The problem**  
“I’m a doctor. Shift handover is rushed, and the ward network is often bad. I want a brief that can be structured on the device when the note is short, and only go to the cloud when the handover is long.”

**0:20–0:35 — Consent and warning**  
Show the opening warning or the banner: not a medical device, clinician remains responsible, fictitious notes only. Click through consent if it appears.

**0:35–1:25 — On-device path**  
Click **Short sample**. Point at the character count, below the threshold. Click **Structure this brief**. If the on-device model is already downloaded, wait for the structured brief and point at the mode badge / route line showing `inferenceSource: ON_DEVICE` (or say clearly if Chrome fell back to cloud, and why). Scroll the structured issues, pending tasks, and watch-outs.

If the model is still downloading, you can record a second take after it finishes. Do not pretend a local preview is Gemini Nano.

**1:25–2:15 — Cloud path**  
Click **Long sample**, or tick **Prefer cloud for a deeper pass**. Run it again. Show the route explanation and `inferenceSource: IN_CLOUD`. Show that a multi-bay note still comes back as one structured brief.

**2:15–2:40 — Why hybrid**  
“One SDK. Short notes prefer on-device for privacy and for when the network is poor. Long notes prefer the cloud. The app reports which path actually ran. Notes stay in this browser; I am not storing them on a server.”

**2:40–3:00 — Close**  
“ShiftBrief is a writing aid only. It is open source under Apache 2.0, free to try, and it never replaces a proper handover.” Stop at or under 3:00. If the file is longer, only the first three minutes will be judged.

## Backup if on-device is unavailable on recording day

Say so honestly: “Chrome on-device model is still downloading / not available on this machine, so this short note used the official cloud fallback. The code path is `PREFER_ON_DEVICE`, and the UI shows the SDK `inferenceSource`.” Then show a long-note cloud run. Honest fallback is better than a fake on-device claim.
