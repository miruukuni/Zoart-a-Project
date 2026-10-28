import catalog from "../data/tags.json";

export const MAX_TAGS = 7;
export const tagLabels = catalog.map(({ label }) => label);
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#]/g, "");
const aliases = new Map(catalog.flatMap(({ label, aliases }) => [label, ...aliases].map(alias => [key(alias), label] as const)));
export function canonicalTag(value: string): string | undefined {
  return aliases.get(key(value));
}

function distance(a: string, b: string): number {
  const grid = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    grid[i][j] = Math.min(grid[i - 1][j] + 1, grid[i][j - 1] + 1, grid[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) grid[i][j] = Math.min(grid[i][j], grid[i - 2][j - 2] + 1);
  }
  return grid[a.length][b.length];
}

export function typoTag(value: string): string | undefined {
  const search = key(value);
  if (search.length < 5 || search.length > 80) return undefined;
  const scores = new Map<string, number>();
  for (const [alias, label] of aliases) {
    if (alias.length < 5 || Math.abs(alias.length - search.length) > 2) continue;
    const edits = distance(search, alias);
    if (edits > 2) continue;
    const score = 1 - edits / Math.max(alias.length, search.length);
    scores.set(label, Math.max(scores.get(label) ?? 0, score));
  }
  const ranked = [...scores].sort((a, b) => b[1] - a[1]);
  if (ranked[0]?.[1] >= 0.82 && ranked[0][1] - (ranked[1]?.[1] ?? 0) >= 0.07) return ranked[0][0];
}

export function matchingTags(query: string): string[] {
  const search = query.trim().toLowerCase();
  const typo = typoTag(query);
  return catalog.filter(({ label, aliases }) => [label, ...aliases].some(value => value.toLowerCase().includes(search)) || label === canonicalTag(query) || label === typo).map(({ label }) => label);
}
