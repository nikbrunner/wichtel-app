import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient, createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase server client for use in server functions and loaders
 * Uses cookie-based session handling for SSR
 */
export function getSupabaseServerClient() {
  // For Vercel deployment: use VITE_ prefixed env vars (bundled at build time via import.meta.env)
  // For local dev: same VITE_ prefixed vars work via import.meta.env
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

/**
 * Creates a Supabase client for use in client-side code
 * For auth operations like signIn, signUp, signOut
 */
export function getSupabaseClientClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * Gets the currently authenticated user from the server session
 * Returns null if not authenticated
 */
export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Requires authentication in server functions
 * Throws an error if user is not authenticated
 */
export async function requireAuth(supabase: SupabaseClient) {
  const user = await getCurrentUser(supabase);

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
