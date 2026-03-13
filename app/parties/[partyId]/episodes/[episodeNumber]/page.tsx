import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EpisodeClient from "./EpisodeClient";

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ partyId: string; episodeNumber: string }>;
}) {
  const { partyId, episodeNumber } = await params;

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { episodes: true },
  });

  if (!party) return notFound();

  const ep = party.episodes.find(
    (e) => e.episodeNumber === parseInt(episodeNumber, 10),
  );

  if (!ep) return notFound();

  const posts = await prisma.post.findMany({
    where: { episodeSessionId: ep.id },
    orderBy: { timestampSec: "asc" },
  });

  return (
    <EpisodeClient
      party={{
        id: party.id,
        name: party.name,
        showTitle: party.showTitle,
      }}
      episode={{
        id: ep.id,
        episodeNumber: ep.episodeNumber,
        episodeTitle: ep.episodeTitle,
      }}
      initialPosts={posts}
    />
  );
}
