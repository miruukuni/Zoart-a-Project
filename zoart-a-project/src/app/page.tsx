"use client";

import { supabase } from "../../lib/client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import title from '../../assets/Title.svg';
import intersect from '../../assets/Intersect.svg';
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import { createProject } from "../../lib/projects";
import { Inter } from "next/font/google";
const searchInter = Inter({ subsets: ["latin"], variable: "--font-search-inter" });

async function fetchMajors() {
  const response = await fetch(
    "https://anteaterapi.com/v2/rest/programs/majors",
  );

  if (!response.ok) {
    throw new Error("Couldn't load majors");
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error("Couldn't load majors");
  }

  return result.data;
}

async function fetchGemini() {
  const response = await fetch("http://localhost:8000/api/gemini_search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_query:"How many days to travel to mars"}),
    }
  );

  console.log("1\n")
  if (!response.ok) {
    throw new Error("Couldn't load gemini");
  }
  console.log(response)
  const result = await response.json();

  console.log(result)
  if (!result.ok) {
    throw new Error("Couldn't load gemini 2");
  }

  return result.data;
}
interface Tag {
  id: number;
  name: string;
  email: string;
}


async function fetchProjects() {
  const { data, error } = await supabase.from("projects").select();
  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return data;
}

export default function Home() {
  const [uploadOpen, setUploadOpen] = useState(false);
  return (
    <div className="bg-[#FFEBC6]">
      <SearchBar setUploadOpen={setUploadOpen} />

      <div className="flex flex-row justify-between px-10">
      <article className="flex w-2/3 min-w-0 max-w-full h-[25rem] flex-col overflow-hidden rounded-[2.5rem] border-[3px] border-[#111111] bg-white">
        <header className="flex min-h-16 min-w-0 items-center border-b-[3px] border-[#111111] bg-[#00ADA5] px-3.5 py-3 sm:px-4">
          <h2 className="min-w-0 text-[32px] font-normal leading-tight [overflow-wrap:anywhere] lg:text-4xl">
            About
          </h2>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-2.5 sm:gap-4 sm:p-3">
          {/* Tags (optional, delete if you don't want them) */}
          <ul className="flex min-w-0 flex-wrap gap-2 font-[family-name:var(--font-search-inter)]">
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#CC404A] px-2 py-1.5 text-xs font-bold leading-4">For Learning</li>
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#00ADA5] px-2 py-1.5 text-xs font-bold leading-4">For Connecting</li>
            <li className="max-w-full rounded-md border-2 border-[#111111] bg-[#F194B4] px-2 py-1.5 text-xs font-bold leading-4">For You</li>
          </ul>

          {/* Orange section */}
          <section className="min-w-0 rounded-3xl border-[3px] border-[#111111] bg-[#FFB100] p-4 lg:p-5">
            <h3 className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px]">Our Story</h3>
            <p className="font-[family-name:var(--font-search-inter)] text-base leading-relaxed [overflow-wrap:anywhere]">
            Zoart-A-Project is a platform that helps students discover projects that match their interests, skills, and goals. Students can explore project opportunities, join existing teams, or contribute their skills to new ideas. By making it easier to find meaningful projects, ProjectHub encourages collaboration, hands-on learning, and skill development beyond the classroom.
            </p>
          </section>
        </div>
      </article>
      <div className="flex justify-end items-center ">
        <img src={title.src} alt="Title" className="w-[35rem] h-[30rem]" />
      </div>
      </div>

      <div>
        <img src={intersect.src} alt="Intersect" className="absolute bottom-0 w-full " />
      </div>

      <UploadProjectModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={createProject}
      />
        
      <button
        onClick={async () => {
          try {
            const tags = await fetchGemini();
            console.log("Tags:", tags);
          } catch (error: unknown){
            console.error(error)
          }
        }}  
      >
        Touch Me!
      </button>
    </div>

    
  );
}
