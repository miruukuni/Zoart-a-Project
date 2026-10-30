"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "../../../assets/placeholder.gif";
import { useAuth } from "@/components/auth/AuthProvider";
import { googleAvailable, safeReturnPath, startGoogleSignIn, googleSignInError } from "@/lib/auth-flow";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const [google, setGoogle] = useState<"checking" | "ready" | "disabled" | "error">("checking");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    googleAvailable(AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]))
      .then(available => { if (!controller.signal.aborted) setGoogle(available ? "ready" : "disabled"); })
      .catch(() => { if (!controller.signal.aborted) setGoogle("error"); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const restore = () => { busy.current = false; setPending(false); };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  function nextPath() { return safeReturnPath(new URLSearchParams(window.location.search).get("next")); }
  async function googleSignIn() {
    if (busy.current || google !== "ready") return;
    busy.current = true; setPending(true); setError("");
    try {
      const result = await startGoogleSignIn(window.location.origin, nextPath());
      if (result.error) throw result.error;
    } catch (error) { setError(googleSignInError(error)); busy.current = false; setPending(false); }
  }
  const button = "min-h-12 w-full rounded-xl border-[3px] border-[#111111] px-4 py-3 font-bold shadow-[4px_4px_0_#111111] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:opacity-50 disabled:cursor-wait";
  return <main className="flex min-h-dvh flex-col bg-[#FFEBC6] text-[#111111]">
    <nav className="site-shell py-6"><Link href="/" className="font-bold underline">← Home</Link></nav>
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-5 pb-12 md:grid-cols-[1fr_1.2fr]">
      <div className="mx-auto w-40 md:w-full md:max-w-80"><Image src={Icon} alt="Your Zoart anteater" priority className="h-auto w-full" sizes="(max-width: 767px) 160px, 320px" /></div>
      <section className="overflow-hidden rounded-[2rem] border-[3px] border-[#111111] bg-white shadow-[7px_7px_0_#111111]">
        <header className="border-b-[3px] border-[#111111] bg-[#00ADA5] p-5"><h1 className="text-3xl font-bold">Fill em resumes up.</h1></header>
        <div className="space-y-5 p-5 sm:p-7">
          <p>Sign in to share projects, save your likes, and manage your team’s availability.</p>
          {loading ? <p role="status">Checking your account…</p> : user ? <div className="space-y-4"><p>You’re signed in as {user.email}.</p><button type="button" className={`${button} bg-[#FFB100]`} onClick={() => window.location.assign(nextPath())}>Continue to projects →</button></div> : <>
            <button type="button" className={`${button} flex items-center justify-center gap-3 bg-white hover:bg-[#FFF8E9]`} onClick={() => void googleSignIn()} disabled={pending || google !== "ready"} aria-busy={pending || google === "checking"}>
              <span aria-hidden="true" className="font-[Arial,Helvetica,sans-serif] text-xl font-bold text-[#4285F4]">G</span>
              {pending ? "Opening Google…" : google === "checking" ? "Checking Google sign-in…" : "Continue with Google"}
            </button>
            <p className="text-sm">Sign in with your Google account.</p>
            {google === "disabled" && <p role="status" className="rounded-xl border-2 border-[#111111] bg-[#FFB100] p-4 text-sm">Google sign-in is being set up. Please try again later.</p>}
            {google === "error" && <p role="status" className="text-sm">Couldn’t check Google sign-in. Check your connection and try again.</p>}
            {(google === "disabled" || google === "error") && <button type="button" onClick={() => { setGoogle("checking"); setAttempt(value => value + 1); }} className="text-sm font-bold underline">Check again</button>}
          </>}
          {error && <p role="alert" className="text-sm font-bold text-[#a42130]">{error}</p>}
        </div>
      </section>
    </div>
    <div aria-hidden="true" className="h-12 bg-[repeating-conic-gradient(#111_0%_25%,#F194B4_0%_50%)] bg-[size:48px_48px]" />
  </main>;
}
