import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, GoogleAIBackend } from "firebase/ai";

export function readFirebaseConfig() {
  const env = import.meta.env;
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const recaptchaSiteKey = env.VITE_RECAPTCHA_V3_SITE_KEY;
  const ready = Boolean(config.apiKey && config.projectId && config.appId);
  return { config, recaptchaSiteKey, ready };
}

export function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * Initialise Firebase App, App Check, and the Gemini Developer API backend.
 * App Check is required by Firebase AI Logic. Debug tokens are allowed on
 * localhost only and must never be committed. Hosted builds need a reCAPTCHA v3 site key.
 */
export function initFirebase() {
  const { config, recaptchaSiteKey, ready } = readFirebaseConfig();
  if (!ready) {
    return { ready: false, app: null, ai: null, reason: "missing-config" };
  }

  const app = initializeApp(config);

  if (isLocalHost()) {
    const debug = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
    // Official pattern: set the debug flag before initializeAppCheck.
    // "true" prints a token in the console to safelist in the Firebase console.
    // A UUID may be supplied instead once that token has been registered.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debug && debug !== "false" ? (debug === "true" ? true : debug) : true;
  }

  if (recaptchaSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } else if (!isLocalHost()) {
    console.warn(
      "ShiftBrief: VITE_RECAPTCHA_V3_SITE_KEY is missing. Hosted App Check will likely fail. Add a reCAPTCHA v3 site key and enforce App Check for Firebase AI Logic."
    );
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return { ready: true, app, ai, reason: "ok" };
}
