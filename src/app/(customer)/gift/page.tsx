"use client";

import { Gift } from "lucide-react";

export default function GiftPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Gift size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Gift a Ticket</h1>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          Gift ticket purchasing will be available once an event is published.
        </p>
      </div>
    </div>
  );
}
