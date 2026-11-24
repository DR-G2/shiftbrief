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
  // App Check is optional. Only initialise it when a reCAPTCHA site key is set.
  const recaptchaSiteKey = (env.VITE_RECAPTCHA_SITE_KEY || env.VITE_RECAPTCHA_V3_SITE_KEY || "").trim();
  const ready = Boolean(config.apiKey && config.projectId && config.appId);
  return { config, recaptchaSiteKey, ready };
}

export function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * Initialise Firebase App and the Gemini Developer API backend.
 * App Check is optional: it is only initialised when VITE_RECAPTCHA_SITE_KEY
 * is set. Leave the key unset if App Check enforcement is off (for example
 * when a reCAPTCHA v3 classic provider is not available in the console).
 */
export function initFirebase() {
  const { config, recaptchaSiteKey, ready } = readFirebaseConfig();
  if (!ready) {
    return { ready: false, app: null, ai: null, appCheck: false, reason: "missing-config" };
  }

  const app = initializeApp(config);
  let appCheck = false;

  if (recaptchaSiteKey) {
    if (isLocalHost()) {
      const debug = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
      // Official pattern: set the debug flag before initializeAppCheck.
      // "true" prints a token in the console to safelist in the Firebase console.
      // A UUID may be supplied instead once that token has been registered.
      self.FIREBASE_APPCHECK_DEBUG_TOKEN =
        debug && debug !== "false" ? (debug === "true" ? true : debug) : true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheck = true;
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return { ready: true, app, ai, appCheck, reason: "ok" };
}
