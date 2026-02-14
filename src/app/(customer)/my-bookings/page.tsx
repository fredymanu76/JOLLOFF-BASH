"use client";

import { Ticket } from "lucide-react";

export default function MyBookingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Ticket size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          You don&apos;t have any bookings yet. Book your first seat at the next
          Jollof Bash!
        </p>
      </div>
    </div>
  );
}
