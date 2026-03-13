"use client";

import { useRouter } from "next/navigation";

type Episode = {
  id: string;
  episodeNumber: number;
  episodeTitle: string | null;
};

export default function EpisodeDropdown({
  partyId,
  episodes,
  currentEpisodeNumber,
}: {
  partyId: string;
  episodes: Episode[];
  currentEpisodeNumber: number;
}) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await fetch(`/api/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentEpisodeNumber: parseInt(e.target.value) }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-600">
        Current Episode
      </label>
      <select
        className="border p-2 rounded max-w-xs"
        defaultValue={currentEpisodeNumber}
        onChange={handleChange}
      >
        {episodes.map((ep) => (
          <option key={ep.id} value={ep.episodeNumber}>
            Episode {ep.episodeNumber}
            {ep.episodeTitle && ` — ${ep.episodeTitle}`}
          </option>
        ))}
      </select>
    </div>
  );
}
