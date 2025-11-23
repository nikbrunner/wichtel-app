import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  // For Vercel serverless functions, use non-prefixed env vars (runtime)
  // For local dev with Vite, use VITE_ prefixed vars (build-time)
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  // Logging for debugging deployment issues
  console.log("[Supabase Client] Environment check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlSource: process.env.SUPABASE_URL
      ? "SUPABASE_URL"
      : import.meta.env.VITE_SUPABASE_URL
        ? "VITE_SUPABASE_URL (import.meta)"
        : process.env.VITE_SUPABASE_URL
          ? "VITE_SUPABASE_URL (process.env)"
          : "none",
    urlPrefix: supabaseUrl?.substring(0, 30) + "...",
    keyPrefix: supabaseKey?.substring(0, 20) + "..."
  });

  if (!supabaseUrl || !supabaseKey) {
    const error = new Error(
      `Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
    );
    console.error("[Supabase Client] Error:", error);
    throw error;
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
