import type { VercelRequest, VercelResponse } from "@vercel/node";

const RATE_LIMIT = 20;
const RATE_WINDOW = 60000;

const ipMap = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.reset) {
    ipMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT;
}

async function callGroq(system: string, user: string) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();

  return data?.choices?.[0]?.message?.content || "";
}

function cleanJSON(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

function parseResults(text: string) {
  try {
    const cleaned = cleanJSON(text);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }

    return [cleaned];
  } catch {
    return [text];
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    const type = body?.t;

    if (!type) {
      return res.status(400).json({ error: "Missing tool type" });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || "unknown";

    if (!rateLimit(ip)) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please slow down." });
    }

    let system = "";
    let user = "";

    if (type === "rb") {
      system =
        "You are a professional resume writer. Return exactly 3 resume bullet points as JSON array.";
      user = `Job Title: ${body.jobTitle}\nTask: ${body.task}\nOutcome: ${body.outcome}`;
    }

    if (type === "rs") {
      system =
        "You are a professional resume writer. Return 2 resume summaries as JSON array.";
      user = `Role: ${body.role}\nExperience: ${body.experience}\nSkills: ${body.skills}`;
    }

    if (type === "cl") {
      system =
        "You are a professional cover letter writer. Return a complete cover letter as JSON array with one item.";
      user = `Job Title: ${body.jobTitle}\nCompany: ${body.company}\nBackground: ${body.background}`;
    }

    if (type === "ce") {
      system =
        "You are a professional email copywriter. Return 3 cold email variations as JSON array.";
      user = `Role: ${body.role}\nTarget: ${body.target}\nMessage: ${body.message}`;
    }

    if (type === "at") {
      system =
        "You are an ATS expert. Analyze resume vs job description and return report as JSON array with one item.";
      user = `Resume:\n${body.resumeText}\n\nJob Description:\n${body.jobDescription}`;
    }

    const aiText = await callGroq(system, user);

    const results = parseResults(aiText);

    return res.status(200).json({
      results,
      remaining: 4,
    });
  } catch (err) {
    console.error("API error:", err);

    return res.status(500).json({
      error: "AI processing failed. Please try again.",
    });
  }
}
