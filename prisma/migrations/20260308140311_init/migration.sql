-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "showTitle" TEXT NOT NULL,
    "hostUsername" TEXT NOT NULL,
    "watchLink" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "currentEpisodeNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);
