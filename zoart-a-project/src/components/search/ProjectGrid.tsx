"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";
import { loadLikes, saveLike, type LikeState } from "@/lib/project-likes";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { sortProjects, type ProjectSort } from "@/lib/project-order";

export default function ProjectGrid({ projects, sort = "most-liked", onStatusChange }: { projects: Project[]; sort?: ProjectSort; onStatusChange: (id: string, status: "active" | "offline") => void }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Display order can change after a like; the request key depends only on IDs.
  const ids = projects.map(project => String(project.id)).sort().join(",");
  const identity = user?.id ?? "guest";
  const currentIdentity = useRef(identity);
  useEffect(() => { currentIdentity.current = identity; }, [identity]);
  const loadedKey = `${identity}:${ids}`;
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [loaded, setLoaded] = useState("");
  const [error, setError] = useState("");
  const [likeErrors, setLikeErrors] = useState<Record<string, string>>({});
  const pending = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    if (authLoading) return () => controller.abort();
    loadLikes(ids ? ids.split(",") : [], controller.signal, !!user)
      .then(result => {
        if (controller.signal.aborted) return;
        setLikes(previous => ({ ...previous, ...Object.fromEntries(Object.entries(result).filter(([id]) => !pending.current.has(`${identity}:${id}`))) }));
        setLoaded(loadedKey); setError("");
      })
      .catch(() => { if (!controller.signal.aborted) setError("Likes are unavailable right now."); });
    return () => controller.abort();
  }, [ids, attempt, user, authLoading, loadedKey, identity]);

  async function toggle(id: string) {
    if (!user) {
      router.push(`/sign-in?next=${encodeURIComponent(`${pathname}${searchParams.size ? `?${searchParams}` : ""}`)}`);
      return;
    }
    const previous = likes[id];
    const key = `${identity}:${id}`;
    if (!previous || loaded !== loadedKey || error || pending.current.has(key)) return;
    pending.current.add(key);
    setPendingIds([...pending.current]);
    setLikeErrors(errors => ({ ...errors, [key]: "" }));
    setLikes(values => ({ ...values, [id]: { liked: !previous.liked, count: Math.max(0, previous.count + (previous.liked ? -1 : 1)) } }));
    try {
      const result = await saveLike(id, !previous.liked);
      if (currentIdentity.current === identity) setLikes(values => ({ ...values, [id]: result }));
    } catch (error) {
      if (currentIdentity.current === identity) {
        setLikes(values => ({ ...values, [id]: previous }));
        setLikeErrors(errors => ({ ...errors, [key]: error instanceof Error ? error.message : "Couldn't save your like." }));
      }
    } finally {
      pending.current.delete(key);
      setPendingIds([...pending.current]);
    }
  }

  const popularitySort = sort === "most-liked" || sort === "least-liked";
  const likesReady = loaded === loadedKey && !error;
  const loadingPopularity = popularitySort && !likesReady && !error;
  const orderedProjects = sortProjects(projects, error && popularitySort ? "newest" : sort, likes);
  return (
    <>
      {error && <p role="status" className="mb-6 text-sm">{error}{popularitySort && " Showing newest projects until popularity is available."} <button type="button" className="font-bold underline" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
      {loadingPopularity ? <p role="status" className="rounded-3xl border-[3px] border-[#111111] bg-white p-6">Loading project popularity…</p> : <div className="project-grid w-full min-w-0 pt-3">
        {orderedProjects.map(project => <ProjectCard key={`${identity}-${project.id}`} project={project} like={loaded === loadedKey ? likes[String(project.id)] : undefined} likesReady={likesReady} liking={pendingIds.includes(`${identity}:${project.id}`)} likeError={likeErrors[`${identity}:${project.id}`]} onLike={() => void toggle(String(project.id))} onStatusChange={onStatusChange} />)}
      </div>}
    </>
  );
}
