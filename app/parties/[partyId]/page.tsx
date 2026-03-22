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
    <main className="min-h-screen bg-gray-50">
      {/* Compact header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Home
          </Link>
          <h1 className="text-lg font-bold leading-tight">{party.name}</h1>
          <p className="text-xs text-gray-500">{party.showTitle}</p>
        </div>

        {/* Inline status badge */}
        <div className="flex flex-col items-end gap-1">
          {status === "live" && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-600">LIVE</span>
            </div>
          )}
          {status === "upcoming" && timeUntil && (
            <span className="text-xs text-gray-500">🕐 {timeUntil}</span>
          )}
          {status === "ended" && (
            <span className="text-xs text-gray-400">✅ Ended</span>
          )}
          {party.watchLink && (
            <a
              href={party.watchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-black text-white px-2 py-1 rounded font-semibold"
            >
              Watch →
            </a>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Chat first - most important during live watch */}
        <PartyChat partyId={partyId} isLive={status === "live"} />

        {/* Episode list */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Episodes
          </h2>
          <ul className="flex flex-col gap-1">
            {party.episodes.map((ep) => (
              <li key={ep.id}>
                <Link
                  href={`/parties/${partyId}/episodes/${ep.episodeNumber}`}
                  className={`block px-3 py-2 rounded-lg border text-sm ${
                    ep.episodeNumber === party.currentEpisodeNumber
                      ? "bg-black text-white font-bold"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Ep {ep.episodeNumber}
                  {ep.episodeTitle && ` — ${ep.episodeTitle}`}
                  {ep.episodeNumber === party.currentEpisodeNumber && " 👈"}
                </Link>
              </li>
            ))}
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
