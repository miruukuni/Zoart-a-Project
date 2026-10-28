"use client";

import { Heart } from "lucide-react";
import type { Project } from "@/types/project";
import { majorLabel } from "@/lib/majors";
import type { LikeState } from "@/lib/project-likes";
import ProjectAge from "./ProjectAge";

const chipColors = ["bg-[#FFB100]", "bg-[#F194B4]", "bg-[#00ADA5]"];

export default function ProjectCard({ project, like, likesReady, liking, likeError, onLike }: {
  project: Project; like?: LikeState; likesReady: boolean; liking: boolean; likeError?: string; onLike: () => void;
}) {
  const tags = project.tags ?? [];
  const majors = project.project_majors?.flatMap(link => link.major ? [link.major] : []) ?? [];
  const displayedMajors = majors.length ? majors : project.major ? [project.major] : [];
  const likeLabel = likesReady && like ? `${like.count} ${like.count === 1 ? "like" : "likes"}` : "Likes unavailable";

  return (
    <article className="relative flex min-w-0 flex-col">
      <div className="group absolute -left-3 -top-4 z-10">
        <button type="button" onClick={onLike} disabled={!likesReady || !like || liking} aria-label={`${like?.liked ? "Unlike" : "Like"} ${project.title || "project"}`} aria-pressed={like?.liked ?? false} aria-describedby={`likes-${project.id}`} aria-busy={liking} className={`grid size-12 place-items-center rounded-full border-2 border-[#111111] shadow-[2px_2px_0_#111111] transition-colors focus-visible:outline-4 focus-visible:outline-offset-4 disabled:cursor-wait ${like?.liked ? "bg-white text-[#CC404A]" : "bg-[#CC404A] text-white"}`}>
          <Heart aria-hidden="true" className="size-6" fill={like?.liked ? "currentColor" : "none"} strokeWidth={2.5} />
        </button>
        <span id={`likes-${project.id}`} role="tooltip" className="pointer-events-none absolute left-0 top-full mt-2 whitespace-nowrap rounded-md bg-[#111111] px-3 py-2 font-[family-name:var(--font-search-inter)] text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{likeLabel}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-b-[2rem] border-[3px] border-[#111111] bg-white">
      <header className="flex min-h-20 min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-[3px] border-[#111111] bg-[#00ADA5] py-3 pl-9 pr-4">
        <h2 className="min-w-0 flex-[1_1_12rem] text-[clamp(1.5rem,1.7vw,2rem)] font-normal leading-tight [overflow-wrap:anywhere]">
          {project.title || "Untitled project"}
        </h2>
        <ProjectAge createdAt={project.created_at} />
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-2.5 sm:gap-4 sm:p-3">
        {displayedMajors.length > 0 && <ul aria-label="UCI majors" className="flex flex-wrap gap-2">{displayedMajors.map(major => <li key={major.id} className="max-w-full rounded-md border-2 border-[#111111] bg-[#ffebc4] px-2 py-1.5 font-[family-name:var(--font-search-inter)] text-xs font-bold [overflow-wrap:anywhere]">{majorLabel(major)}</li>)}</ul>}
        {likeError && <p role="alert" className="text-xs font-bold text-[#a42130]">{likeError}</p>}
        {tags.length > 0 && (
          <ul aria-label="Project tags" className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
            {tags.map((tag, index) => (
              <li key={`${tag}-${index}`} className={`max-w-full rounded-md border-2 border-[#111111] px-2 py-1.5 text-xs font-bold leading-4 [overflow-wrap:anywhere] ${chipColors[index % chipColors.length]}`}>
                {tag}
              </li>
            ))}
          </ul>
        )}

        <section className="flex min-h-44 min-w-0 flex-1 flex-col rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4">
          <h3 className="mb-3 text-2xl font-normal leading-tight">About</h3>
          <div role="region" aria-label="Project description" tabIndex={0} className="max-h-48 min-w-0 overflow-y-auto overscroll-contain rounded-sm font-[family-name:var(--font-search-inter)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]">
            <p className="mb-3 text-sm font-bold [overflow-wrap:anywhere]">By {project.author || "Anonymous"}</p>
            <p className="whitespace-pre-wrap text-base leading-relaxed [overflow-wrap:anywhere]">
              {project.description || "No description provided."}
            </p>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] px-4 py-3 lg:px-5">
          <h3 className="mb-2 text-2xl font-normal leading-tight">Contact</h3>
          <p tabIndex={0} aria-label="Project contact information" className="max-h-24 min-w-0 overflow-y-auto overscroll-contain whitespace-pre-wrap rounded-sm font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]">
            {project.contact_info || "No contact information provided."}
          </p>
        </section>
      </div>
      </div>
    </article>
  );
}
