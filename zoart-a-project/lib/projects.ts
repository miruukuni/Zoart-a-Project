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
  let result = await select(`${projectFields},project_majors!project_id(major:uci_majors!major_id(id,name,degree))`);
  if (result.error && ["PGRST200", "PGRST205"].includes(result.error.code)) {
    // Preserve the existing single-major display until the upgrade is applied.
    result = await select(projectFields);
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

