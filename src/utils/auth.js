import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { DbClient } from '../db/client.js';
import {
  sha256Hex,
  hmacSha256,
  pbkdf2Hex,
  PBKDF2_ITERATIONS,
  randomHex,
  safeEqual,
} from './security.js';

export const SESSION_COOKIE_NAME = 'pp_dashboard_session';
export const DEFAULT_SESSION_DURATION = 86400; // 24 hours in seconds
export const MIN_PASSWORD_LENGTH = 10;

// Kept for backwards compatibility with existing imports.
export const sha256 = sha256Hex;
export const generateRandomHex = randomHex;

const LEGACY_PEPPER = 'payment-processor-middleware-secret';

/**
 * Legacy single-round SHA-256 hash (v1). Only used to verify passwords stored
 * before PBKDF2 was introduced; those are upgraded transparently on next login.
 */
async function legacyHashPassword(password, salt) {
  return await sha256Hex(`${salt}:${password}:${LEGACY_PEPPER}`);
}

/**
 * Hash a password with PBKDF2-SHA256. The stored format is
 * `pbkdf2$<iterations>$<hex>` so the algorithm can be rotated later.
 */
export async function hashPassword(password, salt) {
  const derived = await pbkdf2Hex(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${derived}`;
}

function isLocalRequest(c) {
  try {
    const host = new URL(c.req.url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
  } catch (e) {
    return false;
  }
}

/**
 * Get active admin credentials from D1 DB or environment fallback.
 *
 * Default credentials (`admin` / `admin123`) are only honoured when the
 * dashboard is served from localhost. On any other host a password must be
 * set either via the `ADMIN_PASSWORD` Worker secret or through the Security tab.
 */
export async function getAdminCredentials(dbClient, env = {}, c = null) {
  const dbUsername = await dbClient.getConfig('admin_username', '');
  const dbPasswordHash = await dbClient.getConfig('admin_password_hash', '');
  const dbPasswordSalt = await dbClient.getConfig('admin_password_salt', '');
  let authSecret = await dbClient.getConfig('auth_secret', '');

  if (!authSecret) {
    authSecret = randomHex(32);
    await dbClient.setConfig('auth_secret', authSecret);
  }

  const username = dbUsername || env.ADMIN_USERNAME || 'admin';
  const allowBuiltinDefault = c ? isLocalRequest(c) : false;
  const defaultPassword = env.ADMIN_PASSWORD || (allowBuiltinDefault ? 'admin123' : '');

  return {
    username,
    passwordHash: dbPasswordHash,
    passwordSalt: dbPasswordSalt,
    defaultPassword,
    authSecret,
    isUsingDefault: !dbPasswordHash,
    loginDisabled: !dbPasswordHash && !defaultPassword,
    needsUpgrade: !!dbPasswordHash && !dbPasswordHash.startsWith('pbkdf2$'),
  };
}

/**
 * Verify given password against stored credentials (constant-time compare).
 */
export async function verifyPassword(password, creds) {
  if (creds.passwordHash && creds.passwordSalt) {
    if (creds.passwordHash.startsWith('pbkdf2$')) {
      const [, iterStr, storedHex] = creds.passwordHash.split('$');
      const derived = await pbkdf2Hex(password, creds.passwordSalt, parseInt(iterStr, 10) || PBKDF2_ITERATIONS);
      return safeEqual(derived, storedHex);
    }
    const legacy = await legacyHashPassword(password, creds.passwordSalt);
    return safeEqual(legacy, creds.passwordHash);
  }
  if (!creds.defaultPassword) return false;
  return safeEqual(password, creds.defaultPassword);
}

/**
 * Update admin credentials in database.
 */
export async function updateAdminCredentials(dbClient, newUsername, newPassword) {
  const salt = randomHex(16);
  const hash = await hashPassword(newPassword, salt);

  if (newUsername) {
    await dbClient.setConfig('admin_username', newUsername);
  }
  await dbClient.setConfig('admin_password_hash', hash);
  await dbClient.setConfig('admin_password_salt', salt);
}

/**
 * The session MAC key mixes the auth secret with the password hash so that
 * changing the password invalidates every existing session.
 */
function sessionKey(creds) {
  return `${creds.authSecret}:${creds.passwordHash || 'default'}`;
}

/**
 * Create an HMAC-signed session token: `<user>.<exp>.<nonce>.<hmac>`
 */
export async function createSessionToken(username, creds, ttlSeconds = DEFAULT_SESSION_DURATION) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const nonce = randomHex(8);
  const user = encodeURIComponent(username);
  const signature = await hmacSha256(sessionKey(creds), `${user}.${expiresAt}.${nonce}`);
  return `${user}.${expiresAt}.${nonce}.${signature}`;
}

/**
 * Verify a signed session token.
 */
export async function verifySessionToken(token, creds) {
  if (!token || typeof token !== 'string' || !creds) return false;
  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [user, expiresAtStr, nonce, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;

  let username;
  try {
    username = decodeURIComponent(user);
  } catch (e) {
    return false;
  }
  if (username !== creds.username) return false;

  const expectedSig = await hmacSha256(sessionKey(creds), `${user}.${expiresAt}.${nonce}`);
  return safeEqual(signature, expectedSig);
}

/**
 * Resolve the admin user for a request from its session cookie, or null.
 */
export async function getSessionAdmin(c, dbClient = null, creds = null) {
  const db = dbClient || new DbClient(c.env.DB);
  const credentials = creds || (await getAdminCredentials(db, c.env, c));
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (await verifySessionToken(token, credentials)) {
    return credentials.username;
  }
  return null;
}

/**
 * Set session HTTP-Only cookie on response. `Secure` is set whenever the
 * dashboard is served over HTTPS.
 */
export function setDashboardSessionCookie(c, token, ttlSeconds = DEFAULT_SESSION_DURATION) {
  const isHttps = c.req.url.startsWith('https://');
  setCookie(c, SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
    maxAge: ttlSeconds,
  });
}

/**
 * Delete session cookie on logout
 */
export function clearDashboardSessionCookie(c) {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Reject cross-site state-changing requests to the dashboard. SameSite=Lax
 * already blocks cookie transmission on cross-site POSTs; this adds an
 * explicit Origin / Sec-Fetch-Site check as a second layer.
 */
export function isCrossSiteWrite(c) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) return false;
  const fetchSite = c.req.header('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return true;
  const origin = c.req.header('origin');
  if (origin) {
    try {
      return new URL(origin).host !== new URL(c.req.url).host;
    } catch (e) {
      return true;
    }
  }
  return false;
}

/**
 * Dashboard Authentication Middleware
 */
export async function dashboardAuthMiddleware(c, next) {
  const path = c.req.path;

  // Unprotected routes (API routes carry their own auth middleware)
  if (
    path === '/login' ||
    path === '/logout' ||
    path.startsWith('/api/') ||
    path.startsWith('/payments/') ||
    path.startsWith('/callbacks/') ||
    path.startsWith('/emulator/selcom-pay/')
  ) {
    return await next();
  }

  const dbClient = new DbClient(c.env.DB);
  const creds = await getAdminCredentials(dbClient, c.env, c);
  const token = getCookie(c, SESSION_COOKIE_NAME);

  const isValid = await verifySessionToken(token, creds);

  if (isValid) {
    if (isCrossSiteWrite(c)) {
      return c.json({ success: false, message: 'Cross-site request rejected.' }, 403);
    }
    c.set('adminUser', creds.username);
    return await next();
  }

  // Handle unauthenticated request
  const isJson =
    c.req.header('accept')?.includes('application/json') ||
    c.req.header('content-type')?.includes('application/json') ||
    c.req.header('x-requested-with') === 'XMLHttpRequest';

  if (isJson) {
    return c.json({ success: false, message: 'Authentication required. Please log in.' }, 401);
  }

  const redirectUrl = `/login?redirect=${encodeURIComponent(path)}`;
  return c.redirect(redirectUrl, 302);
}
