import type { Project } from "@/types/project";

/** Fictional demo projects; these are not real student listings or contacts. */
const mockProjects: Project[] = [
  {
    id: "zot-spots", title: "ZotSpots", author: "Maya Chen",
    description: "Your next favorite study spot, minus the aimless wandering. Help map the quiet corners, outlets, and good coffee around campus.",
    tags: ["Web Dev", "Design", "Campus Life"], membersCurrent: 2, membersWanted: 4, contactInfo: "",
  },
  {
    id: "petr-paths", title: "Petr Paths", author: "Jordan Rivera",
    description: "Turn your walk to class into a tiny adventure. An accessible campus navigation app with scenic routes and student-sourced shortcuts.",
    tags: ["Mobile", "Campus Life"], membersCurrent: 3, membersWanted: 5, contactInfo: "",
  },
  {
    id: "second-serving", title: "Second Serving", author: "Aisha Patel",
    description: "Good food deserves a second chance. Connect campus events with students to share leftover meals and cut down on food waste.",
    tags: ["Web Dev", "Sustainability"], membersCurrent: 2, membersWanted: 3, contactInfo: "",
  },
  {
    id: "tiny-tides", title: "Tiny Tides", author: "Leo Nguyen",
    description: "A cozy pixel-art game about restoring a little coastal town. Looking for people who love small worlds, thoughtful stories, and sea otters.",
    tags: ["Game Dev", "Design"], membersCurrent: 1, membersWanted: 4, contactInfo: "",
  },
  {
    id: "open-lab", title: "Open Lab", author: "Sam Okafor",
    description: "Make undergraduate research easier to discover. Explore a student-built directory of research interests and labs across UCI.",
    tags: ["Web Dev", "Data Science"], membersCurrent: 4, membersWanted: 4, contactInfo: "",
  },
  {
    id: "rethread", title: "Rethread", author: "Emily Park",
    description: "Less fast fashion, more great finds. A campus clothing-swap community that makes giving your wardrobe a new chapter easy.",
    tags: ["Mobile", "Design", "Sustainability"], membersCurrent: 2, membersWanted: 5, contactInfo: "",
  },
  {
    id: "anteater-air", title: "Anteater Air", author: "Noah Williams",
    description: "Build low-cost air quality sensors and turn their readings into an approachable dashboard for the places we study, walk, and hang out.",
    tags: ["Hardware", "Data Science", "Sustainability"], membersCurrent: 3, membersWanted: 5, contactInfo: "",
  },
  {
    id: "jam-room", title: "Jam Room", author: "Sofia Martinez",
    description: "Find your sound and your people. Match with student musicians for casual jam sessions, creative experiments, and your next campus gig.",
    tags: ["Web Dev", "Music"], membersCurrent: 1, membersWanted: 3, contactInfo: "",
  },
  {
    id: "course-compass", title: "Course Compass", author: "Alex Kim",
    description: "See how your interests connect across courses. A visual prerequisite explorer to help students sketch out their own academic adventure.",
    tags: ["Data Science", "Design", "Campus Life"], membersCurrent: 2, membersWanted: 4, contactInfo: "",
  },
];

/** Replace this implementation with a server-side query and schema adapter later. */
export async function getProjects(): Promise<Project[]> {
  return mockProjects;
}
