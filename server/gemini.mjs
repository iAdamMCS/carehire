import { GoogleGenAI } from '@google/genai';

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav'
]);

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('Voice transcription is not configured.');
    error.code = 'VOICE_NOT_CONFIGURED';
    throw error;
  }
  return new GoogleGenAI({ apiKey });
}

export async function transcribeAudio({ audioBase64, mimeType, languageHint }) {
  if (!allowedMimeTypes.has(mimeType)) {
    const error = new Error('Unsupported audio format.');
    error.code = 'UNSUPPORTED_AUDIO';
    throw error;
  }

  const buffer = Buffer.from(audioBase64, 'base64');
  if (!buffer.length || buffer.length > MAX_AUDIO_BYTES) {
    const error = new Error('Audio must be between 1 byte and 6 MB.');
    error.code = 'AUDIO_SIZE';
    throw error;
  }

  const ai = getClient();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const uploaded = await ai.files.upload({
    file: blob,
    config: { mimeType, displayName: 'carehire-voice-input' }
  });

  try {
    const generationConfig = languageHint
      ? { transcription_config: { language_codes: [languageHint] } }
      : undefined;

    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.5-transcribe',
      input: [{
        type: 'audio',
        uri: uploaded.uri,
        mime_type: uploaded.mimeType || mimeType
      }],
      ...(generationConfig ? { generation_config: generationConfig } : {})
    });

    const transcript = (interaction.output_text ?? interaction.outputText ?? '').trim();
    if (!transcript) {
      const error = new Error('No speech was detected.');
      error.code = 'NO_SPEECH';
      throw error;
    }

    return transcript;
  } finally {
    if (uploaded.name) {
      ai.files.delete({ name: uploaded.name }).catch(() => {});
    }
  }
}
