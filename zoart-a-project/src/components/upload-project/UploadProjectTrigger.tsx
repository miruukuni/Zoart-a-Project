"use client";

import type { ComponentPropsWithoutRef } from "react";

export type UploadProjectTriggerProps = ComponentPropsWithoutRef<"button">;

export default function UploadProjectTrigger({
  children = "Upload Project +",
  className = "",
  ...props
}: UploadProjectTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      {...props}
      className={`rounded-[10px] border-4 border-[#141414] bg-[var(--sea-teal,#00ADA5)] px-7 py-4 font-sans text-xl font-bold text-[#141414] shadow-[4px_4px_0_#141414] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--sea-teal,#00ADA5)] disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
