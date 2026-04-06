import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EpisodeDropdown from "./EpisodeDropdown";
import { calculatePartyStatus, getTimeUntil } from "@/lib/partyStatus";
import PartyChat from "./PartyChat";

export default async function PartyPage({
  params,
}: {
  params: Promise<{ partyId: string }>;
}) {
  const { partyId } = await params;
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { episodes: { orderBy: { episodeNumber: "asc" } } },
  });

  if (!party) return notFound();

  const status = calculatePartyStatus(
    party.scheduledAt,
    party.liveWindowMinutes,
  );
  const timeUntil = getTimeUntil(party.scheduledAt);

  const recentMinutes = 10;
  const since = new Date(new Date().getTime() - recentMinutes * 60 * 1000);

  const [recentMessages, recentPosts] = await Promise.all([
    prisma.partyMessage.findMany({
      where: { partyId, createdAt: { gte: since } },
      select: { username: true },
    }),
    prisma.post.findMany({
      where: { partyId, createdAt: { gte: since } },
      select: { username: true },
    }),
  ]);

  const watchingNow = new Set([
    ...recentMessages.map((m) => m.username),
    ...recentPosts.map((p) => p.username),
  ]).size;

  return (
    <main className="app-shell">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10 bg-transparent">
        <Link href="/" className="text-sm text-muted hover:text-text-secondary">
          ← Home
        </Link>

        <div className="flex items-start justify-between mt-1">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {party.name}
            </h1>
            <p className="text-sm text-secondary">{party.showTitle}</p>
            <p className="text-sm text-muted">
              Now watching: Episode {party.currentEpisodeNumber}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            {status === "live" && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-live animate-pulse" />
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-status-live">
                  LIVE NOW
                </span>
              </div>
            )}
            {status === "upcoming" && timeUntil && (
              <span className="text-sm text-secondary">🕐 {timeUntil}</span>
            )}
            {status === "ended" && (
              <span className="text-sm text-muted">✅ Ended</span>
            )}
            {watchingNow > 0 && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-active animate-pulse" />
                <span className="text-sm font-medium text-secondary">
                  {watchingNow} watching
                </span>
              </div>
            )}
            {party.watchLink && (
              <a
                href={party.watchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[14px] border border-accent/30 bg-accent px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(139,156,255,0.22)] transition hover:bg-accent-strong"
              >
                Watch Now →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
        {/* Watching now + recent activity */}
        {watchingNow > 0 && (
          <div className="bg-white rounded-lg border px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-gray-700">
                {watchingNow} {watchingNow === 1 ? "person" : "people"} watching
                now
              </p>
            </div>
            <p className="text-xs text-gray-400 ml-4">
              Active in chat or episode reactions recently
            </p>
          </div>
        )}

        {/* Chat first - most important during live watch */}
        <PartyChat partyId={partyId} isLive={status === "live"} />

        {/* Episode list */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Episodes
          </h2>
          <ul className="flex flex-col gap-1">
            {party.episodes.map((ep) => {
              const isCurrent = ep.episodeNumber === party.currentEpisodeNumber;
              return (
                <li key={ep.id}>
                  {isCurrent && (
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1 ml-1">
                      ▶ Watching now
                    </p>
                  )}
                  <Link
                    href={`/parties/${partyId}/episodes/${ep.episodeNumber}`}
                    className={`block px-3 py-2 rounded-lg border text-sm ${
                      isCurrent
                        ? "bg-black text-white font-bold border-black"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>
                        Ep {ep.episodeNumber}
                        {ep.episodeTitle && ` — ${ep.episodeTitle}`}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-bold">
                          NOW
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Host controls */}
        <section className="bg-white rounded-lg border p-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Host Controls
          </h2>
          <EpisodeDropdown
            partyId={partyId}
            episodes={party.episodes}
            currentEpisodeNumber={party.currentEpisodeNumber}
          />
        </section>

        {/* Party info - collapsed to bottom */}
        <section className="bg-white rounded-lg border p-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Party Info
          </h2>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Host:</span> {party.hostUsername}
            </p>
            {party.scheduledAt && (
              <p>
                <span className="font-semibold">Scheduled:</span>{" "}
                {new Date(party.scheduledAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
