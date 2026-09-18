import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const SYSTEM = `You are ResearchBridge, a careful research coach for high school and early career learners. Return valid JSON only with keys: researchQuestion (string), hypothesis (string), method (array of three to five short strings), evidence (array of two to four strings), limitations (array of two to four strings), plainLanguageSummary (string). Never invent sources or claim certainty. Make the project ethical, feasible within two weeks, and suitable for a student. If dataset context is supplied, use only the visible columns and sample. Explicitly state that the full dataset was not independently verified. Use natural sentences without hyphens or dash punctuation.`;

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
    let raw = "";
    let used = "";

    if (provider !== "featherless" && process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5-mini", instructions: SYSTEM, input: prompt, store: false }),
      });
      if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
      raw = extractOpenAIText(await response.json());
      used = "OpenAI";
    } else if (process.env.FEATHERLESS_API_KEY) {
      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}` },
        body: JSON.stringify({ model: process.env.FEATHERLESS_MODEL || "Qwen/Qwen3-8B", messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }], temperature: 0.3 }),
      });
      if (!response.ok) throw new Error(`Featherless request failed (${response.status})`);
      const data = await response.json();
      raw = data.choices?.[0]?.message?.content ?? "";
      used = "Featherless.ai";
    } else {
      return NextResponse.json({ error: "No AI provider is configured. Add an API key to .env.local." }, { status: 503 });
    }

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const plan = removeDashes(JSON.parse(cleaned)) as Record<string, unknown>;
    return NextResponse.json({ ...plan, provider: used });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the research plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
