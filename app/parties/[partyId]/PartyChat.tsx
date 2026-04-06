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
    <section className="surface-elevated flex flex-col gap-4 p-4">
      {isLive ? (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-status-live animate-pulse" />
          <h2 className="text-sm font-semibold text-text-primary">
            Live Party Chat
          </h2>
        </div>
      ) : (
        <h2 className="text-sm font-semibold text-text-primary">Party Chat</h2>
      )}

      {activeUsers > 0 && (
        <p className="text-sm text-muted">
          {activeUsers} {activeUsers === 1 ? "person" : "people"} active
          recently
        </p>
      )}

      <input
        className="w-full rounded-[14px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-muted focus:border-accent/40 focus:bg-white/10"
        placeholder="Your username"
        value={username}
        onChange={(e) => handleUsernameChange(e.target.value)}
      />

      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-[16px] border border-white/10 bg-black/10 px-3 py-3">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-[14px] border border-white/8 bg-white/5 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {msg.username}
                </span>
                <span className="text-xs text-muted">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-secondary">
                {msg.body}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-[14px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-muted focus:border-accent/40 focus:bg-white/10"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-[14px] border border-accent/30 bg-accent px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(139,156,255,0.18)] transition hover:bg-accent-strong disabled:opacity-50"
        >
          {status === "sending" ? "..." : "Send"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm text-status-live">
          Something went wrong. Try again.
        </p>
      )}
    </section>
  );
}
