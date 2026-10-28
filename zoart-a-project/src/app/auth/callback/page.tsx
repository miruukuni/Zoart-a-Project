"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { finishSignIn, safeReturnPath } from "@/lib/auth-flow";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = query.get("code");
    Promise.resolve().then(async () => {
      if (query.has("error") || hash.has("error") || !code) throw new Error("This sign-in link is invalid or has expired. Please request a new link.");
      const result = await finishSignIn(code);
      if (result.error) throw new Error("We couldn't complete sign-in. Open the link in the browser where you requested it, or request a new one.");
      if (active) window.location.replace(safeReturnPath(query.get("next")));
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, []);
  return <main className="grid min-h-dvh place-items-center bg-[#FFEBC6] p-6 text-[#111111]"><div className="max-w-lg rounded-3xl border-[3px] border-[#111111] bg-white p-7 shadow-[6px_6px_0_#111111]">
    <h1 className="mb-4 text-3xl">{error ? "Let’s try that again." : "Signing you in…"}</h1>
    {error ? <><p role="alert">{error}</p><Link href="/sign-in" className="mt-5 inline-block rounded-xl border-[3px] border-[#111111] bg-[#F194B4] px-4 py-3 font-bold">Back to sign in</Link></> : <p role="status">Finishing your sign-in. You’ll be back to your projects shortly.</p>}
  </div></main>;
}
