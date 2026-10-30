"use client";

import { useRef, useState } from "react";
import { Heart, Power } from "lucide-react";
import type { Project } from "@/types/project";
import { majorLabel, projectMajors } from "@/lib/majors";
import type { LikeState } from "@/lib/project-likes";
import { useAuth } from "@/components/auth/AuthProvider";
import { setProjectStatus } from "../../../lib/projects";
import ProjectAge from "./ProjectAge";
import ApplicationLink from "./ApplicationLink";

const chipColors = ["bg-[#FFB100]", "bg-[#F194B4]", "bg-[#00ADA5]"];

export default function ProjectCard({ project, like, likesReady, liking, likeError, onLike, onStatusChange }: {
  project: Project; like?: LikeState; likesReady: boolean; liking: boolean; likeError?: string; onLike: () => void;
  onStatusChange: (id: string, status: "active" | "offline") => void;
}) {
  const { user, loading } = useAuth();
  const [statusPending, setStatusPending] = useState(false);
  const changing = useRef(false);
  const [statusError, setStatusError] = useState("");
  const offline = project.status !== "active";
  const owned = !!user && project.owner_id === user.id;
  const tags = project.tags ?? [];
  const displayedMajors = projectMajors(project);
  const likeLabel = likesReady && like ? `${like.count} ${like.count === 1 ? "like" : "likes"}` : user ? "Likes unavailable" : "Sign in to like this project";
  async function changeStatus() {
    if (!owned || changing.current) return;
    changing.current = true; setStatusPending(true); setStatusError("");
    const next = offline ? "active" : "offline";
    try {
      await setProjectStatus(String(project.id), next);
      onStatusChange(String(project.id), next);
    } catch (error) { setStatusError(error instanceof Error ? error.message : "Couldn't update availability."); }
    finally { changing.current = false; setStatusPending(false); }
  }
  return <article className="relative flex h-[40rem] min-w-0 flex-col">
    <div className="group absolute -left-3 -top-4 z-10">
      <button type="button" onClick={onLike} disabled={loading || liking || (!!user && (!likesReady || !like))} aria-label={`${like?.liked ? "Unlike" : "Like"} ${project.title || "project"}`} aria-pressed={like?.liked ?? false} aria-describedby={`likes-${project.id}`} aria-busy={liking} className={`grid size-12 place-items-center rounded-full border-2 border-[#111111] shadow-[2px_2px_0_#111111] transition-colors focus-visible:outline-4 focus-visible:outline-offset-4 disabled:cursor-wait ${like?.liked ? "bg-white text-[#CC404A]" : "bg-[#CC404A] text-white"}`}>
        <Heart aria-hidden="true" className="size-6" fill={like?.liked ? "currentColor" : "none"} strokeWidth={2.5} />
      </button>
      <span id={`likes-${project.id}`} role="tooltip" className="pointer-events-none absolute left-0 top-full mt-2 whitespace-nowrap rounded-md bg-[#111111] px-3 py-2 font-[family-name:var(--font-search-inter)] text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{likeLabel}</span>
    </div>
    {owned && <div className="group absolute -right-3 -top-4 z-10">
      <button type="button" aria-label={`Set ${project.title || "project"} ${offline ? "active" : "offline"}`} aria-pressed={!offline} aria-describedby={`status-${project.id}`} disabled={statusPending} onClick={() => void changeStatus()} className={`grid size-12 place-items-center rounded-full border-2 border-[#111111] shadow-[2px_2px_0_#111111] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:opacity-60 ${offline ? "bg-[#72777b] text-white" : "bg-[#00ADA5] text-[#111111]"}`}><Power aria-hidden="true" className="size-6" /></button>
      <span id={`status-${project.id}`} role="tooltip" className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md bg-[#111111] px-3 py-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">{statusPending ? "Updating…" : offline ? "Set active" : "Set offline"}</span>
    </div>}
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-b-[2rem] border-[3px] border-[#111111] bg-white">
      <header className={`flex h-28 shrink-0 flex-col justify-between gap-2 border-b-[3px] border-[#111111] py-3 pl-9 pr-5 ${offline ? "bg-[#72777b]" : "bg-[#00ADA5]"}`}>
        <h2 title={project.title ?? undefined} className="line-clamp-2 min-w-0 text-2xl font-normal leading-7 [overflow-wrap:anywhere]">{project.title || "Untitled project"}</h2>
        <div className="flex items-center justify-between gap-2"><span className={`rounded border border-[#111111] px-1.5 text-[10px] font-bold ${offline ? "bg-white text-[#333]" : "bg-[#FFEBC6] text-[#111111]"}`}>{offline ? "Offline" : "Active"}</span><ProjectAge createdAt={project.created_at} /></div>
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
        <div role="region" aria-label="Project majors" tabIndex={0} className="h-11 min-h-0 shrink-0 overflow-x-auto overflow-y-hidden overscroll-contain rounded-md p-0.5 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-[#00ADA5]">
          {displayedMajors.length ? <ul aria-label="UCI majors" className="flex w-max min-w-full gap-1.5">{displayedMajors.map(major => <li key={major.id} className="shrink-0 whitespace-nowrap rounded-md border-2 border-[#111111] bg-[#ffebc4] px-2 py-1 font-[family-name:var(--font-search-inter)] text-xs font-bold leading-4">{majorLabel(major)}</li>)}</ul> : <p className="py-1 text-xs text-[#555]">Open to all majors</p>}
        </div>
        <div role="region" aria-label="Project tags" tabIndex={0} className="h-11 min-h-0 shrink-0 overflow-x-auto overflow-y-hidden overscroll-contain rounded-md p-0.5 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-[#00ADA5]">
          {tags.length ? <ul className="flex w-max min-w-full gap-1.5 font-[family-name:var(--font-search-inter)]">{tags.map((tag,index) => <li key={`${tag}-${index}`} className={`shrink-0 whitespace-nowrap rounded-md border-2 border-[#111111] px-2 py-1 text-xs font-bold leading-4 ${chipColors[index % chipColors.length]}`}>{tag}</li>)}</ul> : <p className="py-1 text-xs text-[#555]">No tags</p>}
        </div>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4">
          <h3 className="mb-2 shrink-0 text-2xl leading-tight">About</h3>
          {(likeError || statusError) && <p role="alert" className="mb-2 max-h-14 shrink-0 overflow-auto text-xs font-bold text-[#8a1420]">{likeError || statusError}</p>}
          <div role="region" aria-label="Project description" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-sm pr-1 font-[family-name:var(--font-search-inter)] [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:outline-[#111111]">
            <p className="mb-2 text-sm font-bold [overflow-wrap:anywhere]">By {project.author || "Anonymous"}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{project.description || "No description provided."}</p>
          </div>
        </section>
        <section className="flex h-[6.5rem] min-h-0 min-w-0 shrink-0 flex-col rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] px-4 py-3">
          <div className="mb-1 flex shrink-0 items-center justify-between gap-3">
            <h3 className="text-2xl leading-tight">Contact</h3>
            <ApplicationLink url={project.application_url} title={project.title} />
          </div>
          <p tabIndex={0} aria-label="Project contact information" className="min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap rounded-sm font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-[#111111]">{project.contact_info || "No contact information provided."}</p>
        </section>
      </div>
    </div>
  </article>;
}
