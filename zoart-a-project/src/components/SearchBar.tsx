"use client";

import { Upload } from "lucide-react";
import Link from "next/link";

type SearchBarProps = {
  setUploadOpen: (open: boolean) => void; 
};

export default function SearchBar({
  setUploadOpen,
}: SearchBarProps) {
  return (
    <div className="flex flex-row  gap-[29vw] p-10 justify-self-end">

        <div className="flex flex-row gap-5 justify-self-end">
        <Link href="/search" className="grid h-[50px] w-[95px] cursor-pointer place-items-center border-[3px] border-black bg-[#00ADA5] shadow-[4px_4px_0_#000]" >    
            PROJECTS
        </Link>
        <button 
            type="button"
            aria-label="Upload"
            onClick={() => setUploadOpen(true)}
            className="grid h-[50px] w-[50px] cursor-pointer place-items-center border-[3px] border-black bg-[#CC404A] shadow-[4px_4px_0_#000]" >
            <Upload className="h-8 w-8" strokeWidth={2.5} />
        </button>
    </div>
</div>
  );
}
