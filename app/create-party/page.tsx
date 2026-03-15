"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateParty() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [showTitle, setShowTitle] = useState("");
  const [hostUsername, setHostUsername] = useState("");
  const [watchLink, setWatchLink] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  async function handleSubmit() {
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        showTitle,
        hostUsername,
        watchLink: watchLink || null,
        scheduledAt: scheduledAt || null,
      }),
    });

    const party = await res.json();
    router.push(`/parties/${party.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Create a Party</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up a watch party for your group
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-4">
        <section className="bg-white rounded-lg border p-4 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Party name
            </label>
            <input
              className="border p-2 rounded w-full mt-1 text-sm"
              placeholder="e.g. Friday Night Watch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Show title
            </label>
            <input
              className="border p-2 rounded w-full mt-1 text-sm"
              placeholder="e.g. Attack on Titan"
              value={showTitle}
              onChange={(e) => setShowTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Your username
            </label>
            <input
              className="border p-2 rounded w-full mt-1 text-sm"
              placeholder="e.g. alice"
              value={hostUsername}
              onChange={(e) => setHostUsername(e.target.value)}
            />
          </div>
        </section>

        <section className="bg-white rounded-lg border p-4 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Watch link{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className="border p-2 rounded w-full mt-1 text-sm"
              placeholder="e.g. https://netflix.com"
              value={watchLink}
              onChange={(e) => setWatchLink(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Scheduled time{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="datetime-local"
              className="border p-2 rounded w-full mt-1 text-sm"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </section>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold"
        >
          Create Party
        </button>
      </div>
    </main>
  );
}
