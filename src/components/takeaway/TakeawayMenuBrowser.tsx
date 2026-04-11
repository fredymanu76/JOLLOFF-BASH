"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Loader2, ShoppingBag } from "lucide-react";
import { formatPence } from "@/lib/utils";
import type { MenuItem, MenuCategory, TakeawayOrderItem } from "@/types";

interface TakeawayMenuBrowserProps {
  onChange: (items: TakeawayOrderItem[]) => void;
}

const CATEGORY_ORDER: MenuCategory[] = ["STARTER", "MAIN", "DESSERT"];

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  STARTER: "Starters",
  MAIN: "Mains",
  DESSERT: "Desserts",
};

export default function TakeawayMenuBrowser({
  onChange,
}: TakeawayMenuBrowserProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu?availability=TAKEAWAY");
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        setMenuItems(data.items || []);
      } catch {
        setError("Could not load the menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  function updateQuantity(item: MenuItem, delta: number) {
    setQuantities((prev) => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [item.id]: next };

      // Build order items and notify parent
      const orderItems: TakeawayOrderItem[] = menuItems
        .filter((mi) => (updated[mi.id] || 0) > 0)
        .map((mi) => ({
          menuItemId: mi.id,
          name: mi.name,
          quantity: updated[mi.id],
          unitPricePence: mi.pricePence || 0,
        }));
      onChange(orderItems);

      return updated;
    });
  }

  // Group items by category
  const grouped = CATEGORY_ORDER.reduce<Record<MenuCategory, MenuItem[]>>(
    (acc, cat) => {
      acc[cat] = menuItems.filter((i) => i.category === cat);
      return acc;
    },
    { STARTER: [], MAIN: [], DESSERT: [] }
  );

  // Calculate subtotal
  const subtotalPence = menuItems.reduce((sum, item) => {
    const qty = quantities[item.id] || 0;
    return sum + qty * (item.pricePence || 0);
  }, 0);

  const totalItems = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={28} className="text-jollof-amber animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-4 text-sm">
        {error}
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          No takeaway items available right now. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {CATEGORY_ORDER.map((category) => {
        const items = grouped[category];
        if (items.length === 0) return null;
        return (
          <div key={category} className="mb-6">
            <h3 className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-3">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const qty = quantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 bg-jollof-surface rounded-lg p-3 border transition-colors ${
                      qty > 0
                        ? "border-jollof-amber/50"
                        : "border-jollof-border"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-jollof-text-muted line-clamp-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-jollof-amber font-semibold mt-0.5">
                        {formatPence(item.pricePence || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        disabled={qty <= 0}
                        className="w-7 h-7 rounded-full bg-jollof-bg border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors disabled:opacity-30"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="w-7 h-7 rounded-full bg-jollof-bg border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Running subtotal */}
      <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-jollof-amber" />
            <span className="text-sm text-jollof-text-muted">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-jollof-text-muted">Subtotal</p>
            <p className="font-bold text-jollof-amber">
              {formatPence(subtotalPence)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
