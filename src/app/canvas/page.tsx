"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import styles from "./canvas.module.css";

type Plan = {
  researchQuestion: string;
  hypothesis: string;
  method: string[];
  evidence: string[];
  limitations: string[];
  plainLanguageSummary: string;
  provider: string;
};

function subscribe() {
  return () => undefined;
}

function getStoredPlan() {
  return window.sessionStorage.getItem("researchbridgePlan");
}

function readPlan(value: string | null): Plan | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Plan;
  } catch {
    return null;
  }
}

export default function CanvasPage() {
  const storedPlan = useSyncExternalStore(subscribe, getStoredPlan, () => null);
  const plan = readPlan(storedPlan);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");

  async function listen() {
    if (!plan) return;
    setAudioState("loading");
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
        setAudioState("idle");
      };
      await audio.play();
      setAudioState("playing");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Audio is unavailable.");
      setAudioState("idle");
    }
  }

  if (!plan) {
    return (
      <main className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <div className={styles.brand}>Research<span>Bridge</span></div>
          <h1>Start with a question</h1>
          <p>Your research canvas will appear here after ResearchBridge creates a plan.</p>
          <Link href="/">Start a new inquiry</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">Research<span>Bridge</span></Link>
        <div className={styles.navActions}>
          <Link href="/">New inquiry</Link>
          <button type="button" onClick={() => window.print()}>Export canvas</button>
        </div>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.kicker}>Your research canvas</div>
          <div className={styles.titleRow}>
            <h1>{plan.researchQuestion}</h1>
            <span className={styles.provider}>{plan.provider}</span>
          </div>
          <p>This canvas is a starting point for discussion, testing, and refinement with a teacher or mentor.</p>
          <div className={styles.summaryStats}>
            <div><strong>{plan.method.length}</strong><span>Method steps</span></div>
            <div><strong>{plan.evidence.length}</strong><span>Evidence goals</span></div>
            <div><strong>{plan.limitations.length}</strong><span>Limitations considered</span></div>
          </div>
        </div>
      </header>

      <div className={styles.canvasLayout}>
        <div className={styles.mainColumn}>
          <section className={`${styles.canvasCard} ${styles.hypothesisCard}`}>
            <div className={styles.sectionNumber}>01</div>
            <div><div className={styles.sectionLabel}>Working hypothesis</div><h2>{plan.hypothesis}</h2></div>
          </section>

          <section className={styles.canvasCard}>
            <div className={styles.sectionHeading}><div><span>02</span><div><div className={styles.sectionLabel}>Research method</div><h2>How to investigate the question</h2></div></div></div>
            <ol className={styles.methodList}>{plan.method.map((item, index) => <li key={index}><span>{index + 1}</span><p>{item}</p></li>)}</ol>
          </section>

          <section className={styles.twoColumnSection}>
            <div className={styles.canvasCard}>
              <div className={styles.sectionLabel}>03 Evidence to collect</div>
              <ul className={styles.checkList}>{plan.evidence.map((item, index) => <li key={index}><span>✓</span><p>{item}</p></li>)}</ul>
            </div>
            <div className={`${styles.canvasCard} ${styles.limitCard}`}>
              <div className={styles.sectionLabel}>04 Study limitations</div>
              <ul className={styles.limitList}>{plan.limitations.map((item, index) => <li key={index}><span>{index + 1}</span><p>{item}</p></li>)}</ul>
            </div>
          </section>

          <section className={`${styles.canvasCard} ${styles.summaryCard}`}>
            <div className={styles.sectionLabel}>05 In plain language</div>
            <p>{plan.plainLanguageSummary}</p>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <div className={styles.sideCard}>
            <div className={styles.sideIcon} aria-hidden="true">◉</div>
            <h2>Listen to your summary</h2>
            <p>Hear the question and explanation read aloud.</p>
            {audioState === "playing" && <div className={styles.audioPlayer} role="status" aria-live="polite">
              <div className={styles.audioWave} aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
              </div>
              <div><strong>Now playing</strong><span>Your research summary</span></div>
            </div>}
            <button type="button" disabled={audioState !== "idle"} onClick={listen}>
              {audioState === "loading" ? "Preparing your audio..." : audioState === "playing" ? "Audio is playing" : "Play audio summary"}
            </button>
            {error && <div className={styles.audioError}>{error}</div>}
          </div>

          <div className={`${styles.sideCard} ${styles.verifyCard}`}>
            <div className={styles.sectionLabel}>Pause and verify</div>
            <p>This guidance comes from AI and is not established evidence.</p>
            <ul>
              <li>Check important claims</li>
              <li>Protect participant privacy</li>
              <li>Review the plan with a teacher or mentor</li>
            </ul>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sectionLabel}>Your next move</div>
            <p>Discuss this canvas, refine the method, and decide what evidence you can collect responsibly.</p>
            <Link href="/">Explore another question</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
