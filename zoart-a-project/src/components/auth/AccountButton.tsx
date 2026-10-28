"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { supabase } from "../../../lib/client";

export default function AccountButton() {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const name = typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : user?.email;
  const style = "inline-flex min-h-11 items-center justify-center rounded-xl border-[3px] border-[#111111] bg-white px-3 text-sm font-bold shadow-[3px_3px_0_#111111] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:opacity-50";
  if (loading) return <span className="text-sm" role="status">Loading account…</span>;
  if (!user) return <Link href="/sign-in" className={style}>Sign in</Link>;
  return <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
    <span className="max-w-44 truncate" title={user.email}>Signed in as {name || user.email}</span>
    <button type="button" disabled={pending} className={style} onClick={async () => {
      setPending(true); setError("");
      try { const result = await supabase.auth.signOut({ scope: "local" }); if (result.error) throw result.error; }
      catch { setError("Couldn't sign out. Please try again."); }
      finally { setPending(false); }
    }}>{pending ? "Signing out…" : "Sign out"}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
