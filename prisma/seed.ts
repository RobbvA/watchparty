import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Party 1 - upcoming in 1 hour
  const party1 = await prisma.party.create({
    data: {
      name: "Anime Night",
      showTitle: "Attack on Titan",
      hostUsername: "bob",
      currentEpisodeNumber: 1,
      watchLink: "https://crunchyroll.com",
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
      liveWindowMinutes: 120,
      status: "upcoming",
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

  // Party 2 - live now
  await prisma.party.create({
    data: {
      name: "Weekend Binge",
      showTitle: "Breaking Bad",
      hostUsername: "alice",
      currentEpisodeNumber: 2,
      watchLink: "https://netflix.com",
      scheduledAt: new Date(Date.now() - 30 * 60 * 1000),
      liveWindowMinutes: 120,
      status: "live",
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
