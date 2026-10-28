"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import AccountButton from "./auth/AccountButton";

type SearchBarProps = {
  setUploadOpen: (open: boolean) => void; 
};

export default function SearchBar({
  setUploadOpen,
}: SearchBarProps) {
  return (
    <nav aria-label="Main navigation" className="site-shell flex flex-wrap items-center justify-end gap-4 py-5 sm:py-7">
        <AccountButton />
        <Link href="/search" className="grid min-h-12 place-items-center border-[3px] border-black bg-[#00ADA5] px-4 text-sm font-bold shadow-[4px_4px_0_#000] focus-visible:outline-4 focus-visible:outline-offset-4" >
            PROJECTS
        </Link>
        <button 
            type="button"
            aria-label="Upload"
            onClick={() => setUploadOpen(true)}
            className="grid size-12 cursor-pointer place-items-center border-[3px] border-black bg-[#CC404A] shadow-[4px_4px_0_#000] focus-visible:outline-4 focus-visible:outline-offset-4" >
            <Upload className="h-8 w-8" strokeWidth={2.5} />
        </button>
    </nav>
  );
}
