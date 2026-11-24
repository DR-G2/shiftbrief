/** Client-side routing used to choose a Firebase AI Logic InferenceMode. */
export const DEFAULT_DEVICE_CHAR_LIMIT = 700;

export function chooseRoute(text, { forceCloud = false, deviceCharLimit = DEFAULT_DEVICE_CHAR_LIMIT } = {}) {
  const notes = (text || "").trim();
  if (!notes) return { ok: false, reason: "empty" };

  if (forceCloud) {
    return {
      ok: true,
      target: "cloud",
      mode: "ONLY_IN_CLOUD",
      reason: "You asked for a deeper cloud pass.",
    };
  }

  if (notes.length > deviceCharLimit) {
    return {
      ok: true,
      target: "cloud",
      mode: "PREFER_IN_CLOUD",
      reason: `Note is ${notes.length} characters, above the ${deviceCharLimit}-character on-device threshold, so the app prefers a cloud model (falling back on-device if the cloud path is unavailable).`,
    };
  }

  return {
    ok: true,
    target: "device",
    mode: "PREFER_ON_DEVICE",
    reason: `Note is ${notes.length} characters, so the app prefers an on-device model when one is available, and falls back to the cloud if it is not.`,
  };
}
