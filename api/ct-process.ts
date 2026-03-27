import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// ── Input validation ────────────────────────────────────────────────────────
const MAX_FIELD_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 8000;

function sanitize(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, MAX_FIELD_LENGTH);
}

function validateInputs(body: Record<string, unknown>, fields: string[]) {
  const sanitized: Record<string, string> = {};
  let totalLength = 0;
  for (const field of fields) {
    const clean = sanitize(body[field]);
    sanitized[field] = clean;
    totalLength += clean.length;
  }
  if (totalLength > MAX_TOTAL_LENGTH) {
    return { valid: false as const, error: "Input too long. Please shorten your text and try again.", sanitized };
  }
  if (totalLength === 0) {
    return { valid: false as const, error: "Please provide at least some input.", sanitized };
  }
  return { valid: true as const, sanitized };
}

// ── Tool configs ────────────────────────────────────────────────────────────
const TOOL_CONFIGS: Record<string, {
  fields: string[];
  buildPrompt: (s: Record<string, string>) => { system: string; user: string };
  resultCount: number;
}> = {
  rb: {
    fields: ["jobTitle", "task", "outcome", "tone"],
    resultCount: 3,
    buildPrompt: (s) => ({
      system: `You are an expert resume writer. Generate exactly 3 professional resume bullet points. Each bullet should start with a strong action verb, be concise (1-2 lines), include quantifiable results when possible, and match the tone: ${s.tone || "standard"}. Fix spelling errors. If input is vague, make professional assumptions. Return ONLY a JSON array of exactly 3 strings, no other text.`,
      user: `Job Title: ${s.jobTitle || "Professional"}\nTask: ${s.task || "General responsibilities"}\nOutcome: ${s.outcome || "Not specified"}\nTone: ${s.tone || "standard"}`,
    }),
  },
  rs: {
    fields: ["role", "experience", "skills", "industry", "objective"],
    resultCount: 2,
    buildPrompt: (s) => ({
      system: `You are an expert resume writer. Generate exactly 2 professional resume summary paragraphs. Each should be 2-4 sentences, compelling, and tailored. Fix spelling errors. If fields are vague, make professional assumptions. Each summary should have a different angle. Return ONLY a JSON array of exactly 2 strings.`,
      user: `Role: ${s.role || "Professional"}\nExperience: ${s.experience || "Not specified"}\nSkills: ${s.skills || "Not specified"}\nIndustry: ${s.industry || "Not specified"}\nObjective: ${s.objective || "Not specified"}`,
    }),
  },
  cl: {
    fields: ["jobTitle", "company", "background", "achievements", "interest"],
    resultCount: 1,
    buildPrompt: (s) => ({
      system: `You are an expert cover letter writer. Generate a complete, professional cover letter (3-4 paragraphs). Tailor to the job and company. Highlight experience and achievements. Fix spelling errors. If fields are vague, make assumptions. End with a strong closing. Return ONLY a JSON array with exactly 1 string.`,
      user: `Job Title: ${s.jobTitle || "Not specified"}\nCompany: ${s.company || "Not specified"}\nBackground: ${s.background || "Not specified"}\nAchievements: ${s.achievements || "Not specified"}\nInterest: ${s.interest || "Not specified"}`,
    }),
  },
  ce: {
    fields: ["outreachType", "role", "target", "message", "cta"],
    resultCount: 3,
    buildPrompt: (s) => {
      const typeLabel = s.outreachType === "freelance" ? "freelance pitch" : s.outreachType === "networking" ? "networking" : "job application";
      return {
        system: `You are an expert email copywriter. Generate exactly 3 cold email variations for a ${typeLabel}. Each should have a subject line (format: "Subject: ..."), be 3-5 short paragraphs, personalized and professional with a clear CTA. Fix spelling errors. Return ONLY a JSON array of exactly 3 strings.`,
        user: `Type: ${typeLabel}\nRole: ${s.role || "Not specified"}\nTarget: ${s.target || "Not specified"}\nMessage: ${s.message || "Not specified"}\nCTA: ${s.cta || "Not specified"}`,
      };
    },
  },
  at: {
    fields: ["resumeText", "jobDescription"],
    resultCount: 1,
    buildPrompt: (s) => ({
      system: `You are an expert ATS (Applicant Tracking System) analyst and resume consultant. Analyze the resume against the job description and produce a comprehensive report. Return ONLY a JSON array with exactly 1 string. The string must contain the full report formatted as follows:

## ATS SCORE: [X/100]

### Missing Keywords
- [list each missing keyword or phrase from the job description]

### Improvement Suggestions
- [list 4-6 specific actionable suggestions]

### Optimized Resume (Optional Rewrite)
[Provide a rewritten version of the resume optimized for this specific job description, incorporating missing keywords naturally]`,
      user: `RESUME:\n${s.resumeText}\n\nJOB DESCRIPTION:\n${s.jobDescription}`,
    }),
  },
};

// ── In-memory rate limiter (per serverless instance) ─────────────────────────
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// ── Gemini API call with retry ──────────────────────────────────────────────
async function callGemini(apiKey: string, system: string, user: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: { temperature: 0.7 },
  };
  const opts: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  let response = await fetch(url, opts);

  // Retry once on 429
  if (response.status === 429) {
    console.warn("Gemini 429 — retrying in 2s…");
    await new Promise((r) => setTimeout(r, 2000));
    response = await fetch(url, opts);
  }

  return response;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body;
    const toolType = String(body?.t || "").trim();
    const config = TOOL_CONFIGS[toolType];

    if (!config) {
      return res.status(400).json({ error: "Invalid request." });
    }

    const { valid, error, sanitized } = validateInputs(body, config.fields);
    if (!valid) {
      return res.status(400).json({ error });
    }

    // Client IP
    const forwarded = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwarded === "string"
        ? forwarded.split(",")[0]?.trim()
        : Array.isArray(forwarded)
          ? forwarded[0]
          : null) || "unknown";

    // In-memory rate limit
    if (!checkMemoryRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests. Please slow down.", remaining: 0 });
    }

    // ── Optional Supabase rate limiting (never crashes the request) ─────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let remaining = 4;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Per-IP daily limit
        try {
          const { data: ipRemaining, error: ipErr } = await supabase.rpc("check_ip_usage", {
            p_ip: clientIp,
            p_limit: 5,
          });
          if (!ipErr && typeof ipRemaining === "number") {
            remaining = ipRemaining;
            if (remaining < 0) {
              return res.status(429).json({
                error: "You've reached your daily limit. Please try again tomorrow.",
                remaining: 0,
              });
            }
          } else {
            console.warn("check_ip_usage failed (non-fatal):", ipErr?.message);
          }
        } catch (e) {
          console.warn("check_ip_usage exception (non-fatal):", e);
        }

        // Global daily cap
        try {
          const { data: allowed, error: capErr } = await supabase.rpc("increment_daily_usage", {
            max_limit: 750,
          });
          if (capErr) {
            console.warn("increment_daily_usage failed (non-fatal):", capErr.message);
          } else if (allowed === false) {
            return res.status(429).json({
              error: "Service has reached its daily capacity. Please try again tomorrow.",
              remaining: 0,
            });
          }
        } catch (e) {
          console.warn("increment_daily_usage exception (non-fatal):", e);
        }
      } catch (e) {
        console.warn("Supabase client init failed (non-fatal):", e);
      }
    }

    // ── Gemini API call ─────────────────────────────────────────────────────
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error." });
    }

    const { system, user } = config.buildPrompt(sanitized);

    let geminiResponse: Response;
    try {
      geminiResponse = await callGemini(GEMINI_API_KEY, system, user);
    } catch (err) {
      console.error("Gemini network error:", err);
      return res.status(502).json({ error: "Could not reach AI service. Please try again." });
    }

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text().catch(() => "");
      console.error(`Gemini API ${geminiResponse.status}:`, errBody);

      if (geminiResponse.status === 429) {
        return res.status(429).json({ error: "AI service is busy. Please try again in a moment." });
      }
      return res.status(502).json({ error: "AI service returned an error. Please try again." });
    }

    // ── Parse response ──────────────────────────────────────────────────────
    const resultData = await geminiResponse.json();
    const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Gemini returned empty/malformed response:", JSON.stringify(resultData).slice(0, 500));
      return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    }

    let results: string[];
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      results = Array.isArray(parsed) ? parsed.map(String) : [rawText];
    } catch {
      // Fallback: return raw text as single result
      results = [rawText];
    }

    return res.status(200).json({ results, remaining });
  } catch (err) {
    console.error("Unhandled error in /api/ct-process:", err);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
}
