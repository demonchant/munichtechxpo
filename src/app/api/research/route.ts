import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const SYSTEM = `You are ResearchBridge, a careful research coach for high school and early career learners. Return valid JSON only with keys: researchQuestion (string), hypothesis (string), method (array of three to five short strings), evidence (array of two to four strings), limitations (array of two to four strings), plainLanguageSummary (string). Never invent sources or claim certainty. Make the project ethical, feasible within two weeks, and suitable for a student. If dataset context is supplied, use only the visible columns and sample. Explicitly state that the full dataset was not independently verified. Use natural sentences without hyphens or dash punctuation.`;
const STABLE_FEATHERLESS_MODEL = "Qwen/Qwen2.5-7B-Instruct";

function extractOpenAIText(data: Record<string, unknown>) {
  if (typeof data.output_text === "string") return data.output_text;
  const output = data.output as Array<{ content?: Array<{ text?: string }> }> | undefined;
  return output?.flatMap((item) => item.content ?? []).map((part) => part.text ?? "").join("") ?? "";
}

function removeDashes(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/[–—]/g, ", ")
      .replace(/\s*--\s*/g, ", ")
      .replace(/([A-Za-z])-([A-Za-z])/g, "$1 $2");
  }
  if (Array.isArray(value)) return value.map(removeDashes);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, removeDashes(item)]));
  }
  return value;
}

function parsePlan(raw: string) {
  const withoutFences = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI provider returned an incomplete research plan.");
  const plan = JSON.parse(withoutFences.slice(start, end + 1)) as Record<string, unknown>;
  const required = ["researchQuestion", "hypothesis", "method", "evidence", "limitations", "plainLanguageSummary"];
  if (required.some((key) => !(key in plan))) throw new Error("The AI provider returned an incomplete research plan.");
  return plan;
}

async function requestFeatherless(prompt: string) {
  const configuredModel = process.env.FEATHERLESS_MODEL || STABLE_FEATHERLESS_MODEL;
  const models = [...new Set([STABLE_FEATHERLESS_MODEL, configuredModel])];
  let lastError = "Featherless could not create a complete research plan.";

  for (const model of models) {
    try {
      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1400,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Featherless request failed (${response.status})`);
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new Error(data.error?.message || "Featherless returned an empty response.");
      return parsePlan(content);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  throw new Error(lastError);
}

export async function POST(request: Request) {
  const rate = checkRateLimit(request, "research", 8, 10 * 60 * 1000);
  if (!rate.allowed) return rateLimitResponse(rate.resetAt);

  try {
    const body = await request.json();
    const topic = String(body.topic ?? "").trim().slice(0, 1200);
    const level = String(body.level ?? "High school").slice(0, 80);
    const dataset = String(body.dataset ?? "").slice(0, 6000);
    const provider = String(body.provider ?? "auto");
    if (topic.length < 8) return NextResponse.json({ error: "Please describe your research idea in a little more detail." }, { status: 400 });

    const prompt = `Learner level: ${level}\nResearch interest: ${topic}\nDataset preview: ${dataset || "No dataset supplied."}`;
    let plan: Record<string, unknown>;
    let used = "";

    if (provider !== "featherless" && process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5-mini", instructions: SYSTEM, input: prompt, store: false }),
      });
      if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
      plan = parsePlan(extractOpenAIText(await response.json()));
      used = "OpenAI";
    } else if (process.env.FEATHERLESS_API_KEY) {
      plan = await requestFeatherless(prompt);
      used = "Featherless.ai";
    } else {
      return NextResponse.json({ error: "No AI provider is configured. Add an API key to .env.local." }, { status: 503 });
    }

    const cleanPlan = removeDashes(plan) as Record<string, unknown>;
    return NextResponse.json({ ...cleanPlan, provider: used });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the research plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
