import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { outreachType, role, target, message, cta } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeLabel = outreachType === "freelance" ? "freelance pitch" : outreachType === "networking" ? "networking" : "job application";

    const systemPrompt = `You are an expert email copywriter specializing in career outreach. Generate exactly 3 different cold email variations for a ${typeLabel}. Each email should:
- Have a compelling subject line (format: "Subject: ...")
- Be 3-5 short paragraphs
- Be personalized and professional
- Include a clear call to action
- Fix any spelling errors in the input
- If fields are vague or missing, make professional assumptions

Return ONLY a JSON array of exactly 3 strings. Each string should include the subject line followed by the email body.`;

    const userPrompt = `Outreach Type: ${typeLabel}
Role/Service: ${role || "Not specified"}
Target Company/Person: ${target || "Not specified"}
Main Message: ${message || "Not specified"}
CTA Preference: ${cta || "Not specified"}`;

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
    let emails: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      emails = JSON.parse(cleaned);
    } catch {
      emails = content.split("\n\n---\n\n").filter((l: string) => l.trim().length > 0).slice(0, 3);
    }

    return new Response(JSON.stringify({ results: emails }), {
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
