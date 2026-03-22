import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const parties = await prisma.party.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">WatchParty</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your social watching companion.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <p className="text-sm text-gray-500">Found {parties.length} parties.</p>
      </div>
    </main>
  );
}
