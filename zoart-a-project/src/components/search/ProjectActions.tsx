"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Project } from "@/types/project";
import { projectMajors } from "@/lib/majors";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import { deleteProject, reportProject, updateProject } from "../../../lib/projects";

export default function ProjectActions({ project, onChanged }: { project: Project; onChanged: () => Promise<void> }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const owned = !!user && project.owner_id === user.id;
  const title = project.title || "Untitled project";
  return <>
    <button type="button" disabled={loading} onClick={() => setOpen(true)} title={owned ? "Project settings" : "Report project"} aria-label={`${owned ? "Manage" : "Report"} project: ${title}`} className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-[#111111] bg-white shadow-[2px_2px_0_#111111] hover:bg-[#F194B4] focus-visible:outline-4 focus-visible:outline-offset-2 disabled:opacity-60"><Settings size={20} aria-hidden="true" /></button>
    {open && (owned ? <UploadProjectModal open onClose={() => setOpen(false)} initialValues={{title:project.title ?? "", author:project.author ?? "", description:project.description ?? "", contact_info:project.contact_info ?? "", application_url:project.application_url ?? "", tags:project.tags ?? [], major_ids:projectMajors(project).map(major => major.id)}} onSubmit={async input => { await updateProject(String(project.id), input); await onChanged(); }} onDelete={async () => { await deleteProject(String(project.id)); await onChanged(); }} /> : <ReportDialog project={project} signedIn={!!user} onClose={() => setOpen(false)} />)}
  </>;
}

export function ReportDialog({ project, signedIn, onClose }: { project: Project; signedIn: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const active = useRef(false);
  const id = useId();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement;
    const overflow = document.body.style.overflow;
    active.current = true;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { active.current = false; element?.close(); document.body.style.overflow = overflow; if (focus instanceof HTMLElement && focus.isConnected) focus.focus(); };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !signedIn || saved) return;
    if (reason.trim().length < 10) { setError("Please explain the issue in at least 10 characters."); return; }
    pending.current = true; setBusy(true); setError("");
    try { await reportProject(String(project.id), reason.trim()); if (active.current) setSaved(true); }
    catch (error) { if (active.current) setError(error instanceof Error ? error.message : "Couldn't submit your report."); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  }
  return <dialog ref={dialog} aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); if (!pending.current) onClose(); }} className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[460px] overflow-y-auto rounded-2xl border-[3px] border-[#111111] bg-[#FFEBC6] p-0 text-[#111111] shadow-[6px_6px_0_#111111] backdrop:bg-black/60">
    <header className="flex items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#00ADA5] p-4"><h2 id={`${id}-title`} className="text-2xl">Report project</h2><button type="button" disabled={busy} onClick={onClose} aria-label="Close report" className="size-8 rounded-lg border-2 border-[#111111] bg-white text-xl focus-visible:outline-4">×</button></header>
    <div className="space-y-4 p-5"><p className="font-bold [overflow-wrap:anywhere]">{project.title || "Untitled project"}</p>
      {saved ? <div role="status" className="space-y-4"><p>Your report was saved for administrator review. It does not automatically hide the project.</p><button type="button" onClick={onClose} className="rounded-lg border-2 border-[#111111] bg-[#00ADA5] px-4 py-2 font-bold">Done</button></div> : !signedIn ? <div className="space-y-4"><p>Sign in to submit a report. Your explanation will be private to site administrators.</p><Link href="/sign-in?next=%2Fsearch" className="inline-block rounded-lg border-2 border-[#111111] bg-[#F194B4] px-4 py-2 font-bold">Sign in to report</Link></div> : <form onSubmit={submit} className="space-y-3" aria-busy={busy}>
        <label htmlFor={`${id}-reason`} className="block font-bold">Why are you reporting this project?</label>
        <textarea id={`${id}-reason`} required minLength={10} maxLength={2000} value={reason} disabled={busy} onChange={event => { setReason(event.target.value); setError(""); }} aria-describedby={`${id}-help`} className="min-h-36 w-full resize-y rounded-lg border-2 border-[#111111] bg-white p-3 text-sm focus-visible:outline-4 focus-visible:outline-[#00ADA5]" placeholder="Describe the content or behavior that concerns you." />
        <p id={`${id}-help`} className="text-xs">{reason.length}/2000 characters. Gemini checks that your reason explains a project issue. Your saved report is private to site administrators. Avoid personal or sensitive information.</p>
        {error && <p role="alert" className="text-sm font-bold text-[#8a1420]">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border-2 border-[#111111] bg-white px-4 py-2 font-bold">Cancel</button><button type="submit" disabled={busy} className="rounded-lg border-2 border-[#111111] bg-[#CC404A] px-4 py-2 font-bold text-white disabled:opacity-60">{busy ? "Checking & sending…" : "Submit report"}</button></div>
      </form>}
    </div>
  </dialog>;
}
