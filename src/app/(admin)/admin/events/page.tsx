"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Users,
  Pencil,
  Check,
  X,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { JollofEvent, EventStatus } from "@/types";
import type { MenuItem, MenuCategory } from "@/lib/constants";
import {
  formatPence,
  formatEventDate,
  formatEventTime,
  getNextEventDate,
  getMonthKey,
} from "@/lib/utils";
import {
  SEAT_PRICE_PENCE,
  CORKAGE_FEE_PENCE,
  DEFAULT_CAPACITY,
  VENUE,
} from "@/lib/constants";

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SOLD_OUT: "Sold Out",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "bg-stone-600/30 text-stone-300 border-stone-500/40",
  PUBLISHED: "bg-green-600/20 text-green-400 border-green-500/40",
  SOLD_OUT: "bg-amber-600/20 text-amber-400 border-amber-500/40",
  CANCELLED: "bg-red-600/20 text-red-400 border-red-500/40",
  COMPLETED: "bg-stone-600/20 text-stone-400 border-stone-500/30",
};

const ALL_STATUSES: EventStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "SOLD_OUT",
  "CANCELLED",
  "COMPLETED",
];

const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  STARTER: "Starters",
  MAIN: "Mains",
  DESSERT: "Desserts",
};

const MENU_CATEGORY_ORDER: MenuCategory[] = ["STARTER", "MAIN", "DESSERT"];

function getDefaultDate(): string {
  const d = getNextEventDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateToInputValue(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToInputValue(iso: string): string {
  const d = new Date(iso);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<JollofEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // All menu items for selection
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formDate, setFormDate] = useState(getDefaultDate);
  const [formTime, setFormTime] = useState("18:30");
  const [formCapacity, setFormCapacity] = useState(String(DEFAULT_CAPACITY));
  const [formSeatPrice, setFormSeatPrice] = useState(
    (SEAT_PRICE_PENCE / 100).toFixed(2)
  );
  const [formCorkage, setFormCorkage] = useState(
    (CORKAGE_FEE_PENCE / 100).toFixed(2)
  );
  const [formVenueName, setFormVenueName] = useState<string>(VENUE.name);
  const [formVenueAddress, setFormVenueAddress] = useState<string>(VENUE.address);
  const [formVenuePostcode, setFormVenuePostcode] = useState<string>(VENUE.postcode);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editSeatPrice, setEditSeatPrice] = useState("");
  const [editCorkage, setEditCorkage] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editVenueAddress, setEditVenueAddress] = useState("");
  const [editVenuePostcode, setEditVenuePostcode] = useState("");
  const [saving, setSaving] = useState(false);

  // Menu selection state
  const [menuEventId, setMenuEventId] = useState<string | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [savingMenu, setSavingMenu] = useState(false);

  // Status & delete loading states
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.items || []);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setAllMenuItems(data.items || []);
    } catch {
      // Menu items will just be empty
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchMenuItems();
  }, [fetchEvents, fetchMenuItems]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formDate || !formTime) return;

    setCreating(true);
    setError("");

    try {
      const dateTime = new Date(`${formDate}T${formTime}:00`).toISOString();
      const monthKey = getMonthKey(new Date(formDate));
      const capacity = parseInt(formCapacity) || DEFAULT_CAPACITY;
      const seatPricePence = Math.round(parseFloat(formSeatPrice) * 100);
      const corkageFeePence = Math.round(parseFloat(formCorkage) * 100);

      if (isNaN(seatPricePence) || seatPricePence <= 0) {
        throw new Error("Please enter a valid seat price");
      }
      if (isNaN(corkageFeePence) || corkageFeePence < 0) {
        throw new Error("Please enter a valid corkage fee");
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime,
          monthKey,
          capacity,
          pricing: { seatPricePence, corkageFeePence },
          venue: {
            name: formVenueName.trim(),
            address: formVenueAddress.trim(),
            postcode: formVenuePostcode.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents((prev) => [data.item, ...prev]);
      setShowCreate(false);
      setFormDate(getDefaultDate());
      setFormTime("18:30");
      setFormCapacity(String(DEFAULT_CAPACITY));
      setFormSeatPrice((SEAT_PRICE_PENCE / 100).toFixed(2));
      setFormCorkage((CORKAGE_FEE_PENCE / 100).toFixed(2));
      setFormVenueName(VENUE.name);
      setFormVenueAddress(VENUE.address);
      setFormVenuePostcode(VENUE.postcode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(ev: JollofEvent) {
    setEditingId(ev.id);
    setEditDate(dateToInputValue(ev.dateTime));
    setEditTime(timeToInputValue(ev.dateTime));
    setEditCapacity(String(ev.capacity));
    setEditSeatPrice((ev.pricing.seatPricePence / 100).toFixed(2));
    setEditCorkage((ev.pricing.corkageFeePence / 100).toFixed(2));
    setEditVenueName(ev.venue.name);
    setEditVenueAddress(ev.venue.address);
    setEditVenuePostcode(ev.venue.postcode);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setError("");

    try {
      const dateTime = new Date(
        `${editDate}T${editTime}:00`
      ).toISOString();
      const monthKey = getMonthKey(new Date(editDate));
      const capacity = parseInt(editCapacity) || DEFAULT_CAPACITY;
      const seatPricePence = Math.round(parseFloat(editSeatPrice) * 100);
      const corkageFeePence = Math.round(parseFloat(editCorkage) * 100);

      if (isNaN(seatPricePence) || seatPricePence <= 0) {
        throw new Error("Please enter a valid seat price");
      }
      if (isNaN(corkageFeePence) || corkageFeePence < 0) {
        throw new Error("Please enter a valid corkage fee");
      }

      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          dateTime,
          monthKey,
          capacity,
          pricing: { seatPricePence, corkageFeePence },
          venue: {
            name: editVenueName.trim(),
            address: editVenueAddress.trim(),
            postcode: editVenuePostcode.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id
            ? {
                ...ev,
                dateTime,
                monthKey,
                capacity,
                pricing: { seatPricePence, corkageFeePence },
                venue: {
                  name: editVenueName.trim(),
                  address: editVenueAddress.trim(),
                  postcode: editVenuePostcode.trim(),
                },
              }
            : ev
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: EventStatus) {
    setUpdatingStatus(id);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, status: newStatus } : ev
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete event"
      );
    } finally {
      setDeleting(null);
    }
  }

  function openMenuPicker(ev: JollofEvent) {
    if (menuEventId === ev.id) {
      setMenuEventId(null);
      return;
    }
    setMenuEventId(ev.id);
    setSelectedMenuIds([...ev.menu]);
  }

  function toggleMenuItem(itemId: string) {
    setSelectedMenuIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  async function handleSaveMenu(eventId: string) {
    setSavingMenu(true);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId, menu: selectedMenuIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, menu: selectedMenuIds } : ev
        )
      );
      setMenuEventId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu");
    } finally {
      setSavingMenu(false);
    }
  }

  const inputClass =
    "w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarDays size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-xs text-jollof-text-muted">
              Create and manage monthly supper club events
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Create Event
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
          <h2 className="font-semibold text-lg mb-4">Create Event</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Seat Price (&pound;)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formSeatPrice}
                  onChange={(e) => setFormSeatPrice(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Corkage Fee (&pound;)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formCorkage}
                  onChange={(e) => setFormCorkage(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  required
                  value={formVenueName}
                  onChange={(e) => setFormVenueName(e.target.value)}
                  className={inputClass}
                  placeholder="Venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={formVenueAddress}
                  onChange={(e) => setFormVenueAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  required
                  value={formVenuePostcode}
                  onChange={(e) => setFormVenuePostcode(e.target.value)}
                  className={inputClass}
                  placeholder="Postcode"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !formDate || !formTime}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Create Event
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

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            No events created yet. Create your first event to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const dt = new Date(ev.dateTime);
            const isEditing = editingId === ev.id;
            const isMenuOpen = menuEventId === ev.id;

            return (
              <div
                key={ev.id}
                className="bg-jollof-surface rounded-xl border border-jollof-border"
              >
                {/* Main card content */}
                <div className="p-5">
                  {isEditing ? (
                    /* ---- EDIT MODE ---- */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">Edit Event</h3>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-jollof-text-muted hover:text-jollof-text p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Time
                          </label>
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Capacity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Seat Price (&pound;)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editSeatPrice}
                            onChange={(e) => setEditSeatPrice(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Corkage Fee (&pound;)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editCorkage}
                            onChange={(e) => setEditCorkage(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Venue Name
                          </label>
                          <input
                            type="text"
                            value={editVenueName}
                            onChange={(e) => setEditVenueName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Address
                          </label>
                          <input
                            type="text"
                            value={editVenueAddress}
                            onChange={(e) =>
                              setEditVenueAddress(e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-jollof-text-muted">
                            Postcode
                          </label>
                          <input
                            type="text"
                            value={editVenuePostcode}
                            onChange={(e) =>
                              setEditVenuePostcode(e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveEdit(ev.id)}
                          disabled={saving}
                          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- VIEW MODE ---- */
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {formatEventDate(dt)}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[ev.status]}`}
                          >
                            {STATUS_LABELS[ev.status]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-jollof-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            {formatEventTime(dt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {ev.venue.name}, {ev.venue.postcode}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={14} />
                            {ev.seatsBooked}/{ev.capacity} seats
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UtensilsCrossed size={14} />
                            {ev.menu.length} menu items
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-jollof-text-muted">
                          <span>
                            Seat: {formatPence(ev.pricing.seatPricePence)}
                          </span>
                          <span>
                            Corkage: {formatPence(ev.pricing.corkageFeePence)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(ev)}
                          className="text-jollof-text-muted hover:text-jollof-amber transition-colors p-2 rounded-lg hover:bg-jollof-amber/10"
                          aria-label="Edit event"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => openMenuPicker(ev)}
                          className={`transition-colors p-2 rounded-lg ${
                            isMenuOpen
                              ? "text-jollof-amber bg-jollof-amber/10"
                              : "text-jollof-text-muted hover:text-jollof-amber hover:bg-jollof-amber/10"
                          }`}
                          aria-label="Manage menu"
                        >
                          <UtensilsCrossed size={16} />
                        </button>

                        <select
                          value={ev.status}
                          onChange={(e) =>
                            handleStatusChange(
                              ev.id,
                              e.target.value as EventStatus
                            )
                          }
                          disabled={updatingStatus === ev.id}
                          className="bg-jollof-bg border border-jollof-border rounded-lg px-3 py-2 text-sm text-jollof-text focus:border-jollof-amber focus:outline-none disabled:opacity-50"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>

                        {updatingStatus === ev.id && (
                          <Loader2
                            size={16}
                            className="text-jollof-amber animate-spin"
                          />
                        )}

                        <button
                          onClick={() => handleDelete(ev.id)}
                          disabled={deleting === ev.id}
                          className="text-jollof-text-muted hover:text-jollof-red transition-colors p-2 rounded-lg hover:bg-jollof-red/10 disabled:opacity-50"
                          aria-label="Delete event"
                        >
                          {deleting === ev.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu picker panel */}
                {isMenuOpen && !isEditing && (
                  <div className="border-t border-jollof-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <UtensilsCrossed size={16} className="text-jollof-amber" />
                        Select Menu for This Event
                      </h4>
                      <button
                        onClick={() => setMenuEventId(null)}
                        className="text-jollof-text-muted hover:text-jollof-text p-1"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>

                    {allMenuItems.length === 0 ? (
                      <p className="text-sm text-jollof-text-muted">
                        No menu items found. Add items in the Menu page first.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {MENU_CATEGORY_ORDER.map((cat) => {
                          const catItems = allMenuItems.filter(
                            (m) => m.category === cat
                          );
                          if (catItems.length === 0) return null;
                          return (
                            <div key={cat}>
                              <h5 className="text-xs font-semibold text-jollof-text-muted uppercase tracking-wider mb-2">
                                {MENU_CATEGORY_LABELS[cat]}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {catItems.map((item) => {
                                  const selected = selectedMenuIds.includes(
                                    item.id
                                  );
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => toggleMenuItem(item.id)}
                                      className={`text-left p-3 rounded-lg border transition-colors ${
                                        selected
                                          ? "border-jollof-amber bg-jollof-amber/10"
                                          : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                          {item.emoji}
                                        </span>
                                        <span className="text-sm font-medium">
                                          {item.name}
                                        </span>
                                        {selected && (
                                          <Check
                                            size={14}
                                            className="text-jollof-amber ml-auto"
                                          />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleSaveMenu(ev.id)}
                            disabled={savingMenu}
                            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm"
                          >
                            {savingMenu ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            Save Menu ({selectedMenuIds.length} items)
                          </button>
                          <button
                            onClick={() => {
                              // Select all
                              setSelectedMenuIds(
                                allMenuItems.map((m) => m.id)
                              );
                            }}
                            className="text-sm text-jollof-amber hover:underline"
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => setSelectedMenuIds([])}
                            className="text-sm text-jollof-text-muted hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
