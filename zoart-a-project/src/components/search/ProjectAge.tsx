"use client";

import { useEffect, useState } from "react";
import { projectAge } from "@/lib/project-age";

export default function ProjectAge({ createdAt }: { createdAt: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const frame = requestAnimationFrame(update);
    const interval = setInterval(update, 60000);
    return () => { cancelAnimationFrame(frame); clearInterval(interval); };
  }, []);
  const age = now === null ? null : projectAge(createdAt, now);
  const valid = !!createdAt && Number.isFinite(Date.parse(createdAt));
  return <time dateTime={valid ? createdAt : undefined} title={valid ? new Date(createdAt).toUTCString() : undefined} className="shrink-0 text-xs font-bold text-white sm:text-sm">{age ? `Created ${age}` : valid && now === null ? "Created…" : "Creation date unavailable"}</time>;
}
