"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ query, onSearch }: {
  query: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(query);
  const [loading, setLoading] = useState(false);
async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedValue = value.trim();
    setValue(trimmedValue)
    if (!trimmedValue) return; // Prevent searching for empty spaces

    setLoading(true);
    try {
      // 2. Trigger the local onSearch logic (if still needed)
      onSearch(trimmedValue);

      // 3. Run and await the Gemini search function
      const geminiData = await fetchGemini();
      console.log("Gemini data fetched successfully:", geminiData);
      
      // Do something with geminiData here if needed (e.g., pass it to a parent state)

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }
  async function fetchGemini() {
  const response = await fetch("http://localhost:8000/api/gemini_search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user_query: value}),
    }
  );

  console.log("1\n")
  if (!response.ok) {
    throw new Error("Couldn't load gemini");
  }
  console.log(response)
  const result = await response.json();

  console.log(result)

  return result.tags;
  }

  return (
    <form role="search" onSubmit={submit} className="flex h-14 w-full min-w-0 max-w-[650px] flex-1 overflow-hidden rounded-full border-[3px] border-[#111111] bg-white shadow-[6px_6px_0_#111111] sm:h-[75px] sm:shadow-[10px_10px_0_#111111]">
      <button type="submit" aria-label="Search projects" className="grid w-12 shrink-0 place-items-center border-r-[3px] border-[#111111] bg-[#F194B4] focus-visible:outline-4 focus-visible:-outline-offset-8 sm:w-24">
        <Search aria-hidden="true" className="size-7 sm:size-10" strokeWidth={2} />
      </button>
      <label htmlFor="project-search" className="sr-only">Search titles, descriptions, authors, and tags</label>
      <input
        id="project-search"
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        className="w-full min-w-0 flex-1 rounded-r-full bg-white px-3 text-2xl font-normal leading-none text-[#111111] placeholder:text-[#111111] focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-[#00ADA5] sm:px-5 sm:text-[32px]"
      />
    </form>
  );
}
