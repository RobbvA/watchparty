"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Post = {
  id: string;
  username: string;
  body: string;
  timestampSec: number;
  createdAt: Date | string;
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
  const [progressStatus, setProgressStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [postStatus, setPostStatus] = useState<"idle" | "posting" | "error">(
    "idle",
  );
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("watchparty_username");
    if (!savedUsername) return;

    fetch(`/api/episodes/${episode.id}/progress?username=${savedUsername}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.progressSec !== undefined) {
          setProgressSec(data.progressSec);
          setSavedProgress(data.progressSec);
        }
      });
  }, [episode.id]);

  async function handleSaveProgress() {
    if (!username) return alert("Enter a username first.");
    setProgressStatus("saving");
    await fetch(`/api/episodes/${episode.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyId: party.id, username, progressSec }),
    });
    setSavedProgress(progressSec);
    setProgressStatus("saved");
  }

  async function handlePostSubmit() {
    if (!username) return alert("Enter a username first.");
    if (!newPost.trim()) return;
    if (savedProgress === null) return alert("Save your progress first.");
    setPostStatus("posting");
    try {
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
      setPostStatus("idle");
    } catch {
      setPostStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <Link
          href={`/parties/${party.id}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← {party.name}
        </Link>
        <h1 className="text-xl font-bold mt-1">{party.showTitle}</h1>
        <p className="text-sm text-gray-500">
          Episode {episode.episodeNumber}
          {episode.episodeTitle && ` — ${episode.episodeTitle}`}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Username */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">
            Your identity
          </h2>
          <input
            className="border p-2 rounded w-full text-sm"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
          />
        </section>

        {/* Progress */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">
            Your progress
          </h2>
          <p className="text-2xl font-mono font-bold text-gray-800 mb-2">
            {formatTime(progressSec)}
          </p>
          <input
            type="range"
            min={0}
            max={3600}
            value={progressSec}
            onChange={(e) => setProgressSec(parseInt(e.target.value))}
            className="w-full"
          />
          <button
            onClick={handleSaveProgress}
            disabled={progressStatus === "saving"}
            className="mt-3 w-full bg-black text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {progressStatus === "saving" ? "Saving..." : "Save Progress"}
          </button>
          {progressStatus === "saved" && (
            <p className="text-xs text-green-600 mt-2 text-center">
              ✅ Saved at {formatTime(savedProgress!)}
            </p>
          )}
        </section>

        {/* Post form */}
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">
            Post a reaction
          </h2>
          {savedProgress !== null && (
            <p className="text-xs text-gray-400 mb-2">
              Posting at {formatTime(savedProgress)}
            </p>
          )}
          <textarea
            className="border p-2 rounded w-full text-sm"
            rows={3}
            placeholder="What do you think?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button
            onClick={handlePostSubmit}
            disabled={postStatus === "posting"}
            className="mt-2 w-full bg-black text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {postStatus === "posting" ? "Posting..." : "Post Reaction"}
          </button>
          {postStatus === "error" && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Something went wrong. Try again.
            </p>
          )}
        </section>

        {/* Reaction feed */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            Reactions {posts.length > 0 && `(${posts.length})`}
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No reactions yet. Be the first!
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => {
                const isSpoiler =
                  savedProgress !== null && post.timestampSec > savedProgress;
                return (
                  <li key={post.id} className="bg-white border rounded-lg p-4">
                    {isSpoiler ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🚫</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-500">
                            Spoiler ahead
                          </p>
                          <p className="text-xs text-gray-400">
                            Posted at {formatTime(post.timestampSec)} — catch up
                            to reveal
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-400">
                          <span className="font-semibold text-gray-700">
                            {post.username}
                          </span>
                          {" · "}
                          {formatTime(post.timestampSec)}
                        </p>
                        <p className="text-sm text-gray-800">{post.body}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
