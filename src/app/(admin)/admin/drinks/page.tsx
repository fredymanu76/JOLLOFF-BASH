"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wine,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { AddOn, AddOnCategory } from "@/types";
import { formatPence } from "@/lib/utils";

const CATEGORY_LABELS: Record<AddOnCategory, string> = {
  WINE: "Wine",
  BEER: "Beer",
  SOFT_DRINK: "Soft Drinks",
  SPIRIT: "Spirits",
  OTHER: "Other",
};

const CATEGORY_ORDER: AddOnCategory[] = [
  "WINE",
  "BEER",
  "SOFT_DRINK",
  "SPIRIT",
  "OTHER",
];

export default function AdminDrinksPage() {
  const [items, setItems] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState<AddOnCategory>("WINE");
  const [addDescription, setAddDescription] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDrinks = useCallback(async () => {
    try {
      const res = await fetch("/api/drinks");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Failed to load drinks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addPrice) return;

    setAdding(true);
    setError("");

    try {
      const pricePence = Math.round(parseFloat(addPrice) * 100);
      if (isNaN(pricePence) || pricePence <= 0) {
        throw new Error("Please enter a valid price");
      }

      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          pricePence,
          category: addCategory,
          description: addDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => [...prev, data.item]);
      setAddName("");
      setAddPrice("");
      setAddDescription("");
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add drink");
    } finally {
      setAdding(false);
    }
  }

  async function handleSavePrice(id: string) {
    setSaving(true);
    setError("");

    try {
      const pricePence = Math.round(parseFloat(editPrice) * 100);
      if (isNaN(pricePence) || pricePence <= 0) {
        throw new Error("Please enter a valid price");
      }

      const res = await fetch("/api/drinks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pricePence }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, pricePence } : item
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update price");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/drinks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete drink");
    } finally {
      setDeleting(null);
    }
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: items.filter((item) => item.category === cat),
  })).filter(({ items: catItems }) => catItems.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Wine size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Drinks Menu</h1>
            <p className="text-xs text-jollof-text-muted">
              Manage drinks available as add-ons when booking
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Drink
        </button>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border mb-6">
          <h2 className="font-semibold text-lg mb-4">Add Drink</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                  placeholder="e.g. House Red Wine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={addCategory}
                  onChange={(e) =>
                    setAddCategory(e.target.value as AddOnCategory)
                  }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (&pound;)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                  placeholder="e.g. 5.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                  placeholder="Short description"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding || !addName.trim() || !addPrice}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Add Drink
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

      {/* Drinks by category */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            No drinks added yet. Add drinks that customers can purchase as
            add-ons when booking.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, label, items: catItems }) => (
            <div key={category}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-jollof-amber" />
                {label}
                <span className="text-sm font-normal text-jollof-text-muted">
                  ({catItems.length})
                </span>
              </h2>

              <div className="grid gap-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-jollof-surface rounded-xl p-4 border border-jollof-border flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-jollof-text-muted truncate">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-jollof-text-muted">
                          &pound;
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 bg-jollof-bg border border-jollof-border rounded-lg px-2 py-1 text-sm text-jollof-text focus:border-jollof-amber focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          disabled={saving}
                          className="text-jollof-amber hover:text-jollof-amber-dark transition-colors p-1"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-jollof-text-muted hover:text-jollof-text transition-colors p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditPrice((item.pricePence / 100).toFixed(2));
                        }}
                        className="text-jollof-amber font-semibold text-sm inline-flex items-center gap-1 hover:underline"
                      >
                        {formatPence(item.pricePence)}
                        <Pencil size={12} />
                      </button>
                    )}

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
