/**
 * Deterministic local preview used ONLY when Firebase is not configured yet.
 * This is not a model, and the UI must label it as a preview.
 */
function linesOf(text) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\-\*\d\.\s]+/, "").trim())
    .filter(Boolean);
}

export function previewBrief(notes) {
  const lines = linesOf(notes);
  const pending = lines.filter((line) => /pend|outstanding|request|await|today|repeat|review/i.test(line));
  const watch = lines.filter((line) => /watch|risk|if |avoid|falling|rising|worsen|hypo|retention|confusion|oxygen/i.test(line));
  const issues = lines.filter((line) => !pending.includes(line) && !watch.includes(line)).slice(0, 6);

  return {
    headline: issues[0] || "Fictitious handover note",
    ident: lines[0] || "No identifier line found",
    issues: issues.length ? issues : ["No separate active issues parsed in this preview."],
    pending: pending.length ? pending : ["No explicit pending tasks parsed in this preview."],
    watch: watch.length ? watch : ["No explicit watch-outs parsed in this preview."],
    caution: "Local preview only. This is a rule-based sketch, not a model summary, and not clinical advice.",
  };
}
