type TagFilterProps = {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
};

export function TagFilter({ tags, selectedTags, onToggle }: TagFilterProps) {
  return (
    <fieldset className="mt-5">
      <legend className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">Find your thing <span className="font-normal tracking-normal normal-case">· Matches all selected tags</span></legend>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <button key={tag} type="button" aria-pressed={selected} aria-controls="project-results" onClick={() => onToggle(tag)} className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"}`}>
              {selected && <span aria-hidden="true" className="mr-1.5">✓</span>}{tag}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
