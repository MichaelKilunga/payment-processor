/**
 * Authentication for the machine-to-machine API used by the web application.
 *
 * Two credential types are accepted:
 *   1. A web app API key, sent as `Authorization: Bearer <key>` or `X-API-Key: <key>`.
 *      Keys are generated from the dashboard Security tab (only the SHA-256 hash is
 *      stored) or supplied through the `WEBAPP_API_KEY` Worker secret.
 *   2. A logged-in dashboard admin session cookie (so the built-in emulator and
 *      log viewers keep working from the browser).
 *
 * Optionally, requests can also be HMAC-signed to prevent replay and tampering:
 *   X-PP-Timestamp: <unix seconds>
 *   X-PP-Signature: hex( HMAC-SHA256( api_key, `${timestamp}.${METHOD}.${pathname}.${rawBody}` ) )
 * Signing is verified whenever the headers are present and is mandatory when the
 * `webapp_require_signed_requests` setting is enabled.
 */

import { DbClient } from '../db/client.js';
import { getSessionAdmin } from './auth.js';
import { sha256Hex, hmacSha256, safeEqual, isTimestampFresh, randomHex, rateLimit, clientIp } from './security.js';

export const API_KEY_PREFIX = 'pp_live_';
export const SIGNATURE_TOLERANCE_SEC = 300;
export const KEY_ROTATION_GRACE_SEC = 24 * 3600;

export const CONFIG_KEYS = {
  apiKeyHash: 'webapp_api_key_hash',
  apiKeyPrefix: 'webapp_api_key_prefix',
  apiKeyCreatedAt: 'webapp_api_key_created_at',
  previousApiKeyHash: 'webapp_api_key_previous_hash',
  previousApiKeyExpiresAt: 'webapp_api_key_previous_expires_at',
  requireSignedRequests: 'webapp_require_signed_requests',
  allowedOrigins: 'webapp_allowed_origins',
  webhookSecret: 'webapp_webhook_secret',
  webhookSecretPrefix: 'webapp_webhook_secret_prefix',
  webhookSecretCreatedAt: 'webapp_webhook_secret_created_at',
};

/**
 * Generate and persist a new API key. Returns the plaintext key exactly once.
 * The previous key keeps working for KEY_ROTATION_GRACE_SEC to allow rollout.
 */
export async function rotateApiKey(dbClient) {
  const key = `${API_KEY_PREFIX}${randomHex(24)}`;
  const hash = await sha256Hex(key);
  const now = new Date();

  const currentHash = await dbClient.getConfig(CONFIG_KEYS.apiKeyHash, '');
  if (currentHash) {
    await dbClient.setConfig(CONFIG_KEYS.previousApiKeyHash, currentHash);
    await dbClient.setConfig(
      CONFIG_KEYS.previousApiKeyExpiresAt,
      new Date(now.getTime() + KEY_ROTATION_GRACE_SEC * 1000).toISOString()
    );
  }

  await dbClient.setConfig(CONFIG_KEYS.apiKeyHash, hash);
  await dbClient.setConfig(CONFIG_KEYS.apiKeyPrefix, key.slice(0, API_KEY_PREFIX.length + 6));
  await dbClient.setConfig(CONFIG_KEYS.apiKeyCreatedAt, now.toISOString());

  return { key, prefix: key.slice(0, API_KEY_PREFIX.length + 6), createdAt: now.toISOString() };
}

export async function revokeApiKeys(dbClient) {
  for (const k of [
    CONFIG_KEYS.apiKeyHash,
    CONFIG_KEYS.apiKeyPrefix,
    CONFIG_KEYS.apiKeyCreatedAt,
    CONFIG_KEYS.previousApiKeyHash,
    CONFIG_KEYS.previousApiKeyExpiresAt,
  ]) {
    await dbClient.setConfig(k, '');
  }
}

/**
 * Generate and persist a new webhook signing secret. Returns plaintext once.
 */
export async function rotateWebhookSecret(dbClient) {
  const secret = `whsec_${randomHex(32)}`;
  const now = new Date().toISOString();
  await dbClient.setConfig(CONFIG_KEYS.webhookSecret, secret);
  await dbClient.setConfig(CONFIG_KEYS.webhookSecretPrefix, secret.slice(0, 12));
  await dbClient.setConfig(CONFIG_KEYS.webhookSecretCreatedAt, now);
  return { secret, prefix: secret.slice(0, 12), createdAt: now };
}

export async function getWebhookSecret(dbClient, env = {}) {
  return (await dbClient.getConfig(CONFIG_KEYS.webhookSecret, '')) || env.WEBAPP_WEBHOOK_SECRET || '';
}

export async function getAllowedOrigins(dbClient, env = {}) {
  const raw = (await dbClient.getConfig(CONFIG_KEYS.allowedOrigins, '')) || env.WEBAPP_ALLOWED_ORIGINS || '';
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

function extractPresentedKey(c) {
  const auth = c.req.header('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1].trim();
  const headerKey = c.req.header('x-api-key');
  return headerKey ? headerKey.trim() : '';
}

/**
 * Validate a presented API key against the stored hash(es) and env secret.
 * Returns { valid, keyId } where keyId identifies which credential matched.
 */
export async function validateApiKey(dbClient, env, presentedKey) {
  if (!presentedKey) return { valid: false, reason: 'missing' };

  const presentedHash = await sha256Hex(presentedKey);

  const currentHash = await dbClient.getConfig(CONFIG_KEYS.apiKeyHash, '');
  if (currentHash && safeEqual(presentedHash, currentHash)) {
    return { valid: true, keyId: 'current' };
  }

  const previousHash = await dbClient.getConfig(CONFIG_KEYS.previousApiKeyHash, '');
  const previousExpiry = await dbClient.getConfig(CONFIG_KEYS.previousApiKeyExpiresAt, '');
  if (previousHash && previousExpiry && Date.parse(previousExpiry) > Date.now() && safeEqual(presentedHash, previousHash)) {
    return { valid: true, keyId: 'previous' };
  }

  if (env && env.WEBAPP_API_KEY) {
    const envHash = await sha256Hex(env.WEBAPP_API_KEY);
    if (safeEqual(presentedHash, envHash)) return { valid: true, keyId: 'env' };
  }

  const anyConfigured = !!currentHash || !!(env && env.WEBAPP_API_KEY);
  return { valid: false, reason: anyConfigured ? 'invalid' : 'not_configured' };
}

/**
 * Verify the optional HMAC request signature.
 */
export async function verifyRequestSignature(c, apiKey, rawBody) {
  const ts = c.req.header('x-pp-timestamp');
  const sig = c.req.header('x-pp-signature');
  if (!ts || !sig) return { present: false, valid: false };

  if (!isTimestampFresh(ts, SIGNATURE_TOLERANCE_SEC)) {
    return { present: true, valid: false, reason: 'stale_timestamp' };
  }

  const pathname = new URL(c.req.url).pathname;
  const payload = `${ts}.${c.req.method.toUpperCase()}.${pathname}.${rawBody || ''}`;
  const expected = await hmacSha256(apiKey, payload);
  const provided = sig.replace(/^v1=/, '').trim().toLowerCase();

  return { present: true, valid: safeEqual(provided, expected), reason: 'mismatch' };
}

/**
 * Middleware: require a web app API key or an admin dashboard session.
 */
export async function requireApiClient(c, next) {
  const dbClient = new DbClient(c.env.DB);
  const ip = clientIp(c);

  // Per-IP flood protection before any crypto work
  const allowed = await rateLimit(c.env, { binding: 'API_RATE_LIMITER', key: `api:${ip}`, limit: 120, periodSec: 60 });
  if (!allowed) {
    return c.json({ success: false, message: 'Rate limit exceeded. Slow down and retry shortly.' }, 429);
  }

  // 1. Dashboard admin session (browser clients)
  const admin = await getSessionAdmin(c, dbClient);
  if (admin) {
    c.set('apiClient', { type: 'admin', id: admin });
    return await next();
  }

  // 2. API key
  const presentedKey = extractPresentedKey(c);
  const result = await validateApiKey(dbClient, c.env, presentedKey);

  if (!result.valid) {
    c.header('WWW-Authenticate', 'Bearer realm="payment-processor"');
    if (result.reason === 'not_configured') {
      return c.json(
        {
          success: false,
          message:
            'API access is locked: no web app API key has been generated. Log in to the dashboard, open Admin Security, and generate an API key.',
        },
        401
      );
    }
    return c.json({ success: false, message: 'Unauthorized: missing or invalid API key.' }, 401);
  }

  // 3. Optional / enforced request signing
  const rawBody = ['GET', 'HEAD'].includes(c.req.method) ? '' : await c.req.raw.clone().text().catch(() => '');
  const sigCheck = await verifyRequestSignature(c, presentedKey, rawBody);
  const requireSigned = (await dbClient.getConfig(CONFIG_KEYS.requireSignedRequests, '0')) === '1';

  if (sigCheck.present && !sigCheck.valid) {
    return c.json({ success: false, message: `Unauthorized: request signature rejected (${sigCheck.reason}).` }, 401);
  }
  if (requireSigned && !sigCheck.present) {
    return c.json(
      { success: false, message: 'Unauthorized: this processor requires signed requests (X-PP-Timestamp and X-PP-Signature headers).' },
      401
    );
  }

  c.set('apiClient', { type: 'api_key', id: result.keyId, signed: sigCheck.valid });
  return await next();
}

/**
 * Middleware: require an authenticated dashboard admin session only.
 * Used for privileged operations that must never be reachable with an API key.
 */
export async function requireAdminSession(c, next) {
  const admin = await getSessionAdmin(c);
  if (!admin) {
    return c.json({ success: false, message: 'Forbidden: this endpoint requires an authenticated dashboard administrator session.' }, 403);
  }
  c.set('adminUser', admin);
  c.set('apiClient', { type: 'admin', id: admin });
  return await next();
}
