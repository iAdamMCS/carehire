import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { transcribeAudio } from './gemini.mjs';

const app = express();
const port = Number(process.env.PORT || 8080);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8')
  .replace('</body>', '<script src="/role-patch.js" defer></script>\n</body>');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(express.json({ limit: '9mb' }));

const voiceLimiter = rateLimit({
  windowMs: 60_000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many voice requests. Please wait a moment and try again.' }
});

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'carehire', version: '1.0.0' });
});

app.post('/api/voice/transcribe', voiceLimiter, async (req, res) => {
  try {
    const { audioBase64, mimeType, languageHint } = req.body || {};
    if (typeof audioBase64 !== 'string' || typeof mimeType !== 'string') {
      return res.status(400).json({ error: 'Audio and MIME type are required.' });
    }

    const transcript = await transcribeAudio({
      audioBase64,
      mimeType,
      languageHint: typeof languageHint === 'string' ? languageHint : undefined
    });

    return res.json({ transcript });
  } catch (error) {
    const code = error?.code;
    if (code === 'VOICE_NOT_CONFIGURED') return res.status(503).json({ error: error.message });
    if (['UNSUPPORTED_AUDIO', 'AUDIO_SIZE', 'NO_SPEECH'].includes(code)) {
      return res.status(400).json({ error: error.message });
    }
    console.error('voice_transcription_failed', { name: error?.name, code });
    return res.status(502).json({ error: 'Voice transcription is temporarily unavailable. You can continue by typing.' });
  }
});

app.get('/', (_req, res) => res.type('html').send(indexHtml));

app.use(express.static(publicDir, {
  index: false,
  extensions: ['html'],
  etag: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));

app.get('/{*splat}', (_req, res) => res.type('html').send(indexHtml));

app.use((error, _req, res, _next) => {
  console.error('unhandled_error', { name: error?.name });
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CareHire listening on ${port}`);
});
