import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  // For Vercel serverless functions, use non-prefixed env vars
  // For local dev with Vite, use VITE_ prefixed vars
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

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
