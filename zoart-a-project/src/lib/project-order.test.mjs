import assert from "node:assert/strict";
import { test } from "node:test";
import { projectSort, sortProjects } from "./project-order.ts";
import { projectHasMajor, projectMajors } from "./majors.ts";

const chemistry = { id: "CHEM", name: "Chemistry", degree: "B.S." };
const computing = { id: "CS", name: "Computer Science", degree: "B.S." };
const projects = [
  { id: "older", created_at: "2025-01-01T00:00:00Z", major_id: "CHEM", major: chemistry },
  { id: "newer", created_at: "2026-01-01T00:00:00Z", major: computing, project_majors: [{ major: computing }, { major: chemistry }] },
  { id: "undated", created_at: null },
  { id: "middle", created_at: "2025-07-01T00:00:00Z", project_majors: [{ major: computing }] },
];
const likes = { older: { count: 2, liked: false }, newer: { count: 2, liked: false }, undated: { count: 5, liked: false }, middle: { count: 0, liked: false } };
const ids = values => values.map(project => project.id);

test("popularity defaults to most liked and uses newest first for ties", () => {
  assert.equal(projectSort(null), "most-liked");
  assert.equal(projectSort("unknown"), "most-liked");
  assert.deepEqual(ids(sortProjects(projects, "most-liked", likes)), ["undated", "newer", "older", "middle"]);
  assert.deepEqual(ids(sortProjects(projects, "least-liked", likes)), ["middle", "newer", "older", "undated"]);
});

test("age sorting works in both directions and places undated posts last", () => {
  assert.deepEqual(ids(sortProjects(projects, "newest", likes)), ["newer", "middle", "older", "undated"]);
  assert.deepEqual(ids(sortProjects(projects, "oldest", likes)), ["older", "middle", "newer", "undated"]);
});

test("major filtering matches any selected major and legacy single-major posts", () => {
  const matches = projects.filter(project => projectHasMajor(project, "CHEM"));
  assert.deepEqual(ids(matches), ["older", "newer"]);
  assert.deepEqual(ids(sortProjects(matches, "most-liked", likes)), ["newer", "older"]);
  assert.equal(projectHasMajor(projects[2], "CHEM"), false);
  assert.equal(projectHasMajor({ major_id: "CHEM" }, "CHEM"), true);
  assert.equal(projectHasMajor(projects[2], ""), true);
  assert.equal(projectHasMajor(projects[0], "chem"), false);
});

test("updated likes change popularity order without mutating projects or majors", () => {
  const before = structuredClone(projects);
  const updated = { ...likes, middle: { count: 10, liked: true } };
  assert.equal(sortProjects(projects, "most-liked", updated)[0].id, "middle");
  assert.deepEqual(projectMajors(projects[1]), [computing, chemistry]);
  assert.deepEqual(projects, before);
});
