-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "liveWindowMinutes" INTEGER DEFAULT 120,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'upcoming';
