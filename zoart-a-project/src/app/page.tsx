"use client";

import { supabase } from "../../lib/client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import title from '../../assets/Title.svg';
import intersect from '../../assets/Intersect.svg';
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import { createProject } from "../../lib/projects";

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
    <div>
      <SearchBar setUploadOpen={setUploadOpen} />
      <button
        onClick={async () => {
          const projects = await fetchProjects();
          console.log(projects);
        }}
      >
        press me
      </button>

      <div className="flex justify-end items-center ">
        <img src={title.src} alt="Title" className="w-[35rem] h-[30rem]" />
      </div>

      <button
        onClick={async () => {
          try {
            const majors = await fetchMajors();
            console.log("Majors:", majors);
          } catch {
            console.error("Failed to load majors");
          }
        }}
      >
        Load majors
      </button>

      <div>
        <img src={intersect.src} alt="Intersect" className="absolute bottom-0 w-full " />
      </div>

      <UploadProjectModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={createProject}
      />
    </div>
  );
}
