"use client";

import { useId, useRef } from "react";
import { applicationUrl } from "@/lib/application-url";

export default function ApplicationLink({ url, title }: { url: string | null | undefined; title: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const destination = applicationUrl(url);
  if (!destination) return null;
  return <>
    <button type="button" aria-label={`Apply to ${title || "project"}`} onClick={() => dialog.current?.showModal()} className="shrink-0 rounded-lg border-2 border-[#111111] bg-[#F194B4] px-3 py-1 font-[family-name:var(--font-search-inter)] text-sm font-bold shadow-[2px_2px_0_#111111] hover:bg-white focus-visible:outline-4 focus-visible:outline-offset-2">Apply ↗</button>
    <dialog ref={dialog} aria-labelledby={`${id}-heading`} className="m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-3xl border-[3px] border-[#111111] bg-[#FFEBC6] p-6 text-[#111111] shadow-[6px_6px_0_#111111] backdrop:bg-black/60">
      <h2 id={`${id}-heading`} className="text-2xl font-bold">Continue to {new URL(destination).hostname}?</h2>
      <p className="mt-4 font-[family-name:var(--font-search-inter)] text-sm">This is an external project page. An approved host does not guarantee its content. Never enter your password or sign-in code in a project application.</p>
      <p className="my-4 break-all rounded-xl border-2 border-[#111111] bg-white p-3 font-[family-name:var(--font-search-inter)] text-sm">{destination}</p>
      <div className="flex flex-wrap gap-3 font-bold">
        <button type="button" onClick={() => dialog.current?.close()} className="rounded-xl border-2 border-[#111111] bg-white px-4 py-3">Cancel</button>
        <a href={destination} target="_blank" rel="noopener noreferrer" onClick={() => dialog.current?.close()} className="rounded-xl border-2 border-[#111111] bg-[#00ADA5] px-4 py-3">Continue in new tab ↗</a>
      </div>
    </dialog>
  </>;
}
