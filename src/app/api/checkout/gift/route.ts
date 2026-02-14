import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE, STRIPE_CURRENCY } from "@/lib/constants";

function getStripeServer() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
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
    } = body;

    if (!recipientName || !recipientPhone || !mealSelection || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalPence = SEAT_PRICE_PENCE + CORKAGE_FEE_PENCE;
    const stripe = getStripeServer();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: purchaserEmail,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: totalPence,
            product_data: {
              name: `Jollof Bash Gift Ticket for ${recipientName}`,
              description: `1 seat — includes meal selection and £2 corkage`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "gift_ticket",
        recipientName,
        recipientPhone,
        purchaserName: purchaserName || "",
        purchaserEmail,
        mealSelection: JSON.stringify(mealSelection),
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
