import { getGenerativeModel, InferenceMode, Schema } from "firebase/ai";
import { BRIEF_PROMPT, parseBrief } from "./schema.js";

const CLOUD_MODEL = "gemini-3.5-flash-lite";

const MODE = {
  PREFER_ON_DEVICE: InferenceMode.PREFER_ON_DEVICE,
  PREFER_IN_CLOUD: InferenceMode.PREFER_IN_CLOUD,
  ONLY_IN_CLOUD: InferenceMode.ONLY_IN_CLOUD,
  ONLY_ON_DEVICE: InferenceMode.ONLY_ON_DEVICE,
};

function briefSchema() {
  return Schema.object({
    properties: {
      headline: Schema.string(),
      ident: Schema.string(),
      issues: Schema.array({ items: Schema.string() }),
      pending: Schema.array({ items: Schema.string() }),
      watch: Schema.array({ items: Schema.string() }),
      caution: Schema.string(),
    },
  });
}

function generationConfig() {
  return {
    temperature: 0.2,
    responseMimeType: "application/json",
    responseSchema: briefSchema(),
  };
}

/**
 * Create a hybrid model for the chosen route.
 * Firebase AI Logic is imported and actually called here — required by the contest.
 */
export function createBriefModel(ai, routeMode) {
  const inferenceMode = MODE[routeMode] || InferenceMode.PREFER_ON_DEVICE;
  return getGenerativeModel(ai, {
    mode: inferenceMode,
    inCloudParams: {
      model: CLOUD_MODEL,
      generationConfig: generationConfig(),
    },
    onDeviceParams: {
      createOptions: {
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          {
            role: "system",
            content: [{ type: "text", value: BRIEF_PROMPT }],
          },
        ],
      },
    },
  });
}

/**
 * Must be called after a user gesture and before generateContent.
 * Returns a promise that may take several minutes if the on-device model is downloading.
 * For PREFER_* modes, generateContent will not wait and may fall back to cloud if we don't await.
 * We await when the intended target is on-device, and still start the download otherwise.
 */
export function startDeviceModel(model, onProgress) {
  return model.initializeDeviceModel((value) => {
    if (typeof onProgress === "function") onProgress(value);
  });
}

export async function generateBrief(model, notes) {
  const prompt = `${BRIEF_PROMPT}\n\nNotes:\n${notes}`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const brief = parseBrief(text);
  const inferenceSource = response.inferenceSource || "UNKNOWN";
  return { brief, inferenceSource, rawText: text };
}
