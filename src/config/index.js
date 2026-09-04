require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    connectionString: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'changeme_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY,
    // Fast, capable model available on Groq
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
  },
};

// Warn on startup if critical env vars are missing
if (!config.groq.apiKey) {
  console.warn('[config] WARNING: GROQ_API_KEY is not set.');
}
if (!config.db.connectionString) {
  console.warn('[config] WARNING: DATABASE_URL is not set.');
}

module.exports = config;
