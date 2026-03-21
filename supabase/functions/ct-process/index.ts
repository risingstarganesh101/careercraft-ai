import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { validateInputs } from "../_shared/validate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Internal tool configs — never exposed to client
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const toolType = String(body?.t || "").trim();
    const config = TOOL_CONFIGS[toolType];

    if (!config) {
      return new Response(JSON.stringify({ error: "Invalid request." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate & sanitize inputs
    const { valid, error, sanitized } = validateInputs(body, config.fields);
    if (!valid) {
      return new Response(JSON.stringify({ error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DB-backed per-IP rate limit (persists across cold starts)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";

    const { data: ipAllowed, error: ipError } = await supabase.rpc("check_ip_usage", { p_ip: clientIp, p_limit: 20 });
    if (ipError || !ipAllowed) {
      return new Response(JSON.stringify({ error: "You've reached your daily limit. Please try again tomorrow." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check global daily cap
    const { data: allowed, error: rpcError } = await supabase.rpc("increment_daily_usage", { max_limit: 750 });
    if (rpcError || !allowed) {
      return new Response(JSON.stringify({ error: "Service is temporarily busy. Please try again later." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build prompts internally
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Configuration error");

    const { system, user } = config.buildPrompt(sanitized);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429 || status === 402) {
        return new Response(JSON.stringify({ error: "Service is temporarily busy. Please try again later." }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Processing failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let results: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      results = JSON.parse(cleaned);
    } catch {
      results = content.split("\n\n").filter((l: string) => l.trim().length > 0).slice(0, config.resultCount);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Processing error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
