import { supabase } from "./client";
import type { CreateProjectInput, Project } from "../src/types/project";
import { api } from "../src/lib/api";

// Both the legacy FK and the new join table connect projects to majors.
// Name the FK column explicitly so PostgREST never chooses between them.
const projectFields = "id,title,author,description,contact_info,tags,status,created_at,major_id,major:uci_majors!major_id(id,name,degree)";

async function readProjects(tags: string[] | undefined, signal?: AbortSignal): Promise<Project[]> {
  const timeout = AbortSignal.timeout(15000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  async function select(fields: string) {
    let request = supabase.from("projects").select(fields).order("created_at", { ascending: false });
    if (tags) request = request.overlaps("tags", tags);
    return request.abortSignal(requestSignal);
  }
  // Embed links per project, avoiding a second query that could truncate majors.
  const majors = ",project_majors!project_id(major:uci_majors!major_id(id,name,degree))";
  const variants = [`${projectFields},owner_id${majors}`, `${projectFields}${majors}`, `${projectFields},owner_id`, projectFields];
  let result = await select(variants[0]);
  for (const fields of variants.slice(1)) {
    if (!result.error || !["PGRST200", "PGRST205", "42703"].includes(result.error.code)) break;
    result = await select(fields);
  }
  if (result.error) throw result.error;
  return (result.data ?? []) as unknown as Project[];
}

export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  return readProjects(undefined, signal);
}

export async function createProject(
  input: CreateProjectInput,
): Promise<void> {
  await api("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    auth: "required",
  });
}

export async function setProjectStatus(projectId: string, status: "active" | "offline"): Promise<void> {
  await api(`/api/projects/${encodeURIComponent(projectId)}/status`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }), auth: "required",
  });
}
export async function fetchProjectsByTags(
  tagNames: string[],
  signal?: AbortSignal,
): Promise<Project[]> {
  const tags = [...new Set(tagNames.map(tag => tag.trim()).filter(Boolean))];

  if (!tags.length) return [];

  return readProjects(tags, signal);
}

