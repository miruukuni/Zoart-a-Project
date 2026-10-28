"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, House } from "lucide-react";
import Link from "next/link";
import type { CreateProjectInput, Project } from "@/types/project";
import { filterProjects, type Category } from "@/lib/filter-projects";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";
import ProjectGrid from "./ProjectGrid";
import { createProject, fetchProjects, fetchProjectsByTags } from "../../../lib/projects";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import AccountButton from "@/components/auth/AccountButton";
import ProjectViewFilter, { type ProjectView } from "./ProjectViewFilter";
import { useSearchParams } from "next/navigation";

export default function SearchResults({ query }: { query: string }) {
  const { user, loading: authLoading } = useAuth();
  const params = useSearchParams();
  const view: ProjectView = params.get("view") === "mine" ? "mine" : params.get("view") === "offline" ? "offline" : "active";
  const searchTags = useRef<string[]>([]);
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState<Category>("All projects");
  const [uploadOpen, setUploadOpen] = useState(false);

async function reload() {
  setLoading(true);
  setError("");

  try {
    const data = query ? await fetchProjectsByTags(searchTags.current) : await fetchProjects();
    setProjects(data);
  } catch (error) {
    setError(error instanceof Error ? error.message : "Could not load projects.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  const controller = new AbortController();

  async function load() {
    if (!query.trim()) {
      searchTags.current = [];
      return fetchProjects(controller.signal);
    }
    const result = await api<{ tags: { tag: string }[] }>("/api/gemini_search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_query: query }),
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(55000)]),
    });
    const tags = [...new Set(result.tags.map(item => item.tag))];
    if (controller.signal.aborted) return [];
    searchTags.current = tags;
    return fetchProjectsByTags(tags, controller.signal);
  }

  Promise.resolve().then(() => {
    if (controller.signal.aborted) return [];
    setLoading(true);
    setError("");
    return load();
  })
    .then((data) => {
      if (!controller.signal.aborted) setProjects(data);
    })
    .catch((error) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Could not load projects.");
    })
    .finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

  return () => controller.abort();
}, [query, attempt]);

function search(value: string) {
  if (value === query) return;
  setLoading(true);
  setError("");

  startTransition(() =>
    router.push(
      `/search?${new URLSearchParams({ ...(value ? { q: value } : {}), ...(view !== "active" ? { view } : {}) })}`,
      { scroll: false },
    ),
  );
}

  async function upload(input: CreateProjectInput) {
    await createProject(input);
    await reload();
  }

  const visibleProjects = filterProjects(projects, "", category).filter(project => view === "mine" ? !!user && project.owner_id === user.id : view === "active" ? project.status === "active" : project.status !== "active");
  function changeView(value: ProjectView) {
    const next = new URLSearchParams(params.toString());
    if (value === "active") next.delete("view"); else next.set("view", value);
    router.push(`/search${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  return (
    <main className="site-shell min-w-0 py-6 sm:py-8">
      <h1 className="sr-only">Find a project</h1>
      <div className="mb-5 flex justify-end"><AccountButton /></div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:gap-5">
        <SearchBar key={`${query}-${attempt}`} query={query} loading={loading || navigating} onSearch={search} />
        <Link href="/" aria-label="Return home" className="grid size-12 place-items-center rounded-xl border-[3px] border-[#111111] bg-[#111111] text-white shadow-[4px_4px_0_#F194B4] focus-visible:outline-4 focus-visible:outline-offset-4 sm:size-14"><House className="size-6 sm:size-7" aria-hidden="true" /></Link>
        <button type="button" aria-label="Upload a project" onClick={() => setUploadOpen(true)} className="grid size-12 shrink-0 place-items-center border-[3px] border-[#111111] bg-[#CC404A] shadow-[4px_4px_0_#111111] transition-colors hover:bg-[#F194B4] focus-visible:outline-4 focus-visible:outline-offset-4 sm:size-14">
          <CloudUpload aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-8 sm:mt-10"><CategoryFilters selected={category} onSelect={setCategory} /></div>
      <div className="mt-5"><ProjectViewFilter value={view} onChange={changeView} /></div>
      <section aria-label="Search results" aria-busy={loading || navigating} className="mt-8 min-w-0 sm:mt-10">
        {loading || (view === "mine" && authLoading) ? <p role="status" className="rounded-3xl border-4 border-[#111111] bg-white p-8 text-2xl">Think faster Gemini…</p> : view === "mine" && !user ? <div className="rounded-3xl border-4 border-[#111111] bg-white p-8"><h2 className="text-3xl">Your projects live here.</h2><p className="mt-3">Sign in to see and manage the projects you created.</p><Link href="/sign-in?next=%2Fsearch%3Fview%3Dmine" className="mt-5 inline-block rounded-xl border-[3px] border-[#111111] bg-[#F194B4] px-5 py-3 font-bold">Sign in</Link></div> : error ? (
          <div role="alert" className="rounded-3xl border-4 border-[#111111] bg-white p-8">
            <h2 className="text-3xl">Couldn’t load projects</h2>
            <p className="mt-3 text-lg">{error}</p>
            <button type="button" onClick={() => { setLoading(true); setError(""); setAttempt(previous => previous + 1); }} className="mt-5 rounded-xl border-4 border-[#111111] bg-[#F194B4] px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-4">Try again</button>
          </div>
        ) : <>
          <p role="status" className="mb-5 min-w-0 font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere]">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}{query && <> matching “<span>{query}</span>”</>}{category !== "All projects" && ` in ${category}`}</p>
          {visibleProjects.length ? <ProjectGrid projects={visibleProjects} onStatusChange={(id, status) => setProjects(previous => previous.map(project => String(project.id) === id ? { ...project, status } : project))} /> : (
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
