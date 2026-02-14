"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  MENU_STARTERS,
  MENU_MAINS,
  MENU_DESSERTS,
  type MenuItem,
  type MenuCategory,
} from "@/lib/constants";
import type { MealSelection } from "@/types";
import { cn } from "@/lib/utils";

interface MealSelectorProps {
  value: MealSelection;
  onChange: (selection: MealSelection) => void;
  label?: string;
}

function MenuItemCard({
  item,
  selected,
  onToggle,
}: {
  item: MenuItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
        selected
          ? "border-jollof-amber bg-jollof-amber/10 ring-1 ring-jollof-amber"
          : "border-jollof-border bg-jollof-bg hover:border-jollof-surface-light"
      )}
    >
      <span className="text-2xl shrink-0 mt-0.5">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{item.name}</p>
        <p className="text-xs text-jollof-text-muted mt-0.5">
          {item.description}
        </p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 bg-jollof-amber rounded-full p-0.5">
          <Check size={12} className="text-jollof-bg" />
        </div>
      )}
    </button>
  );
}

export function MealSelector({ value, onChange, label }: MealSelectorProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [starters, setStarters] = useState<MenuItem[]>(MENU_STARTERS);
  const [mains, setMains] = useState<MenuItem[]>(MENU_MAINS);
  const [desserts, setDesserts] = useState<MenuItem[]>(MENU_DESSERTS);
  const [menuLoading, setMenuLoading] = useState(true);

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
        setMenuLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const steps = [
    { title: "Choose your Starter", items: starters },
    { title: "Choose your Mains", subtitle: "Served buffet style — pick all you fancy", items: mains },
    { title: "Choose your Dessert", items: desserts },
  ];

  const currentStep = steps[step];
  const canGoNext =
    (step === 0 && value.starter) ||
    (step === 1 && value.mains.length > 0) ||
    (step === 2 && value.dessert);

  function handleSelect(item: MenuItem) {
    if (step === 0) {
      onChange({ ...value, starter: value.starter === item.id ? "" : item.id });
    } else if (step === 1) {
      const newMains = value.mains.includes(item.id)
        ? value.mains.filter((id) => id !== item.id)
        : [...value.mains, item.id];
      onChange({ ...value, mains: newMains });
    } else {
      onChange({ ...value, dessert: value.dessert === item.id ? "" : item.id });
    }
  }

  function isSelected(item: MenuItem): boolean {
    if (step === 0) return value.starter === item.id;
    if (step === 1) return value.mains.includes(item.id);
    return value.dessert === item.id;
  }

  const isComplete = value.starter && value.mains.length > 0 && value.dessert;

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="text-jollof-amber animate-spin" />
        <span className="ml-2 text-sm text-jollof-text-muted">Loading menu...</span>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <p className="font-semibold text-jollof-amber mb-3">{label}</p>
      )}

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-4">
        {["Starter", "Mains", "Dessert"].map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => setStep(i as 0 | 1 | 2)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors",
              step === i
                ? "bg-jollof-amber text-jollof-bg font-semibold"
                : (i === 0 && value.starter) ||
                    (i === 1 && value.mains.length > 0) ||
                    (i === 2 && value.dessert)
                  ? "bg-jollof-amber/20 text-jollof-amber"
                  : "bg-jollof-surface text-jollof-text-muted"
            )}
          >
            {((i === 0 && value.starter) ||
              (i === 1 && value.mains.length > 0) ||
              (i === 2 && value.dessert)) && <Check size={12} />}
            {name}
          </button>
        ))}
      </div>

      {/* Current step */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">{currentStep.title}</h3>
        {"subtitle" in currentStep && currentStep.subtitle && (
          <p className="text-xs text-jollof-text-muted mb-3">
            {currentStep.subtitle}
          </p>
        )}
        <div className="grid gap-2">
          {currentStep.items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              selected={isSelected(item)}
              onToggle={() => handleSelect(item)}
            />
          ))}
        </div>
      </div>

      {/* Dietary notes on last step */}
      {step === 2 && (
        <div className="mb-4">
          <label className="block text-sm text-jollof-text-muted mb-1">
            Allergies or dietary requirements?
          </label>
          <input
            type="text"
            value={value.dietaryNotes ?? ""}
            onChange={(e) =>
              onChange({ ...value, dietaryNotes: e.target.value })
            }
            placeholder="e.g. nut allergy, vegetarian"
            className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2 text-sm text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((step - 1) as 0 | 1 | 2)}
            className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Back
          </button>
        )}
        {step < 2 && (
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setStep((step + 1) as 0 | 1 | 2)}
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>

      {/* Summary when complete */}
      {isComplete && (
        <MealSummary selection={value} starters={starters} mains={mains} desserts={desserts} />
      )}
    </div>
  );
}

export function MealSummary({
  selection,
  starters,
  mains,
  desserts,
}: {
  selection: MealSelection;
  starters?: MenuItem[];
  mains?: MenuItem[];
  desserts?: MenuItem[];
}) {
  const starterList = starters || MENU_STARTERS;
  const mainList = mains || MENU_MAINS;
  const dessertList = desserts || MENU_DESSERTS;

  const starterItem = starterList.find((i) => i.id === selection.starter);
  const mainItems = mainList.filter((i) => selection.mains.includes(i.id));
  const dessertItem = dessertList.find((i) => i.id === selection.dessert);

  if (!starterItem || mainItems.length === 0 || !dessertItem) return null;

  return (
    <div className="mt-4 bg-jollof-amber/5 border border-jollof-amber/20 rounded-xl p-4">
      <p className="text-xs font-semibold text-jollof-amber mb-2 uppercase tracking-wide">
        Your meal choices
      </p>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-jollof-text-muted">Starter:</span>{" "}
          {starterItem.emoji} {starterItem.name}
        </p>
        <p>
          <span className="text-jollof-text-muted">Mains:</span>{" "}
          {mainItems.map((m) => `${m.emoji} ${m.name}`).join(", ")}
        </p>
        <p>
          <span className="text-jollof-text-muted">Dessert:</span>{" "}
          {dessertItem.emoji} {dessertItem.name}
        </p>
        {selection.dietaryNotes && (
          <p>
            <span className="text-jollof-text-muted">Notes:</span>{" "}
            {selection.dietaryNotes}
          </p>
        )}
      </div>
    </div>
  );
}
