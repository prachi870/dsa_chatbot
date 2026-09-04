/**
 * src/routes/chat.js
 *
 * POST   /api/chat                        — send a message, get bot reply
 * GET    /api/chat/history/:sessionId     — fetch messages for a session
 * GET    /api/chat/sessions               — list all sessions for the user
 * DELETE /api/chat/:sessionId             — delete a session
 * GET    /api/topics                      — list DSA topic quick-starts
 */

const express  = require('express');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { isDSAQuery, outOfScopeMessage } = require('../utils/dsaClassifier');
const groqService = require('../services/groqService');

const router = express.Router();

// All chat routes require a valid JWT
router.use(authenticateToken);

// ── DSA Topics quick-start list ───────────────────────────────────────────────

const DSA_TOPICS = [
  { id: 'arrays',          label: 'Arrays',                    prompt: 'Explain arrays and common operations with time complexity.' },
  { id: 'linked-lists',    label: 'Linked Lists',              prompt: 'Explain singly and doubly linked lists with examples.' },
  { id: 'stacks-queues',   label: 'Stacks & Queues',           prompt: 'Explain stacks and queues with use cases and implementations.' },
  { id: 'trees',           label: 'Trees & BST',               prompt: 'Explain binary trees, BSTs, and tree traversal algorithms.' },
  { id: 'heaps',           label: 'Heaps & Priority Queues',   prompt: 'Explain heaps, min/max heap, and priority queue operations.' },
  { id: 'graphs',          label: 'Graphs',                    prompt: 'Explain graph representations, BFS, and DFS.' },
  { id: 'hashing',         label: 'Hashing',                   prompt: 'Explain hash tables, collision resolution, and common patterns.' },
  { id: 'sorting',         label: 'Sorting Algorithms',        prompt: 'Compare major sorting algorithms with their time/space complexities.' },
  { id: 'binary-search',   label: 'Binary Search',             prompt: 'Explain binary search and its common variations.' },
  { id: 'dp',              label: 'Dynamic Programming',       prompt: 'Explain dynamic programming with classic examples like knapsack and LCS.' },
  { id: 'greedy',          label: 'Greedy Algorithms',         prompt: 'Explain greedy algorithms with examples.' },
  { id: 'backtracking',    label: 'Backtracking',              prompt: 'Explain backtracking with N-Queens and Sudoku examples.' },
  { id: 'sliding-window',  label: 'Sliding Window',            prompt: 'Explain the sliding window technique with examples.' },
  { id: 'two-pointers',    label: 'Two Pointers',              prompt: 'Explain the two-pointer technique with examples.' },
  { id: 'recursion',       label: 'Recursion',                 prompt: 'Explain recursion, the call stack, and how to analyze recursive complexity.' },
  { id: 'complexity',      label: 'Complexity Analysis',       prompt: 'Explain Big-O notation, best/worst/average case, and amortized complexity.' },
];

// ── GET /api/topics ──────────────────────────────────────────────────────────

router.get('/topics', (req, res) => {
  res.json({ topics: DSA_TOPICS });
});

// ── GET /api/chat/sessions ────────────────────────────────────────────────────

router.get('/sessions', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('[chat/sessions]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/chat ────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, language } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required.' });
    }

    // ── Resolve or create session ─────────────────────────────────────────────
    let resolvedSessionId = sessionId;

    if (!resolvedSessionId) {
      // Auto-create a new session, titling it from the first ~50 chars of the message
      const title = message.trim().slice(0, 50);
      const sessionResult = await query(
        'INSERT INTO sessions (user_id, title) VALUES ($1, $2) RETURNING id',
        [req.user.id, title]
      );
      resolvedSessionId = sessionResult.rows[0].id;
    } else {
      // Verify the session belongs to this user
      const sessionCheck = await query(
        'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
        [resolvedSessionId, req.user.id]
      );
      if (sessionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found.' });
      }
    }

    // ── Domain classification ─────────────────────────────────────────────────
    if (!isDSAQuery(message)) {
      // Save user message + out-of-scope bot reply for transparency
      await query(
        'INSERT INTO messages (session_id, role, content, language) VALUES ($1, $2, $3, $4)',
        [resolvedSessionId, 'user', message.trim(), language || null]
      );
      const refusal = outOfScopeMessage();
      await query(
        'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
        [resolvedSessionId, 'bot', refusal]
      );

      return res.json({
        sessionId: resolvedSessionId,
        reply: refusal,
        inScope: false,
      });
    }

    // ── Fetch prior conversation history (last 20 turns for context window) ───
    const historyResult = await query(
      `SELECT role, content FROM messages
       WHERE session_id = $1
       ORDER BY timestamp ASC
       LIMIT 40`,
      [resolvedSessionId]
    );

    // ── Call Claude ───────────────────────────────────────────────────────────
    const reply = await groqService.chat(historyResult.rows, message.trim(), language);

    // ── Persist both messages ─────────────────────────────────────────────────
    await query(
      'INSERT INTO messages (session_id, role, content, language) VALUES ($1, $2, $3, $4)',
      [resolvedSessionId, 'user', message.trim(), language || null]
    );
    await query(
      'INSERT INTO messages (session_id, role, content, language) VALUES ($1, $2, $3, $4)',
      [resolvedSessionId, 'bot', reply, language || null]
    );

    res.json({ sessionId: resolvedSessionId, reply, inScope: true });
  } catch (err) {
    console.error('[chat/post]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/chat/history/:sessionId ─────────────────────────────────────────

router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify ownership
    const sessionCheck = await query(
      'SELECT id, title FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const messages = await query(
      'SELECT id, role, content, language, timestamp FROM messages WHERE session_id = $1 ORDER BY timestamp ASC',
      [sessionId]
    );

    res.json({
      session: sessionCheck.rows[0],
      messages: messages.rows,
    });
  } catch (err) {
    console.error('[chat/history]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── DELETE /api/chat/:sessionId ───────────────────────────────────────────────

router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.json({ message: 'Session deleted successfully.' });
  } catch (err) {
    console.error('[chat/delete]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
