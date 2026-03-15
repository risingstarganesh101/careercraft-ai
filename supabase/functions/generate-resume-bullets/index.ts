import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobTitle, task, outcome, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert resume writer. Generate exactly 3 professional resume bullet points based on the user's input. Each bullet should:
- Start with a strong action verb
- Be concise (1-2 lines)
- Include quantifiable results when possible
- Match the requested tone: ${tone || "standard"}
- If the input has spelling errors, interpret the intended meaning and use correct spelling
- If the input is vague, make reasonable professional assumptions and generate strong bullets anyway
- If outcome is missing, infer a plausible positive outcome

Return ONLY a JSON array of exactly 3 strings, no other text.`;

    const userPrompt = `Job Title: ${jobTitle || "Professional"}
Task Performed: ${task || "General responsibilities"}
Outcome/Result: ${outcome || "Not specified - infer a plausible result"}
Tone: ${tone || "standard"}`;

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
    
    let bullets: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      bullets = JSON.parse(cleaned);
    } catch {
      bullets = content.split("\n").filter((l: string) => l.trim().length > 0).slice(0, 3);
    }

    return new Response(JSON.stringify({ results: bullets }), {
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
