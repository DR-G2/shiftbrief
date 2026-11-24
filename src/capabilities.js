/** Chrome desktop + Prompt API capability hints for on-device inference. */
export function detectChromeDesktop() {
  const ua = navigator.userAgent || "";
  const isChromeFamily = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua) && !/SamsungBrowser/.test(ua);
  const match = ua.match(/Chrome\/(\d+)/);
  const version = match ? Number(match[1]) : 0;
  const isDesktop = !/Mobile|Android|iPhone|iPad/.test(ua);
  return {
    isChromeFamily,
    isDesktop,
    version,
    supported: isChromeFamily && isDesktop && version >= 139,
  };
}

export function hasPromptApiHint() {
  return "LanguageModel" in window || "ai" in window;
}
