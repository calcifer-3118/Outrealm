const memoryStore = new Map();
const TOKEN_EXPIRY = 2 * 60 * 1000; // 2 minutes

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    // Preflight request
    return res.status(204).end();
  }

  if (req.method === "POST") {
    try {
      // Ensure req.body is parsed JSON (Vercel automatically parses JSON for you)
      const token = Math.random().toString(36).substr(2, 10);
      memoryStore.set(token, { data: req.body, timestamp: Date.now() });

      return res.status(200).json({ token });
    } catch (e) {
      return res.status(500).json({ error: "Failed to store state" });
    }
  }

  if (req.method === "GET") {
    const { token } = req.query;

    if (!token || !memoryStore.has(token)) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    const entry = memoryStore.get(token);
    const age = Date.now() - entry.timestamp;

    if (age > TOKEN_EXPIRY) {
      memoryStore.delete(token);
      return res.status(410).json({ error: "Token expired" });
    }

    memoryStore.delete(token);
    return res.status(200).json(entry.data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
