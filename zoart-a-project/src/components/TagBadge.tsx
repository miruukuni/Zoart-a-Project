const colors: Record<string, string> = {
  "Web Dev": "bg-blue-50 text-blue-800",
  Design: "bg-violet-50 text-violet-800",
  "Campus Life": "bg-amber-50 text-amber-900",
  Mobile: "bg-cyan-50 text-cyan-800",
  Sustainability: "bg-emerald-50 text-emerald-800",
  "Game Dev": "bg-rose-50 text-rose-800",
  "Data Science": "bg-indigo-50 text-indigo-800",
};

export function TagBadge({ tag }: { tag: string }) {
  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${colors[tag] ?? "bg-slate-100 text-slate-700"}`}>{tag}</span>;
}
