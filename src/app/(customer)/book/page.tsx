"use client";

import { CalendarDays } from "lucide-react";
import { getNextEventDate, formatEventDate, formatEventTime, formatPence } from "@/lib/utils";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE } from "@/lib/constants";

export default function BookPage() {
  const nextEvent = getNextEventDate();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Book Seats</h1>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border">
        <h2 className="text-lg font-semibold mb-4">Next Event</h2>
        <p className="text-jollof-text-muted mb-2">
          {formatEventDate(nextEvent)} at {formatEventTime(nextEvent)}
        </p>
        <p className="text-jollof-text-muted mb-6">
          {formatPence(SEAT_PRICE_PENCE)} per seat + {formatPence(CORKAGE_FEE_PENCE)} corkage
        </p>
        <p className="text-jollof-text-muted text-sm">
          Booking will be available once the event is published by the organiser.
        </p>
      </div>
    </div>
  );
}
