export function majorLabel(major: { name: string; degree: string }): string {
  const name = major.name.replace(/^Major in /, "");
  return name.endsWith(`(${major.degree})`) ? name : `${name} (${major.degree})`;
}
