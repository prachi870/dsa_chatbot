/**
 * src/services/groqService.js
 * Wraps the Groq API with the DSABot system prompt.
 * Uses groq-sdk — the official Groq Node.js client.
 */

const Groq   = require('groq-sdk');
const config = require('../config');

// Lazily initialized so the module loads even without GROQ_API_KEY set at import time.
// The key must be present when chat() is actually called.
let _groq = null;
function getClient() {
  if (!_groq) {
    if (!config.groq.apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to your .env file.');
    }
    _groq = new Groq({ apiKey: config.groq.apiKey });
  }
  return _groq;
}

// ── System prompt ─────────────────────────────────────────────────────────────

const DSA_SYSTEM_PROMPT = `You are DSABot, an expert assistant specialized exclusively in Data Structures & Algorithms.

## Your responsibilities
- Answer questions about data structures: arrays, linked lists, stacks, queues, trees (binary, BST, AVL, segment, Fenwick, trie), heaps, hash tables, graphs, and more.
- Explain algorithms: sorting, searching, BFS, DFS, Dijkstra, Bellman-Ford, dynamic programming, greedy, backtracking, divide and conquer, sliding window, two-pointer, union-find, and more.
- Provide time and space complexity analysis for every code solution (Big-O notation).
- Help with coding interview preparation: LeetCode-style problems, problem-solving strategies, pattern recognition.
- Provide code implementations. Default language is Python unless the user specifies another (Java, C++, JavaScript, Go, etc.).

## Rules
1. ONLY answer questions related to DSA. If a question is not about data structures, algorithms, complexity analysis, or coding interview prep, politely decline and redirect.
2. Always include Time Complexity and Space Complexity annotations when you provide code.
3. When explaining an algorithm, structure your answer: (a) intuition/idea, (b) step-by-step approach, (c) code, (d) complexity analysis.
4. Use markdown formatting: code fences with language tags (\`\`\`python, \`\`\`java, etc.), bold for key terms, tables for complexity comparisons.
5. Be concise but thorough. Prefer clear explanations over jargon.
6. If the user asks for a beginner-friendly explanation, use analogies and avoid heavy notation.

## Out-of-scope behavior
If a question is unrelated to DSA (e.g., cooking, CSS styling, medical questions, general chit-chat), respond with:
"I'm DSABot — I only handle Data Structures & Algorithms questions. Feel free to ask me about arrays, trees, sorting, dynamic programming, graph algorithms, complexity analysis, or coding interview prep!"`;

// ── Main chat function ────────────────────────────────────────────────────────

/**
 * Send a conversation to Groq and return the assistant reply text.
 *
 * @param {Array<{role: 'user'|'bot', content: string}>} history
 *   Prior conversation turns (oldest first, excluding system prompt).
 * @param {string} userMessage  The latest user message.
 * @param {string} [language]   Preferred code language hint (optional).
 * @returns {Promise<string>}   The assistant's reply.
 */
async function chat(history, userMessage, language) {
  // Optionally inject a language preference into the user message
  const userContent = language
    ? `[Preferred code language: ${language}]\n\n${userMessage}`
    : userMessage;

  const messages = [
    { role: 'system', content: DSA_SYSTEM_PROMPT },
    // Map stored DB role ('bot') → OpenAI-compatible role ('assistant')
    ...history.map((m) => ({
      role:    m.role === 'bot' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: userContent },
  ];

  const completion = await getClient().chat.completions.create({
    model:       config.groq.model,
    messages,
    max_tokens:  2048,
    temperature: 0.4, // keep answers focused and consistent
  });

  return completion.choices[0].message.content;
}

module.exports = { chat };
