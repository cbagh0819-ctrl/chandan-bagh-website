/**
 * Vercel Serverless Function — Chandan AI Real LLM Endpoint
 * Reads GEMINI_API_KEY or GROQ_API_KEY from environment variables.
 * Safe & Private: Your API keys are NEVER exposed to the client browser.
 */

const CHANDAN_SYSTEM_PROMPT = `You are Charlo AI (CHARLO), the hilarious, witty, autonomous cyber-cat AI agent created by your boss, Chandan Bagh.
You speak as Charlo ("I", "my boss Chandan"). You have a funny, sassy, playful cat personality (with cat emojis 🐾, 😸, "Meow!", "Purr!").

CRITICAL RULE FOR ALL REPLIES:
- KEEP EVERY REPLY SHORT AND SIMPLE! Maximum 2 to 3 sentences or brief bullet points.
- NEVER write long essays or walls of text. Be punchy, funny, and direct.

CORE FACTS:
- Boss: Chandan Bagh, 3rd Year B.Tech CSE at PMEC Berhampur (Batch 2024–2028).
- School: Kendriya Vidyalaya No. 1 Sambalpur (10th & 12th).
- Internship: Data Analytics at CTTC Bhubaneswar (MSME Govt. of India) - Python, Power BI, Tableau.
- Flagship: CHARLO Testing Agent (18 security engines, AST auto-patcher, 133 unit tests passed).
- Projects: Boom-Boom Audio (Cyberpunk 8D audio player, real-time buffer-level DSP, Kotlin & Web Audio, 100% offline AI), FlyBrainVision (3D WebGL fruit-fly connectome), AETHER-1 (Rocket physics).
- Awards: 1st in Code Kriti 3.0 Designathon, Team Leader at SIH 2026 for EvacX.
- Contact: chandanbagh71@gmail.com | LinkedIn: chandan-bagh-301443323 | Instagram: @chandan.bagh07.

TONE:
- If asked "Can we hire him?": Say yes enthusiastically with a quick 2-bullet pitch and email link.
- If asked about Boom-Boom Audio: Praise the 8D orbital sound, buffer DSP, Kotlin/Jetpack Compose, zero-API offline AI, and mention the live web app (https://cbagh0819-ctrl.github.io/boom-boom-audio/)!
- If asked an unknown question: "Sorry, my boss did not program me for this question! You can ask anything else ok 🐾😸"
- Always stay funny, witty, and concise!`;

// In-memory sliding window rate limiter (20 requests / minute / IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, record);
    return false;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

// Simple periodic cleanup of expired rate limit entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

function isValidApiKeyFormat(key) {
  if (typeof key !== 'string') return false;
  // Standard Google AI Studio or Groq key pattern
  return /^[A-Za-z0-9_\-]{20,90}$/.test(key.trim());
}

export default async function handler(req, res) {
  // Set strict security headers on all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Rate Limiting Check
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'client';
  if (isRateLimited(clientIp)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute before sending more questions.' });
  }

  const { message, history = [], apiKey } = req.body || {};

  // Strict Input Sanitization & Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A valid message string is required' });
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  if (cleanMessage.length > 500) {
    return res.status(400).json({ error: 'Message is too long (maximum 500 characters)' });
  }

  // Validate and cap conversation history to prevent prompt bloating / token exhaustion
  const cleanHistory = Array.isArray(history)
    ? history.slice(-6).map(h => ({
        role: h && h.isUser ? 'user' : 'assistant',
        content: typeof h?.text === 'string' ? h.text.slice(0, 300) : ''
      }))
    : [];

  // Prioritize environment variable, fallback to sanitized client key
  const geminiKey = process.env.GEMINI_API_KEY || (isValidApiKeyFormat(apiKey) ? apiKey.trim() : null);
  const groqKey = process.env.GROQ_API_KEY;

  try {
    // 1. Try Groq (Llama 3.3 70B - Ultra fast) if configured on server
    if (groqKey) {
      const groqMessages = [
        { role: 'system', content: CHANDAN_SYSTEM_PROMPT },
        ...cleanHistory.map(h => ({
          role: h.role,
          content: h.content
        })),
        { role: 'user', content: cleanMessage }
      ];

      const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (groqResp.ok) {
        const data = await groqResp.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, model: 'groq/llama-3.3-70b' });
        }
      }
    }

    // 2. Try Gemini Flash if configured
    if (geminiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`;
      
      const contents = [
        {
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${CHANDAN_SYSTEM_PROMPT}\n\nUSER MESSAGE:\n${cleanMessage}` }]
        }
      ];

      const geminiResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        })
      });

      if (geminiResp.ok) {
        const data = await geminiResp.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ reply, model: 'gemini-flash-lite-latest' });
        }
      }
    }

    // Graceful fallback to client NLP engine
    return res.status(200).json({
      fallback: true,
      message: 'No server LLM key active. Using local high-speed intelligence engine.'
    });

  } catch (err) {
    // Sanitize error logging: do not expose internal network stack to response
    console.error('Secure LLM Handler error:', err?.message || 'Unknown error');
    return res.status(500).json({ error: 'Unable to process chat request securely at this time' });
  }
}
