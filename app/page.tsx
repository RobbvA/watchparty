import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculatePartyStatus } from "@/lib/partyStatus";

export default async function Home() {
  const parties = await prisma.party.findMany({
    orderBy: { createdAt: "desc" },
  });

  const liveParties = parties.filter(
    (p) => calculatePartyStatus(p.scheduledAt, p.liveWindowMinutes) === "live",
  );

  const upcomingParties = parties.filter(
    (p) =>
      calculatePartyStatus(p.scheduledAt, p.liveWindowMinutes) === "upcoming",
  );

  const endedParties = parties.filter(
    (p) => calculatePartyStatus(p.scheduledAt, p.liveWindowMinutes) === "ended",
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">WatchParty</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your social watching companion.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <p className="text-sm text-gray-500">Live: {liveParties.length}</p>
        <p className="text-sm text-gray-500">
          Upcoming: {upcomingParties.length}
        </p>
        <p className="text-sm text-gray-500">Ended: {endedParties.length}</p>
      </div>
    </main>
  );
}
