"use client";

import { useState } from "react";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import title from '../../assets/Title.svg';
import intersect from '../../assets/Intersect.svg';
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import { createProject } from "../../lib/projects";

export default function Home() {
  const [uploadOpen, setUploadOpen] = useState(false);
  return (
    <div className="flex min-h-dvh flex-col bg-[#FFEBC6] text-[#111111]">
      <SearchBar setUploadOpen={setUploadOpen} />

      <main className="site-shell grid flex-1 items-center gap-8 pb-12 pt-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-10 lg:gap-16">
      <article className="flex min-w-0 flex-col overflow-hidden rounded-[2rem] border-[3px] border-[#111111] bg-white">
        <header className="flex min-h-16 min-w-0 items-center border-b-[3px] border-[#111111] bg-[#00ADA5] px-3.5 py-3 sm:px-4">
          <h2 className="min-w-0 text-[32px] font-normal leading-tight [overflow-wrap:anywhere] lg:text-4xl">
            About
          </h2>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-5">
          {/* Tags (optional, delete if you don't want them) */}
          <ul className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#CC404A] px-2 py-1.5 text-xs font-bold leading-4">Build a Project</li>
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#00ADA5] px-2 py-1.5 text-xs font-bold leading-4">Make Connections</li>
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#F194B4] px-2 py-1.5 text-xs font-bold leading-4">Add things to your resume</li>
          </ul>

          {/* Orange section */}
          <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4 lg:p-5">
            <h3 className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px]">Our Story</h3>
            <p className="max-w-[85ch] font-[family-name:var(--font-search-inter)] text-base leading-relaxed [overflow-wrap:anywhere] lg:text-lg">
            Zoart-A-Project is a platform that helps students discover projects that match their interests, skills, and goals. Students can explore project opportunities, join existing teams, or contribute their skills to new ideas. By making it easier to find meaningful projects, ProjectHub encourages collaboration, hands-on learning, and skill development beyond the classroom.
            </p>
          </section>
        </div>
      </article>
      <div className="mx-auto w-full max-w-[36rem]">
        <h1 className="sr-only">Zoart a Project — find your next teammates</h1>
        <Image src={title} alt="Zoart a Project" priority className="h-auto w-full" sizes="(max-width: 767px) 85vw, 35vw" />
      </div>
      </main>

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
