"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  MENU_STARTERS,
  MENU_MAINS,
  MENU_DESSERTS,
  VENUE,
} from "@/lib/constants";
import { formatPence } from "@/lib/utils";
import type { MenuItem, MenuCategory } from "@/types";

function MenuSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: MenuItem[];
  accent: string;
}) {
  return (
    <div>
      <h3
        className="text-xl font-bold mb-4 pb-2 border-b-2"
        style={{ borderColor: accent }}
      >
        {title}
      </h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{item.name}</p>
                {item.pricePence && (
                  <span className="text-xs font-semibold text-jollof-amber">
                    {formatPence(item.pricePence)}
                  </span>
                )}
              </div>
              <p className="text-sm text-jollof-text-muted">
                {item.description}
              </p>
              {item.availability && item.availability !== "BOTH" && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                  item.availability === "EVENT"
                    ? "bg-amber-600/20 text-amber-400"
                    : "bg-green-600/20 text-green-400"
                }`}>
                  {item.availability === "EVENT" ? "Event" : "Takeaway"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuShowcase() {
  const [starters, setStarters] = useState<MenuItem[]>(MENU_STARTERS);
  const [mains, setMains] = useState<MenuItem[]>(MENU_MAINS);
  const [desserts, setDesserts] = useState<MenuItem[]>(MENU_DESSERTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        const items: MenuItem[] = data.items || [];
        if (items.length > 0) {
          setStarters(items.filter((i: MenuItem) => i.category === ("STARTER" as MenuCategory)));
          setMains(items.filter((i: MenuItem) => i.category === ("MAIN" as MenuCategory)));
          setDesserts(items.filter((i: MenuItem) => i.category === ("DESSERT" as MenuCategory)));
        }
      } catch {
        // Keep defaults from constants
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  return (
    <section id="menu" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-jollof-amber font-semibold text-sm uppercase tracking-wide mb-2">
            What&apos;s Cooking
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The <span className="text-jollof-amber">Menu</span>
          </h2>
          <p className="text-jollof-text-muted max-w-lg mx-auto">
            Food served mezze/buffet style at{" "}
            <span className="text-jollof-text font-medium">
              {VENUE.name}
            </span>
            , {VENUE.location}, {VENUE.address}, {VENUE.postcode}
          </p>
        </div>

        {/* Kente pattern divider */}
        <div className="flex justify-center gap-1 mb-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  i % 4 === 0
                    ? "#DC2626"
                    : i % 4 === 1
                      ? "#F59E0B"
                      : i % 4 === 2
                        ? "#16A34A"
                        : "#1C1917",
              }}
            />
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-jollof-amber animate-spin" />
          </div>
        ) : (
          <>
            {/* Menu grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border">
                <MenuSection
                  title="Starter"
                  items={starters}
                  accent="#F59E0B"
                />
              </div>

              <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border md:row-span-1">
                <MenuSection
                  title="Main Course"
                  items={mains}
                  accent="#DC2626"
                />
              </div>

              <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border">
                <MenuSection
                  title="Dessert"
                  items={desserts}
                  accent="#F59E0B"
                />
              </div>
            </div>

            {/* Food images row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop&q=80"
                  alt="Jollof rice"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=400&fit=crop&q=80"
                  alt="Grilled chicken"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1590689080478-14f5e4a4c5e0?w=400&h=400&fit=crop&q=80"
                  alt="Fried plantain"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1567982047351-76b6f93e38ee?w=400&h=400&fit=crop&q=80"
                  alt="African stew"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </>
        )}

        {/* BYOB notice */}
        <div className="bg-jollof-amber/10 border border-jollof-amber/30 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-jollof-amber mb-1">
            BYOB — Bring Your Own Bottle!
          </p>
          <p className="text-jollof-text-muted">
            Corkage fee of just &pound;2 per person if bringing your own.
            Alternatively, order drinks from our menu when you book!
          </p>
        </div>
      </div>
    </section>
  );
}
