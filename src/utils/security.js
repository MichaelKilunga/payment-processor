/**
 * Low-level cryptographic helpers shared by dashboard auth, API auth,
 * webhook signing and gateway signature verification.
 *
 * Everything here uses the Web Crypto API so it runs identically on
 * Cloudflare Workers and under wrangler dev.
 */

const encoder = new TextEncoder();

export function toHex(bufferOrBytes) {
  const bytes = bufferOrBytes instanceof Uint8Array ? bufferOrBytes : new Uint8Array(bufferOrBytes);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(hex) {
  const clean = String(hex || '').trim();
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function randomHex(byteLength = 16) {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return toHex(array);
}

export function randomId(prefix = '') {
  const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : randomHex(16);
  return prefix ? `${prefix}${id}` : id;
}

export async function sha256Hex(str) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(String(str)));
  return toHex(digest);
}

export async function hmacSha256(secret, message, encoding = 'hex') {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(String(message)));
  if (encoding === 'base64') {
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }
  return toHex(sig);
}

/**
 * PBKDF2-SHA256 password derivation. Cloudflare Workers cap iterations at 100,000.
 */
export const PBKDF2_ITERATIONS = 100000;

export async function pbkdf2Hex(password, saltHex, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(String(password)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations },
    key,
    256
  );
  return toHex(bits);
}

/**
 * Constant-time string comparison. Returns false for differing lengths without
 * leaking which characters matched.
 */
export function safeEqual(a, b) {
  const aBytes = encoder.encode(String(a ?? ''));
  const bBytes = encoder.encode(String(b ?? ''));
  if (aBytes.length !== bBytes.length) {
    // Still burn comparable time before returning.
    let dummy = 0;
    for (let i = 0; i < aBytes.length; i++) dummy |= aBytes[i] ^ 0;
    return dummy === -1;
  }
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

/**
 * Validate a timestamp (unix seconds or ISO string) is within +/- toleranceSec of now.
 */
export function isTimestampFresh(ts, toleranceSec = 300) {
  if (ts === undefined || ts === null || ts === '') return false;
  let ms;
  if (/^\d+$/.test(String(ts))) {
    const n = Number(ts);
    ms = n > 1e12 ? n : n * 1000;
  } else {
    ms = Date.parse(String(ts));
  }
  if (!Number.isFinite(ms)) return false;
  return Math.abs(Date.now() - ms) <= toleranceSec * 1000;
}

/**
 * Recursively mask secret-looking fields in an object before persisting it to logs.
 */
const SENSITIVE_KEY_RE = /(secret|password|passwd|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|authorization|^token$|signature|digest|cookie|set-cookie|x-pp-signature)/i;

export function redactSensitive(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth > 8) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = v === null || v === undefined || v === '' ? v : '[REDACTED]';
      } else {
        out[k] = redactSensitive(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/**
 * Redact a raw request/response body string. JSON bodies are parsed and masked
 * field by field; form bodies are masked key by key; anything else is returned as is.
 */
export function redactBodyText(text) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.stringify(redactSensitive(JSON.parse(trimmed)));
    } catch (e) {
      return text;
    }
  }
  if (/^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(trimmed)) {
    try {
      const params = new URLSearchParams(trimmed);
      const out = new URLSearchParams();
      for (const [k, v] of params.entries()) {
        out.append(k, SENSITIVE_KEY_RE.test(k) ? '[REDACTED]' : v);
      }
      return out.toString();
    } catch (e) {
      return text;
    }
  }
  return text;
}

/**
 * Validate an outbound webhook/callback URL. HTTPS is required except for
 * loopback and private-network hosts used during development.
 */
export function validateWebhookUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return { ok: true, url: '' };
  let url;
  try {
    url = new URL(value);
  } catch (e) {
    return { ok: false, error: 'Callback URL is not a valid absolute URL.' };
  }
  if (url.username || url.password) {
    return { ok: false, error: 'Callback URL must not embed credentials.' };
  }
  const host = url.hostname.toLowerCase();
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.localhost') ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (url.protocol === 'https:') return { ok: true, url: url.toString() };
  if (url.protocol === 'http:' && isLocal) return { ok: true, url: url.toString() };
  if (url.protocol === 'http:') {
    return { ok: false, error: 'Callback URL must use HTTPS. Plain HTTP is only allowed for localhost and private network addresses.' };
  }
  return { ok: false, error: 'Callback URL must use the https scheme.' };
}

/**
 * Simple rate limiter. Uses a Cloudflare Rate Limiting binding when one is
 * configured in wrangler.jsonc, otherwise a per-isolate fixed-window counter.
 * Returns true when the request is allowed.
 */
const memoryBuckets = new Map();

export async function rateLimit(env, { binding, key, limit = 60, periodSec = 60 }) {
  const rl = env && binding ? env[binding] : null;
  if (rl && typeof rl.limit === 'function') {
    try {
      const { success } = await rl.limit({ key: String(key) });
      return success !== false;
    } catch (e) {
      console.error('Rate limiter binding error, falling back to memory:', e);
    }
  }

  const windowId = Math.floor(Date.now() / (periodSec * 1000));
  const bucketKey = `${binding || 'default'}:${key}:${windowId}`;
  const count = (memoryBuckets.get(bucketKey) || 0) + 1;
  memoryBuckets.set(bucketKey, count);

  if (memoryBuckets.size > 5000) {
    for (const k of memoryBuckets.keys()) {
      if (!k.endsWith(`:${windowId}`)) memoryBuckets.delete(k);
    }
  }
  return count <= limit;
}

export function clientIp(c) {
  return c.req.header('cf-connecting-ip') || (c.req.header('x-forwarded-for') || '').split(',')[0].trim() || '127.0.0.1';
}
