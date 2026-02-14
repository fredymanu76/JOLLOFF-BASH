import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase/admin";

function getStripeServer() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await getAdminDb().collection("bookings").doc(bookingId).update({
          paymentStatus: "PAID",
          stripeSessionId: session.id,
        });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await getAdminDb().collection("bookings").doc(bookingId).update({
          paymentStatus: "FAILED",
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
