import type { Project } from "@/types/project";

/** Text matches any searchable field; a project must contain every selected tag. */
export function filterProjects(projects: Project[], query: string, selectedTags: string[]): Project[] {
  const search = query.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesSearch = [project.title, project.description, project.author, ...project.tags]
      .some((value) => value.toLowerCase().includes(search));
    const matchesTags = selectedTags.every((tag) => project.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
}
