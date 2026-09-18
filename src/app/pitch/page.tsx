"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./pitch.module.css";

const journey = [
  ["1", "Ask", "A learner begins with a topic they genuinely care about."],
  ["2", "Shape", "ResearchBridge turns the topic into a focused and testable question."],
  ["3", "Investigate", "The learner receives a practical method and evidence checklist."],
  ["4", "Reflect", "Limitations and uncertainty remain visible throughout the inquiry."],
];

export default function PitchPage() {
  return (
    <main className={styles.deck}>
      <div className={styles.controls}>
        <Link href="/">Open live demo</Link>
        <button type="button" onClick={() => window.print()}>Print or save as PDF</button>
      </div>

      <section className={`${styles.slide} ${styles.cover}`}>
        <div>
          <div className={styles.kicker}>RISE Research Youth Innovation Challenge</div>
          <h1>ResearchBridge</h1>
          <p className={styles.heroLine}>From curiosity to credible inquiry</p>
          <p className={styles.intro}>A responsible AI research coach that helps young learners ask stronger questions, understand evidence, and communicate what they discover.</p>
          <div className={styles.author}>Created by Damilola Oladapo</div>
        </div>
        <div className={styles.coverImage}>
          <Image src="/students/scholar_1.png" alt="A student examining plant growth data" fill priority sizes="45vw" />
        </div>
      </section>

      <section className={styles.slide}>
        <div className={styles.number}>01</div>
        <div className={styles.kicker}>The problem</div>
        <h2>Curiosity is everywhere. Research confidence is not.</h2>
        <div className={styles.threeColumns}>
          <article><strong>Questions feel too broad</strong><p>Many learners have meaningful ideas but do not know how to turn them into research questions.</p></article>
          <article><strong>Methods feel intimidating</strong><p>Academic language and unfamiliar processes make research feel reserved for experts.</p></article>
          <article><strong>AI can hide uncertainty</strong><p>Answer engines may sound confident while skipping evidence, ethics, and limitations.</p></article>
        </div>
        <blockquote>Students do not need another answer generator. They need a patient guide for the inquiry process.</blockquote>
      </section>

      <section className={`${styles.slide} ${styles.solution}`}>
        <div className={styles.number}>02</div>
        <div className={styles.kicker}>The solution</div>
        <h2>A research coach that keeps the learner in control.</h2>
        <div className={styles.journey}>
          {journey.map(([number, title, description]) => (
            <article key={number}><span>{number}</span><strong>{title}</strong><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.slide}>
        <div className={styles.number}>03</div>
        <div className={styles.kicker}>The experience</div>
        <h2>One clear canvas for a complete research starting point.</h2>
        <div className={styles.featureGrid}>
          <div className={styles.mockPanel}>
            <div className={styles.mockLabel}>Your research canvas</div>
            <h3>How does screen time affect sleep among secondary school students?</h3>
            <div><b>Working hypothesis</b><p>Students with more evening screen time may report shorter sleep duration.</p></div>
            <div><b>Method</b><p>Define variables, collect consent, gather observations, and compare patterns.</p></div>
            <div><b>Limitations</b><p>Self reported behavior may be incomplete and cannot establish causation.</p></div>
          </div>
          <div className={styles.featureList}>
            <article><strong>Questions with direction</strong><p>Ideas become ethical and feasible investigations.</p></article>
            <article><strong>Data with context</strong><p>Learners can preview a public CSV without surrendering control of interpretation.</p></article>
            <article><strong>Audio access</strong><p>ElevenLabs reads the plan aloud for learners who benefit from listening.</p></article>
            <article><strong>Portable results</strong><p>The research canvas can be printed and reviewed with a teacher or mentor.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.slide} ${styles.responsible}`}>
        <div className={styles.number}>04</div>
        <div className={styles.kicker}>Responsible AI</div>
        <h2>Designed to strengthen judgment, not replace it.</h2>
        <div className={styles.responsibleGrid}>
          <article><span>01</span><strong>No invented citations</strong><p>The product does not pretend that generated claims are verified sources.</p></article>
          <article><span>02</span><strong>Uncertainty stays visible</strong><p>Every canvas includes limitations and a clear verification reminder.</p></article>
          <article><span>03</span><strong>Privacy comes first</strong><p>Learners are warned not to upload personal, medical, or confidential data.</p></article>
          <article><span>04</span><strong>Human review matters</strong><p>Students are encouraged to discuss plans with a teacher or mentor.</p></article>
        </div>
      </section>

      <section className={styles.slide}>
        <div className={styles.number}>05</div>
        <div className={styles.kicker}>Technical execution</div>
        <h2>Production ready foundations with flexible AI access.</h2>
        <div className={styles.architecture}>
          <div className={styles.archBox}><b>Student</b><span>Question and optional public data</span></div>
          <div className={styles.arrow}>→</div>
          <div className={styles.archBox}><b>ResearchBridge</b><span>Next.js application with protected server routes</span></div>
          <div className={styles.arrow}>→</div>
          <div className={styles.providerStack}><div>OpenAI reasoning</div><div>Featherless model choice</div><div>ElevenLabs voice</div></div>
        </div>
        <div className={styles.techNotes}><span>Private server credentials</span><span>Request protection</span><span>Provider fallback</span><span>Accessible interface</span></div>
      </section>

      <section className={styles.slide}>
        <div className={styles.number}>06</div>
        <div className={styles.kicker}>Challenge impact</div>
        <h2>Research becomes something a learner can begin today.</h2>
        <div className={styles.impactGrid}>
          <div><strong>Lower barrier</strong><p>Plain language turns an unfamiliar academic process into manageable actions.</p></div>
          <div><strong>Better understanding</strong><p>Evidence, hypotheses, and limitations are separated clearly.</p></div>
          <div><strong>Broader access</strong><p>Audio guidance and flexible learning levels support different needs.</p></div>
          <div><strong>Responsible practice</strong><p>Ethics and verification are part of the workflow from the beginning.</p></div>
        </div>
        <p className={styles.alignment}>This directly supports the RISE mission by helping high school students and early career learners run real inquiries and understand academic thinking.</p>
      </section>

      <section className={`${styles.slide} ${styles.finalSlide}`}>
        <div className={styles.kicker}>The next generation of researchers already has questions</div>
        <h2>ResearchBridge helps them begin.</h2>
        <p>Start with curiosity. Leave with a credible plan.</p>
        <Link href="/">Try the live experience</Link>
      </section>
    </main>
  );
}
