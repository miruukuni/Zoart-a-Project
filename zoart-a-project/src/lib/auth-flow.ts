import { supabase } from "../../lib/client";

export function safeReturnPath(value: string | null): string {
  // Keep OAuth/email redirects inside the app, including encoded-slash cases.
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/search";
  try {
    const parsed = new URL(value, "https://zoart.invalid");
    if (parsed.origin !== "https://zoart.invalid" || !["/", "/search"].includes(parsed.pathname)) return "/search";
    return parsed.pathname + parsed.search + parsed.hash;
  } catch { return "/search"; }
}

let exchange: { code: string; result: ReturnType<typeof supabase.auth.exchangeCodeForSession> } | undefined;
export function finishSignIn(code: string) {
  // Strict Mode and repeated renders must not redeem the same one-use code twice.
  if (exchange?.code !== code) exchange = { code, result: supabase.auth.exchangeCodeForSession(code) };
  return exchange.result;
}

export async function googleAvailable(signal: AbortSignal): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" }, signal,
  });
  if (!response.ok) return false;
  return (await response.json()).external?.google === true;
}
