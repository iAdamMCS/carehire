# CareHire — Modern Caregiving Solutions

CareHire is a family-friendly Canadian hiring assistant for private in-home support. It helps a caregiver move from care needs to an adjustable weekly-hours estimate, job description, interview guide, hiring-status check and plain-language work agreement draft.

## Production architecture

- **Frontend:** accessible mobile-first HTML/CSS/JavaScript served by the application service.
- **Voice:** browser `MediaRecorder` captures a short push-to-talk clip and sends it to the server. The server calls Gemini transcription; the Gemini key is never exposed to the browser.
- **AI boundary:** document generation and the hours calculator are deterministic in V1. Gemini is used only for speech transcription. A future free-form voice intake may use Gemini structured output behind the same server-side gateway.
- **Storage:** V1 has no account and no cloud persistence. Optional drafts are stored only in the current browser with explicit user action. This materially reduces privacy and breach surface.
- **Hosting target:** Google Cloud Run. Put the Gemini credential in Google Secret Manager.

## Local development

1. Install Node.js 22+.
2. `npm install`
3. Copy `.env.example` to `.env` and provide a development Gemini API key.
4. `npm run dev`
5. Open `http://localhost:8080`.

## Production deployment

Use Cloud Run rather than GitHub Pages for production because CareHire requires a server-side voice endpoint and a protected Gemini credential.

Suggested deployment:

```bash
gcloud run deploy carehire --source . --region northamerica-northeast1 --allow-unauthenticated
```

Configure `GEMINI_API_KEY` from Secret Manager rather than placing it in source or a plain deployment variable.

## Go-live gates

Code can be prepared for production, but the product should not be called production-ready until all of these are signed off:

1. Canadian employment-law review of the work agreement and jurisdiction copy.
2. Verification of province/territory reference data and special domestic-worker exceptions.
3. Privacy review, including browser storage language and Gemini audio handling/retention.
4. Accessibility review against WCAG 2.2 AA.
5. Cross-browser/mobile voice testing.
6. Security review, rate-limit/load testing and incident/rollback runbook.
7. MCS brand-token review against the current corporate design system/assets.

See `PRODUCTION_READINESS.md` and `VOICE_ARCHITECTURE.md`.
