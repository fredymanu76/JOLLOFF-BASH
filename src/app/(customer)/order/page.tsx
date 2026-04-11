"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Loader2,
  UtensilsCrossed,
  Truck,
  Clock,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { formatPence } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import TakeawayMenuBrowser from "@/components/takeaway/TakeawayMenuBrowser";
import type {
  TakeawayOrderItem,
  TakeawaySettings,
  TimeSlot,
  DeliveryAddress,
} from "@/types";

type Step = "menu" | "address" | "timeslot" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "menu", label: "1. Menu" },
  { key: "address", label: "2. Address" },
  { key: "timeslot", label: "3. Time" },
  { key: "review", label: "4. Pay" },
];

/** Tomorrow's date as YYYY-MM-DD */
function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDeliveryDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NextDayOrderPage() {
  const { user, profile } = useAuth();

  const [step, setStep] = useState<Step>("menu");
  const [items, setItems] = useState<TakeawayOrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    phone: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Guest checkout fields (when not logged in)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Date is always tomorrow
  const deliveryDate = getTomorrowDate();

  // Settings & time slots
  const [settings, setSettings] = useState<TakeawaySettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/takeaway/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings(data);
      } catch {
        setError("Could not load order settings. Please try again.");
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  // Fetch time slots for tomorrow on mount
  useEffect(() => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/takeaway/timeslots?date=${deliveryDate}`)
      .then((res) => res.json())
      .then((data) => setTimeSlots(data.items || []))
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [deliveryDate]);

  // Calculations — always delivery
  const subtotalPence = items.reduce(
    (sum, i) => sum + i.unitPricePence * i.quantity,
    0
  );
  const deliveryFeePence = settings?.deliveryFeePence || 0;
  const totalPence = subtotalPence + deliveryFeePence;

  // Validation per step
  const canProceedFromMenu = items.length > 0;
  const canProceedFromAddress =
    deliveryAddress.line1.trim() !== "" &&
    deliveryAddress.city.trim() !== "" &&
    deliveryAddress.postcode.trim() !== "" &&
    deliveryAddress.phone.trim() !== "";
  const canProceedFromTimeslot = !!selectedSlot;

  async function handlePay() {
    setError("");
    setPaying(true);

    try {
      const res = await fetch("/api/checkout/takeaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          date: deliveryDate,
          fulfilmentType: "DELIVERY",
          deliveryAddress,
          timeSlotId: selectedSlot?.id,
          timeSlotLabel: selectedSlot?.label,
          dietaryNotes: dietaryNotes.trim() || undefined,
          userName: profile?.name || user?.email || guestName,
          userEmail: user?.email || guestEmail,
          userId: user?.uid || undefined,
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

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-jollof-amber animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <UtensilsCrossed size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Next Day Order</h1>
      </div>
      <p className="text-jollof-text-muted mb-1">
        Order today, delivered to your door tomorrow
      </p>
      <p className="text-sm text-jollof-amber font-medium mb-6">
        Delivery date: {formatDeliveryDate(deliveryDate)}
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STEPS.map(({ key, label }) => (
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

      {/* Step 1: Menu */}
      {step === "menu" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">Choose your items</h2>
          <TakeawayMenuBrowser onChange={setItems} />
          <button
            onClick={() => setStep("address")}
            disabled={!canProceedFromMenu}
            className="w-full mt-6 bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Delivery Address <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Delivery Address */}
      {step === "address" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-jollof-amber" />
            <h2 className="font-semibold text-lg">Delivery Address</h2>
          </div>
          <p className="text-sm text-jollof-text-muted mb-4">
            Where should we deliver your order tomorrow?
          </p>

          <div className="space-y-3 mb-6">
            <input
              type="text"
              value={deliveryAddress.line1}
              onChange={(e) =>
                setDeliveryAddress((a) => ({ ...a, line1: e.target.value }))
              }
              placeholder="Address line 1 *"
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
            />
            <input
              type="text"
              value={deliveryAddress.line2 || ""}
              onChange={(e) =>
                setDeliveryAddress((a) => ({ ...a, line2: e.target.value }))
              }
              placeholder="Address line 2"
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={deliveryAddress.city}
                onChange={(e) =>
                  setDeliveryAddress((a) => ({ ...a, city: e.target.value }))
                }
                placeholder="City *"
                className="bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
              />
              <input
                type="text"
                value={deliveryAddress.postcode}
                onChange={(e) =>
                  setDeliveryAddress((a) => ({
                    ...a,
                    postcode: e.target.value,
                  }))
                }
                placeholder="Postcode *"
                className="bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
              />
            </div>
            <input
              type="tel"
              value={deliveryAddress.phone}
              onChange={(e) =>
                setDeliveryAddress((a) => ({ ...a, phone: e.target.value }))
              }
              placeholder="Phone number *"
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("menu")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep("timeslot")}
              disabled={!canProceedFromAddress}
              className="flex-1 bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Choose Delivery Time <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Delivery Time Slot */}
      {step === "timeslot" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-jollof-amber" />
            <h2 className="font-semibold text-lg">Pick a delivery time</h2>
          </div>
          <p className="text-sm text-jollof-text-muted mb-4">
            Choose when you&apos;d like your order delivered on{" "}
            {formatDeliveryDate(deliveryDate)}
          </p>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-jollof-amber animate-spin" />
            </div>
          ) : timeSlots.length === 0 ? (
            <p className="text-sm text-jollof-text-muted bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              No delivery slots available for tomorrow. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {timeSlots.map((slot) => {
                const remaining = slot.maxOrders - slot.currentOrders;
                const isFull = remaining <= 0;
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isFull && setSelectedSlot(slot)}
                    disabled={isFull}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-jollof-amber bg-jollof-amber/10"
                        : isFull
                        ? "border-jollof-border bg-jollof-bg opacity-50 cursor-not-allowed"
                        : "border-jollof-border bg-jollof-bg hover:border-jollof-amber/50"
                    }`}
                  >
                    <p className="font-semibold text-sm">{slot.label}</p>
                    <p className="text-xs text-jollof-text-muted mt-1">
                      {slot.startTime} &ndash; {slot.endTime}
                    </p>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        isFull
                          ? "text-jollof-red-light"
                          : remaining <= 3
                          ? "text-jollof-amber"
                          : "text-green-500"
                      }`}
                    >
                      {isFull
                        ? "Fully booked"
                        : `${remaining} slot${remaining !== 1 ? "s" : ""} remaining`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("address")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep("review")}
              disabled={!canProceedFromTimeslot}
              className="flex-1 bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Review &amp; Pay <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Pay */}
      {step === "review" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">Review Your Order</h2>

          {/* Guest details (when not logged in) */}
          {!user && (
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-amber/30 mb-4">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-3">
                Your Details
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name *"
                  className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Email address *"
                  className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                />
              </div>
              <p className="text-xs text-jollof-text-muted mt-2">
                No account needed &mdash; you can create one after payment
              </p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Items summary */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Items
              </p>
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between text-sm mb-1"
                >
                  <span className="text-jollof-text-muted">
                    {item.name} x {item.quantity}
                  </span>
                  <span>
                    {formatPence(item.unitPricePence * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery details */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Delivery
              </p>
              <p className="text-sm">
                Delivery on {formatDeliveryDate(deliveryDate)}
              </p>
              {selectedSlot && (
                <p className="text-sm text-jollof-text-muted mt-1">
                  {selectedSlot.label} ({selectedSlot.startTime} &ndash;{" "}
                  {selectedSlot.endTime})
                </p>
              )}
              <div className="mt-2 text-xs text-jollof-text-muted">
                <p>{deliveryAddress.line1}</p>
                {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
                <p>
                  {deliveryAddress.city}, {deliveryAddress.postcode}
                </p>
                <p>{deliveryAddress.phone}</p>
              </div>
            </div>

            {/* Dietary notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Dietary notes / allergies (optional)
              </label>
              <textarea
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                rows={2}
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none resize-none"
                placeholder="e.g. nut allergy, extra spicy"
              />
            </div>

            {/* Payment breakdown */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Payment
              </p>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-jollof-text-muted">Subtotal</span>
                <span>{formatPence(subtotalPence)}</span>
              </div>
              {deliveryFeePence > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-jollof-text-muted">Delivery fee</span>
                  <span>{formatPence(deliveryFeePence)}</span>
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
              onClick={() => setStep("timeslot")}
              className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handlePay}
              disabled={paying || (!user && (!guestName.trim() || !guestEmail.trim()))}
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
