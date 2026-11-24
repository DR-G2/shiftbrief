/** Brief JSON shape expected from the model (and used to parse responses). */
export const BRIEF_FIELD_ORDER = ["headline", "ident", "issues", "pending", "watch", "caution"];

export const BRIEF_PROMPT = `You are helping a clinician turn unofficial, already de-identified handover notes into a structured brief.
Return JSON only, with exactly these keys:
- headline: one short line naming the situation
- ident: the identifier or setting line from the notes (ward, bay, or role). If none, say so.
- issues: an array of current active clinical issues
- pending: an array of outstanding tasks, results, or reviews
- watch: an array of things the incoming clinician should watch for
- caution: one short reminder that this is a writing aid, not a clinical decision, and that the notes must not contain real identifiers

Rules:
- Use only information present in the notes. Do not invent results, drugs, or plans.
- Keep items short and specific.
- If a section has nothing to extract, use a single array item that says so.
- The notes are fictitious practice text. Do not treat them as a real patient record.`;

export function emptyBrief(message) {
  return {
    headline: "No brief yet",
    ident: "",
    issues: [],
    pending: [],
    watch: [],
    caution: message || "This is a writing aid only.",
  };
}

export function parseBrief(raw) {
  const text = String(raw || "").trim();
  const jsonText = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const data = JSON.parse(jsonText);
  const asList = (value) => {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (value == null || value === "") return [];
    return [String(value).trim()];
  };
  return {
    headline: String(data.headline || "").trim() || "Structured brief",
    ident: String(data.ident || "").trim(),
    issues: asList(data.issues),
    pending: asList(data.pending),
    watch: asList(data.watch),
    caution: String(data.caution || "Writing aid only. The clinician remains responsible.").trim(),
  };
}
