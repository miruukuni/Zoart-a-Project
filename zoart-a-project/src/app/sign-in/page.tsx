"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import mascot from "../../../assets/Mascot.png";
import { supabase } from "../../../lib/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { googleAvailable, safeReturnPath } from "@/lib/auth-flow";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [google, setGoogle] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    googleAvailable(AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]))
      .then(setGoogle).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function nextPath() { return safeReturnPath(new URLSearchParams(window.location.search).get("next")); }
  function callback() { return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`; }
  async function emailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || cooldown) return;
    busy.current = true; setPending(true); setError("");
    try {
      const result = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callback() } });
      if (result.error) throw result.error;
      setSent(true); setCooldown(60);
    } catch { setError("We couldn't send the sign-in link. Check your email address and try again shortly."); }
    finally { busy.current = false; setPending(false); }
  }
  async function googleSignIn() {
    if (busy.current) return;
    busy.current = true; setPending(true); setError("");
    try {
      const result = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(), queryParams: { prompt: "select_account" } } });
      if (result.error) throw result.error;
    } catch { setError("Google sign-in is unavailable. Please use email instead."); busy.current = false; setPending(false); }
  }
  const button = "min-h-12 w-full rounded-xl border-[3px] border-[#111111] px-4 py-3 font-bold shadow-[4px_4px_0_#111111] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:opacity-50 disabled:cursor-wait";
  return <main className="flex min-h-dvh flex-col bg-[#FFEBC6] text-[#111111]">
    <nav className="site-shell py-6"><Link href="/" className="font-bold underline">← Home</Link></nav>
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-5 pb-12 md:grid-cols-[1fr_1.2fr]">
      <div className="mx-auto w-40 md:w-full md:max-w-80"><Image src={mascot} alt="Your Zoart anteater" priority className="h-auto w-full" sizes="(max-width: 767px) 160px, 320px" /></div>
      <section className="overflow-hidden rounded-[2rem] border-[3px] border-[#111111] bg-white shadow-[7px_7px_0_#111111]">
        <header className="border-b-[3px] border-[#111111] bg-[#00ADA5] p-5"><h1 className="text-3xl font-bold">Your next project starts here.</h1></header>
        <div className="space-y-5 p-5 sm:p-7">
          <p>Sign in to share projects, save your likes, and manage your team’s availability.</p>
          {loading ? <p role="status">Checking your account…</p> : user ? <div className="space-y-4"><p>You’re signed in as {user.email}.</p><button type="button" className={`${button} bg-[#FFB100]`} onClick={() => window.location.assign(nextPath())}>Continue to projects →</button></div> : <>
            {google && <><button type="button" className={`${button} bg-white`} onClick={() => void googleSignIn()} disabled={pending}>Continue with Google</button><p className="text-center text-sm">or use your email</p></>}
            <form onSubmit={emailSignIn} className="space-y-4">
              <label htmlFor="sign-in-email" className="block text-sm font-bold">Email address</label>
              <input id="sign-in-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setSent(false); }} placeholder="you@uci.edu" className="min-h-12 w-full rounded-xl border-2 border-[#111111] bg-[#FFF8E9] px-4 font-[family-name:var(--font-search-inter)] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#00ADA5]" />
              <button type="submit" className={`${button} bg-[#F194B4]`} disabled={pending || !!cooldown}>{pending ? "Sending…" : cooldown ? `Send again in ${cooldown}s` : "Email me a sign-in link"}</button>
            </form>
            <p className="text-sm">No password needed. Open the link in this browser to finish signing in. Your first sign-in creates your account.</p>
          </>}
          {sent && <p role="status" className="rounded-xl border-2 border-[#111111] bg-[#FFB100] p-4">Check your inbox for a sign-in link. You can close this page after opening it.</p>}
          {error && <p role="alert" className="text-sm font-bold text-[#a42130]">{error}</p>}
        </div>
      </section>
    </div>
    <div aria-hidden="true" className="h-12 bg-[repeating-conic-gradient(#111_0%_25%,#F194B4_0%_50%)] bg-[size:48px_48px]" />
  </main>;
}
