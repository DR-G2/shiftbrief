const KEY = "shiftbrief.history.v1";
const LIMIT = 8;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry) {
  const next = [entry, ...loadHistory()].slice(0, LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  return [];
}
