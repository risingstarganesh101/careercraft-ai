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
        temperature: 0.6,
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
      return parsed.map((item: any) => {
        if (typeof item === "string") return item;
        if (item.bullet) return item.bullet;
        if (item.text) return item.text;
        return JSON.stringify(item);
      });
    }

    return [cleaned];
  } catch {
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^[-•\d.]\s*/, ""));
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

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
      system = `
You are a senior resume writer with 15 years of hiring experience.

Generate EXACTLY 3 strong resume bullet points.

Rules:
- Start each bullet with a powerful action verb
- 1–2 lines maximum
- Include measurable impact when possible
- Do NOT include explanations
- Return ONLY a JSON array of strings

Example:
[
"Led social media campaigns that increased revenue by 15% through targeted audience engagement.",
"Analyzed marketing performance data to optimize campaigns and boost ROI by 20%.",
"Collaborated with cross-functional teams to launch growth initiatives improving customer acquisition."
]
`;

      user = `Job Title: ${body.jobTitle}
Task: ${body.task}
Outcome: ${body.outcome}`;
    }

    if (type === "rs") {
      system = `
You are an expert resume writer.

Write 2 powerful resume summary paragraphs.

Rules:
- 2–3 sentences each
- Professional and concise
- Highlight strengths and achievements
- Return ONLY a JSON array with 2 strings.
`;

      user = `Role: ${body.role}
Experience: ${body.experience}
Skills: ${body.skills}`;
    }

    if (type === "cl") {
      system = `
You are a professional cover letter writer.

Write a tailored cover letter.

Rules:
- 3–4 paragraphs
- Professional tone
- Personalized to the job
- Return ONLY a JSON array with one string.
`;

      user = `Job Title: ${body.jobTitle}
Company: ${body.company}
Background: ${body.background}`;
    }

    if (type === "ce") {
      system = `
You are a professional email copywriter.

Generate 3 cold email variations.

Rules:
- Short and persuasive
- Include a clear CTA
- Return ONLY a JSON array of 3 strings.
`;

      user = `Role: ${body.role}
Target: ${body.target}
Message: ${body.message}`;
    }

    if (type === "at") {
      system = `
You are an ATS resume analyzer.

Analyze the resume against the job description.

Return ONLY a JSON array with one string containing:

ATS Score
Missing Keywords
Improvement Suggestions
Optimized Resume Version
`;

      user = `Resume:
${body.resumeText}

Job Description:
${body.jobDescription}`;
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
