/**
 * src/utils/dsaClassifier.js
 *
 * Two-layer domain classifier:
 *  1. Hard-block obvious off-topic categories (medical, cooking, etc.)
 *  2. Positive DSA keyword match
 *  3. Default PASS — let the LLM system prompt handle edge cases
 *
 * Being too strict causes false negatives (valid DSA questions blocked).
 * The LLM system prompt is the final safety net for truly off-topic queries.
 */

// ── Hard-block: clearly non-DSA topics ────────────────────────────────────────
const OFF_TOPIC_PATTERNS = [
  /\b(recipe|cook|bake|ingredient|cuisine|meal|dinner|breakfast|lunch)\b/i,
  /\b(medical|doctor|diagnosis|symptom|medicine|hospital|disease|cancer|drug)\b/i,
  /\b(weather|forecast|temperature|humidity|rainfall)\b/i,
  /\b(stock market|forex|crypto price|bitcoin price|investment advice)\b/i,
  /\b(celebrity|gossip|movie review|song lyrics|horoscope|astrology)\b/i,
  /\b(relationship advice|dating|marriage|divorce)\b/i,
  /\b(political party|election results|vote for|president of)\b/i,
];

// ── Positive DSA signals ───────────────────────────────────────────────────────
const DSA_KEYWORDS = [
  // Data structures
  'array', 'string', 'linked list', 'stack', 'queue', 'deque', 'heap',
  'tree', 'binary tree', 'bst', 'trie', 'graph', 'hash', 'map', 'set',
  'matrix', 'segment tree', 'fenwick', 'priority queue', 'disjoint',
  'union find', 'adjacency',

  // Algorithms & techniques
  'algorithm', 'sort', 'search', 'bfs', 'dfs', 'dijkstra', 'bellman',
  'floyd', 'kruskal', 'prim', 'topological', 'dynamic programming',
  'memoization', 'tabulation', 'greedy', 'backtrack', 'recursion',
  'divide and conquer', 'sliding window', 'two pointer', 'prefix sum',
  'binary search', 'merge sort', 'quick sort', 'heap sort',
  'kadane', 'knapsack', 'subsequence', 'substring', 'permutation',
  'combination', 'cycle detection', 'bit manipulation', 'bitwise',

  // Complexity & patterns
  'complexity', 'big o', 'time complexity', 'space complexity',
  'o(n)', 'o(log', 'amortized', 'pattern', 'approach', 'technique',
  'optimal', 'efficient', 'brute force', 'optimize',

  // Problem-solving context
  'leetcode', 'interview', 'problem', 'implement', 'code', 'function',
  'data structure', 'algorithm', 'explain', 'what is', 'how does',
  'how to', 'difference between', 'compare', 'example of',
];

/**
 * Returns true if the query should be answered (DSA-related or ambiguous).
 * Returns false only if clearly off-topic.
 * @param {string} query
 * @returns {boolean}
 */
function isDSAQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const lower = query.toLowerCase().trim();

  // Very short or greeting-like messages → let the LLM handle politely
  if (lower.length < 4) return false;
  if (/^(hi|hello|hey|sup|yo|hii+|helo)[\s!.]*$/.test(lower)) return false;

  // Hard-block obvious off-topic
  if (OFF_TOPIC_PATTERNS.some((re) => re.test(lower))) return false;

  // Positive DSA signal — pass through
  if (DSA_KEYWORDS.some((kw) => lower.includes(kw))) return true;

  // Default: PASS and let the system prompt handle it
  // Better to let Groq politely decline than block a valid question
  return true;
}

/**
 * Friendly out-of-scope message for greetings and clear non-DSA queries.
 */
function outOfScopeMessage() {
  return (
    "Hey! I'm DSABot 👋 — I specialize in Data Structures & Algorithms. " +
    "I can help you with topics like arrays, trees, graphs, sorting, dynamic programming, " +
    "complexity analysis, and coding interview prep. What DSA topic can I help you with?"
  );
}

module.exports = { isDSAQuery, outOfScopeMessage };
