import { api } from "./api";

export type LikeState = { count: number; liked: boolean };
function legacyVisitorId(): string | undefined {
  try {
    const saved = localStorage.getItem("zoart-visitor-id");
    if (saved && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved)) return saved;
  } catch { /* Storage can be disabled; account likes still work. */ }
}

export async function loadLikes(ids: string[], signal: AbortSignal, signedIn = false): Promise<Record<string, LikeState>> {
  const likes: Record<string, LikeState> = {};
  for (let start = 0; start < ids.length; start += 200) {
    const result = await api<{ likes: Record<string, LikeState>; legacy_imported?: boolean }>("/api/project_likes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_ids: ids.slice(start, start + 200), legacy_visitor_id: signedIn ? legacyVisitorId() : undefined }),
      auth: "optional",
      signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
    });
    Object.assign(likes, result.likes);
    if (result.legacy_imported) { try { localStorage.removeItem("zoart-visitor-id"); } catch {} }
  }
  return likes;
}

export function saveLike(projectId: string, liked: boolean): Promise<LikeState> {
  return api(`/api/projects/${encodeURIComponent(projectId)}/like`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liked }), auth: "required",
  });
}
