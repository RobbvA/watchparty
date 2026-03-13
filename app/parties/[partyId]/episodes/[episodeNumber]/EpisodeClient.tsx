"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Post = {
  id: string;
  username: string;
  body: string;
  timestampSec: number;
  createdAt: string;
};

type Props = {
  party: { id: string; name: string; showTitle: string };
  episode: { id: string; episodeNumber: number; episodeTitle: string | null };
  initialPosts: Post[];
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function EpisodeClient({ party, episode, initialPosts }: Props) {
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("watchparty_username") ?? "";
  });

  function handleUsernameChange(value: string) {
    setUsername(value);
    localStorage.setItem("watchparty_username", value);
  }
  const [progressSec, setProgressSec] = useState(0);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState("");

  async function handleSaveProgress() {
    if (!username) return alert("Enter a username first.");
    await fetch(`/api/episodes/${episode.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partyId: party.id,
        username,
        progressSec,
      }),
    });
    setSavedProgress(progressSec);
  }

  async function handlePostSubmit() {
    if (!username) return alert("Enter a username first.");
    if (!newPost.trim()) return;
    if (savedProgress === null) return alert("Save your progress first.");

    const res = await fetch(`/api/episodes/${episode.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partyId: party.id,
        username,
        body: newPost,
        timestampSec: savedProgress,
      }),
    });

    const created = await res.json();
    setPosts((prev) =>
      [...prev, created].sort((a, b) => a.timestampSec - b.timestampSec),
    );
    setNewPost("");
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <Link
        href={`/parties/${party.id}`}
        className="text-sm text-gray-500 underline"
      >
        ← Back to {party.name}
      </Link>

      <h1 className="text-2xl font-bold mt-4">{party.showTitle}</h1>
      <h2 className="text-lg text-gray-600 mt-1">
        Episode {episode.episodeNumber}
        {episode.episodeTitle && ` — ${episode.episodeTitle}`}
      </h2>

      {/* Username */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-gray-600">
          Your username
        </label>
        <input
          className="border p-2 rounded w-full mt-1"
          placeholder="e.g. alice"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
        />
      </div>

      {/* Progress */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-600">
          Your progress: {formatTime(progressSec)}
        </label>
        <input
          type="range"
          min={0}
          max={3600}
          value={progressSec}
          onChange={(e) => setProgressSec(parseInt(e.target.value))}
          className="w-full mt-1"
        />
        <button
          onClick={handleSaveProgress}
          className="mt-2 bg-black text-white px-4 py-2 rounded text-sm"
        >
          Save Progress
        </button>
        {savedProgress !== null && (
          <p className="text-xs text-green-600 mt-1">
            Progress saved at {formatTime(savedProgress)}
          </p>
        )}
      </div>

      {/* Post form */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-gray-600">
          Post a reaction
        </label>
        <textarea
          className="border p-2 rounded w-full mt-1"
          rows={3}
          placeholder="What do you think?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button
          onClick={handlePostSubmit}
          className="mt-2 bg-black text-white px-4 py-2 rounded text-sm"
        >
          Post
        </button>
      </div>

      {/* Reaction feed */}
      <h3 className="text-lg font-bold mt-8 mb-3">Reactions</h3>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => {
          const isSpoiler =
            savedProgress !== null && post.timestampSec > savedProgress;
          return (
            <li key={post.id} className="border rounded p-3">
              {isSpoiler ? (
                <p className="text-gray-400 italic">
                  🚫 Spoiler at {formatTime(post.timestampSec)}
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-1">
                    {post.username} · {formatTime(post.timestampSec)}
                  </p>
                  <p>{post.body}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
