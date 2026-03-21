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

  const response = await fetch("/api/ct-process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, t: toolType }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error || "Something went wrong";
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
