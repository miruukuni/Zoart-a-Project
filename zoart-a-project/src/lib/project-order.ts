import type { Project } from "@/types/project";
import type { LikeState } from "./project-likes";

export const PROJECT_SORTS = [
  { value: "most-liked", label: "Most liked" },
  { value: "least-liked", label: "Least liked" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
] as const;
export type ProjectSort = typeof PROJECT_SORTS[number]["value"];

export function projectSort(value: string | null): ProjectSort {
  return PROJECT_SORTS.find(sort => sort.value === value)?.value ?? "most-liked";
}

function byAge(a: Project, b: Project, oldestFirst = false): number {
  const first = a.created_at ? Date.parse(a.created_at) : NaN;
  const second = b.created_at ? Date.parse(b.created_at) : NaN;
  // Undated legacy posts go last in either direction.
  if (!Number.isFinite(first)) return Number.isFinite(second) ? 1 : 0;
  if (!Number.isFinite(second)) return -1;
  return oldestFirst ? first - second : second - first;
}

export function sortProjects(projects: Project[], sort: ProjectSort, likes: Record<string, LikeState>): Project[] {
  return [...projects].sort((a, b) => {
    if (sort === "most-liked" || sort === "least-liked") {
      const difference = (likes[String(a.id)]?.count ?? 0) - (likes[String(b.id)]?.count ?? 0);
      if (difference) return sort === "least-liked" ? difference : -difference;
    }
    return byAge(a, b, sort === "oldest") || String(a.id).localeCompare(String(b.id));
  });
}
