"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { MenuItem, MenuCategory, MenuItemAvailability } from "@/types";
import { formatPence } from "@/lib/utils";

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  STARTER: "Starters",
  MAIN: "Main Course",
  DESSERT: "Desserts",
};

const CATEGORY_ORDER: MenuCategory[] = ["STARTER", "MAIN", "DESSERT"];

const AVAILABILITY_LABELS: Record<MenuItemAvailability, string> = {
  EVENT: "Event Only",
  TAKEAWAY: "Takeaway Only",
  BOTH: "Both",
};

const AVAILABILITY_COLORS: Record<MenuItemAvailability, string> = {
  EVENT: "bg-amber-600/20 text-amber-400 border-amber-500/40",
  TAKEAWAY: "bg-green-600/20 text-green-400 border-green-500/40",
  BOTH: "bg-blue-600/20 text-blue-400 border-blue-500/40",
};

const EMOJI_SUGGESTIONS: Record<MenuCategory, string[]> = {
  STARTER: ["🍗", "🍟", "🥟", "🍤", "🫓"],
  MAIN: ["🍚", "🍲", "🍌", "🐟", "🥗", "🥘", "🌶️", "🍖"],
  DESSERT: ["🍨", "🍉", "🎂", "🍮", "🧁"],
};

type FilterTab = "ALL" | "EVENT" | "TAKEAWAY";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addCategory, setAddCategory] = useState<MenuCategory>("STARTER");
  const [addEmoji, setAddEmoji] = useState("🍽️");
  const [addAvailability, setAddAvailability] = useState<MenuItemAvailability>("BOTH");
  const [addPrice, setAddPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<MenuCategory>("STARTER");
  const [editEmoji, setEditEmoji] = useState("");
  const [editAvailability, setEditAvailability] = useState<MenuItemAvailability>("BOTH");
  const [editPrice, setEditPrice] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const pricePence = addPrice ? Math.round(parseFloat(addPrice) * 100) : undefined;

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          description: addDescription.trim(),
          category: addCategory,
          emoji: addEmoji,
          availability: addAvailability,
          pricePence,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => [...prev, data.item]);
      setAddName("");
      setAddDescription("");
      setAddEmoji("🍽️");
      setAddAvailability("BOTH");
      setAddPrice("");
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

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditEmoji(item.emoji);
    setEditAvailability(item.availability || "BOTH");
    setEditPrice(item.pricePence ? (item.pricePence / 100).toFixed(2) : "");
    setEditActive(item.active !== false);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setError("");

    try {
      const pricePence = editPrice ? Math.round(parseFloat(editPrice) * 100) : undefined;

      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          description: editDescription.trim(),
          category: editCategory,
          emoji: editEmoji,
          availability: editAvailability,
          pricePence,
          active: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? (data.item as MenuItem) : item
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  // Filter items by tab
  const filteredItems = items.filter((item) => {
    if (filterTab === "ALL") return true;
    if (filterTab === "EVENT") return item.availability === "EVENT" || item.availability === "BOTH";
    if (filterTab === "TAKEAWAY") return item.availability === "TAKEAWAY" || item.availability === "BOTH";
    return true;
  });

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filteredItems.filter((item) => item.category === cat),
  }));

  const inputClass =
    "w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Menu Management</h1>
            <p className="text-xs text-jollof-text-muted">
              Manage items for events and takeaway
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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["ALL", "EVENT", "TAKEAWAY"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
              filterTab === tab
                ? "bg-jollof-amber text-jollof-bg"
                : "bg-jollof-surface text-jollof-text-muted hover:text-jollof-text"
            }`}
          >
            {tab === "ALL" ? "All Items" : tab === "EVENT" ? "Event" : "Takeaway"}
          </button>
        ))}
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
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Suya Skewers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={addCategory}
                  onChange={(e) => {
                    const cat = e.target.value as MenuCategory;
                    setAddCategory(cat);
                    setAddEmoji(EMOJI_SUGGESTIONS[cat][0]);
                  }}
                  className={inputClass}
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
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                className={inputClass}
                placeholder="Short description of the dish"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <select
                  value={addAvailability}
                  onChange={(e) => setAddAvailability(e.target.value as MenuItemAvailability)}
                  className={inputClass}
                >
                  <option value="BOTH">Both (Event + Takeaway)</option>
                  <option value="EVENT">Event Only</option>
                  <option value="TAKEAWAY">Takeaway Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (&pound;) {addAvailability !== "EVENT" && <span className="text-jollof-amber">*</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 8.00"
                  required={addAvailability !== "EVENT"}
                />
                <p className="text-xs text-jollof-text-muted mt-1">
                  Required for takeaway items
                </p>
              </div>
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
                  {catItems.map((item) => {
                    const isEditing = editingId === item.id;

                    if (isEditing) {
                      return (
                        <div
                          key={item.id}
                          className="bg-jollof-surface rounded-xl p-4 border border-jollof-amber"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">Edit Item</h3>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-jollof-text-muted hover:text-jollof-text p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={inputClass}
                                placeholder="Name"
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as MenuCategory)}
                                className={inputClass}
                              >
                                {CATEGORY_ORDER.map((cat) => (
                                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                                ))}
                              </select>
                              <select
                                value={editAvailability}
                                onChange={(e) => setEditAvailability(e.target.value as MenuItemAvailability)}
                                className={inputClass}
                              >
                                <option value="BOTH">Both</option>
                                <option value="EVENT">Event Only</option>
                                <option value="TAKEAWAY">Takeaway Only</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className={inputClass}
                                placeholder="Description"
                              />
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className={inputClass}
                                placeholder="Price (£)"
                              />
                              <input
                                type="text"
                                value={editEmoji}
                                onChange={(e) => setEditEmoji(e.target.value)}
                                className={inputClass}
                                placeholder="Emoji"
                                maxLength={2}
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editActive}
                                  onChange={(e) => setEditActive(e.target.checked)}
                                  className="accent-jollof-amber"
                                />
                                Active
                              </label>
                              <div className="ml-auto flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  disabled={saving}
                                  className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm"
                                >
                                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-3 py-1.5 rounded-lg transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className={`bg-jollof-surface rounded-xl p-4 border border-jollof-border flex items-center gap-4 ${
                          item.active === false ? "opacity-50" : ""
                        }`}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold">{item.name}</p>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                AVAILABILITY_COLORS[item.availability || "BOTH"]
                              }`}
                            >
                              {AVAILABILITY_LABELS[item.availability || "BOTH"]}
                            </span>
                            {item.active === false && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-red-600/20 text-red-400 border-red-500/40">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {item.description && (
                              <p className="text-sm text-jollof-text-muted truncate">
                                {item.description}
                              </p>
                            )}
                            {item.pricePence && (
                              <span className="text-sm font-semibold text-jollof-amber shrink-0">
                                {formatPence(item.pricePence)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-jollof-text-muted hover:text-jollof-amber transition-colors p-2 rounded-lg hover:bg-jollof-amber/10"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil size={16} />
                          </button>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
