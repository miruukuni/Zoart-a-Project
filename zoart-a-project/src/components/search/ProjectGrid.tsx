"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";
import { loadLikes, saveLike, type LikeState } from "@/lib/project-likes";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const ids = projects.map(project => String(project.id)).join(",");
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [loaded, setLoaded] = useState("");
  const [error, setError] = useState("");
  const [likeErrors, setLikeErrors] = useState<Record<string, string>>({});
  const pending = useRef(new Set<string>());
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadLikes(ids ? ids.split(",") : [], controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setLikes(previous => ({ ...previous, ...Object.fromEntries(Object.entries(result).filter(([id]) => !pending.current.has(id))) }));
        setLoaded(ids); setError("");
      })
      .catch(() => { if (!controller.signal.aborted) setError("Likes are unavailable right now."); });
    return () => controller.abort();
  }, [ids, attempt]);

  async function toggle(id: string) {
    const previous = likes[id];
    if (!previous || loaded !== ids || error || pending.current.has(id)) return;
    pending.current.add(id);
    setPendingIds([...pending.current]);
    setLikeErrors(errors => ({ ...errors, [id]: "" }));
    setLikes(values => ({ ...values, [id]: { liked: !previous.liked, count: Math.max(0, previous.count + (previous.liked ? -1 : 1)) } }));
    try {
      const result = await saveLike(id, !previous.liked);
      setLikes(values => ({ ...values, [id]: result }));
    } catch (error) {
      setLikes(values => ({ ...values, [id]: previous }));
      setLikeErrors(errors => ({ ...errors, [id]: error instanceof Error ? error.message : "Couldn't save your like." }));
    } finally {
      pending.current.delete(id);
      setPendingIds([...pending.current]);
    }
  }

  return (
    <>
      {error && <p role="status" className="mb-6 text-sm">{error} <button type="button" className="font-bold underline" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
      <div className="project-grid w-full min-w-0 pt-3">
        {projects.map(project => <ProjectCard key={project.id} project={project} like={likes[String(project.id)]} likesReady={loaded === ids && !error} liking={pendingIds.includes(String(project.id))} likeError={likeErrors[String(project.id)]} onLike={() => void toggle(String(project.id))} />)}
      </div>
    </>
  );
}
