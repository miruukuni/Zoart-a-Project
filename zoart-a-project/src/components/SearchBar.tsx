"use client";

import { useState, type FormEvent } from "react";
import { Search, Upload } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
};

export default function SearchBar({
  placeholder = "Search",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch?.(query.trim());
  }

  return (
    <div className="flex flex-row gap-[29vw] p-10">

    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex h-14 w-[60vw] overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[8px_8px_0_#000] ${className}`}
    >
      <button
        type="submit"
        aria-label="Search"
        className="grid w-[87px] shrink-0 place-items-center border-r-[3px] border-black bg-[#f291b4]"
      >
        <Search className="h-8 w-8" strokeWidth={2.5} />
      </button>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-5 text-2xl outline-none placeholder:text-black"
        />
        </form>
        <button 
            type="button"
            aria-label="Upload"
            onClick={() => console.log("clicked")}
            className="grid h-[50px] w-[50px] cursor-pointer place-items-center border-[3px] border-black bg-[#CC404A] shadow-[4px_4px_0_#000]" >
        <Upload className="h-8 w-8" strokeWidth={2.5} />
    </button>
</div>
  );
}