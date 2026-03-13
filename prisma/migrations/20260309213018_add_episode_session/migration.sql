-- CreateTable
CREATE TABLE "EpisodeSession" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "episodeTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodeSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EpisodeSession" ADD CONSTRAINT "EpisodeSession_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
