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
  UtensilsCrossed,
} from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import type { AddOn, MenuItem } from "@/types";

type Step = "seats" | "drinks" | "review";
type DrinkOption = "none" | "byob" | "order";

interface DrinkSelection {
  id: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

export default function BookPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  const [step, setStep] = useState<Step>("seats");
  const [seats, setSeats] = useState(1);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Guest checkout fields (when not logged in)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Set menu items for display
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

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

  // Fetch event menu items
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu?availability=EVENT");
        const data = await res.json();
        setMenuItems(data.items || []);
      } catch {
        // Keep empty
      } finally {
        setLoadingMenu(false);
      }
    }
    fetchMenu();
  }, []);

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

  const selectedDrinks = drinkSelections.filter((d) => d.quantity > 0);

  // Group menu items by category for display
  const starters = menuItems.filter((i) => i.category === "STARTER");
  const mains = menuItems.filter((i) => i.category === "MAIN");
  const desserts = menuItems.filter((i) => i.category === "DESSERT");

  async function handlePay() {
    setError("");
    setPaying(true);

    try {
      const res = await fetch("/api/checkout/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seats,
          userName: profile?.name || user?.email || guestName,
          userEmail: user?.email || guestEmail,
          userId: user?.uid || undefined,
          byob: isByob,
          drinks:
            drinkOption === "order" ? selectedDrinks : [],
          dietaryNotes: dietaryNotes.trim() || undefined,
          eventId: eventId || undefined,
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

      {/* Set Menu Display */}
      {!loadingMenu && menuItems.length > 0 && (
        <div className="bg-jollof-surface rounded-xl p-4 border border-jollof-border mb-6">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed size={16} className="text-jollof-amber" />
            <h3 className="font-semibold text-sm">Set Menu</h3>
            <span className="text-xs text-jollof-text-muted ml-auto">
              Food served Mezze/Buffet style
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {starters.length > 0 && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold mb-1">Starters</p>
                {starters.map((item) => (
                  <p key={item.id} className="text-sm text-jollof-text-muted">
                    {item.emoji} {item.name}
                  </p>
                ))}
              </div>
            )}
            {mains.length > 0 && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold mb-1">Mains</p>
                {mains.map((item) => (
                  <p key={item.id} className="text-sm text-jollof-text-muted">
                    {item.emoji} {item.name}
                  </p>
                ))}
              </div>
            )}
            {desserts.length > 0 && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold mb-1">Desserts</p>
                {desserts.map((item) => (
                  <p key={item.id} className="text-sm text-jollof-text-muted">
                    {item.emoji} {item.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-jollof-amber/70 mt-2">
            No payment at the gate &mdash; all inclusive with your seat
          </p>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "seats", label: "1. Seats" },
          { key: "drinks", label: "2. Drinks" },
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

          {/* Dietary notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Dietary notes / allergies (optional)
            </label>
            <input
              type="text"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
              placeholder="e.g. nut allergy, vegetarian"
            />
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
              Drinks &amp; BYOB corkage options in step 2
            </p>
          </div>

          <button
            onClick={() => setStep("drinks")}
            className="w-full bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            Drinks <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Drinks selection */}
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

          {/* Drink quantity selectors */}
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
              onClick={() => setStep("seats")}
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

      {/* Step 3: Review & Pay */}
      {step === "review" && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border">
          <h2 className="font-semibold text-lg mb-4">Review Your Booking</h2>

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
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                />
              </div>
              <p className="text-xs text-jollof-text-muted mt-2">
                No account needed &mdash; you can create one after payment
              </p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Booking details */}
            <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border">
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-2">
                Booking
              </p>
              <p className="text-sm">
                {seats} seat{seats > 1 ? "s" : ""} at Jollof Bash
              </p>
              <p className="text-xs text-jollof-text-muted mt-1">
                Food served Mezze/Buffet style &mdash; set menu included
              </p>
              {dietaryNotes && (
                <p className="text-xs text-jollof-text-muted mt-1">
                  Dietary notes: {dietaryNotes}
                </p>
              )}
            </div>

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
