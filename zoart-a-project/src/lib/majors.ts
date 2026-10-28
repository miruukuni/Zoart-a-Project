import type { Project } from "@/types/project";

export type ProjectMajor = NonNullable<Project["major"]>;

export function majorLabel(major: { name: string; degree: string }): string {
  const name = major.name.replace(/^Major in /, "");
  return name.endsWith(`(${major.degree})`) ? name : `${name} (${major.degree})`;
}

export function projectMajors(project: Project): ProjectMajor[] {
  const majors = project.project_majors?.flatMap(link => link.major ? [link.major] : []) ?? [];
  if (project.major) majors.push(project.major);
  return [...new Map(majors.map(major => [major.id, major])).values()];
}

export function projectHasMajor(project: Project, majorId: string): boolean {
  return !majorId || project.major_id === majorId || projectMajors(project).some(major => major.id === majorId);
}
