import type { Project } from "@/types/project";

export const categories = ["All projects", "Web Dev", "AI / ML", "Data Science", "Games", "Design", "Robotics", "Cybersecurity", "Research", "Community"] as const;
export type Category = (typeof categories)[number];

// Ignore punctuation and spaces so AI/ML, AI / ML, and ai-ml agree.
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const categoryTags: Record<Exclude<Category, "All projects">, string[]> = {
  "Web Dev": ["webdev", "webdevelopment", "web", "frontend", "backend", "fullstack", "react", "nextjs", "javascript", "typescript"],
  "AI / ML": ["aiml", "ai", "ml", "artificialintelligence", "machinelearning", "deeplearning", "llm"],
  "Data Science": ["datascience", "dataanalytics", "dataanalysis", "datavisualization"],
  Games: ["games", "game", "gaming", "gamedev", "gamedevelopment", "unity", "unreal", "godot"],
  Design: ["design", "ui", "ux", "uiux", "uidesign", "uxdesign", "figma", "graphicdesign"],
  Robotics: ["robotics", "robot", "robots"],
  Cybersecurity: ["cybersecurity", "security", "infosec"],
  Research: ["research", "academicresearch", "scientificresearch"],
  Community: ["community", "volunteering", "socialimpact", "communityservice"],
};

export function filterProjects(projects: Project[], query: string, category: Category): Project[] {
  const search = query.trim().toLowerCase();
  return projects.filter((project) => {
    const tags = project.tags ?? [];
    const matchesCategory = category === "All projects" || tags.some((tag) => categoryTags[category].includes(normalizeTag(tag)));
    const matchesQuery = !search || [project.title, project.description, project.author, ...tags].some((value) => value?.toLowerCase().includes(search));
    return matchesCategory && matchesQuery;
  });
}
