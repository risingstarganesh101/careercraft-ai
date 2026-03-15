import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function callAI(functionName: string, body: Record<string, unknown>): Promise<string[]> {
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
