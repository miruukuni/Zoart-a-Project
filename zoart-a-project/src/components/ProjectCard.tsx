import Link from "next/link";
import { TagBadge } from "@/components/TagBadge";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project }) {
  const openings = Math.max(0, project.membersWanted - project.membersCurrent);
  const initials = project.author.split(" ").map((name) => name[0]).slice(0, 2).join("");

  return (
    <li className="h-full">
      <Link href={`/projects/${encodeURIComponent(project.id)}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${openings > 0 ? "text-emerald-800" : "text-slate-500"}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${openings > 0 ? "bg-emerald-600" : "bg-slate-400"}`} />
            {openings > 0 ? `Looking for ${openings} more` : "Team full"}
          </span>
          <span aria-hidden="true" className="text-xl text-slate-400 group-hover:text-blue-700">↗</span>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-blue-700">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.description}</p>
        <div className="mt-5 mb-6 flex flex-wrap gap-1.5">{project.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}</div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{initials}</span>
            <span className="font-medium text-slate-700">{project.author}</span>
          </span>
          <span>{project.membersCurrent} / {project.membersWanted} members</span>
        </div>
      </Link>
    </li>
  );
}
