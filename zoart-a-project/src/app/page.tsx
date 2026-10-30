"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import SearchBar from "@/components/SearchBar";
import title from '../../assets/Title.svg';
import intersect from '../../assets/Intersect.svg';
import mascot from '../../assets/Mascot.png';
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import { createProject } from "../../lib/projects";
import { MASCOT_MESSAGES } from "@/data/mascot-messages";

// Sticker config: position (% of the top area), color, tilt, shape, animation delay (s)
const ZOARTS = [
  { top: "6%",  left: "4%",  bg: "#8DB4FF", rot: -8,  shape: "rounded-full", delay: 0.2 },
  { top: "34%", left: "38%", bg: "#F194B4", rot: 5,   shape: "rounded-2xl",  delay: 0.5 },
  { top: "0%",  left: "62%", bg: "#8368FF", rot: -4,  shape: "rounded-full", delay: 0.8 },
];

const TODOS = [
  { label: "'Learn more' page for projects", bg: "#F194B4" },
  { label: "Settings page for projects", bg: "#8DB4FF" },
  { label: "Page dedicated for club and organizations", bg: "#69be8a" },
  { label: "Page dedicated for news and opportunities", bg: "#ffc295" },
];

const SLIDE_SECONDS = 1.8;
const ZOART_SOUND = "/audio/testinganother.mp3";

export default function Home() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const [mascotMessage, setMascotMessage] = useState<string>(MASCOT_MESSAGES[0]);
  const zoartAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => {
      setMascotMessage(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId]);

  const playZoart = () => {
    // Created lazily so it only runs in the browser
    if (!zoartAudio.current) {
      zoartAudio.current = new Audio(ZOART_SOUND);
    }
    const audio = zoartAudio.current;
    audio.currentTime = 0; // restart so rapid clicks re-trigger
    audio.play().catch(() => {}); // ignore missing file / autoplay rejections
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFEBC6] text-[#111111]">
      <style>{`
        @keyframes zoart-pop {
          0%   { transform: scale(0) rotate(calc(var(--r) - 25deg)); }
          70%  { transform: scale(1.15) rotate(var(--r)); }
          100% { transform: scale(1) rotate(var(--r)); }
        }
        @keyframes zoart-bob {
          0%, 100% { transform: translateY(0) rotate(var(--r)); }
          50%      { transform: translateY(-8px) rotate(calc(var(--r) + 2deg)); }
        }
        .zoart-sticker {
          cursor: pointer;
          animation:
            zoart-pop 0.5s cubic-bezier(.34,1.56,.64,1) var(--d) both,
            zoart-bob 3s ease-in-out calc(var(--d) + 0.5s) infinite;
        }
        .zoart-sticker:hover { filter: brightness(1.08); }
        .zoart-sticker:active {
          translate: 4px 4px;
          box-shadow: 1px 1px 0 #111111;
        }
        @keyframes mascot-slide {
          from { transform: translateX(-110%); }
          to   { transform: translateX(calc(75vw - 75%)); }
        }
        @keyframes bubble-pop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mascot-slide {
          animation: mascot-slide ${SLIDE_SECONDS}s cubic-bezier(.22,.8,.3,1) forwards;
        }
        .mascot-bubble {
          transform-origin: bottom center;
          animation: bubble-pop 0.4s cubic-bezier(.34,1.56,.64,1) ${SLIDE_SECONDS}s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .zoart-sticker { animation: none; transform: rotate(var(--r)); }
          .mascot-slide { animation: none; transform: translateX(calc(75vw - 75%)); }
          .mascot-bubble { animation: none; }
        }
      `}</style>

      <SearchBar setUploadOpen={setUploadOpen} />

      <main className="site-shell relative grid flex-1 items-center gap-8 pb-12 pt-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-10 lg:gap-16">
        {/* Zoart! stickers (clickable, play a sound) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[34%] md:block">
          {ZOARTS.map((z, i) => (
            <button
              key={i}
              type="button"
              onClick={playZoart}
              aria-label="Play Zoart sound"
              className={`zoart-sticker pointer-events-auto absolute select-none border-[3px] border-[#111111] px-5 py-1.5 text-3xl leading-tight shadow-[5px_5px_0_#111111] lg:px-7 lg:py-2 lg:text-5xl ${z.shape}`}
              style={
                {
                  top: z.top,
                  left: z.left,
                  backgroundColor: z.bg,
                  "--r": `${z.rot}deg`,
                  "--d": `${z.delay}s`,
                } as React.CSSProperties
              }
            >
              Zoart!
            </button>
          ))}
        </div>

        <article className="flex min-w-0 flex-col overflow-hidden rounded-[2rem] border-[3px] border-[#111111] bg-white">
          <header className="flex min-h-16 min-w-0 items-center border-b-[3px] border-[#111111] bg-[#00ADA5] px-3.5 py-3 sm:px-4">
            <h2 className="min-w-0 text-[32px] font-normal leading-tight [overflow-wrap:anywhere] lg:text-4xl">
              What is this you might be wondering?
            </h2>
          </header>

          <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-5">
            <ul className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#8DB4FF] px-2 py-1.5 text-xs font-bold leading-4">Share your ideas</li>
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#CC5A5C] px-2 py-1.5 text-xs font-bold leading-4">Build a Project</li>
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#00ADA5] px-2 py-1.5 text-xs font-bold leading-4">Make Connections</li>
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#8368FF] px-2 py-1.5 text-xs font-bold leading-4">Add things to your resume</li>
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#F194B4] px-2 py-1.5 text-xs font-bold leading-4">Shamelessly claiming credits</li>
              <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#FF676D] px-2 py-1.5 text-xs font-bold leading-4">Troy Ngo</li>
            </ul>

            <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4 lg:p-5">
              <h3 className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px]">Is your resume kinda homeless?</h3>
              <p className="max-w-[85ch] font-[family-name:var(--font-search-inter)] text-base leading-relaxed [overflow-wrap:anywhere] lg:text-lg">
                Zoart A Project matches students with projects worth building. Browse what people
                are working on, join a team that needs your skills, or post your own idea and
                find collaborators. Real projects, real teammates, real stuff to put on your
                resume. No classroom required.
              </p>
            </section>
            <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4 lg:p-5">
              <h3 className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px]">Todo list:</h3>
              <ul className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
                {TODOS.map((t) => (
                  <li
                    key={t.label}
                    className="max-w-full rounded-md border-2 border-[#111111] px-2 py-1.5 text-xs font-bold leading-4"
                    style={{ backgroundColor: t.bg }}
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <div className="mx-auto w-full max-w-[36rem]">
          <h1 className="sr-only">Zoart a Project — make your resume less homeless</h1>
          <Image src={title} alt="Zoart a Project" priority className="h-auto w-full" sizes="(max-width: 767px) 85vw, 35vw" />
        </div>
      </main>

      {/* UCI mascot: slides in at constant speed, then the bubble pops */}
      <Link
        href={user ? "/search?view=mine" : "/sign-in"}
        aria-label={user ? "See your projects" : "Sign in with the Zoart mascot"}
        className="mascot-slide fixed bottom-4 left-0 z-10 block w-40 rounded-2xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#CC404A] sm:bottom-6 sm:w-56 lg:bottom-4 lg:w-64"
      >
        <div className="absolute bottom-full left-[65%] -mb-8 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="mascot-bubble relative rounded-2xl border-[3px] border-[#111111] bg-white px-4 py-2 text-xl shadow-[4px_4px_0_#111111] sm:text-2xl">
            {user ? mascotMessage : "sign in"}
            {/* bubble tail */}
            <span className="absolute -bottom-[10px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#111111] bg-white" />
          </div>
        </div>
        <Image src={mascot} alt="" className="h-auto w-full" />
      </Link>

      <footer aria-hidden="true" className="mt-auto h-12 shrink-0 overflow-hidden sm:h-16">
        <Image src={intersect} alt="" className="h-full w-full object-cover" sizes="100vw" />
      </footer>

      <UploadProjectModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={createProject}
      />
    </div>
  );
}