"use client";

import { Wine, Plus } from "lucide-react";

export default function AdminDrinksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Wine size={28} className="text-jollof-amber" />
          <h1 className="text-2xl font-bold">Drinks Menu</h1>
        </div>
        <button className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Drink
        </button>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          No drinks added yet. Add drinks that customers can purchase as add-ons
          when booking.
        </p>
      </div>
    </div>
  );
}
