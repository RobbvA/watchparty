"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateParty() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [showTitle, setShowTitle] = useState("");
  const [hostUsername, setHostUsername] = useState("");

  async function handleSubmit() {
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, showTitle, hostUsername }),
    });

    const party = await res.json();
    router.push(`/parties/${party.id}`);
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Create a Party</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          className="border p-2 rounded"
          placeholder="Party name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Show title"
          value={showTitle}
          onChange={(e) => setShowTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Your username"
          value={hostUsername}
          onChange={(e) => setHostUsername(e.target.value)}
        />
        <button
          className="bg-black text-white p-2 rounded"
          onClick={handleSubmit}
        >
          Create Party
        </button>
      </div>
    </main>
  );
}
