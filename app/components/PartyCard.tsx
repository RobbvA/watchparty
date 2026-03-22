import Link from "next/link";
import { calculatePartyStatus, getTimeUntil } from "@/lib/partyStatus";

type Party = {
  id: string;
  name: string;
  showTitle: string;
  currentEpisodeNumber: number;
  scheduledAt: Date | null;
  liveWindowMinutes: number | null;
  watchLink: string | null;
};

export default function PartyCard({ party }: { party: Party }) {
  const status = calculatePartyStatus(
    party.scheduledAt,
    party.liveWindowMinutes,
  );
  const timeUntil = getTimeUntil(party.scheduledAt);

  return (
    <div
      className={`bg-white rounded-lg border p-4 flex flex-col gap-2 ${
        status === "live" ? "border-red-400 shadow-sm" : ""
      }`}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between">
        {status === "live" && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-600">LIVE</span>
          </div>
        )}
        {status === "upcoming" && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            UPCOMING
          </span>
        )}
        {status === "ended" && (
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            ENDED
          </span>
        )}
      </div>

      {/* Party info */}
      <div>
        <h3 className="font-bold text-gray-900">{party.name}</h3>
        <p className="text-sm text-gray-500">{party.showTitle}</p>
        <p className="text-xs text-gray-400 mt-1">
          Episode {party.currentEpisodeNumber}
        </p>
        {status === "upcoming" && timeUntil && (
          <p className="text-xs text-blue-500 mt-1">🕐 Starts in {timeUntil}</p>
        )}
      </div>

      {/* Join button */}
      <Link
        href={`/parties/${party.id}`}
        className="mt-1 block w-full text-center bg-black text-white py-2 rounded text-sm font-semibold"
      >
        Join Party
      </Link>
    </div>
  );
}
