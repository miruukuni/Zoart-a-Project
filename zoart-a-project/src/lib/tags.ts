import catalog from "../data/tags.json";

export const MAX_TAGS = 7;
export const tagLabels = catalog.map(({ label }) => label);
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const aliases = new Map(catalog.flatMap(({ label, aliases }) => [label, ...aliases].map(alias => [key(alias), label] as const)));
export function canonicalTag(value: string): string | undefined {
  return aliases.get(key(value));
}
export function matchingTags(query: string): string[] {
  const search = query.trim().toLowerCase();
  return catalog.filter(({ label, aliases }) => [label, ...aliases].some(value => value.toLowerCase().includes(search)) || label === canonicalTag(query)).map(({ label }) => label);
}
