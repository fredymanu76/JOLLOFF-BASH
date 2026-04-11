"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { TimeSlot } from "@/types";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminTimeSlotsPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [formStart, setFormStart] = useState("12:00");
  const [formEnd, setFormEnd] = useState("13:00");
  const [formMax, setFormMax] = useState("10");
  const [formType, setFormType] = useState<"recurring" | "specific">("recurring");
  const [formDay, setFormDay] = useState("6"); // Saturday
  const [formDate, setFormDate] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editMax, setEditMax] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/takeaway/timeslots");
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setError("Failed to load time slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formLabel.trim()) return;

    setCreating(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        label: formLabel.trim(),
        startTime: formStart,
        endTime: formEnd,
        maxOrders: parseInt(formMax) || 10,
      };

      if (formType === "recurring") {
        body.dayOfWeek = parseInt(formDay);
      } else {
        body.specificDate = formDate;
      }

      const res = await fetch("/api/takeaway/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSlots((prev) => [...prev, data.slot]);
      setShowCreate(false);
      setFormLabel("");
      setFormStart("12:00");
      setFormEnd("13:00");
      setFormMax("10");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create slot");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(slot: TimeSlot) {
    setEditingId(slot.id);
    setEditLabel(slot.label);
    setEditStart(slot.startTime);
    setEditEnd(slot.endTime);
    setEditMax(String(slot.maxOrders));
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/takeaway/timeslots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          label: editLabel.trim(),
          startTime: editStart,
          endTime: editEnd,
          maxOrders: parseInt(editMax) || 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSlots((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, label: editLabel.trim(), startTime: editStart, endTime: editEnd, maxOrders: parseInt(editMax) || 10 }
            : s
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save slot");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/takeaway/timeslots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete slot");
    } finally {
      setDeleting(null);
    }
  }

  const inputClass =
    "w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Delivery Slots</h1>
            <p className="text-xs text-jollof-text-muted">
              Manage next day delivery time windows
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Slot
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
          <h2 className="font-semibold text-lg mb-4">Add Time Slot</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                required
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className={inputClass}
                placeholder="e.g. Lunch Window, Evening Pickup"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Orders</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formMax}
                  onChange={(e) => setFormMax(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as "recurring" | "specific")}
                  className={inputClass}
                >
                  <option value="recurring">Recurring (day of week)</option>
                  <option value="specific">Specific date</option>
                </select>
              </div>
            </div>

            {formType === "recurring" ? (
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className={inputClass}
                >
                  {DAYS_OF_WEEK.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Specific Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !formLabel.trim()}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create Slot
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

      {/* Slots list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            No time slots created yet. Add your first slot to enable takeaway orders.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {slots.map((slot) => {
            const isEditing = editingId === slot.id;

            if (isEditing) {
              return (
                <div key={slot.id} className="bg-jollof-surface rounded-xl p-4 border border-jollof-amber">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className={inputClass} placeholder="Label" />
                    <input type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)} className={inputClass} />
                    <input type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className={inputClass} />
                    <input type="number" min="1" value={editMax} onChange={(e) => setEditMax(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(slot.id)}
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
              );
            }

            return (
              <div
                key={slot.id}
                className="bg-jollof-surface rounded-xl p-4 border border-jollof-border flex items-center gap-4"
              >
                <Clock size={20} className="text-jollof-amber shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{slot.label}</p>
                  <p className="text-sm text-jollof-text-muted">
                    {slot.startTime} &mdash; {slot.endTime}
                    {slot.dayOfWeek !== undefined && ` (${DAYS_OF_WEEK[slot.dayOfWeek]})`}
                    {slot.specificDate && ` (${slot.specificDate})`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    {slot.currentOrders}/{slot.maxOrders}
                  </p>
                  <p className="text-xs text-jollof-text-muted">orders</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(slot)}
                    className="text-jollof-text-muted hover:text-jollof-amber transition-colors p-2 rounded-lg hover:bg-jollof-amber/10"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    disabled={deleting === slot.id}
                    className="text-jollof-text-muted hover:text-jollof-red transition-colors p-2 rounded-lg hover:bg-jollof-red/10 disabled:opacity-50"
                  >
                    {deleting === slot.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
