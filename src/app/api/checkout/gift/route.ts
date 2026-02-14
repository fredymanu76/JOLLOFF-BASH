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
      mealSelection: unknown;
      purchaserName: string;
      purchaserEmail: string;
      byob?: boolean;
      drinks?: DrinkLineItem[];
    };

    if (!recipientName || !recipientPhone || !mealSelection || !purchaserEmail) {
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
            name: `Jollof Bash Gift Ticket for ${recipientName}`,
            description: "1 seat — includes meal selection",
          },
        },
        quantity: 1,
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
        quantity: 1,
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
      customer_email: purchaserEmail,
      line_items,
      metadata: {
        type: "gift_ticket",
        recipientName,
        recipientPhone,
        purchaserName: purchaserName || "",
        purchaserEmail,
        mealSelection: JSON.stringify(mealSelection),
        byob: byob ? "true" : "false",
        drinks: drinks && drinks.length > 0 ? JSON.stringify(drinks) : "",
      },
      success_url: `${req.nextUrl.origin}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/gift`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
