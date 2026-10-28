"use client";

import { useId, useState } from "react";
import { majorLabel } from "@/lib/majors";

export type Major = { id: string; name: string; degree: string };

export default function MajorPicker({ majors, selected, onChange }: {
  majors: Major[]; selected: string[]; onChange: (ids: string[]) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);
  const choices = majors.filter(major => !selected.includes(major.id) && majorLabel(major).toLowerCase().includes(query.trim().toLowerCase()));
  function add(major: Major) {
    if (!selected.includes(major.id)) onChange([...selected, major.id]);
    setQuery(""); setIndex(-1); setOpen(false);
  }
  return (
    <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <label htmlFor={`${id}-input`} className="mb-1 block text-[13px] font-bold">UCI majors (optional)</label>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border-2 border-[#141414] bg-white px-2 py-1">
        {selected.map(majorId => {
          const major = majors.find(item => item.id === majorId);
          return major && <button key={majorId} type="button" onClick={() => onChange(selected.filter(item => item !== majorId))} aria-label={`Remove ${majorLabel(major)} major`} className="max-w-full rounded border-2 border-[#141414] bg-[#ffebc4] px-2 py-1 text-left text-xs font-bold [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2">{majorLabel(major)} <span aria-hidden="true">×</span></button>;
        })}
        <input id={`${id}-input`} role="combobox" aria-expanded={open && !!majors.length} aria-controls={open && majors.length ? `${id}-choices` : undefined} aria-autocomplete="list" aria-activedescendant={open && index >= 0 && choices[index] ? `${id}-choice-${index}` : undefined} autoComplete="off" value={query} disabled={!majors.length} maxLength={100} placeholder={majors.length ? "+ Add majors" : "Majors unavailable"} onChange={event => { setQuery(event.target.value); setOpen(true); setIndex(-1); }} onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setIndex(previous => !choices.length ? -1 : previous < 0 ? direction > 0 ? 0 : choices.length - 1 : (previous + direction + choices.length) % choices.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            const choice = choices[index >= 0 ? index : 0];
            if (choice) add(choice);
          } else if (event.key === "Escape" && open) {
            event.preventDefault(); event.stopPropagation(); setOpen(false); setIndex(-1);
          }
        }} className="min-w-0 flex-1 basis-28 rounded px-1 py-1 text-sm focus-visible:outline-2 focus-visible:outline-[#00ADA5]" />
      </div>
      {open && !!majors.length && <div id={`${id}-choices`} role="listbox" aria-label="Available UCI majors" className="absolute inset-x-0 z-20 mt-1 max-h-48 overflow-auto rounded-md border-2 border-[#141414] bg-[#ffebc4] p-1 shadow-[3px_3px_0_#141414]">
        {choices.length ? choices.map((major, position) => <div id={`${id}-choice-${position}`} role="option" aria-selected={index === position} key={major.id} onMouseDown={event => event.preventDefault()} onMouseMove={() => setIndex(position)} onClick={() => add(major)} className={`cursor-pointer rounded px-2 py-2 text-xs ${index === position ? "bg-[#00ADA5] font-bold" : "hover:bg-white"}`}>{majorLabel(major)}</div>) : <p className="px-2 py-2 text-xs">No more matching majors.</p>}
      </div>}
    </div>
  );
}
