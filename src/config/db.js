/**
 * src/config/db.js
 * Shared PostgreSQL connection pool.
 */

const { Pool } = require('pg');
const config   = require('./index');

const pool = new Pool({
  connectionString: config.db.connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // Required for Supabase and most cloud Postgres providers
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

/**
 * Convenience wrapper — always releases the client back to the pool.
 * @param {string} text   SQL query string
 * @param {any[]}  params Query parameters (prevents SQL injection)
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
