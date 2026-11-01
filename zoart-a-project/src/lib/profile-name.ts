export function profileName(user: { user_metadata?: Record<string, unknown> } | null | undefined): string {
  for (const key of ["full_name", "name", "display_name"]) {
    const value = user?.user_metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 100);
  }
  return "";
}
