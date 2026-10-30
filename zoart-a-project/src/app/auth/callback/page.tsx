"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { finishSignIn, safeReturnPath, readAuthCallback, signInError, googleSignInError } from "@/lib/auth-flow";
import { supabase } from "../../../../lib/client";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");
  const [emailLink, setEmailLink] = useState<{ tokenHash: string; next: string } | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const callback = readAuthCallback(window.location.search, window.location.hash);
    const next = safeReturnPath(query.get("next"));
    Promise.resolve().then(async () => {
      if (callback.kind === "error") throw new Error(callback.message);
      if (callback.kind === "email") {
        if (active) {
          setEmailLink({ tokenHash: callback.tokenHash, next });
          // Remove the email secret before loading or following anything else.
          window.history.replaceState(null, "", "/auth/callback");
        }
        return;
      }
      const result = await finishSignIn(callback.code, callback.flowId);
      if (result.error || !result.data.session) throw new Error(googleSignInError(result.error));
      if (active) window.location.replace(next);
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, []);
  async function confirmEmail() {
    if (!emailLink || pending) return;
    setPending(true); setError("");
    try {
      const result = await supabase.auth.verifyOtp({ token_hash: emailLink.tokenHash, type: "email" });
      if (result.error || !result.data.session) throw result.error ?? new Error("No session returned");
      window.location.replace(emailLink.next);
    } catch (error) { setError(signInError(error, true)); setPending(false); }
  }
  return <main className="grid min-h-dvh place-items-center bg-[#FFEBC6] p-6 text-[#111111]"><div className="max-w-lg rounded-3xl border-[3px] border-[#111111] bg-white p-7 shadow-[6px_6px_0_#111111]">
    <h1 className="mb-4 text-3xl">{error ? "Let’s try that again." : emailLink ? "Ready to sign in?" : "Doing the magic…"}</h1>
    {error ? <><p role="alert">{error}</p><Link href="/sign-in" className="mt-5 inline-block rounded-xl border-[3px] border-[#111111] bg-[#F194B4] px-4 py-3 font-bold">Back to sign in</Link></> : emailLink ? <><p>Confirm to finish signing in. This keeps automatic email link previews from using your link.</p><button type="button" disabled={pending} onClick={() => void confirmEmail()} className="mt-5 rounded-xl border-[3px] border-[#111111] bg-[#F194B4] px-4 py-3 font-bold disabled:opacity-50">{pending ? "Signing in…" : "Finish sign-in"}</button></> : <p role="status">Finishing your sign-in. Wait a sec.</p>}
  </div></main>;
}
