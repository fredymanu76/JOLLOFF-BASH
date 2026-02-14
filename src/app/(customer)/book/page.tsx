"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Wine,
} from "lucide-react";
import { MealSelector, MealSummary } from "@/components/booking/MealSelector";
import {
  getNextEventDate,
  formatEventDate,
  formatEventTime,
  formatPence,
} from "@/lib/utils";
import {
  SEAT_PRICE_PENCE,
  CORKAGE_FEE_PENCE,
  MAX_SEATS_PER_BOOKING,
  VENUE,
} from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import type { MealSelection, AddOn } from "@/types";

type Step = "seats" | "meals" | "drinks" | "review";
type DrinkOption = "none" | "byob" | "order";

interface DrinkSelection {
  id: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

const emptyMeal: MealSelection = { starter: "", mains: [], dessert: "" };

export default function BookPage() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>("seats");
  const [seats, setSeats] = useState(1);
  const [currentSeat, setCurrentSeat] = useState(0);
  const [mealSelections, setMealSelections] = useState<MealSelection[]>([
    { ...emptyMeal },
  ]);
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
  const corkagePence = isByob ? CORKAGE_FEE_PENCE * seats : 0;
  const drinksTotalPence = drinkSelections.reduce(
    (sum, d) => sum + d.unitPricePence * d.quantity,
    0
  );
  const totalPence =
    SEAT_PRICE_PENCE * seats + corkagePence + drinksTotalPence;

  // Fetch available drinks once when entering drinks step
  useEffect(() => {
    if (step === "drinks" && !drinksFetched.current) {
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
        .catch(() => {
          // Keep empty
        })
        .finally(() => setLoadingDrinks(false));
    }
  }, [step]);

  function handleSeatsChange(newSeats: number) {
    const clamped = Math.max(1, Math.min(MAX_SEATS_PER_BOOKING, newSeats));
    setSeats(clamped);
    const newSelections = [...mealSelections];
    while (newSelections.length < clamped) {
      newSelections.push({ ...emptyMeal });
    }
    setMealSelections(newSelections.slice(0, clamped));
    if (currentSeat >= clamped) setCurrentSeat(clamped - 1);
  }

  function updateMealForSeat(index: number, selection: MealSelection) {
    const newSelections = [...mealSelections];
    newSelections[index] = selection;
    setMealSelections(newSelections);
  }

  function updateDrinkQuantity(drinkId: string, delta: number) {
    setDrinkSelections((prev) =>
      prev.map((d) =>
        d.id === drinkId
          ? { ...d, quantity: Math.max(0, d.quantity + delta) }
          : d
      )
    );
  }

  const allMealsComplete = mealSelections
    .slice(0, seats)
    .every((m) => m.starter && m.mains.length > 0 && m.dessert);

  const selectedDrinks = drinkSelections.filter((d) => d.quantity > 0);

  async function handlePay() {
    setError("");
    setPaying(true);

    try {
      const res = await fetch("/api/checkout/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seats,
          mealSelections: mealSelections.slice(0, seats),
          userName: profile?.name || user?.email || "",
          userEmail: user?.email || "",
          byob: isByob,
          drinks:
            drinkOption === "order" ? selectedDrinks : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPaying(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Book Seats</h1>
      </div>
      <p className="text-jollof-text-muted mb-6">
        Reserve your spot at the next Jollof Bash
      </p>

      {/* Event info */}
      <div className="bg-jollof-surface rounded-xl p-4 border border-jollof-border mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-jollof-text-muted">Next event</p>
            <p className="font-semibold">
              {formatEventDate(nextEvent)} at {formatEventTime(nextEvent)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-jollof-text-muted mt-1">
              <MapPin size={12} />
              <span>
                {VENUE.name}, {VENUE.location}, {VENUE.address},{" "}
                {VENUE.postcode}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-jollof-text-muted">Per seat</p>
            <p className="font-bold text-jollof-amber text-lg">
              {formatPence(SEAT_PRICE_PENCE)}
            </p>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "seats", label: "1. Seats" },
          { key: "meals", label: "2. Meals" },
          { key: "drinks", label: "3. Drinks" },
          { key: "review", label: "4. Pay" },
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

      {/* Step 1: Choose seats */}
      {step === "seats" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">
            How many seats?
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => handleSeatsChange(seats - 1)}
              disabled={seats <= 1}
              className="w-10 h-10 rounded-full bg-jollof-bg border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <span className="text-4xl font-bold text-jollof-amber w-16 text-center">
              {seats}
            </span>
            <button
              onClick={() => handleSeatsChange(seats + 1)}
              disabled={seats >= MAX_SEATS_PER_BOOKING}
              className="w-10 h-10 rounded-full bg-jollof-bg border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-jollof-text-muted">
                {seats} seat{seats > 1 ? "s" : ""} x {formatPence(SEAT_PRICE_PENCE)}
              </span>
              <span>{formatPence(SEAT_PRICE_PENCE * seats)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-jollof-border">
              <span>Subtotal</span>
              <span className="text-jollof-amber">
                {formatPence(SEAT_PRICE_PENCE * seats)}
              </span>
            </div>
            <p className="text-xs text-jollof-text-muted mt-2">
              Drinks &amp; BYOB corkage options in step 3
            </p>
          </div>

          <button
            onClick={() => setStep("meals")}
            className="w-full bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            Choose Meals <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Meal selection per seat */}
      {step === "meals" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          {seats > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {Array.from({ length: seats }).map((_, i) => {
                const meal = mealSelections[i];
                const complete =
                  meal && meal.starter && meal.mains.length > 0 && meal.dessert;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentSeat(i)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      currentSeat === i
                        ? "bg-jollof-amber text-jollof-bg"
                        : complete
                          ? "bg-jollof-amber/20 text-jollof-amber"
                          : "bg-jollof-bg text-jollof-text-muted"
                    }`}
                  >
                    Seat {i + 1} {complete ? "\u2713" : ""}
                  </button>
                );
              })}
            </div>
          )}

          <MealSelector
            label={seats > 1 ? `Seat ${currentSeat + 1} meal` : undefined}
            value={mealSelections[currentSeat]}
            onChange={(sel) => updateMealForSeat(currentSeat, sel)}
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("seats")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            {seats > 1 && currentSeat < seats - 1 && (
              <button
                onClick={() => setCurrentSeat(currentSeat + 1)}
                className="border border-jollof-amber text-jollof-amber px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
              >
                Next Seat <ArrowRight size={16} />
              </button>
            )}
            <button
              disabled={!allMealsComplete}
              onClick={() => setStep("drinks")}
              className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2 ml-auto"
            >
              Drinks <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Drinks selection */}
      {step === "drinks" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <div className="flex items-center gap-2 mb-4">
            <Wine size={20} className="text-jollof-amber" />
            <h2 className="font-semibold text-lg">Drinks</h2>
          </div>

          <div className="space-y-3 mb-6">
            {/* No drinks option */}
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                drinkOption === "none"
                  ? "border-jollof-amber bg-jollof-amber/10"
                  : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
              }`}
            >
              <input
                type="radio"
                name="drinkOption"
                value="none"
                checked={drinkOption === "none"}
                onChange={() => setDrinkOption("none")}
                className="accent-jollof-amber"
              />
              <div>
                <p className="font-semibold">No drinks</p>
                <p className="text-sm text-jollof-text-muted">
                  Just the food, please
                </p>
              </div>
            </label>

            {/* BYOB option */}
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                drinkOption === "byob"
                  ? "border-jollof-amber bg-jollof-amber/10"
                  : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
              }`}
            >
              <input
                type="radio"
                name="drinkOption"
                value="byob"
                checked={drinkOption === "byob"}
                onChange={() => setDrinkOption("byob")}
                className="accent-jollof-amber"
              />
              <div className="flex-1">
                <p className="font-semibold">
                  BYOB &mdash; Bring Your Own Bottle
                </p>
                <p className="text-sm text-jollof-text-muted">
                  {formatPence(CORKAGE_FEE_PENCE)} corkage per person
                </p>
              </div>
              <span className="text-jollof-amber font-semibold text-sm">
                +{formatPence(CORKAGE_FEE_PENCE * seats)}
              </span>
            </label>

            {/* Order drinks option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                drinkOption === "order"
                  ? "border-jollof-amber bg-jollof-amber/10"
                  : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
              }`}
            >
              <input
                type="radio"
                name="drinkOption"
                value="order"
                checked={drinkOption === "order"}
                onChange={() => setDrinkOption("order")}
                className="accent-jollof-amber mt-1"
              />
              <div>
                <p className="font-semibold">Order drinks from our menu</p>
                <p className="text-sm text-jollof-text-muted">
                  Pre-order drinks to enjoy with your meal
                </p>
              </div>
            </label>
          </div>

          {/* Drink quantity selectors — shown when "order" is selected */}
          {drinkOption === "order" && (
            <div className="mb-6">
              {loadingDrinks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    size={24}
                    className="text-jollof-amber animate-spin"
                  />
                </div>
              ) : availableDrinks.length === 0 ? (
                <p className="text-sm text-jollof-text-muted bg-jollof-bg rounded-lg p-4 border border-jollof-border">
                  No drinks available at the moment. You can choose BYOB instead.
                </p>
              ) : (
                <div className="space-y-2">
                  {drinkSelections.map((drink) => (
                    <div
                      key={drink.id}
                      className="flex items-center gap-3 bg-jollof-bg rounded-lg p-3 border border-jollof-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{drink.name}</p>
                        <p className="text-xs text-jollof-text-muted">
                          {formatPence(drink.unitPricePence)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateDrinkQuantity(drink.id, -1)}
                          disabled={drink.quantity <= 0}
                          className="w-7 h-7 rounded-full bg-jollof-surface border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors disabled:opacity-30 text-xs"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {drink.quantity}
                        </span>
                        <button
                          onClick={() => updateDrinkQuantity(drink.id, 1)}
                          className="w-7 h-7 rounded-full bg-jollof-surface border border-jollof-border flex items-center justify-center hover:border-jollof-amber transition-colors text-xs"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {drink.quantity > 0 && (
                        <span className="text-jollof-amber font-semibold text-sm w-16 text-right">
                          {formatPence(drink.unitPricePence * drink.quantity)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Running total */}
          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-jollof-text-muted">
                {seats} seat{seats > 1 ? "s" : ""}
              </span>
              <span>{formatPence(SEAT_PRICE_PENCE * seats)}</span>
            </div>
            {isByob && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">
                  Corkage (BYOB) x {seats}
                </span>
                <span>{formatPence(corkagePence)}</span>
              </div>
            )}
            {drinkOption === "order" && drinksTotalPence > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">Drinks</span>
                <span>{formatPence(drinksTotalPence)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-jollof-border">
              <span>Total</span>
              <span className="text-jollof-amber">
                {formatPence(totalPence)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("meals")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep("review")}
              className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2 ml-auto"
            >
              Review &amp; Pay <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Pay */}
      {step === "review" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">Review Your Booking</h2>

          <div className="space-y-4 mb-6">
            {mealSelections.slice(0, seats).map((meal, i) => (
              <div
                key={i}
                className="bg-jollof-bg rounded-lg p-4 border border-jollof-border"
              >
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                  {seats > 1 ? `Seat ${i + 1}` : "Your Meal"}
                </p>
                <MealSummary selection={meal} />
              </div>
            ))}

            {/* Drinks summary */}
            {(isByob || (drinkOption === "order" && selectedDrinks.length > 0)) && (
              <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                  Drinks
                </p>
                {isByob && (
                  <p className="text-sm">BYOB &mdash; Bring Your Own Bottle</p>
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

            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Payment
              </p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">
                  {seats} seat{seats > 1 ? "s" : ""}
                </span>
                <span>{formatPence(SEAT_PRICE_PENCE * seats)}</span>
              </div>
              {isByob && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-jollof-text-muted">
                    Corkage (BYOB)
                  </span>
                  <span>{formatPence(corkagePence)}</span>
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
              onClick={() => setStep("drinks")}
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
