import { prisma } from "@/lib/prisma";
import { calculatePartyStatus } from "@/lib/partyStatus";
import PartyCard from "./components/PartyCard";
import Link from "next/link";

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
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WatchParty</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your social watching companion.
          </p>
        </div>
        <Link
          href="/create-party"
          className="bg-black text-white px-4 py-2 rounded text-sm font-semibold"
        >
          + Create
        </Link>
      </div>
      {/* Global empty state */}
      {parties.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <p className="text-4xl">🎬</p>
          <p className="text-gray-600 font-semibold">No watch parties yet.</p>
          <p className="text-sm text-gray-400">
            Create one and invite your friends!
          </p>
          <Link
            href="/create-party"
            className="mt-2 bg-black text-white px-6 py-2 rounded text-sm font-semibold"
          >
            Create Watch Party
          </Link>
        </div>
      )}
      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-8">
        {/* Live Now */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
              Live Now
            </h2>
          </div>
          {liveParties.length === 0 ? (
            <p className="text-sm text-gray-400">No live parties right now.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {liveParties.map((p) => (
                <li key={p.id}>
                  <PartyCard party={p} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
            Upcoming
          </h2>
          {upcomingParties.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming parties.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingParties.map((p) => (
                <li key={p.id}>
                  <PartyCard party={p} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently Ended */}
        {endedParties.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
              Recently Ended
            </h2>
            <ul className="flex flex-col gap-3">
              {endedParties.map((p) => (
                <li key={p.id}>
                  <PartyCard party={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
