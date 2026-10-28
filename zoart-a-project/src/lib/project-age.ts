export function projectAge(createdAt: string | null, now: number): string | null {
  if (!createdAt) return null;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return null;
  const days = Math.max(0, Math.floor((now - created) / 86400000));
  if (days === 0) return "today";
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
