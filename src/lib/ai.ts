import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Client-side throttle: minimum 3s between AI calls
let lastCallTime = 0;
const THROTTLE_MS = 3000;

// Internal tool type mapping — keeps function names opaque
const TOOL_MAP: Record<string, string> = {
  "generate-resume-bullets": "rb",
  "generate-resume-summary": "rs",
  "generate-cover-letter": "cl",
  "generate-cold-email": "ce",
  "ats-analyzer": "at",
};

export interface AIResponse {
  results: string[];
  remaining: number;
}

export async function callAI(toolName: string, body: Record<string, unknown>): Promise<AIResponse> {
  // Throttle rapid requests
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < THROTTLE_MS) {
    const waitMsg = "Please wait a moment before generating again.";
    toast({ title: "Slow down", description: waitMsg });
    throw new Error(waitMsg);
  }
  lastCallTime = Date.now();

  const toolType = TOOL_MAP[toolName];
  if (!toolType) throw new Error("Unknown tool");

  const { data, error } = await supabase.functions.invoke("ct-process", {
    body: { ...body, t: toolType },
  });

  if (error) {
    const msg = error.message || "Something went wrong";
    toast({ title: "Error", description: msg, variant: "destructive" });
    throw new Error(msg);
  }

  if (data?.error) {
    toast({ title: "Error", description: data.error, variant: "destructive" });
    throw new Error(data.error);
  }

  return {
    results: data?.results || [],
    remaining: typeof data?.remaining === "number" ? data.remaining : 0,
  };
}
