import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EpisodeDropdown from "./EpisodeDropdown";
import { calculatePartyStatus, getTimeUntil } from "@/lib/partyStatus";

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-1">{party.name}</h1>
        <p className="text-sm text-gray-500">{party.showTitle}</p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-6">
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Party Status</h2>

          {status === "live" && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-bold text-lg">LIVE NOW</span>
            </div>
          )}

          {status === "upcoming" && timeUntil && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">🕐</span>
              <span className="font-semibold">Starts in {timeUntil}</span>
            </div>
          )}

          {status === "upcoming" && !timeUntil && (
            <p className="text-gray-500 text-sm">Not scheduled yet</p>
          )}

          {status === "ended" && (
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xl">✅</span>
              <span className="font-semibold">Watch Party Ended</span>
            </div>
          )}

          {party.watchLink && (
            <a
              href={party.watchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full text-center bg-black text-white py-2 rounded text-sm font-semibold"
            >
              Watch Now →
            </a>
          )}
        </section>

        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Party Info</h2>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
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

        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            Host Controls
          </h2>
          <EpisodeDropdown
            partyId={partyId}
            episodes={party.episodes}
            currentEpisodeNumber={party.currentEpisodeNumber}
          />
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Episodes</h2>
          <ul className="flex flex-col gap-2">
            {party.episodes.map((ep) => (
              <li key={ep.id}>
                <Link
                  href={`/parties/${partyId}/episodes/${ep.episodeNumber}`}
                  className={`block p-3 rounded-lg border text-sm ${
                    ep.episodeNumber === party.currentEpisodeNumber
                      ? "bg-black text-white font-bold"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Episode {ep.episodeNumber}
                  {ep.episodeTitle && ` — ${ep.episodeTitle}`}
                  {ep.episodeNumber === party.currentEpisodeNumber &&
                    " 👈 current"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
