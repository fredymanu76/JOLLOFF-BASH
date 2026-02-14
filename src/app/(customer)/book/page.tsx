"use client";

import { useState } from "react";
import {
  CalendarDays,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
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
import type { MealSelection } from "@/types";

type Step = "seats" | "meals" | "review";

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

  const nextEvent = getNextEventDate();
  const perSeatPence = SEAT_PRICE_PENCE + CORKAGE_FEE_PENCE;
  const totalPence = perSeatPence * seats;

  function handleSeatsChange(newSeats: number) {
    const clamped = Math.max(1, Math.min(MAX_SEATS_PER_BOOKING, newSeats));
    setSeats(clamped);
    // Adjust meal selections array
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

  const allMealsComplete = mealSelections
    .slice(0, seats)
    .every((m) => m.starter && m.mains.length > 0 && m.dessert);

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
              {formatPence(perSeatPence)}
            </p>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "seats", label: "1. Seats" },
          { key: "meals", label: "2. Meals" },
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
            <div className="flex justify-between text-sm mb-1">
              <span className="text-jollof-text-muted">
                {seats} seat{seats > 1 ? "s" : ""} x {formatPence(SEAT_PRICE_PENCE)}
              </span>
              <span>{formatPence(SEAT_PRICE_PENCE * seats)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-jollof-text-muted">
                Corkage x {seats}
              </span>
              <span>{formatPence(CORKAGE_FEE_PENCE * seats)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-jollof-border">
              <span>Total</span>
              <span className="text-jollof-amber">{formatPence(totalPence)}</span>
            </div>
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
                    Seat {i + 1} {complete ? "✓" : ""}
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
              onClick={() => setStep("review")}
              className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2 ml-auto"
            >
              Review &amp; Pay <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
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
              <div className="flex justify-between text-sm mb-2">
                <span className="text-jollof-text-muted">Corkage</span>
                <span>{formatPence(CORKAGE_FEE_PENCE * seats)}</span>
              </div>
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
              onClick={() => setStep("meals")}
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
