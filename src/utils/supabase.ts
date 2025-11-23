import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value
        }));
      },
      setAll(cookies) {
        cookies.forEach(cookie => {
          setCookie(cookie.name, cookie.value);
        });
      }
    }
  });
}
