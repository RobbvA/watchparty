"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  id: string;
  username: string;
  body: string;
  createdAt: string;
};

export default function PartyChat({
  partyId,
  isLive,
}: {
  partyId: string;
  isLive: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("watchparty_username") ?? "";
  });
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeUsers = new Set(
    messages
      .filter((m) => {
        const messageAge =
          new Date().getTime() - new Date(m.createdAt).getTime();
        return messageAge < 10 * 60 * 1000;
      })
      .map((m) => m.username),
  ).size;

  useEffect(() => {
    function fetchMessages() {
      fetch(`/api/parties/${partyId}/messages`)
        .then((res) => res.json())
        .then((data) => setMessages(data));
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [partyId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleUsernameChange(value: string) {
    setUsername(value);
    localStorage.setItem("watchparty_username", value);
  }

  async function handleSend() {
    if (!username) return alert("Enter a username first.");
    if (!body.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/parties/${partyId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, body }),
      });
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setBody("");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="bg-white rounded-lg border p-4 flex flex-col gap-3">
      {isLive ? (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-bold text-red-600">Live Party Chat</h2>
        </div>
      ) : (
        <h2 className="text-sm font-bold text-gray-700">Party Chat</h2>
      )}

      {activeUsers > 0 && (
        <p className="text-xs text-gray-400">
          {activeUsers} {activeUsers === 1 ? "person" : "people"} active
          recently
        </p>
      )}

      <input
        className="border p-2 rounded text-sm w-full"
        placeholder="Your username"
        value={username}
        onChange={(e) => handleUsernameChange(e.target.value)}
      />

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold text-gray-700">
                {msg.username}
              </span>
              <span className="text-gray-400 text-xs ml-2">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
              <p className="text-gray-800">{msg.body}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded text-sm flex-1"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={status === "sending"}
          className="bg-black text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
        >
          {status === "sending" ? "..." : "Send"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500">Something went wrong. Try again.</p>
      )}
    </section>
  );
}
