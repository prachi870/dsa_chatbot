/**
 * src/app.js
 * Express application setup — middleware, routes, error handling.
 */

const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const config      = require('./config');

const authRoutes  = require('./routes/auth');
const chatRoutes  = require('./routes/chat');

const app = express();

// ── Core middleware ───────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' })); // guard against large payloads

// ── Rate limiting ─────────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please slow down and try again.' },
});

app.use('/api', limiter);

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth',  authRoutes);
app.use('/api/chat',  chatRoutes);

// /api/topics is a sub-route on chatRoutes (GET /api/chat/topics),
// but expose it also at the top level for convenience
app.use('/api/topics', (req, res, next) => {
  req.url = '/topics';
  chatRoutes(req, res, next);
});

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[app] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
