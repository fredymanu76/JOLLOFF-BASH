"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { MenuCategory, MenuItem } from "@/lib/constants";

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  STARTER: "Starters",
  MAIN: "Main Course",
  DESSERT: "Desserts",
};

const CATEGORY_ORDER: MenuCategory[] = ["STARTER", "MAIN", "DESSERT"];

const EMOJI_SUGGESTIONS: Record<MenuCategory, string[]> = {
  STARTER: ["🍗", "🧁", "🥟", "🍤", "🫓"],
  MAIN: ["🍚", "🍲", "🍌", "🐟", "🥗", "🥬", "🌶️", "🍖", "🥘"],
  DESSERT: ["🍨", "🍉", "🎂", "🍮", "🧁"],
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState("");

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addCategory, setAddCategory] = useState<MenuCategory>("STARTER");
  const [addEmoji, setAddEmoji] = useState("🍽️");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setItems(data.items || []);
      setSource(data.source || "");
    } catch {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          description: addDescription.trim(),
          category: addCategory,
          emoji: addEmoji,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add to local state
      setItems((prev) => [...prev, data.item]);
      setAddName("");
      setAddDescription("");
      setAddEmoji("🍽️");
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/menu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(null);
    }
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: items.filter((item) => item.category === cat),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <p className="text-xs text-jollof-text-muted">
              Changes reflect on the landing page and booking flows
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {source === "defaults" && (
        <div className="bg-jollof-amber/10 border border-jollof-amber/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-jollof-amber shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-jollof-amber">Using default menu</p>
            <p className="text-jollof-text-muted">
              Firestore is not configured. Showing default menu from constants.
              Once Firebase is connected, you can add/remove items and they&apos;ll
              persist.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border mb-6">
          <h2 className="font-semibold text-lg mb-4">Add Menu Item</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                  placeholder="e.g. Suya Skewers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={addCategory}
                  onChange={(e) => {
                    const cat = e.target.value as MenuCategory;
                    setAddCategory(cat);
                    setAddEmoji(EMOJI_SUGGESTIONS[cat][0]);
                  }}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none"
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                type="text"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                placeholder="Short description of the dish"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_SUGGESTIONS[addCategory].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAddEmoji(emoji)}
                    className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      addEmoji === emoji
                        ? "bg-jollof-amber/20 ring-2 ring-jollof-amber"
                        : "bg-jollof-bg hover:bg-jollof-surface-light"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
                <input
                  type="text"
                  value={addEmoji}
                  onChange={(e) => setAddEmoji(e.target.value)}
                  className="w-10 h-10 text-center text-2xl bg-jollof-bg border border-jollof-border rounded-lg focus:border-jollof-amber focus:outline-none"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding || !addName.trim()}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Add to Menu
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu items by category */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, label, items: catItems }) => (
            <div key={category}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span
                  className="w-1 h-6 rounded-full"
                  style={{
                    backgroundColor:
                      category === "STARTER"
                        ? "#F59E0B"
                        : category === "MAIN"
                          ? "#DC2626"
                          : "#F59E0B",
                  }}
                />
                {label}
                <span className="text-sm font-normal text-jollof-text-muted">
                  ({catItems.length} items)
                </span>
              </h2>

              {catItems.length === 0 ? (
                <p className="text-sm text-jollof-text-muted bg-jollof-surface rounded-lg p-4 border border-jollof-border">
                  No {label.toLowerCase()} added yet.
                </p>
              ) : (
                <div className="grid gap-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-jollof-surface rounded-xl p-4 border border-jollof-border flex items-center gap-4"
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-jollof-text-muted truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-jollof-text-muted hover:text-jollof-red transition-colors p-2 rounded-lg hover:bg-jollof-red/10 disabled:opacity-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        {deleting === item.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
