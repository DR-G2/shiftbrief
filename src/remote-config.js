import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";
import { DEFAULT_DEVICE_CHAR_LIMIT } from "./hybrid.js";

export const DEFAULTS = {
  device_char_limit: DEFAULT_DEVICE_CHAR_LIMIT,
};

export async function loadRemoteSettings(app) {
  if (!app) {
    return { ...DEFAULTS, source: "defaults", error: "no-app" };
  }

  const remoteConfig = getRemoteConfig(app);
  remoteConfig.settings.minimumFetchIntervalMillis = 60 * 1000;
  remoteConfig.defaultConfig = {
    device_char_limit: String(DEFAULTS.device_char_limit),
  };

  try {
    await fetchAndActivate(remoteConfig);
    const raw = getValue(remoteConfig, "device_char_limit").asString();
    const parsed = Number(raw);
    const deviceCharLimit = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS.device_char_limit;
    return { deviceCharLimit, source: "remote-config" };
  } catch (error) {
    return { deviceCharLimit: DEFAULTS.device_char_limit, source: "defaults", error: error.message };
  }
}
