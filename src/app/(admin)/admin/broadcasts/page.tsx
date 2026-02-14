"use client";

import { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus, Trash2, Loader2, Send } from "lucide-react";
import type { Broadcast, BroadcastAudience, BroadcastChannel } from "@/types";

const AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  ALL: "All Users",
  BOOKED: "Booked Guests",
  PAST_ATTENDEES: "Past Attendees",
};

const CHANNEL_LABELS: Record<BroadcastChannel, string> = {
  EMAIL: "Email",
  PUSH: "Push",
  BOTH: "Email & Push",
};

export default function AdminBroadcastsPage() {
  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("ALL");
  const [channel, setChannel] = useState<BroadcastChannel>("EMAIL");
  const [sending, setSending] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/broadcasts");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Failed to load broadcasts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          audience,
          channel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => [data.item, ...prev]);
      setTitle("");
      setMessage("");
      setAudience("ALL");
      setChannel("EMAIL");
      setShowCreate(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send broadcast"
      );
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/broadcasts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete broadcast"
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Broadcasts</h1>
            <p className="text-xs text-jollof-text-muted">
              Send notifications to your customers
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border mb-6">
          <h2 className="font-semibold text-lg mb-4">New Broadcast</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                placeholder="e.g. February Supper Club Reminder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none resize-none"
                placeholder="Write your broadcast message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as BroadcastAudience)
                  }
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none"
                >
                  {(
                    Object.entries(AUDIENCE_LABELS) as [
                      BroadcastAudience,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) =>
                    setChannel(e.target.value as BroadcastChannel)
                  }
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none"
                >
                  {(
                    Object.entries(CHANNEL_LABELS) as [
                      BroadcastChannel,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Broadcast
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            No broadcasts sent yet. Send email or push notifications to your
            customers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-jollof-surface rounded-xl p-5 border border-jollof-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-jollof-text-muted mt-1 line-clamp-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-jollof-amber/10 text-jollof-amber px-2 py-0.5 rounded-full">
                      {AUDIENCE_LABELS[item.audience]}
                    </span>
                    <span className="text-xs bg-jollof-surface-light text-jollof-text-muted px-2 py-0.5 rounded-full">
                      {CHANNEL_LABELS[item.channel]}
                    </span>
                    {item.sentAt && (
                      <span className="text-xs text-jollof-text-muted">
                        Sent{" "}
                        {new Date(item.sentAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="text-jollof-text-muted hover:text-jollof-red transition-colors p-2 rounded-lg hover:bg-jollof-red/10 disabled:opacity-50 shrink-0"
                  aria-label={`Delete ${item.title}`}
                >
                  {deleting === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
