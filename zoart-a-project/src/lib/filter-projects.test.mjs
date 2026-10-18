import assert from "node:assert/strict";
import { test } from "node:test";
import { filterProjects, normalizeTag } from "./filter-projects.ts";

const projects = [
  { id: 1, title: "Campus map", author: "Alex", description: "Find study rooms", tags: ["React", "Web Development"] },
  { id: 2, title: "Study buddy", author: "Sam", description: "React to your progress", tags: ["AI/ML"] },
  { id: 3, title: "Arcade", author: "Lee", description: "Play together", tags: ["Unity", "Games"] },
  { id: 4, title: null, author: null, description: null, tags: null },
];

test("empty and whitespace queries display all projects", () => {
  assert.deepEqual(filterProjects(projects, "", "All projects"), projects);
  assert.deepEqual(filterProjects(projects, "   ", "All projects"), projects);
});

test("search matches title, description, author, and tags without case sensitivity", () => {
  for (const query of ["CAMPUS", "rooms", "aLeX", " WEB DEVELOPMENT "]) {
    assert.deepEqual(filterProjects(projects, query, "All projects").map(p => p.id), [1]);
  }
});

test("categories normalize common punctuation, spacing, and aliases", () => {
  assert.equal(normalizeTag("AI / ML"), normalizeTag("AI/ML"));
  const aliases = { "Web Dev": "web-development", "AI / ML": "AI / ML", "Data Science": "data_science", Games: "game dev", Design: "UI/UX" };
  for (const [category, tag] of Object.entries(aliases)) {
    const tagged = [{ ...projects[0], tags: [tag] }];
    assert.equal(filterProjects(tagged, "", category).length, 1);
  }
});

test("search and category filters intersect", () => {
  assert.deepEqual(filterProjects(projects, "react", "All projects").map(p => p.id), [1, 2]);
  assert.deepEqual(filterProjects(projects, "react", "AI / ML").map(p => p.id), [2]);
  assert.deepEqual(filterProjects(projects, "react", "Web Dev").map(p => p.id), [1]);
});

test("unmatched searches and categories return no projects", () => {
  assert.deepEqual(filterProjects(projects, "no-such-project", "All projects"), []);
  assert.deepEqual(filterProjects(projects, "react", "Games"), []);
});

test("nullable fields are safe and filtering does not mutate input", () => {
  const before = structuredClone(projects);
  assert.deepEqual(filterProjects(projects, "something", "Design"), []);
  assert.deepEqual(projects, before);
});
