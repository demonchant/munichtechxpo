"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Plan = {
  researchQuestion: string;
  hypothesis: string;
  method: string[];
  evidence: string[];
  limitations: string[];
  plainLanguageSummary: string;
  provider: string;
};

const studentStories = [
  { image: "/students/scholar_1.png", alt: "A student studying plant growth data in a science classroom", caption: "Study the world around you" },
  { image: "/students/scholar_2.png", alt: "A student exploring environmental sensor data with a tablet", caption: "Turn observations into evidence" },
  { image: "/students/scholar_3.png", alt: "A student organizing climate research with a laptop and notes", caption: "Make complex ideas clear" },
  { image: "/students/scholar_4.png", alt: "A student learning about astronomy with books and a tablet", caption: "Follow your curiosity" },
  { image: "/students/scholar_5.png", alt: "A student using a microscope during a biology investigation", caption: "Build confidence through inquiry" },
];

export default function Home() {
  const [topic, setTopic] = useState("How does daily screen time affect sleep duration among secondary school students?");
  const [level, setLevel] = useState("High school");
  const [dataset, setDataset] = useState("");
  const [provider, setProvider] = useState("auto");
  const [fileName, setFileName] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % studentStories.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setDataset(text.split(/\r?\n/).slice(0, 12).join("\n"));
  }

  async function generate() {
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, dataset, provider }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate a plan.");
      setPlan(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function listen() {
    if (!plan) return;
    setSpeaking(true);
    setError("");
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${plan.researchQuestion}. ${plan.plainLanguageSummary}` }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Audio is unavailable.");
      }
      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      await audio.play();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Audio is unavailable.");
      setSpeaking(false);
    }
  }

  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">Research<span>Bridge</span></div>
        <div className="pill">Responsible AI for every student</div>
      </nav>
      <section className="hero">
        <div>
          <div className="eyebrow">From curiosity to credible inquiry</div>
          <h1>Research should begin with wonder, not worry.</h1>
          <p className="lead">A guided AI research coach that helps young learners shape better questions, understand data, and communicate evidence while keeping uncertainty visible.</p>
          <div className="trust"><span>Clear explanations</span><span>No invented citations</span><span>Limitations made visible</span></div>
          <div className="studentShowcase" aria-label="Young researchers from different communities">
            <div className="studentViewport">
              <div className="studentTrack" style={{ transform: `translateX(${-slide * 100}%)` }}>
                {studentStories.map((story) => (
                  <figure className="studentStory" key={story.image}>
                    <Image src={story.image} alt={story.alt} fill sizes="(max-width: 850px) 100vw, 50vw" priority={story.image === studentStories[0].image} />
                    <figcaption>{story.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="studentControls" aria-label="Choose a student story">
              {studentStories.map((story, index) => (
                <button key={story.image} type="button" className={index === slide ? "current" : ""} onClick={() => setSlide(index)} aria-label={`Show image ${index + 1}`} aria-current={index === slide ? "true" : undefined} />
              ))}
            </div>
          </div>
        </div>
        <div className="workspace">
          <div className="stepbar"><i className="active"/><i className={plan ? "active" : ""}/><i/></div>
          {!plan ? <>
            <h2>Shape your inquiry</h2>
            <div className="hint">Tell us what you are curious about. We will turn it into a feasible, testable research plan.</div>
            <label htmlFor="topic">What would you like to investigate?</label>
            <textarea id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} />
            <div className="row">
              <div><label htmlFor="level">Learning level</label><select id="level" value={level} onChange={(event) => setLevel(event.target.value)}><option>High school</option><option>Early university</option><option>Independent learner</option></select></div>
              <div><label htmlFor="provider">AI provider</label><select id="provider" value={provider} onChange={(event) => setProvider(event.target.value)}><option value="auto">Automatic</option><option value="openai">OpenAI</option><option value="featherless">Featherless.ai</option></select></div>
            </div>
            <label htmlFor="csv">Optional public or open CSV dataset</label>
            <div className="upload"><input id="csv" type="file" accept=".csv,text/csv" onChange={(event) => upload(event.target.files?.[0])}/>{fileName && <div>{fileName} is ready to preview</div>}</div>
            {error && <div className="error">{error}</div>}
            <div className="actions"><button className="primary" disabled={loading} onClick={generate}>{loading ? "Building your plan..." : "Build my research plan"}</button></div>
          </> : <div className="result">
            <div className="resultHead"><div><div className="eyebrow">Your research canvas</div><div className="question">{plan.researchQuestion}</div></div><span className="tag">{plan.provider}</span></div>
            <div className="section"><h3>Working hypothesis</h3><p>{plan.hypothesis}</p></div>
            <div className="section"><h3>Method</h3><ul>{plan.method.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
            <div className="section"><h3>Evidence to collect</h3><ul>{plan.evidence.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
            <div className="section"><h3>What could limit this study?</h3><ul>{plan.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
            <div className="section"><h3>In plain language</h3><p>{plan.plainLanguageSummary}</p></div>
            <div className="notice"><b>Pause and verify.</b> This guidance comes from AI and is not established evidence. Check claims, protect participant privacy, and review your plan with a teacher or mentor.</div>
            {error && <div className="error">{error}</div>}
            <div className="actions"><button className="secondary" onClick={() => setPlan(null)}>Revise</button><button className="secondary" disabled={speaking} onClick={listen}>{speaking ? "Playing..." : "Listen"}</button><button className="primary" onClick={() => window.print()}>Export canvas</button></div>
          </div>}
        </div>
      </section>
      <section className="values">
        <div className="value"><b>Question, not answer</b><p>ResearchBridge coaches the inquiry process instead of writing a finished paper for the learner.</p></div>
        <div className="value"><b>Evidence stays visible</b><p>Every plan separates hypotheses, observations, and limitations to build research literacy.</p></div>
        <div className="value"><b>Designed for access</b><p>Plain language and an audio workflow make research approachable to more students.</p></div>
      </section>
    </main>
  );
}
