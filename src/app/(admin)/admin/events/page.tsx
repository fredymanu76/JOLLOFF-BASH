"use client";

import { CalendarDays, Plus } from "lucide-react";

export default function AdminEventsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarDays size={28} className="text-jollof-amber" />
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <button className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          No events created yet. Create your first event to get started.
        </p>
      </div>
    </div>
  );
}
