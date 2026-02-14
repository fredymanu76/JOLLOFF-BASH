"use client";

import { Megaphone, Plus } from "lucide-react";

export default function AdminBroadcastsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone size={28} className="text-jollof-amber" />
          <h1 className="text-2xl font-bold">Broadcasts</h1>
        </div>
        <button className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          No broadcasts sent yet. Send email or push notifications to your
          customers.
        </p>
      </div>
    </div>
  );
}
