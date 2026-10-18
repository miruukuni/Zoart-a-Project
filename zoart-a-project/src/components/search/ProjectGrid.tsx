import type { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-x-14 lg:gap-y-12">
      {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
  );
}
