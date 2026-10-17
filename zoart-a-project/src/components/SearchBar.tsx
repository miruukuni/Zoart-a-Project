type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div role="search" className="relative">
      <label htmlFor="project-search" className="sr-only">Search projects by title, description, author, or tag</label>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-500">
        <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
      </svg>
      <input id="project-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search ideas, skills, or people…" aria-controls="project-results" className="min-h-15 w-full rounded-2xl border border-slate-300 bg-white py-4 pr-5 pl-13 text-base text-slate-900 shadow-sm placeholder:text-slate-500" />
    </div>
  );
}
