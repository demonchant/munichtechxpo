"use client";

import { useState } from "react";

type Plan = { researchQuestion: string; hypothesis: string; method: string[]; evidence: string[]; limitations: string[]; plainLanguageSummary: string; provider: string };

export default function Home() {
  const [topic, setTopic] = useState("How does daily screen time affect sleep duration among secondary-school students?");
  const [level, setLevel] = useState("High school");
  const [dataset, setDataset] = useState("");
  const [provider, setProvider] = useState("auto");
  const [fileName, setFileName] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setDataset(text.split(/\r?\n/).slice(0, 12).join("\n"));
  }

  async function generate() {
    setLoading(true); setError(""); setPlan(null);
    try {
      const response = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, level, dataset, provider }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate a plan.");
      setPlan(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  async function listen() {
    if (!plan) return;
    setSpeaking(true); setError("");
    try {
      const response = await fetch("/api/speech", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `${plan.researchQuestion}. ${plan.plainLanguageSummary}` }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Audio is unavailable."); }
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); setSpeaking(false); };
      await audio.play();
    } catch (e) { setError(e instanceof Error ? e.message : "Audio is unavailable."); setSpeaking(false); }
  }

  return (
    <main className="shell">
      <nav className="nav"><div className="brand">Research<span>Bridge</span></div><div className="pill">Responsible AI · Student first</div></nav>
      <section className="hero">
        <div>
          <div className="eyebrow">From curiosity to credible inquiry</div>
          <h1>Research should begin with wonder, not worry.</h1>
          <p className="lead">A guided AI research coach that helps young learners shape better questions, understand data, and communicate evidence -- without hiding uncertainty.</p>
          <div className="trust"><span>✓ Age-aware explanations</span><span>✓ No invented citations</span><span>✓ Limitations made visible</span></div>
        </div>
        <div className="workspace">
          <div className="stepbar"><i className="active"/><i className={plan ? "active" : ""}/><i/></div>
          {!plan ? <>
            <h2>Shape your inquiry</h2><div className="hint">Tell us what you are curious about. We’ll turn it into a feasible, testable research plan.</div>
            <label htmlFor="topic">What would you like to investigate?</label>
            <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <div className="row"><div><label htmlFor="level">Learning level</label><select id="level" value={level} onChange={(e) => setLevel(e.target.value)}><option>High school</option><option>Early university</option><option>Independent learner</option></select></div><div><label htmlFor="provider">AI provider</label><select id="provider" value={provider} onChange={(e) => setProvider(e.target.value)}><option value="auto">Automatic</option><option value="openai">OpenAI</option><option value="featherless">Featherless.ai</option></select></div></div>
            <label htmlFor="csv">Optional public or open CSV dataset</label><div className="upload"><input id="csv" type="file" accept=".csv,text/csv" onChange={(e) => upload(e.target.files?.[0])}/>{fileName && <div>{fileName} - preview ready</div>}</div>
            {error && <div className="error">{error}</div>}
            <div className="actions"><button className="primary" disabled={loading} onClick={generate}>{loading ? "Building your plan…" : "Build my research plan →"}</button></div>
          </> : <div className="result">
            <div className="result-head"><div><div className="eyebrow">Your research canvas</div><div className="question">{plan.researchQuestion}</div></div><span className="tag">{plan.provider}</span></div>
            <div className="section"><h3>Working hypothesis</h3><p>{plan.hypothesis}</p></div>
            <div className="section"><h3>Method</h3><ul>{plan.method.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="section"><h3>Evidence to collect</h3><ul>{plan.evidence.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="section"><h3>What could limit this study?</h3><ul>{plan.limitations.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            <div className="section"><h3>In plain language</h3><p>{plan.plainLanguageSummary}</p></div>
            <div className="notice"><b>Pause and verify.</b> This is AI-generated guidance, not established evidence. Check claims, protect participant privacy, and review your plan with a teacher or mentor.</div>
            {error && <div className="error">{error}</div>}
            <div className="actions"><button className="secondary" onClick={() => setPlan(null)}>← Revise</button><button className="secondary" disabled={speaking} onClick={listen}>{speaking ? "Playing..." : "Listen"}</button><button className="primary" onClick={() => window.print()}>Export canvas</button></div>
          </div>}
        </div>
      </section>
      <section className="values"><div className="value"><b>Question, not answer</b><p>ResearchBridge coaches the inquiry process instead of writing a finished paper for the learner.</p></div><div className="value"><b>Evidence stays visible</b><p>Every plan separates hypotheses, observations, and limitations to build research literacy.</p></div><div className="value"><b>Designed for access</b><p>Plain language and an audio-ready workflow make research approachable to more students.</p></div></section>
    </main>
  );
}
