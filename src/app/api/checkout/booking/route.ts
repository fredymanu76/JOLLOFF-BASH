import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE, STRIPE_CURRENCY } from "@/lib/constants";

function getStripeServer() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seats, mealSelections, userName, userEmail } = body;

    if (!seats || !mealSelections || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const perSeatPence = SEAT_PRICE_PENCE + CORKAGE_FEE_PENCE;
    const stripe = getStripeServer();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: perSeatPence,
            product_data: {
              name: "Jollof Bash Seat",
              description: `Includes meal selection and £2 corkage per person`,
            },
          },
          quantity: seats,
        },
      ],
      metadata: {
        type: "booking",
        seats: String(seats),
        userName: userName || "",
        userEmail,
        mealSelections: JSON.stringify(mealSelections),
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
