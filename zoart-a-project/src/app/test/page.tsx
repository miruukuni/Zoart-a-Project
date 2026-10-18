"use client";

import { supabase } from "../../lib/client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
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

async function fetchGemini() {
  const response = await fetch("http://localhost:8000/api/gemini_search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_query:"I want to build an airplane that can read your mind"}),
    }
  );

  console.log("1\n")
  if (!response.ok) {
    throw new Error("Couldn't load gemini");
  }
  console.log("2\n")
  const result = await response.json();

  console.log("2\n")
  if (!result.ok) {
    throw new Error("Couldn't load gemini");
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
