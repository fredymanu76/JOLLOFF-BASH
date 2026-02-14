"use client";

import { useState, useEffect, useRef } from "react";
import {
  Gift,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Wine,
} from "lucide-react";
import { MealSelector, MealSummary } from "@/components/booking/MealSelector";
import {
  getNextEventDate,
  formatEventDate,
  formatEventTime,
  formatPence,
} from "@/lib/utils";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import type { MealSelection, AddOn } from "@/types";

type Step = "recipient" | "meal" | "review";
type DrinkOption = "none" | "byob" | "order";

interface DrinkSelection {
  id: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

const emptyMeal: MealSelection = { starter: "", mains: [], dessert: "" };

export default function GiftPage() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>("recipient");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [mealSelection, setMealSelection] = useState<MealSelection>(emptyMeal);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Drinks state
  const [drinkOption, setDrinkOption] = useState<DrinkOption>("none");
  const [availableDrinks, setAvailableDrinks] = useState<AddOn[]>([]);
  const [drinkSelections, setDrinkSelections] = useState<DrinkSelection[]>([]);
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const drinksFetched = useRef(false);

  const nextEvent = getNextEventDate();

  const isByob = drinkOption === "byob";
  const corkagePence = isByob ? CORKAGE_FEE_PENCE : 0;
  const drinksTotalPence = drinkSelections.reduce(
    (sum, d) => sum + d.unitPricePence * d.quantity,
    0
  );
  const totalPence = SEAT_PRICE_PENCE + corkagePence + drinksTotalPence;

  const isMealComplete =
    mealSelection.starter &&
    mealSelection.mains.length > 0 &&
    mealSelection.dessert;

  // Fetch drinks once when entering meal step
  useEffect(() => {
    if (step === "meal" && !drinksFetched.current) {
      drinksFetched.current = true;
      setLoadingDrinks(true);
      fetch("/api/drinks")
        .then((res) => res.json())
        .then((data) => {
          const items: AddOn[] = data.items || [];
          setAvailableDrinks(items);
          if (items.length > 0) {
            setDrinkSelections(
              items.map((d) => ({
                id: d.id,
                name: d.name,
                quantity: 0,
                unitPricePence: d.pricePence,
              }))
            );
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDrinks(false));
    }
  }, [step]);

  function updateDrinkQuantity(drinkId: string, delta: number) {
    setDrinkSelections((prev) =>
      prev.map((d) =>
        d.id === drinkId
          ? { ...d, quantity: Math.max(0, d.quantity + delta) }
          : d
      )
    );
  }

  const selectedDrinks = drinkSelections.filter((d) => d.quantity > 0);

  async function handlePay() {
    setError("");
    setPaying(true);

    try {
      const res = await fetch("/api/checkout/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientPhone,
          mealSelection,
          purchaserName: profile?.name || user?.email || "",
          purchaserEmail: user?.email || "",
          byob: isByob,
          drinks: drinkOption === "order" ? selectedDrinks : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPaying(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Gift size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Gift a Ticket</h1>
      </div>
      <p className="text-jollof-text-muted mb-6">
        Surprise someone special with a seat at Jollof Bash
      </p>

      {/* Event info card */}
      <div className="bg-jollof-surface rounded-xl p-4 border border-jollof-border mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-jollof-text-muted">Next event</p>
          <p className="font-semibold">
            {formatEventDate(nextEvent)} at {formatEventTime(nextEvent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-jollof-text-muted">From</p>
          <p className="font-bold text-jollof-amber text-lg">
            {formatPence(SEAT_PRICE_PENCE)}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "recipient", label: "1. Recipient" },
          { key: "meal", label: "2. Meal & Drinks" },
          { key: "review", label: "3. Pay" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              step === key
                ? "bg-jollof-amber text-jollof-bg"
                : "bg-jollof-surface text-jollof-text-muted"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Recipient Info */}
      {step === "recipient" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">
            Who are you gifting to?
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="recipientName"
                className="block text-sm font-medium mb-1"
              >
                Recipient&apos;s Name
              </label>
              <input
                id="recipientName"
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                placeholder="Their full name"
              />
            </div>
            <div>
              <label
                htmlFor="recipientPhone"
                className="block text-sm font-medium mb-1"
              >
                Recipient&apos;s Phone Number
              </label>
              <input
                id="recipientPhone"
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                placeholder="07XXX XXXXXX"
              />
              <p className="text-xs text-jollof-text-muted mt-1">
                They&apos;ll use this to look up their gift in the app
              </p>
            </div>
            <button
              disabled={!recipientName.trim() || !recipientPhone.trim()}
              onClick={() => setStep("meal")}
              className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              Choose Their Meal <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Meal Selection + Drinks */}
      {step === "meal" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">
            Pick a meal for {recipientName}
          </h2>
          <MealSelector value={mealSelection} onChange={setMealSelection} />

          {/* Drinks section within meal step */}
          <div className="mt-6 pt-6 border-t border-jollof-border">
            <div className="flex items-center gap-2 mb-4">
              <Wine size={18} className="text-jollof-amber" />
              <h3 className="font-semibold">Add drinks?</h3>
            </div>

            <div className="space-y-2 mb-4">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                  drinkOption === "none"
                    ? "border-jollof-amber bg-jollof-amber/10"
                    : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
                }`}
              >
                <input
                  type="radio"
                  name="giftDrinkOption"
                  value="none"
                  checked={drinkOption === "none"}
                  onChange={() => setDrinkOption("none")}
                  className="accent-jollof-amber"
                />
                <span>No drinks</span>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                  drinkOption === "byob"
                    ? "border-jollof-amber bg-jollof-amber/10"
                    : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
                }`}
              >
                <input
                  type="radio"
                  name="giftDrinkOption"
                  value="byob"
                  checked={drinkOption === "byob"}
                  onChange={() => setDrinkOption("byob")}
                  className="accent-jollof-amber"
                />
                <span className="flex-1">
                  BYOB &mdash; {formatPence(CORKAGE_FEE_PENCE)} corkage
                </span>
                <span className="text-jollof-amber font-semibold">
                  +{formatPence(CORKAGE_FEE_PENCE)}
                </span>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${
                  drinkOption === "order"
                    ? "border-jollof-amber bg-jollof-amber/10"
                    : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
                }`}
              >
                <input
                  type="radio"
                  name="giftDrinkOption"
                  value="order"
                  checked={drinkOption === "order"}
                  onChange={() => setDrinkOption("order")}
                  className="accent-jollof-amber"
                />
                <span>Order drinks from our menu</span>
              </label>
            </div>

            {drinkOption === "order" && (
              <div className="mb-4">
                {loadingDrinks ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2
                      size={20}
                      className="text-jollof-amber animate-spin"
                    />
                  </div>
                ) : availableDrinks.length === 0 ? (
                  <p className="text-xs text-jollof-text-muted bg-jollof-bg rounded-lg p-3 border border-jollof-border">
                    No drinks available. Choose BYOB instead.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {drinkSelections.map((drink) => (
                      <div
                        key={drink.id}
                        className="flex items-center gap-2 bg-jollof-bg rounded-lg p-2 border border-jollof-border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs">{drink.name}</p>
                          <p className="text-xs text-jollof-text-muted">
                            {formatPence(drink.unitPricePence)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateDrinkQuantity(drink.id, -1)
                            }
                            disabled={drink.quantity <= 0}
                            className="w-6 h-6 rounded-full bg-jollof-surface border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors disabled:opacity-30"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">
                            {drink.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateDrinkQuantity(drink.id, 1)
                            }
                            className="w-6 h-6 rounded-full bg-jollof-surface border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        {drink.quantity > 0 && (
                          <span className="text-jollof-amber font-semibold text-xs w-14 text-right">
                            {formatPence(
                              drink.unitPricePence * drink.quantity
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("recipient")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              disabled={!isMealComplete}
              onClick={() => setStep("review")}
              className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              Review &amp; Pay <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === "review" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">Review Your Gift</h2>

          <div className="space-y-4 mb-6">
            {/* Recipient */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Recipient
              </p>
              <p className="font-semibold">{recipientName}</p>
              <p className="text-sm text-jollof-text-muted">
                {recipientPhone}
              </p>
            </div>

            {/* Meal */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Meal Selection
              </p>
              <MealSummary selection={mealSelection} />
            </div>

            {/* Drinks */}
            {(isByob ||
              (drinkOption === "order" && selectedDrinks.length > 0)) && (
              <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                  Drinks
                </p>
                {isByob && (
                  <p className="text-sm">
                    BYOB &mdash; Bring Your Own Bottle
                  </p>
                )}
                {drinkOption === "order" &&
                  selectedDrinks.map((d) => (
                    <p key={d.id} className="text-sm">
                      {d.name} x {d.quantity} &mdash;{" "}
                      {formatPence(d.unitPricePence * d.quantity)}
                    </p>
                  ))}
              </div>
            )}

            {/* Price */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Payment
              </p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">1 seat</span>
                <span>{formatPence(SEAT_PRICE_PENCE)}</span>
              </div>
              {isByob && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-jollof-text-muted">
                    Corkage (BYOB)
                  </span>
                  <span>{formatPence(CORKAGE_FEE_PENCE)}</span>
                </div>
              )}
              {drinkOption === "order" && drinksTotalPence > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-jollof-text-muted">Drinks</span>
                  <span>{formatPence(drinksTotalPence)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-jollof-border">
                <span>Total</span>
                <span className="text-jollof-amber">
                  {formatPence(totalPence)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("meal")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handlePay}
              disabled={paying}
              className="flex-1 bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} /> Pay {formatPence(totalPence)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
