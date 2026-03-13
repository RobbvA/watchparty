import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">WatchParty</h1>
      <p className="mt-2 text-gray-500">Your social watching companion.</p>
      <Link
        href="/create-party"
        className="mt-6 inline-block bg-black text-white px-4 py-2 rounded"
      >
        Create a Party
      </Link>
    </main>
  );
}
