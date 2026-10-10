import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestLoggerMiddleware } from './middleware/requestLogger.js';
import { apiRoutes } from './routes/api.js';
import { emulatorApiRoutes } from './routes/emulatorApi.js';
import { webRoutes } from './routes/web.js';
import { DbClient } from './db/client.js';
import { getAllowedOrigins } from './utils/apiAuth.js';

const app = new Hono();

// Baseline security headers on every response
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  if (c.req.path.startsWith('/api/')) {
    c.header('Cache-Control', 'no-store');
  }
  if (c.req.url.startsWith('https://')) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
});

// Global HTTP Request Logger Middleware (captures all incoming requests & responses)
app.use('*', requestLoggerMiddleware);

// CORS for API routes: server-to-server traffic needs none. Browser origins are
// only honoured when explicitly allow-listed in Admin Security (webapp_allowed_origins).
app.use('/api/*', async (c, next) => {
  const origin = c.req.header('origin');
  if (!origin) return next();

  let allowed = [];
  try {
    allowed = await getAllowedOrigins(new DbClient(c.env.DB), c.env);
  } catch (e) {
    allowed = [];
  }

  const normalizedOrigin = origin.replace(/\/+$/, '');
  if (!allowed.includes(normalizedOrigin)) {
    // Same-origin dashboard requests carry an Origin header too; they need no CORS headers.
    return next();
  }

  return cors({
    origin: normalizedOrigin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-PP-Timestamp', 'X-PP-Signature'],
    maxAge: 600,
  })(c, next);
});

// Mount API routes
app.route('/api', apiRoutes);

// Mount Emulator API routes
app.route('/api/emulator', emulatorApiRoutes);

// Direct callback aliases at root level in case providers post without /api prefix
app.all('/payments/callback', (c) => apiRoutes.fetch(new Request(new URL('/api/payments/callback', c.req.url), c.req.raw), c.env, c.executionCtx));
app.all('/callbacks/:gateway', (c) => apiRoutes.fetch(new Request(new URL(`/api/callbacks/${c.req.param('gateway')}`, c.req.url), c.req.raw), c.env, c.executionCtx));
app.all('/callbacks', (c) => apiRoutes.fetch(new Request(new URL('/api/callbacks', c.req.url), c.req.raw), c.env, c.executionCtx));

// Mount Web Dashboard routes
app.route('/', webRoutes);

// Global 404 handler
app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ success: false, message: 'API Endpoint Not Found' }, 404);
  }
  return c.text('404 Page Not Found', 404);
});

// Global Error Handler (never leak internal error details to clients)
app.onError((err, c) => {
  const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  console.error(`Unhandled Error [${errorId}]:`, err);
  if (c.req.path.startsWith('/api/')) {
    return c.json({ success: false, message: 'Internal Server Error', error_id: errorId }, 500);
  }
  return c.text(`500 Internal Server Error (reference ${errorId})`, 500);
});

export default app;
