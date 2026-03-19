import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateInputs, checkRateLimit } from "../_shared/validate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!checkRateLimit(req).allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { valid, error, sanitized } = validateInputs(body, ["role", "experience", "skills", "industry", "objective"]);
    if (!valid) {
      return new Response(JSON.stringify({ error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { role, experience, skills, industry, objective } = sanitized;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert resume writer. Generate exactly 2 professional resume summary paragraphs. Each should be 2-4 sentences, compelling, and tailored to the user's background.
- Fix any spelling errors in the input
- If fields are vague or missing, make professional assumptions
- Each summary should have a slightly different angle (e.g., results-focused vs skills-focused)

Return ONLY a JSON array of exactly 2 strings.`;

    const userPrompt = `Job Role: ${role || "Professional"}
Years of Experience: ${experience || "Not specified"}
Key Skills: ${skills || "Not specified"}
Industry: ${industry || "Not specified"}
Career Objective: ${objective || "Not specified"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    let summaries: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summaries = JSON.parse(cleaned);
    } catch {
      summaries = content.split("\n\n").filter((l: string) => l.trim().length > 0).slice(0, 2);
    }

    return new Response(JSON.stringify({ results: summaries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
