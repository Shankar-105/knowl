import WebSocket from 'ws';

// This route MUST run on the Node.js runtime (uses the 'ws' WebSocket client and
// streams a raw binary body). It also must be dynamic (no caching of audio).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Vapi <-> 60db custom-voice bridge
//
// Vapi (provider: 'custom-voice') POSTs each utterance here as:
//   { message: { type: 'voice-request', text, sampleRate, ... } }
// and expects the response body to be RAW PCM: 16-bit signed little-endian,
// mono, at the requested sampleRate, with Content-Type application/octet-stream.
//
// 60db's REST/stream endpoints return MP3/WAV, so we use 60db's WebSocket TTS
// which emits LINEAR16 (raw PCM) chunks — the only 60db endpoint that matches
// Vapi's contract. The selected 60db voice_id + tuning arrive as query params
// (Vapi's voice-request body carries no voiceId).
// ---------------------------------------------------------------------------

const SIXTYDB_WS_URL = 'wss://api.60db.ai/ws/tts';
const SIXTYDB_API_KEY = process.env.SIXTYDB_API_KEY || '';
const PROXY_SECRET = process.env.SIXTYDB_PROXY_SECRET || '';

// 60db supports these LINEAR16 sample rates. Vapi may request 22050, which 60db
// does not; in that case we synthesize at 24000 and linearly resample down.
const SIXTYDB_SUPPORTED_RATES = new Set([8000, 16000, 24000, 48000]);

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', provider: '60db' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  // Light gate: if a proxy secret is configured, require Vapi's x-vapi-secret header.
  if (PROXY_SECRET) {
    const got = request.headers.get('x-vapi-secret');
    if (got !== PROXY_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  if (!SIXTYDB_API_KEY) {
    console.error('[60db] Missing SIXTYDB_API_KEY');
    return new Response('TTS not configured', { status: 500 });
  }

  let text = '';
  let requestedRate = 24000;
  try {
    const body = await request.json();
    const msg = body?.message ?? {};
    text = String(msg.text ?? '').trim();
    const sr = Number(msg.sampleRate);
    if (Number.isFinite(sr) && sr > 0) requestedRate = sr;
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  if (!text) {
    // Nothing to synthesize -> empty PCM (Vapi treats this as silence).
    return new Response(new Uint8Array(0), {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  }

  const url = new URL(request.url);
  const voiceId = url.searchParams.get('voice_id') || undefined;
  const stability = clampNum(url.searchParams.get('stability'), 0, 100, 50);
  const similarity = clampNum(url.searchParams.get('similarity'), 0, 100, 75);
  const speed = clampNum(url.searchParams.get('speed'), 0.5, 2.0, 1.0);

  // Pick a 60db synth rate, resampling afterwards only if Vapi asked for one 60db can't do.
  const synthRate = SIXTYDB_SUPPORTED_RATES.has(requestedRate) ? requestedRate : 24000;
  const needsResample = synthRate !== requestedRate;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let settled = false;
      const finish = (err?: unknown) => {
        if (settled) return;
        settled = true;
        try {
          if (err) controller.error(err);
          else controller.close();
        } catch { /* already closed */ }
        try { ws.close(); } catch { /* noop */ }
        clearTimeout(guard);
      };

      // Overall safety timeout so a stuck socket can't hang the Vapi call.
      const guard = setTimeout(() => finish(), 30000);

      const ws = new WebSocket(`${SIXTYDB_WS_URL}?apiKey=${encodeURIComponent(SIXTYDB_API_KEY)}`);
      const contextId = `vapi-${requestedRate}-${text.length}`;

      const sendCreateContext = () => {
        ws.send(JSON.stringify({
          create_context: {
            context_id: contextId,
            ...(voiceId ? { voice_id: voiceId } : {}),
            audio_config: { audio_encoding: 'LINEAR16', sample_rate_hertz: synthRate },
            speed,
            stability,
            similarity,
          },
        }));
      };

      ws.on('open', () => { /* wait for connection_established before create_context */ });

      ws.on('message', (raw: WebSocket.RawData) => {
        let data: any;
        try { data = JSON.parse(raw.toString()); } catch { return; }

        if (data.connection_established) {
          sendCreateContext();
        } else if (data.context_created) {
          ws.send(JSON.stringify({ send_text: { context_id: contextId, text } }));
          // close_context flushes remaining text and emits the final audio, then closes.
          ws.send(JSON.stringify({ close_context: { context_id: contextId } }));
        } else if (data.audio_chunk?.audioContent) {
          const raw = Buffer.from(data.audio_chunk.audioContent, 'base64');
          const pcm = needsResample ? resamplePcm16(raw, synthRate, requestedRate) : raw;
          if (pcm.length) controller.enqueue(Uint8Array.from(pcm));
        } else if (data.context_closed) {
          finish();
        } else if (data.error) {
          console.error('[60db] WS error:', data.error?.message || data.error);
          finish(); // empty/partial body -> Vapi triggers its ElevenLabs fallback
        }
      });

      ws.on('error', (e) => { console.error('[60db] socket error:', e); finish(); });
      ws.on('close', () => finish());
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// Parse a numeric query param with bounds + default.
function clampNum(v: string | null, min: number, max: number, dflt: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}

// Linear-interpolation resampler for 16-bit signed LE mono PCM.
// Used only when Vapi requests a rate 60db can't synthesize (e.g. 22050).
function resamplePcm16(buf: Buffer, fromRate: number, toRate: number): Buffer {
  if (fromRate === toRate || buf.length < 2) return buf;
  const inSamples = buf.length >> 1; // 2 bytes/sample
  const ratio = toRate / fromRate;
  const outSamples = Math.max(1, Math.floor(inSamples * ratio));
  const out = Buffer.alloc(outSamples * 2);
  for (let i = 0; i < outSamples; i++) {
    const srcPos = i / ratio;
    const i0 = Math.floor(srcPos);
    const i1 = Math.min(i0 + 1, inSamples - 1);
    const frac = srcPos - i0;
    const s0 = buf.readInt16LE(i0 * 2);
    const s1 = buf.readInt16LE(i1 * 2);
    out.writeInt16LE(Math.round(s0 + (s1 - s0) * frac), i * 2);
  }
  return out;
}
