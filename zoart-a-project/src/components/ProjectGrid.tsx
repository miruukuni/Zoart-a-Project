import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/types/project";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </ul>
  );
}
