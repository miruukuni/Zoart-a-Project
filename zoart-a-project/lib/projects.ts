import { supabase } from "./client";
import type { CreateProjectInput, Project } from "../src/types/project";

export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  const request = supabase
    .from("projects")
    .select("id,title,author,description,contact_info,tags,status,created_at")
    .order("created_at", { ascending: false });
  const timeout = AbortSignal.timeout(15000);
  const { data, error } = await request.abortSignal(
    signal ? AbortSignal.any([signal, timeout]) : timeout,
  );
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function createProject(
  input: CreateProjectInput,
): Promise<void> {
  const { error } = await supabase.from("projects").insert({
    title: input.title,
    author: input.author,
    description: input.description,
    contact_info: input.contact_info,
    tags: input.tags,
  });

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}
