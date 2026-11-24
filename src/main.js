import { SHORT_SAMPLE, LONG_SAMPLE } from "./samples.js";
import { chooseRoute, DEFAULT_DEVICE_CHAR_LIMIT } from "./hybrid.js";
import { previewBrief } from "./preview-model.js";
import { detectChromeDesktop, hasPromptApiHint } from "./capabilities.js";
import { loadHistory, saveHistoryEntry, clearHistory } from "./history.js";
import { initFirebase, readFirebaseConfig, isLocalHost } from "./firebase.js";
import { loadRemoteSettings } from "./remote-config.js";
import { createBriefModel, startDeviceModel, generateBrief } from "./ai.js";

const notesEl = document.querySelector("#notes");
const countEl = document.querySelector("#char-count");
const forceEl = document.querySelector("#force-cloud");
const runEl = document.querySelector("#run");
const outputEl = document.querySelector("#output");
const hintEl = document.querySelector("#route-hint");
const badgeEl = document.querySelector("#mode-badge");
const copyEl = document.querySelector("#copy-brief");
const historyEl = document.querySelector("#history");
const configStatusEl = document.querySelector("#config-status");
const chromeStatusEl = document.querySelector("#chrome-status");
const modelStatusEl = document.querySelector("#model-status");
const progressEl = document.querySelector("#progress");
const progressBarEl = document.querySelector("#progress-bar");
const progressLabelEl = document.querySelector("#progress-label");
const consentEl = document.querySelector("#consent");

const state = {
  firebase: { ready: false, app: null, ai: null },
  deviceCharLimit: DEFAULT_DEVICE_CHAR_LIMIT,
  deviceModelReady: false,
  deviceInitStarted: false,
  models: {},
  lastBrief: null,
};

function modelFor(routeMode) {
  if (!state.models[routeMode]) {
    state.models[routeMode] = createBriefModel(state.firebase.ai, routeMode);
  }
  return state.models[routeMode];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setBadge(modeState, label) {
  badgeEl.dataset.state = modeState;
  badgeEl.textContent = `Mode: ${label}`;
}

function updateCount() {
  countEl.textContent = `${notesEl.value.length} characters`;
}

function renderBrief(brief, meta) {
  const items = (title, arr) =>
    `<h3>${title}</h3><ul>${(arr.length ? arr : ["—"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  outputEl.innerHTML = `
    <div class="brief">
      <p class="route">${escapeHtml(meta.summary)}</p>
      <h3>Headline</h3>
      <p>${escapeHtml(brief.headline)}</p>
      <h3>Identifier line</h3>
      <p>${escapeHtml(brief.ident || "—")}</p>
      ${items("Active issues", brief.issues)}
      ${items("Pending tasks", brief.pending)}
      ${items("Watch-outs", brief.watch)}
      <h3>Caution</h3>
      <p>${escapeHtml(brief.caution)}</p>
    </div>
  `;
  copyEl.disabled = false;
  state.lastBrief = { brief, meta };
}

function briefAsText(brief) {
  const list = (title, arr) => `${title}:\n${(arr.length ? arr : ["—"]).map((item) => `- ${item}`).join("\n")}`;
  return [
    brief.headline,
    `Identifier: ${brief.ident || "—"}`,
    list("Active issues", brief.issues),
    list("Pending tasks", brief.pending),
    list("Watch-outs", brief.watch),
    `Caution: ${brief.caution}`,
  ].join("\n\n");
}

function renderHistory() {
  const items = loadHistory();
  if (!items.length) {
    historyEl.innerHTML = "<li class='empty'>No briefs stored in this browser yet.</li>";
    return;
  }
  historyEl.innerHTML = items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.headline)}</strong> · ${escapeHtml(item.when)} · ${escapeHtml(item.source)}</li>`
    )
    .join("");
}

function showProgress(fraction, label) {
  progressEl.hidden = false;
  const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  progressBarEl.style.width = `${pct}%`;
  progressLabelEl.textContent = label || `On-device model download: ${pct}%`;
}

function hideProgress() {
  progressEl.hidden = true;
}

function describeChrome() {
  const chrome = detectChromeDesktop();
  const prompt = hasPromptApiHint();
  if (chrome.supported) {
    chromeStatusEl.textContent = `Chrome desktop ${chrome.version} detected. On-device inference needs Chrome 139+ and the Prompt API flag chrome://flags/#prompt-api-for-gemini-nano-multimodal-input enabled. Prompt API hint: ${prompt ? "present" : "not detected yet"}.`;
  } else {
    chromeStatusEl.textContent = `This browser does not look like Chrome desktop 139+. On-device inference will not run here; the app will use the cloud path if Firebase is configured. Official requirement: Chrome on desktop, version 139 or higher.`;
  }
}

async function boot() {
  const consentAccepted = localStorage.getItem("shiftbrief.consent") === "yes";
  if (!consentAccepted && typeof consentEl.showModal === "function") {
    consentEl.showModal();
  }

  describeChrome();
  const { ready } = readFirebaseConfig();
  if (!ready) {
    configStatusEl.textContent =
      "Firebase is not configured on this machine. Copy .env.example to .env.local, add your personal Firebase web-app keys, and restart the dev server. A labelled local preview can still demonstrate the UI, but a contest build must call Firebase AI Logic.";
    configStatusEl.dataset.state = "missing";
    return;
  }

  try {
    state.firebase = initFirebase();
    if (!state.firebase.ready) {
      throw new Error("Firebase initialisation returned not ready.");
    }
    const settings = await loadRemoteSettings(state.firebase.app);
    state.deviceCharLimit = settings.deviceCharLimit || DEFAULT_DEVICE_CHAR_LIMIT;
    const appCheckNote = state.firebase.appCheck
      ? isLocalHost()
        ? "App Check initialised (localhost debug token)."
        : "App Check initialised."
      : "App Check skipped (no reCAPTCHA site key; optional when enforcement is off).";
    configStatusEl.textContent = `Firebase AI Logic initialised. ${appCheckNote} Remote Config ${settings.source === "remote-config" ? "loaded" : "using defaults"} (on-device character threshold: ${state.deviceCharLimit}). Host: ${isLocalHost() ? "localhost" : "hosted"}.`;
    configStatusEl.dataset.state = "ok";
  } catch (error) {
    configStatusEl.textContent = `Firebase initialisation failed: ${error.message}`;
    configStatusEl.dataset.state = "error";
  }
}

async function runBrief() {
  const route = chooseRoute(notesEl.value, {
    forceCloud: forceEl.checked,
    deviceCharLimit: state.deviceCharLimit,
  });
  if (!route.ok) {
    setBadge("idle", "idle");
    hintEl.textContent = "Add a fictitious note first.";
    return;
  }

  setBadge(route.target === "cloud" ? "cloud" : "device", route.target);
  hintEl.textContent = route.reason;
  outputEl.innerHTML = "<p class='empty'>Structuring the brief…</p>";
  copyEl.disabled = true;

  if (!state.firebase.ready || !state.firebase.ai) {
    const brief = previewBrief(notesEl.value.trim());
    setBadge("preview", "local preview");
    renderBrief(brief, {
      summary: `Local preview only — Firebase AI Logic is not configured, so this is a rule-based sketch, not a live model. Intended route after configuration: ${route.mode}. ${route.reason}`,
    });
    return;
  }

  try {
    const model = modelFor(route.mode);

    if (!state.deviceInitStarted) {
      state.deviceInitStarted = true;
      modelStatusEl.textContent = "Starting on-device model initialisation (required after a user click)…";
      showProgress(0.02, "Starting on-device model initialisation…");
      const initPromise = startDeviceModel(model, (value) => {
        showProgress(value, `On-device model download: ${Math.round(value * 10000) / 100}%`);
      });
      if (route.target === "device") {
        try {
          await initPromise;
          state.deviceModelReady = true;
          modelStatusEl.textContent = "On-device model initialisation finished. The next short note can stay on-device if Chrome and the Prompt API are ready.";
        } catch (error) {
          modelStatusEl.textContent = `On-device initialisation issue: ${error.message}. The SDK can still fall back to the cloud in PREFER_ON_DEVICE mode.`;
        }
      } else {
        initPromise
          .then(() => {
            state.deviceModelReady = true;
            modelStatusEl.textContent = "On-device model initialisation finished in the background.";
          })
          .catch((error) => {
            modelStatusEl.textContent = `On-device initialisation issue: ${error.message}`;
          });
      }
      hideProgress();
    }

    const { brief, inferenceSource } = await generateBrief(model, notesEl.value.trim());
    const sourceLabel = inferenceSource === "ON_DEVICE" ? "on-device" : inferenceSource === "IN_CLOUD" ? "cloud" : String(inferenceSource);
    setBadge(inferenceSource === "ON_DEVICE" ? "device" : inferenceSource === "IN_CLOUD" ? "cloud" : "idle", sourceLabel);
    const summary = `Live Firebase AI Logic call. Requested mode: ${route.mode}. SDK inferenceSource: ${inferenceSource}. ${route.reason}`;
    renderBrief(brief, { summary });
    saveHistoryEntry({
      headline: brief.headline,
      when: new Date().toLocaleString("en-IN", { timeZone: "Asia/Calcutta" }),
      source: sourceLabel,
    });
    renderHistory();
  } catch (error) {
    outputEl.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
    setBadge("idle", "error");
  }
}

document.querySelector("#load-short").addEventListener("click", () => {
  notesEl.value = SHORT_SAMPLE;
  updateCount();
});
document.querySelector("#load-long").addEventListener("click", () => {
  notesEl.value = LONG_SAMPLE;
  updateCount();
});
document.querySelector("#clear-notes").addEventListener("click", () => {
  notesEl.value = "";
  updateCount();
});
document.querySelector("#accept-consent").addEventListener("click", () => {
  localStorage.setItem("shiftbrief.consent", "yes");
});
copyEl.addEventListener("click", async () => {
  if (!state.lastBrief) return;
  await navigator.clipboard.writeText(briefAsText(state.lastBrief.brief));
  copyEl.textContent = "Copied";
  setTimeout(() => {
    copyEl.textContent = "Copy";
  }, 1200);
});
document.querySelector("#clear-history").addEventListener("click", () => {
  clearHistory();
  renderHistory();
});
notesEl.addEventListener("input", updateCount);
runEl.addEventListener("click", runBrief);

updateCount();
renderHistory();
boot();
