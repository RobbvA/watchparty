import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const party1 = await prisma.party.create({
    data: {
      name: "Anime Night",
      showTitle: "Attack on Titan",
      hostUsername: "bob",
      currentEpisodeNumber: 1,
      episodes: {
        create: [
          { episodeNumber: 1, episodeTitle: "To You, 2000 Years Later" },
          { episodeNumber: 2, episodeTitle: "That Day" },
          { episodeNumber: 3, episodeTitle: "A Dim Light Amid Despair" },
        ],
      },
    },
    include: { episodes: true },
  });

  const ep1 = party1.episodes.find((e) => e.episodeNumber === 1)!;

  await prisma.post.createMany({
    data: [
      {
        partyId: party1.id,
        episodeSessionId: ep1.id,
        username: "alice",
        body: "Wow what an opening scene!",
        timestampSec: 60,
      },
      {
        partyId: party1.id,
        episodeSessionId: ep1.id,
        username: "charlie",
        body: "The animation is incredible here.",
        timestampSec: 180,
      },
      {
        partyId: party1.id,
        episodeSessionId: ep1.id,
        username: "bob",
        body: "That ending hit different...",
        timestampSec: 1200,
      },
    ],
  });

  await prisma.party.create({
    data: {
      name: "Weekend Binge",
      showTitle: "Breaking Bad",
      hostUsername: "alice",
      currentEpisodeNumber: 2,
      episodes: {
        create: [
          { episodeNumber: 1, episodeTitle: "Pilot" },
          { episodeNumber: 2, episodeTitle: "Cat's in the Bag" },
          { episodeNumber: 3, episodeTitle: "And the Bag's in the River" },
        ],
      },
    },
  });

  console.log("Seed data created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
