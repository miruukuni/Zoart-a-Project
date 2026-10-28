import type { Project } from "@/types/project";
import { majorLabel } from "@/lib/majors";

const chipColors = ["bg-[#FFB100]", "bg-[#F194B4]", "bg-[#00ADA5]"];

export default function ProjectCard({ project }: { project: Project }) {
  const tags = project.tags ?? [];

  return (
    <article className="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-b-[2.5rem] border-[3px] border-[#111111] bg-white">
      <header className="flex min-h-16 min-w-0 items-center border-b-[3px] border-[#111111] bg-[#00ADA5] px-3.5 py-3 sm:px-4">
        <h2 className="min-w-0 text-[32px] font-normal leading-tight [overflow-wrap:anywhere] lg:text-4xl">
          {project.title || "Untitled project"}
        </h2>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-2.5 sm:gap-4 sm:p-3">
        {project.major && <p className="rounded-md border-2 border-[#111111] bg-[#ffebc4] px-2 py-1.5 text-xs font-bold">UCI major: {majorLabel(project.major)}</p>}
        {tags.length > 0 && (
          <ul aria-label="Project tags" className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
            {tags.map((tag, index) => (
              <li key={`${tag}-${index}`} className={`max-w-full rounded-md border-2 border-[#111111] px-2 py-1.5 text-xs font-bold leading-4 [overflow-wrap:anywhere] ${chipColors[index % chipColors.length]}`}>
                {tag}
              </li>
            ))}
          </ul>
        )}

        <section className="flex min-h-48 min-w-0 flex-1 flex-col rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4 lg:min-h-52 lg:p-5">
          <h3 className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px]">About</h3>
          <div role="region" aria-label="Project description" tabIndex={0} className="max-h-48 min-w-0 overflow-y-auto overscroll-contain rounded-sm font-[family-name:var(--font-search-inter)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]">
            <p className="mb-3 text-sm font-bold [overflow-wrap:anywhere]">By {project.author || "Anonymous"}</p>
            <p className="whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere]">
              {project.description || "No description provided."}
            </p>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] px-4 py-3 lg:px-5">
          <h3 className="mb-2 text-[28px] font-normal leading-tight sm:text-[32px]">Contact</h3>
          <p tabIndex={0} aria-label="Project contact information" className="max-h-24 min-w-0 overflow-y-auto overscroll-contain whitespace-pre-wrap rounded-sm font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]">
            {project.contact_info || "No contact information provided."}
          </p>
        </section>
      </div>
    </article>
  );
}
