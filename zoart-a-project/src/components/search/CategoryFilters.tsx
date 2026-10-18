import { categories, type Category } from "@/lib/filter-projects";

export default function CategoryFilters({ selected, onSelect }: {
  selected: Category;
  onSelect: (category: Category) => void;
}) {
  return (
    <div role="group" aria-label="Filter projects by category" className="flex min-w-0 flex-wrap gap-3 sm:gap-4 lg:gap-5">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className={`rounded-xl border-[3px] border-[#111111] px-3 py-3 text-base font-bold leading-none transition-colors focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#CC404A] sm:px-3.5 sm:py-3.5 sm:text-lg ${selected === category ? "bg-[#00ADA5]" : "bg-white hover:bg-[#F194B4]"}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
