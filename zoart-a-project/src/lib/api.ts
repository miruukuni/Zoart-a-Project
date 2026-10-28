import { supabase } from "../../lib/client";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function api<T>(path: string, options?: RequestInit & { auth?: "required" | "optional" }): Promise<T> {
  const { auth, ...request } = options ?? {};
  const headers = new Headers(request.headers);
  if (auth) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Please sign in again to continue.");
    if (auth === "required" && !data.session) throw new Error("Please sign in to continue.");
    if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...request,
    headers,
    signal: options?.signal ?? AbortSignal.timeout(55000),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const retry = response.headers.get("Retry-After");
    throw new Error(
      (typeof result.detail === "string" ? result.detail : "The request failed. Please try again.") +
      (retry ? ` Try again in ${retry} seconds.` : ""),
    );
  }
  return response.json();
}
