import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  SEAT_PRICE_PENCE,
  CORKAGE_FEE_PENCE,
  SUMUP_CURRENCY,
  SUMUP_API_URL,
  BOOKING_CODE_LENGTH,
} from "@/lib/constants";
import type { MealSelection, BookingAddOn } from "@/types";

interface DrinkLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < BOOKING_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seats, mealSelections, userName, userEmail, byob, drinks } = body as {
      seats: number;
      mealSelections: MealSelection[];
      userName: string;
      userEmail: string;
      byob?: boolean;
      drinks?: DrinkLineItem[];
    };

    if (!seats || !mealSelections || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate total in pence
    let totalPence = seats * SEAT_PRICE_PENCE;

    // Build add-ons list
    const addOns: BookingAddOn[] = [];

    if (byob) {
      totalPence += seats * CORKAGE_FEE_PENCE;
      addOns.push({
        addOnId: "corkage-byob",
        name: "Corkage Fee (BYOB)",
        quantity: seats,
        unitPricePence: CORKAGE_FEE_PENCE,
      });
    }

    if (drinks && drinks.length > 0) {
      for (const drink of drinks) {
        if (drink.quantity > 0) {
          totalPence += drink.quantity * drink.unitPricePence;
          addOns.push({
            addOnId: drink.id,
            name: drink.name,
            quantity: drink.quantity,
            unitPricePence: drink.unitPricePence,
          });
        }
      }
    }

    // Convert pence to pounds for SumUp (decimal amount)
    const totalPounds = totalPence / 100;

    // Create Firestore booking doc FIRST with PENDING status
    const db = getAdminDb();
    const bookingRef = db.collection("bookings").doc();
    const bookingId = bookingRef.id;
    const bookingCode = generateBookingCode();

    await bookingRef.set({
      id: bookingId,
      userName: userName || "",
      userEmail,
      seats,
      mealSelections,
      addOns,
      discounts: [],
      subtotalPence: seats * SEAT_PRICE_PENCE,
      discountTotalPence: 0,
      totalPence,
      paymentStatus: "PENDING",
      bookingCode,
      attended: false,
      createdAt: new Date().toISOString(),
    });

    // Create SumUp checkout
    const origin = req.nextUrl.origin;
    const sumupRes = await fetch(`${SUMUP_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: bookingId,
        amount: totalPounds,
        currency: SUMUP_CURRENCY,
        pay_to_email: process.env.SUMUP_PAY_TO_EMAIL,
        description: `Jollof Bash – ${seats} seat(s)`,
        redirect_url: `${origin}/book/success?checkout_id=${bookingId}`,
        return_url: `${origin}/api/sumup/webhook`,
      }),
    });

    if (!sumupRes.ok) {
      const errBody = await sumupRes.text();
      await bookingRef.delete();
      return NextResponse.json(
        { error: `SumUp checkout failed: ${errBody}` },
        { status: 502 }
      );
    }

    const checkout = await sumupRes.json();

    // Store the SumUp checkout ID on the booking
    await bookingRef.update({ sumupCheckoutId: checkout.id });

    return NextResponse.json({ url: checkout.hosted_checkout_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
