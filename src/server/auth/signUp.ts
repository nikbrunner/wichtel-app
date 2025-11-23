import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      user: authData.user
    };
  });
