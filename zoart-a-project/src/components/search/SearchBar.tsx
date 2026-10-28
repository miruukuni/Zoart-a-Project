"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ query, loading, onSearch }: {
  query: string;
  loading: boolean;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(query);
  const submitted = useRef(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || submitted.current || value.trim() === query) return;
    submitted.current = true;
    onSearch(value.trim());
  }

  return (
    <form role="search" aria-busy={loading} onSubmit={submit} className="flex h-14 w-full min-w-0 max-w-[650px] flex-1 overflow-hidden rounded-full border-[3px] border-[#111111] bg-white shadow-[6px_6px_0_#111111] sm:h-[75px] sm:shadow-[10px_10px_0_#111111]">
      <button type="submit" disabled={loading} aria-label={loading ? "Searching projects" : "Search projects"} className="grid w-12 shrink-0 place-items-center border-r-[3px] border-[#111111] bg-[#F194B4] focus-visible:outline-4 focus-visible:-outline-offset-8 disabled:cursor-wait disabled:opacity-60 sm:w-24">
        <Search aria-hidden="true" className="size-7 sm:size-10" strokeWidth={2} />
      </button>
      <label htmlFor="project-search" className="sr-only">Describe the projects you want to find</label>
      <input id="project-search" type="search" name="q" maxLength={1000} value={value} onChange={event => setValue(event.target.value)} placeholder={loading ? "Making magic happen..." : "Try searching: 'I want to build a rocket'"} className="w-full min-w-0 flex-1 rounded-r-full bg-white px-3 text-2xl font-normal leading-none text-[#111111] placeholder:text-[#111111] focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-[#00ADA5] sm:px-5 sm:text-[32px]" />
    </form>
  );
}
