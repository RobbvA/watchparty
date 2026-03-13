import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EpisodeDropdown from "./EpisodeDropdown";

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

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">{party.name}</h1>
      <div className="mt-4 flex flex-col gap-2 text-gray-700">
        <p>
          <span className="font-semibold">Show:</span> {party.showTitle}
        </p>
        <p>
          <span className="font-semibold">Host:</span> {party.hostUsername}
        </p>
        {party.watchLink && (
          <p>
            <span className="font-semibold">Watch Link:</span> {party.watchLink}
          </p>
        )}
      </div>

      <div className="mt-6">
        <EpisodeDropdown
          partyId={partyId}
          episodes={party.episodes}
          currentEpisodeNumber={party.currentEpisodeNumber}
        />
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Episodes</h2>
      <ul className="flex flex-col gap-2">
        {party.episodes.map((ep) => (
          <li key={ep.id}>
            <Link
              href={`/parties/${partyId}/episodes/${ep.episodeNumber}`}
              className={`block p-3 rounded border ${
                ep.episodeNumber === party.currentEpisodeNumber
                  ? "bg-black text-white font-bold"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              Episode {ep.episodeNumber}
              {ep.episodeTitle && ` — ${ep.episodeTitle}`}
              {ep.episodeNumber === party.currentEpisodeNumber && " 👈 current"}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
