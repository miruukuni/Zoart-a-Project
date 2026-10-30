"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import mascot from "../../../assets/Mascot.png";
import { PROJECT_MASCOT_MESSAGES } from "@/data/project-mascot-messages";
import { reminderMessageIndex, startMascotReminders } from "@/lib/mascot-reminder";

const SOUND = "/audio/mascot_sfx.mp3";
const SOUND_PREFERENCE = "zoart-project-reminder-muted";

export default function ProjectMascotReminder({ paused = false }: { paused?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const previousMessage = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const pausedRef = useRef(paused);
  const visible = message !== null && !paused;

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const dismiss = useCallback(() => {
    setMessage(null);
    audio.current?.pause();
  }, []);

  const playSound = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    player.currentTime = 0;
    void player.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    const player = new Audio(SOUND);
    player.preload = "none";
    player.volume = 0.35;
    audio.current = player;
    // Defer preference hydration so server and client render the same initial UI.
    const preferenceTimer = window.setTimeout(() => {
      try { setMuted(localStorage.getItem(SOUND_PREFERENCE) === "true"); } catch { /* Storage may be disabled. */ }
    }, 0);
    const stop = startMascotReminders(window, () => {
      if (document.visibilityState !== "visible" || pausedRef.current) return;
      const index = reminderMessageIndex(PROJECT_MASCOT_MESSAGES.length, previousMessage.current);
      previousMessage.current = index;
      setMessage(PROJECT_MASCOT_MESSAGES[index]);
    }, dismiss);
    function visibilityChanged() {
      if (document.visibilityState !== "visible") dismiss();
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      stop();
      window.clearTimeout(preferenceTimer);
      document.removeEventListener("visibilitychange", visibilityChanged);
      player.pause();
      audio.current = null;
    };
  }, [dismiss]);

  useEffect(() => {
    if (visible && !muted) playSound();
    else audio.current?.pause();
  }, [visible, message, muted, playSound]);

  function toggleSound() {
    const nextMuted = blocked ? false : !muted;
    setMuted(nextMuted);
    try { localStorage.setItem(SOUND_PREFERENCE, String(nextMuted)); } catch { /* Preference is optional. */ }
    if (nextMuted) audio.current?.pause();
    else playSound(); // A direct click can enable playback when autoplay is blocked.
  }

  if (!visible) return null;
  return (
    <aside aria-label="Zoart project reminder" className="project-reminder-enter fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-30 flex max-w-[24rem] items-end gap-2 sm:right-auto sm:gap-3">
      <button type="button" onClick={dismiss} aria-label="Dismiss Zoart reminder" className="w-28 shrink-0 overflow-hidden rounded-2xl border-[3px] border-[#111111] bg-[#111111] shadow-[4px_4px_0_#CC404A] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#CC404A] sm:w-40">
        <Image src={mascot} alt="" sizes="(max-width: 639px) 112px, 160px" className="h-auto w-full" />
      </button>
      <div className="relative mb-3 min-w-0 flex-1 rounded-2xl border-[3px] border-[#111111] bg-white p-3 text-[#111111] shadow-[4px_4px_0_#111111] sm:mb-6">
        <p role="status" aria-atomic="true" className="text-sm font-bold leading-snug [overflow-wrap:anywhere] sm:text-base">{message}</p>
        <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={blocked && !muted ? "Play reminder sound" : muted ? "Enable reminder sound" : "Mute reminder sound"} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border-2 border-[#111111] bg-[#FFEBC6] px-2 py-1 text-xs font-bold focus-visible:outline-4 focus-visible:outline-offset-2">
          {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          {blocked && !muted ? "Play sound" : muted ? "Sound off" : "Sound on"}
        </button>
        <span aria-hidden="true" className="absolute -left-[9px] bottom-4 size-3.5 rotate-45 border-b-[3px] border-l-[3px] border-[#111111] bg-white" />
      </div>
    </aside>
  );
}
