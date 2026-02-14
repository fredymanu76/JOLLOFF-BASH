"use client";

import { Ticket } from "lucide-react";

export default function AdminBookingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Ticket size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          No bookings yet. Bookings will appear here once customers start
          reserving seats.
        </p>
      </div>
    </div>
  );
}
