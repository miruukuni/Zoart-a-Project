"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload } from "lucide-react";
import type { CreateProjectInput, Project } from "@/types/project";
import { filterProjects, type Category } from "@/lib/filter-projects";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";
import ProjectGrid from "./ProjectGrid";
import { createProject, fetchProjectsByTags } from "../../../lib/projects";

export default function SearchResults({ query }: { query: string }) {
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<Category>("All projects");
  const [uploadOpen, setUploadOpen] = useState(false);

async function reload() {
  setLoading(true);
  setError(false);

  try {
    const data = await fetchProjectsByTags(searchTags);
    setProjects(data);
  } catch {
    setError(true);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  const controller = new AbortController();

  setLoading(true);
  setError(false);

  fetchProjectsByTags(searchTags, controller.signal)
    .then((data) => {
      if (!controller.signal.aborted) setProjects(data);
    })
    .catch(() => {
      if (!controller.signal.aborted) setError(true);
    })
    .finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

  return () => controller.abort();
}, [searchTags]);

function search(value: string, tags: string[] = []) {
  setSearchTags(tags);

  startTransition(() =>
    router.push(
      value ? `/search?q=${encodeURIComponent(value)}` : "/search",
      { scroll: false },
    ),
  );
}

  async function upload(input: CreateProjectInput) {
    await createProject(input);
    await reload();
  }

  const visibleProjects = filterProjects(projects, "", category);
  return (
    <main className="mx-auto w-full min-w-0 max-w-screen-2xl px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <h1 className="sr-only">Find a project</h1>
      <div className="flex min-w-0 items-start justify-between gap-5 sm:gap-10">
        <SearchBar key={query} query={query} onSearch={search} />
        <button type="button" aria-label="Upload a project" onClick={() => setUploadOpen(true)} className="grid size-12 shrink-0 place-items-center border-[3px] border-[#111111] bg-[#CC404A] shadow-[4px_4px_0_#111111] transition-colors hover:bg-[#F194B4] focus-visible:outline-4 focus-visible:outline-offset-4 sm:h-16 sm:w-20">
          <CloudUpload aria-hidden="true" className="size-7 sm:size-10" strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-12 sm:mt-14 lg:mt-16"><CategoryFilters selected={category} onSelect={setCategory} /></div>
      <section aria-label="Search results" aria-busy={loading || navigating} className="mt-12 min-w-0 sm:mt-16">
        {loading ? <p role="status" className="rounded-3xl border-4 border-[#111111] bg-white p-8 text-2xl">Loading projects…</p> : error ? (
          <div role="alert" className="rounded-3xl border-4 border-[#111111] bg-white p-8">
            <h2 className="text-3xl">Couldn’t load projects</h2>
            <p className="mt-3 text-lg">Check your connection and try again.</p>
            <button type="button" onClick={() => void reload()} className="mt-5 rounded-xl border-4 border-[#111111] bg-[#F194B4] px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-4">Try again</button>
          </div>
        ) : <>
          <p role="status" className="mb-5 min-w-0 font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere]">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}{query && <> matching “<span>{query}</span>”</>}{category !== "All projects" && ` in ${category}`}</p>
          {visibleProjects.length ? <ProjectGrid projects={visibleProjects} /> : (
            <div className="rounded-3xl border-4 border-[#111111] bg-white p-8">
              <h2 className="text-3xl">No projects found</h2>
              <p className="mt-3 text-lg">Try another search or category, or upload a project of your own.</p>
              {(query || category !== "All projects") && <button type="button" onClick={() => { setCategory("All projects"); search(""); }} className="mt-5 rounded-xl border-4 border-[#111111] bg-[#00ADA5] px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-4">Show all projects</button>}
            </div>
          )}
        </>}
      </section>
      <UploadProjectModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmit={upload} />
    </main>
  );
}
