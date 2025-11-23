import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();

  await supabase.auth.signOut();

  return { success: true };
});
