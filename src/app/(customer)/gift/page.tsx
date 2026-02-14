"use client";

import { useState } from "react";
import { Gift, ArrowRight, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { MealSelector, MealSummary } from "@/components/booking/MealSelector";
import { getNextEventDate, formatEventDate, formatEventTime, formatPence } from "@/lib/utils";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import type { MealSelection } from "@/types";

type Step = "recipient" | "meal" | "review";

const emptyMeal: MealSelection = { starter: "", mains: [], dessert: "" };

export default function GiftPage() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>("recipient");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [mealSelection, setMealSelection] = useState<MealSelection>(emptyMeal);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const nextEvent = getNextEventDate();
  const totalPence = SEAT_PRICE_PENCE + CORKAGE_FEE_PENCE;
  const isMealComplete =
    mealSelection.starter && mealSelection.mains.length > 0 && mealSelection.dessert;

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
          <p className="text-sm text-jollof-text-muted">Gift price</p>
          <p className="font-bold text-jollof-amber text-lg">
            {formatPence(totalPence)}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "recipient", label: "1. Recipient" },
          { key: "meal", label: "2. Meal" },
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

      {/* Step 2: Meal Selection */}
      {step === "meal" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">
            Pick a meal for {recipientName}
          </h2>
          <MealSelector
            value={mealSelection}
            onChange={setMealSelection}
          />
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

            {/* Price */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Payment
              </p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">1 seat</span>
                <span>{formatPence(SEAT_PRICE_PENCE)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-jollof-text-muted">Corkage fee</span>
                <span>{formatPence(CORKAGE_FEE_PENCE)}</span>
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
