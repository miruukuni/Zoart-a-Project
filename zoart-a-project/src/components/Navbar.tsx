import Link from "next/link";

export function Navbar() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="border-b border-slate-200/80 bg-white/80">
        <nav aria-label="Main navigation" className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Zot a Project home" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 sm:gap-2.5 sm:text-lg">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl text-white sm:h-9 sm:w-9" aria-hidden="true">z.</span>
            <span>Zot a Project<span className="ml-2 hidden text-xs font-medium tracking-normal text-slate-500 sm:inline">/ UCI</span></span>
          </Link>
          <div className="flex items-center gap-7">
            <Link href="/#projects" className="hidden text-sm font-medium text-slate-600 hover:text-blue-700 sm:block">Explore projects</Link>
            <Link href="/projects/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-blue-800 sm:px-4 sm:text-sm">
              <span aria-hidden="true">+</span> Post a project
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
