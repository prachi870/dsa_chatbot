/**
 * db/migrate.js
 * Reads schema.sql and applies it to the configured PostgreSQL database.
 * Usage: node db/migrate.js
 */

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  console.log('[migrate] Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('[migrate] Running schema.sql...');
    await client.query(sql);
    console.log('[migrate] ✅ Migration complete.');
  } catch (err) {
    console.error('[migrate] ❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
