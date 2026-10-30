"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, House } from "lucide-react";
import Link from "next/link";
import type { CreateProjectInput, Project } from "@/types/project";
import { filterProjects, type Category } from "@/lib/filter-projects";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";
import ProjectGrid from "./ProjectGrid";
import { createProject, fetchProjects, searchProjects } from "../../../lib/projects";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import AccountButton from "@/components/auth/AccountButton";
import ProjectViewFilter, { type ProjectView } from "./ProjectViewFilter";
import { useSearchParams } from "next/navigation";
import ProjectBrowseControls from "./ProjectBrowseControls";
import { projectSort } from "@/lib/project-order";
import { majorLabel, projectHasMajor, projectMajors, type ProjectMajor } from "@/lib/majors";

export default function SearchResults({ query }: { query: string }) {
  const { user, loading: authLoading } = useAuth();
  const params = useSearchParams();
  const sort = projectSort(params.get("sort"));
  const major = params.get("major") ?? "";
  const view: ProjectView = params.get("view") === "mine" ? "mine" : params.get("view") === "offline" ? "offline" : "active";
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState<Category>("All projects");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [majorCatalog, setMajorCatalog] = useState<ProjectMajor[]>([]);
  const majorOptions = [...new Map([...majorCatalog, ...projects.flatMap(projectMajors)].map(major => [major.id, major])).values()]
    .sort((a, b) => majorLabel(a).localeCompare(majorLabel(b)));
  const selectedMajor = majorOptions.find(option => option.id === major);

  useEffect(() => {
    const controller = new AbortController();
    api<{ majors: ProjectMajor[] }>("/api/majors", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) })
      .then(result => { if (!controller.signal.aborted) setMajorCatalog(result.majors); })
      .catch(() => { /* Majors already attached to loaded projects remain selectable. */ });
    return () => controller.abort();
  }, []);

async function reload() {
  setLoading(true);
  setError("");

  try {
    const result = query ? await searchProjects(query) : { projects: await fetchProjects(), notice: "" };
    setProjects(result.projects); setSearchNotice(result.notice);
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
      return { projects: await fetchProjects(controller.signal), notice: "" };
    }
    return searchProjects(query, controller.signal);
  }

  Promise.resolve().then(() => {
    if (controller.signal.aborted) return;
    setLoading(true);
    setError("");
    return load();
  })
    .then((data) => {
      if (!controller.signal.aborted && data) { setProjects(data.projects); setSearchNotice(data.notice); }
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

  const next = new URLSearchParams(params.toString());
  if (value) next.set("q", value); else next.delete("q");
  startTransition(() =>
    router.push(
      `/search${next.size ? `?${next}` : ""}`,
      { scroll: false },
    ),
  );
}

  async function upload(input: CreateProjectInput) {
    await createProject(input);
    await reload();
  }

  const visibleProjects = filterProjects(projects, "", category)
    .filter(project => view === "mine" ? !!user && project.owner_id === user.id : view === "active" ? project.status === "active" : project.status !== "active")
    .filter(project => projectHasMajor(project, major));
  function updateBrowse(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value); else next.delete(key);
    }
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
      <div className="mt-5 flex min-w-0 flex-wrap items-end justify-between gap-5">
        <ProjectViewFilter value={view} onChange={value => updateBrowse({ view: value === "active" ? null : value })} />
        <ProjectBrowseControls sort={sort} major={major} majors={majorOptions} onSortChange={value => updateBrowse({ sort: value === "most-liked" ? null : value })} onMajorChange={value => updateBrowse({ major: value })} />
      </div>
      <section aria-label="Search results" aria-busy={loading || navigating} className="mt-8 min-w-0 sm:mt-10">
        {loading || (view === "mine" && authLoading) ? <p role="status" className="rounded-3xl border-4 border-[#111111] bg-white p-8 text-2xl">Think faster Gemini…</p> : view === "mine" && !user ? <div className="rounded-3xl border-4 border-[#111111] bg-white p-8"><h2 className="text-3xl">Your projects live here.</h2><p className="mt-3">Sign in to see and manage the projects you created.</p><Link href="/sign-in?next=%2Fsearch%3Fview%3Dmine" className="mt-5 inline-block rounded-xl border-[3px] border-[#111111] bg-[#F194B4] px-5 py-3 font-bold">Sign in</Link></div> : error ? (
          <div role="alert" className="rounded-3xl border-4 border-[#111111] bg-white p-8">
            <h2 className="text-3xl">Couldn’t load projects</h2>
            <p className="mt-3 text-lg">{error}</p>
            <button type="button" onClick={() => { setLoading(true); setError(""); setAttempt(previous => previous + 1); }} className="mt-5 rounded-xl border-4 border-[#111111] bg-[#F194B4] px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-4">Try again</button>
          </div>
        ) : <>
          {searchNotice && <p role="status" className="mb-4 rounded-xl border-2 border-[#111111] bg-white p-3 text-sm">{searchNotice}</p>}
          <p role="status" className="mb-5 min-w-0 font-[family-name:var(--font-search-inter)] text-sm leading-relaxed [overflow-wrap:anywhere]">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}{query && <> matching “<span>{query}</span>”</>}{category !== "All projects" && ` in ${category}`}{major && ` for ${selectedMajor ? majorLabel(selectedMajor) : "the selected major"}`}</p>
          {visibleProjects.length ? <ProjectGrid projects={visibleProjects} sort={sort} onStatusChange={(id, status) => setProjects(previous => previous.map(project => String(project.id) === id ? { ...project, status } : project))} /> : (
            <div className="rounded-3xl border-4 border-[#111111] bg-white p-8">
              <h2 className="text-3xl">No projects found</h2>
              <p className="mt-3 text-lg">Try another search, category, or major, or upload a project of your own.</p>
              {(query || category !== "All projects" || major) && <button type="button" onClick={() => { setCategory("All projects"); updateBrowse({ q: null, major: null }); }} className="mt-5 rounded-xl border-4 border-[#111111] bg-[#00ADA5] px-5 py-3 font-bold focus-visible:outline-4 focus-visible:outline-offset-4">Clear search and filters</button>}
            </div>
          )}
        </>}
      </section>
      <UploadProjectModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmit={upload} />
    </main>
  );
}
