"use client";

export type ProjectView = "active" | "offline" | "mine";
export default function ProjectViewFilter({ value, onChange }: { value: ProjectView; onChange: (value: ProjectView) => void }) {
  return <div role="group" aria-label="Project availability" className="flex flex-wrap gap-2">
    {([["active", "Active projects"], ["offline", "Offline projects"], ["mine", "My projects"]] as const).map(([view,label]) => <button key={view} type="button" aria-pressed={value === view} onClick={() => onChange(view)} className={`rounded-full border-2 border-[#111111] px-4 py-2 text-sm font-bold focus-visible:outline-4 focus-visible:outline-offset-4 ${value === view ? "bg-[#111111] text-white" : "bg-white hover:bg-[#F194B4]"}`}>{label}</button>)}
  </div>;
}
