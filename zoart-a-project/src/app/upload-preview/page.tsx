"use client";

import { useState } from "react";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import UploadProjectTrigger from "@/components/upload-project/UploadProjectTrigger";
import type { CreateProjectInput } from "@/types/project";

/** Temporary frontend-only preview. Remove this route before merging if desired. */
export default function UploadPreviewPage() {
  const [open, setOpen] = useState(false);
  const [fail, setFail] = useState(false);
  const [received, setReceived] = useState<CreateProjectInput | null>(null);

  async function handleDemoSubmit(input: CreateProjectInput): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    if (fail) throw new Error("Intentional demo failure");
    setReceived(input);
  }

  return (
    <main className="min-h-dvh bg-[#ffebc4] px-6 py-16 font-[Arial,Helvetica,sans-serif] text-[#141414]">
      <div className="mx-auto max-w-3xl space-y-8">
        <p className="text-sm font-bold uppercase tracking-widest">Zoart a Project / Isolated preview</p>
        <h1 className="text-4xl font-bold">Upload Project modal</h1>
        <p className="text-xl">Demo only. No Supabase connection or database writes. Successful submissions appear below and disappear when you reload.</p>
        <label className="flex items-center gap-3 text-lg"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} className="size-5 accent-[var(--sea-teal,#00ADA5)]" />Simulate submission failure</label>
        <UploadProjectTrigger onClick={() => setOpen(true)} />
        {received && <section aria-label="Last demo submission" className="rounded-xl border-4 border-[#141414] bg-white p-6"><h2 className="mb-4 text-xl font-bold">Last demo callback payload — not saved</h2><pre className="overflow-auto whitespace-pre-wrap break-words text-sm">{JSON.stringify(received, null, 2)}</pre></section>}
      </div>
      <UploadProjectModal open={open} onClose={() => setOpen(false)} onSubmit={handleDemoSubmit} demo />
    </main>
  );
}
