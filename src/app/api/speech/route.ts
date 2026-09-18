import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
      return NextResponse.json({ error: "ElevenLabs narration is not configured yet." }, { status: 503 });
    }
    const body = await request.json();
    const text = String(body.text ?? "").trim().slice(0, 2500);
    if (!text) return NextResponse.json({ error: "There is no explanation to narrate." }, { status: 400 });
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/mpeg", "xi-api-key": process.env.ELEVENLABS_API_KEY },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.55, similarity_boost: 0.7 } }),
    });
    if (!response.ok) throw new Error(`ElevenLabs request failed (${response.status})`);
    return new Response(await response.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create narration." }, { status: 500 });
  }
}
