import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Client-side throttle: minimum 3s between AI calls
let lastCallTime = 0;
const THROTTLE_MS = 3000;

export async function callAI(functionName: string, body: Record<string, unknown>): Promise<string[]> {
  // Throttle rapid requests
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < THROTTLE_MS) {
    const waitMsg = "Please wait a moment before generating again.";
    toast({ title: "Slow down", description: waitMsg });
    throw new Error(waitMsg);
  }
  lastCallTime = Date.now();

  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    const msg = error.message || "Something went wrong";
    toast({ title: "Error", description: msg, variant: "destructive" });
    throw new Error(msg);
  }

  if (data?.error) {
    toast({ title: "Error", description: data.error, variant: "destructive" });
    throw new Error(data.error);
  }

  return data?.results || [];
}
