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

let exchange: { code: string; flowId?: string; result: ReturnType<typeof supabase.auth.exchangeCodeForSession> } | undefined;
export function finishSignIn(code: string, flowId?: string) {
  // Deduplicate only in flight: a consumed code must never appear valid after logout.
  if (exchange?.code !== code || exchange?.flowId !== flowId) {
    const result = supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    exchange = { code, flowId, result };
    const clear = () => { if (exchange?.result === result) exchange = undefined; };
    void result.then(clear, clear);
  }
  return exchange.result;
}

export type AuthCallback = { kind: "code"; code: string; flowId?: string } | { kind: "email"; tokenHash: string } | { kind: "error"; message: string };
export function readAuthCallback(search: string, hash: string): AuthCallback {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  if (query.has("error") || fragment.has("error")) {
    const code = query.get("error_code") ?? fragment.get("error_code");
    return { kind: "error", message: code === "otp_expired" ? "This older email link was used or expired. Return to sign in and continue with Google." : "Google sign-in was cancelled or couldn’t be completed. Return to sign in and try again." };
  }
  const tokenHash = query.get("token_hash");
  if (tokenHash && query.get("type") === "email") return { kind: "email", tokenHash };
  const code = query.get("code");
  if (code) {
    const flowId = query.get("sb_flow_id") ?? undefined;
    if (flowId && !/^[a-zA-Z0-9_-]{8,64}$/.test(flowId)) return { kind: "error", message: "This sign-in attempt is incomplete. Return to sign in and start again." };
    return { kind: "code", code, flowId };
  }
  return { kind: "error", message: "This address is missing sign-in details. Return to sign in and continue with Google." };
}

export function startGoogleSignIn(origin: string, next: string | null) {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeReturnPath(next));
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), scopes: "openid email profile", queryParams: { prompt: "select_account" } },
  });
}

export function googleSignInError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (["provider_disabled", "oauth_provider_not_supported"].includes(code)) return "Google sign-in is not available yet. Please try again later.";
  if (["bad_code_verifier", "pkce_code_verifier_not_found", "flow_state_expired", "flow_state_not_found", "otp_expired"].includes(code)) return "This sign-in attempt expired or belongs to another browser. Start Google sign-in again in this browser.";
  return "Couldn’t complete Google sign-in. Please try again.";
}

export function signInError(error: unknown, verifying = false): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "email_address_not_authorized") return "The site's email sender isn't configured for this address yet. Contact the site owner.";
  if (code === "over_email_send_rate_limit") return "The site's email sending limit has been reached. Wait before requesting another email.";
  if (code === "over_request_rate_limit") return "Too many attempts. Wait a minute before trying again.";
  if (code === "email_provider_disabled" || code === "signup_disabled") return "Email sign-in or new accounts are currently disabled. Contact the site owner.";
  if (["otp_expired", "flow_state_expired", "flow_state_not_found"].includes(code)) return "This older email link or code was used or expired. Return to sign in and continue with Google.";
  if (["bad_code_verifier", "pkce_code_verifier_not_found"].includes(code)) return "This sign-in belongs to another browser. Return to sign in and start Google sign-in in this browser.";
  return verifying ? "Couldn't verify this older email link. Return to sign in and continue with Google." : "Couldn't send the sign-in email. Check your address and connection, then try again shortly.";
}

export async function googleAvailable(signal: AbortSignal): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" }, cache: "no-store", signal,
  });
  if (!response.ok) throw new Error("Could not check sign-in availability");
  return (await response.json()).external?.google === true;
}
