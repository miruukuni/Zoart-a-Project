import { api } from "./api";

export type LikeState = { count: number; liked: boolean };
let visitor: string | undefined;

function visitorId(): string {
  if (visitor) return visitor;
  try {
    const saved = localStorage.getItem("zoart-visitor-id");
    visitor = saved && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved) ? saved : crypto.randomUUID();
    localStorage.setItem("zoart-visitor-id", visitor);
  } catch {
    visitor = crypto.randomUUID();
  }
  return visitor;
}

export async function loadLikes(ids: string[], signal: AbortSignal): Promise<Record<string, LikeState>> {
  const likes: Record<string, LikeState> = {};
  for (let start = 0; start < ids.length; start += 200) {
    const result = await api<{ likes: Record<string, LikeState> }>("/api/project_likes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_ids: ids.slice(start, start + 200), visitor_id: visitorId() }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
    });
    Object.assign(likes, result.likes);
  }
  return likes;
}

export function saveLike(projectId: string, liked: boolean): Promise<LikeState> {
  return api(`/api/projects/${encodeURIComponent(projectId)}/like`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liked, visitor_id: visitorId() }),
  });
}
