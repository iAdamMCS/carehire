# CareHire production readiness

## Implemented in this production branch

- MCS-branded mobile-first interface
- Seven-step caregiver workflow
- Deterministic task-frequency × duration hours calculator
- Province/territory official-reference layer with verification dates
- Deterministic job description, interview guide and agreement drafting
- Employee/contractor awareness screen with CRA link
- Push-to-talk server-mediated Gemini transcription
- Explicit transcript review before use
- Optional local-device draft save + clear-data control
- Security headers and API rate limiting
- No client-side Gemini key
- Health endpoint and Cloud Run container configuration
- Production-safe error messages

## Required before external production launch

### Legal/content gate
- Employment lawyer reviews the agreement template.
- Domestic-worker/live-in exceptions are reviewed for every jurisdiction.
- CRA employer-status wording is reviewed.
- A named MCS owner and review cadence are assigned to jurisdiction data.

### Privacy gate
- Update MCS privacy notice for CareHire.
- Confirm Gemini transcription retention/data-use configuration and vendor terms.
- Confirm local-browser storage language and shared-device warning.
- Complete privacy impact assessment proportional to collected data.

### QA gate
- WCAG 2.2 AA audit.
- Chrome, Edge, Safari, Firefox and mobile browser matrix.
- Microphone permission denied/revoked tests.
- No-speech, noisy-room, accent and multilingual voice tests.
- Document snapshot tests for every role and province/territory.
- Security dependency scan and endpoint abuse tests.

### Operations gate
- Cloud Run service in Canadian region when available/appropriate to MCS policy.
- Gemini secret in Secret Manager.
- Monitoring and alerting without transcript content.
- Budget/rate controls.
- Rollback procedure.
- Production domain and TLS.

## Recommended V1 privacy posture

Launch without accounts or cloud draft storage. This is intentional. CareHire can create useful hiring documents without creating another MCS database of caregiver/recipient details. Add accounts only if user research shows cross-device history is genuinely needed.
