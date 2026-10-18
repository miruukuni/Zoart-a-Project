import { supabase } from "./client";
import type { CreateProjectInput } from "../src/types/project";

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