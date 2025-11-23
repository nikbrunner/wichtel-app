import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null };
  }

  return { user };
});
