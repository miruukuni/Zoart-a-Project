# Zot a Project — home/search frontend

A UCI student project-discovery board built with Next.js App Router, React,
TypeScript, and Tailwind CSS v4. The homepage currently uses **fictional demo data**.

## Run locally

From this directory (`zoart-a-project`):

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run lint`, `npx tsc --noEmit`, and
`npm run build` to check the app. No environment variables are needed for the demo.

## Where things live

- `src/app/page.tsx`: server-rendered homepage, hero, and navigation.
- `src/components/ProjectBrowser.tsx`: client boundary for search/tag state.
- `src/components/`: reusable Navbar, SearchBar, TagFilter, TagBadge,
  ProjectCard, and ProjectGrid.
- `src/types/project.ts`: shared Project shape. `membersWanted` means total
  desired team size; a team at or above that number displays “Team full”.
- `src/lib/projects.ts`: fictional listings and the asynchronous `getProjects()`
  data boundary. Replace its implementation when connecting the database.
- `src/lib/filter-projects.ts`: pure search/filter function, independent of React.
- `src/app/globals.css`: theme, focus styles, and decorative hero artwork.

## How the data flows

The server page calls `getProjects()` and passes the results to ProjectBrowser
through **props** (component inputs). ProjectBrowser stores the search text and
selected tags in React **state**; typing or clicking a tag updates that state and
renders the matching cards immediately. SearchBar and TagFilter receive values
and callbacks as props so they do not need their own copies of the state.

`filterProjects()` uses `.filter()` to create a new array containing only matching
projects. Text search ignores case and outer whitespace and checks title,
description, author, and tags. A project must contain **every selected tag** as
well as match the search text. Clear filters resets both controls. Available tags
come from the project data, so a new category automatically gets a filter.

## Teammate integration

- Implement `/projects/new` and `/projects/[id]` separately. Navigation and cards
  already link to those URLs; they currently return 404 until those routes exist.
- Replace `getProjects()` with server-side Supabase access and map the real schema
  into `Project` in a dedicated adapter. No backend routes or database schema are
  assumed here. Keep service-role credentials on the server.
- Cards do not render contact information. Before exposing real data, return only
  public browse fields to the client; retrieve private contact details separately
  on the detail route with appropriate access checks. Demo contact fields are empty.
- Authentication, project creation, and detail-page behavior are outside this pass.

## Manual checks

- Desktop: three columns; medium screens (768px+): two; mobile: one.
- Search `MAYA`, `coffee`, or `hardware`; verify title/description/author/tag matches.
- Select Web Dev and Sustainability: only Second Serving remains. Add Music:
  the empty state appears. Reset restores all nine projects.
- Search `pixel` while Design is selected: Tiny Tides remains.
- Open Lab shows “Team full”; other cards show available places and current/total.
- Use Tab, Enter, and Space to navigate, activate links, and toggle tag buttons.
  Focus is visible, tag selection is announced, and result counts are live.
