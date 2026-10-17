"use client";

import { useState } from "react";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { filterProjects } from "@/lib/filter-projects";
import type { Project } from "@/types/project";

/** Owns interactive state; projects arrive as props from the server page. */
export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const tags = Array.from(new Set(projects.flatMap((project) => project.tags))).sort();
  const filteredProjects = filterProjects(projects, query, selectedTags);
  const hasFilters = query.length > 0 || selectedTags.length > 0;

  function toggleTag(tag: string) {
    setSelectedTags((current) => current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]);
  }

  function resetFilters() {
    setQuery("");
    setSelectedTags([]);
  }

  return (
    <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="projects-heading" className="text-2xl font-semibold tracking-tight text-slate-900">A place for your next big idea.</h2>
          <p className="mt-2 text-sm text-slate-500">Find a project that makes you want to open your laptop.</p>
        </div>
        <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">Demo · Fictional projects</span>
      </div>
      <SearchBar value={query} onChange={setQuery} />
      <TagFilter tags={tags} selectedTags={selectedTags} onToggle={toggleTag} />
      <div className="mt-8 mb-5 flex min-h-10 items-center justify-between gap-3 border-t border-slate-200 pt-5">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{filteredProjects.length}</span> {filteredProjects.length === 1 ? "project" : "projects"}{hasFilters ? ` matching your search · ${projects.length} total` : " to explore"}
        </p>
        {hasFilters && <button type="button" onClick={resetFilters} className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-medium text-blue-700 underline-offset-4 hover:underline">Clear filters</button>}
      </div>
      <div id="project-results">
        {filteredProjects.length > 0 ? <ProjectGrid projects={filteredProjects} /> : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span aria-hidden="true" className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">✦</span>
            <h3 className="text-xl font-semibold text-slate-900">{projects.length ? "Your next project is still out there." : "The next big idea could be yours."}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{projects.length ? "Try another keyword or select fewer tags. Projects need to match every selected tag." : "There are no projects to explore yet. Check back soon for ideas from the community."}</p>
            {hasFilters && <button type="button" onClick={resetFilters} className="mt-6 min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800">Reset search and tags</button>}
          </div>
        )}
      </div>
    </section>
  );
}
