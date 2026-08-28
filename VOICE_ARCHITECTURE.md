# CareHire voice architecture

## Decision

For V1, **Speak instead** is push-to-talk, per question.

The browser records a short audio clip with `MediaRecorder` and sends it over HTTPS to `POST /api/voice/transcribe`. The server sends the clip to Gemini transcription and immediately deletes the temporary Gemini file after the transcript is returned.

Do **not** use the browser Web Speech API as the primary production path. Browser support and behaviour vary, and it can obscure which provider processes the audio.

## Why this fits MCS / MyHuddle

MyHuddle already uses Gemini for Teeyah. CareHire should reuse the MCS Gemini governance pattern—central secret management, logging rules, model allow-listing, cost controls and vendor review—without sharing Teeyah conversation state or memory.

The services may share an MCS AI gateway, but they should remain separate logical clients:

- `teeyah` — conversational caregiving assistant
- `carehire-voice` — transcription only
- future `carehire-intake-parser` — structured extraction only

No Teeyah memory, chat transcript or recipient context should be imported into CareHire voice requests.

## Recommended models

- **V1 per-field transcription:** `gemini-3.5-transcribe`.
- **Later real-time streaming:** `gemini-3.5-transcribe-live` if usability testing proves that streaming is worth the added complexity.
- **Later “tell me everything” intake:** transcribe first, then send the transcript—not raw audio unless needed—to a Gemini model using a strict JSON Schema. Validate every returned field before inserting it into the form.

## UX rules

1. Voice is optional. Typing always remains available.
2. Button states are explicit: Speak instead → Stop recording → Transcribing.
3. Never silently submit a transcript. Put it into the field and tell the user to review it.
4. A transcription failure must never block the hiring workflow.
5. Keep recordings short; V1 caps uploads at 6 MB.
6. Do not retain the audio in CareHire after transcription.
7. Avoid recording names, diagnoses, medication lists or other unnecessary health details.

## Security/privacy

- Gemini API key remains server-side only.
- Store the key in Google Secret Manager.
- Rate-limit the transcription endpoint.
- Log request IDs, latency, model and status—not audio or transcript content.
- Delete Gemini Files API uploads immediately after each request; do not rely only on automatic expiry.
- Document Google's applicable data-processing terms in the MCS privacy/vendor register before launch.
