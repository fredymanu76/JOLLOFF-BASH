"use client";

import { useState } from "react";
import { TicketCheck, Search, Gift, CalendarDays, MapPin, Loader2 } from "lucide-react";
import { MealSummary } from "@/components/booking/MealSelector";
import { formatPence } from "@/lib/utils";
import { VENUE } from "@/lib/constants";
import type { MealSelection } from "@/types";

interface GiftResult {
  id: string;
  recipientName: string;
  recipientPhone: string;
  purchaserName: string;
  code: string;
  status: string;
  seats: number;
  mealSelection: MealSelection;
  pricePaidPence: number;
  eventDate?: string;
}

export default function RedeemPage() {
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState<GiftResult[]>([]);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/gifts/lookup?phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to look up gifts");
      }

      setGifts(data.gifts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGifts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <TicketCheck size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Redeem Gift Ticket</h1>
      </div>
      <p className="text-jollof-text-muted mb-6">
        Enter your phone number to find gift tickets sent to you
      </p>

      {/* Search form */}
      <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
              placeholder="Your phone number (07XXX XXXXXX)"
            />
          </div>
          <button
            type="submit"
            disabled={!phone.trim() || loading}
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Look Up
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && gifts.length === 0 && !error && (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <Gift size={40} className="text-jollof-text-muted mx-auto mb-4" />
          <p className="text-jollof-text-muted">
            No gift tickets found for this phone number. Double-check the
            number and try again.
          </p>
        </div>
      )}

      {gifts.length > 0 && (
        <div className="space-y-4">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="bg-jollof-surface rounded-xl border border-jollof-border overflow-hidden"
            >
              {/* Gift header */}
              <div className="bg-jollof-amber/10 px-6 py-3 border-b border-jollof-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-jollof-amber" />
                  <span className="font-semibold text-jollof-amber text-sm">
                    Gift from {gift.purchaserName}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    gift.status === "PURCHASED"
                      ? "bg-green-500/10 text-green-400"
                      : gift.status === "REDEEMED"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-jollof-text-muted/10 text-jollof-text-muted"
                  }`}
                >
                  {gift.status}
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Recipient info */}
                <div>
                  <p className="font-semibold text-lg">{gift.recipientName}</p>
                  <p className="text-sm text-jollof-text-muted">
                    {gift.seats} seat{gift.seats > 1 ? "s" : ""} &middot;{" "}
                    {formatPence(gift.pricePaidPence)} paid
                  </p>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-2 text-sm text-jollof-text-muted">
                  <MapPin size={14} />
                  <span>
                    {VENUE.name}, {VENUE.address}, {VENUE.postcode}
                  </span>
                </div>

                {gift.eventDate && (
                  <div className="flex items-center gap-2 text-sm text-jollof-text-muted">
                    <CalendarDays size={14} />
                    <span>{gift.eventDate}</span>
                  </div>
                )}

                {/* Meal selection */}
                <div>
                  <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                    Your Meal
                  </p>
                  <MealSummary selection={gift.mealSelection} />
                </div>

                {/* Booking code */}
                <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border text-center">
                  <p className="text-xs text-jollof-text-muted mb-1">
                    Booking Code
                  </p>
                  <p className="text-2xl font-mono font-bold text-jollof-amber tracking-widest">
                    {gift.code}
                  </p>
                  <p className="text-xs text-jollof-text-muted mt-1">
                    Show this at the door
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
