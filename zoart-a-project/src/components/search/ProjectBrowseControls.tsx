"use client";

import { majorLabel, type ProjectMajor } from "@/lib/majors";
import { PROJECT_SORTS, projectSort, type ProjectSort } from "@/lib/project-order";

export default function ProjectBrowseControls({ sort, major, majors, onSortChange, onMajorChange }: {
  sort: ProjectSort;
  major: string;
  majors: ProjectMajor[];
  onSortChange: (value: ProjectSort) => void;
  onMajorChange: (value: string) => void;
}) {
  const selectClass = "min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111111] bg-white px-3 py-2 text-sm font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#00ADA5]";
  return <div role="group" aria-label="Sort and filter by major" className="grid w-full min-w-0 gap-3 sm:w-auto sm:grid-cols-[minmax(10rem,12rem)_minmax(12rem,18rem)]">
    <label className="min-w-0"><span className="mb-1 block text-xs font-bold">Sort by</span>
      <select aria-label="Sort projects" value={sort} onChange={event => onSortChange(projectSort(event.target.value))} className={selectClass}>
        {PROJECT_SORTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="min-w-0"><span className="mb-1 block text-xs font-bold">Major</span>
      <select aria-label="Filter by major" value={major} onChange={event => onMajorChange(event.target.value)} className={selectClass}>
        <option value="">All majors</option>
        {major && !majors.some(option => option.id === major) && <option value={major}>Selected major</option>}
        {majors.map(option => <option key={option.id} value={option.id}>{majorLabel(option)}</option>)}
      </select>
    </label>
  </div>;
}
