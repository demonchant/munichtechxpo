# ResearchBridge

ResearchBridge is a responsible AI research coach for high-school students and early-career learners. It turns curiosity into a feasible research question, method, evidence checklist, limitations, and plain-language explanation.

Built for the **RISE Research Youth Innovation & Research Challenge** at MunichTech EXPO 2026.

## Why it matters

Many students have promising ideas but lack access to research mentorship. ResearchBridge lowers the first barrier without pretending that generated text is authoritative evidence. It labels AI output, makes uncertainty visible, avoids invented citations, and repeatedly asks learners to verify findings with a teacher or mentor.

## Features

- Age-aware research question and hypothesis coaching
- Optional CSV preview for dataset-grounded planning
- Step-by-step method and evidence checklist
- Explicit limitations and responsible-AI notice
- OpenAI primary inference with Featherless.ai fallback
- Print-friendly research canvas export
- ElevenLabs spoken summaries for accessible learning
- Server-only API keys
- Per-IP API rate protection with a Vercel WAF production layer

## Judging criteria alignment

| Criterion | Evidence in ResearchBridge |
| --- | --- |
| Educational and research impact | Guides a learner through a question, hypothesis, method, evidence, and limitations instead of generating a finished paper. |
| Originality | Combines research-method coaching, dataset-aware planning, uncertainty labels, and accessible audio in one student-first canvas. |
| Technical execution | Uses secure server routes, two swappable inference providers, truncated CSV previews, structured AI output, responsive UI, and optional speech synthesis. |
| Demo and pitch quality | Delivers one clear journey from a student's curiosity to a printable and spoken research canvas in under two minutes. |

## Challenge compliance

- Designed specifically for high-school students and early-career learners
- Works with public or open CSV datasets and does not depend on proprietary RISE data
- Core source is public and reviewable
- Demo is written for a non-technical education audience
- Team size must remain between one and five participants
- Target submission date is 20 September 2026

## Local setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Add at least one provider key to `.env.local`. Never commit that file.

## AI disclosure

ResearchBridge uses generative AI to formulate questions, explain concepts, and propose research plans. OpenAI and Featherless.ai may generate inaccurate output. The interface identifies generated guidance, avoids claiming authoritative sources, and requires human verification. OpenAI Codex assisted with application development.

## Privacy

Dataset previews are truncated before inference. Users should not upload personal, medical, or confidential information. API credentials remain server-side.

## Abuse protection

Both paid API routes apply a per-IP fixed-window backstop. Production deployments should also configure a Vercel WAF fixed-window rule for the `/api/` path so abusive requests are rejected before a serverless function or provider is called.

## License

MIT
