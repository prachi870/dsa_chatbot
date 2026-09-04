/**
 * src/server.js
 * Entry point — starts the HTTP server and verifies DB connectivity.
 */

const app    = require('./app');
const config = require('./config');
const { pool } = require('./config/db');

async function start() {
  // Verify database connection before accepting traffic
  try {
    await pool.query('SELECT 1');
    console.log('[server] ✅ Database connection OK');
  } catch (err) {
    console.warn('[server] ⚠️  Database unavailable:', err.message);
    console.warn('[server]    The server will start, but DB-dependent routes will fail.');
    console.warn('[server]    Make sure DATABASE_URL is set and PostgreSQL is running.');
  }

  app.listen(config.port, () => {
    console.log(`[server] 🚀 DSABot backend running on http://localhost:${config.port}`);
    console.log(`[server]    Environment : ${config.nodeEnv}`);
    console.log(`[server]    Health check: http://localhost:${config.port}/health`);
  });
}

start();
