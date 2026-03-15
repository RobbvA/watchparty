export type PartyStatus = "upcoming" | "live" | "ended";

export function calculatePartyStatus(
  scheduledAt: Date | null,
  liveWindowMinutes: number | null,
): PartyStatus {
  if (!scheduledAt) return "upcoming";

  const now = Date.now();
  const start = new Date(scheduledAt).getTime();
  const windowMs = (liveWindowMinutes ?? 120) * 60 * 1000;
  const end = start + windowMs;

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
}

export function getTimeUntil(scheduledAt: Date | null): string | null {
  if (!scheduledAt) return null;

  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
