export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
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
