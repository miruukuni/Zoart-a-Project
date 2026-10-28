import { supabase } from "./client";
import type { CreateProjectInput, Project } from "../src/types/project";
import { api } from "../src/lib/api";

const projectFields = "id,title,author,description,contact_info,tags,status,created_at,major_id,major:uci_majors(id,name,degree)";

export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  const request = supabase
    .from("projects")
    .select(projectFields)
    .order("created_at", { ascending: false });
  const timeout = AbortSignal.timeout(15000);
  const { data, error } = await request.abortSignal(
    signal ? AbortSignal.any([signal, timeout]) : timeout,
  );
  if (error) throw error;
  return (data ?? []) as unknown as Project[];
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

  const request = supabase
    .from("projects")
    .select(projectFields)
    .overlaps("tags", tags)
    .order("created_at", { ascending: false });

  const timeout = AbortSignal.timeout(15000);
  const { data, error } = await request.abortSignal(
    signal ? AbortSignal.any([signal, timeout]) : timeout,
  );

  if (error) throw error;
  return (data ?? []) as unknown as Project[];
}

