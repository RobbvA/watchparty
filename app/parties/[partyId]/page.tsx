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
      {/* Header */}
      <div
        className={`border-b px-4 py-4 ${status === "live" ? "bg-red-50" : "bg-white"}`}
      >
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          ← Home
        </Link>

        <div className="flex items-start justify-between mt-1">
          <div>
            <h1 className="text-lg font-bold leading-tight">{party.name}</h1>
            <p className="text-xs text-gray-500">{party.showTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Now watching: Episode {party.currentEpisodeNumber}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {status === "live" && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-600">LIVE NOW</span>
              </div>
            )}
            {status === "upcoming" && timeUntil && (
              <span className="text-xs text-gray-500">🕐 {timeUntil}</span>
            )}
            {status === "ended" && (
              <span className="text-xs text-gray-400">✅ Ended</span>
            )}
            {watchingNow > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-semibold">
                  {watchingNow} watching
                </span>
              </div>
            )}
            {party.watchLink && (
              <a
                href={party.watchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-black text-white px-3 py-1.5 rounded font-semibold"
              >
                Watch Now →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Watching now */}
        {watchingNow > 0 && (
          <div className="flex items-center gap-2 bg-white rounded-lg border px-4 py-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-gray-700">
              {watchingNow} {watchingNow === 1 ? "person" : "people"} watching
              now
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
