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

function generateGiftCode(): string {
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
    const {
      recipientName,
      recipientPhone,
      mealSelection,
      purchaserName,
      purchaserEmail,
      byob,
      drinks,
    } = body as {
      recipientName: string;
      recipientPhone: string;
      mealSelection: MealSelection;
      purchaserName: string;
      purchaserEmail: string;
      byob?: boolean;
      drinks?: DrinkLineItem[];
    };

    if (!recipientName || !recipientPhone || !mealSelection || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate total in pence (1 seat for gift ticket)
    let totalPence = SEAT_PRICE_PENCE;
    const addOns: BookingAddOn[] = [];

    if (byob) {
      totalPence += CORKAGE_FEE_PENCE;
      addOns.push({
        addOnId: "corkage-byob",
        name: "Corkage Fee (BYOB)",
        quantity: 1,
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

    // Convert pence to pounds for SumUp
    const totalPounds = totalPence / 100;

    // Create Firestore gift ticket doc FIRST with PENDING payment
    const db = getAdminDb();
    const giftRef = db.collection("giftTickets").doc();
    const giftTicketId = giftRef.id;
    const giftCode = generateGiftCode();

    await giftRef.set({
      id: giftTicketId,
      purchaserName: purchaserName || "",
      purchaserEmail,
      recipientName,
      recipientPhone,
      mealSelection,
      addOns,
      code: giftCode,
      status: "PURCHASED",
      seats: 1,
      pricePaidPence: totalPence,
      paymentStatus: "PENDING",
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
        checkout_reference: giftTicketId,
        amount: totalPounds,
        currency: SUMUP_CURRENCY,
        pay_to_email: process.env.SUMUP_PAY_TO_EMAIL,
        description: `Jollof Bash Gift Ticket for ${recipientName}`,
        redirect_url: `${origin}/gift/success?checkout_id=${giftTicketId}`,
        return_url: `${origin}/api/sumup/webhook`,
      }),
    });

    if (!sumupRes.ok) {
      const errBody = await sumupRes.text();
      await giftRef.delete();
      return NextResponse.json(
        { error: `SumUp checkout failed: ${errBody}` },
        { status: 502 }
      );
    }

    const checkout = await sumupRes.json();

    // Store the SumUp checkout ID
    await giftRef.update({ sumupCheckoutId: checkout.id });

    return NextResponse.json({ url: `https://pay.sumup.com/b2c/${checkout.id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
