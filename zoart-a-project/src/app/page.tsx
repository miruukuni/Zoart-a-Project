import { Navbar } from "@/components/Navbar";
import { ProjectBrowser } from "@/components/ProjectBrowser";
import { getProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <section className="hero relative py-16 sm:py-24" aria-labelledby="hero-heading">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-amber-900">
              <span aria-hidden="true">✦</span> BIG IDEAS START WITH ANTEATERS
            </p>
            <h1 id="hero-heading" className="text-5xl leading-[1.08] font-semibold tracking-[-0.055em] text-slate-900 sm:text-7xl">
              Find something<br />worth <span className="text-blue-700">building.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Discover student projects at UCI and meet the people building them. Your next teammate could be one idea away.
            </p>
            <p className="mt-7 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
              All majors. All experience levels. One curious community.
            </p>
          </div>
          <div className="hero-doodle" aria-hidden="true">
            <div className="doodle-orbit" />
            <span className="doodle-spark">✳</span>
            <span className="doodle-note">a little curiosity,<br />a lot of possibility.</span>
          </div>
        </section>
        <ProjectBrowser projects={projects} />
      </main>
      <footer className="border-t border-slate-200 px-5 py-7 text-center text-sm text-slate-500">
        Built for the ideas that start with “what if?” <span className="ml-1 text-amber-700">Zot zot.</span>
      </footer>
    </>
  );
}
