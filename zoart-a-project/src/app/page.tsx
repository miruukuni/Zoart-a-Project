"use client"

import {supabase} from "../../lib/client";

async function fetchMajors() {
  const response = await fetch(
    "https://anteaterapi.com/v2/rest/programs/majors"
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
  const { data, error } = await supabase
    .from('projects')
    .select();
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data;
}


export default function Home() {
  return (
    <div>
      <button onClick={async () => {
        const projects = await fetchProjects();
        console.log(projects);
      }}>
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
    </div>
  );
}
