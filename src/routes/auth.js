/**
 * src/routes/auth.js
 * POST /api/auth/signup
 * POST /api/auth/login
 */

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { query } = require('../config/db');
const config   = require('../config');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase(), passwordHash]
    );

    const user  = result.rows[0];
    const token = signToken(user);

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/signup]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const result = await query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    // Use constant-time compare to avoid timing attacks
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection00000000000');

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
