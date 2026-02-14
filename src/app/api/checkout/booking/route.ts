import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE, STRIPE_CURRENCY } from "@/lib/constants";

function getStripeServer() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

interface DrinkLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seats, mealSelections, userName, userEmail, byob, drinks } = body as {
      seats: number;
      mealSelections: unknown[];
      userName: string;
      userEmail: string;
      byob?: boolean;
      drinks?: DrinkLineItem[];
    };

    if (!seats || !mealSelections || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stripe = getStripeServer();

    // Build line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: SEAT_PRICE_PENCE,
          product_data: {
            name: "Jollof Bash Seat",
            description: "Includes meal selection",
          },
        },
        quantity: seats,
      },
    ];

    // Add corkage only if BYOB
    if (byob) {
      line_items.push({
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: CORKAGE_FEE_PENCE,
          product_data: {
            name: "Corkage Fee (BYOB)",
            description: "Bring your own bottle corkage",
          },
        },
        quantity: seats,
      });
    }

    // Add drink line items
    if (drinks && drinks.length > 0) {
      for (const drink of drinks) {
        if (drink.quantity > 0) {
          line_items.push({
            price_data: {
              currency: STRIPE_CURRENCY,
              unit_amount: drink.unitPricePence,
              product_data: {
                name: drink.name,
              },
            },
            quantity: drink.quantity,
          });
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items,
      metadata: {
        type: "booking",
        seats: String(seats),
        userName: userName || "",
        userEmail,
        mealSelections: JSON.stringify(mealSelections),
        byob: byob ? "true" : "false",
        drinks: drinks && drinks.length > 0 ? JSON.stringify(drinks) : "",
      },
      success_url: `${req.nextUrl.origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/book`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
