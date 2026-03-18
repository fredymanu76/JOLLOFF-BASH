import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { SUMUP_API_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, id: checkoutId } = body as {
      event_type?: string;
      id?: string;
    };

    if (event_type !== "CHECKOUT_STATUS_CHANGED" || !checkoutId) {
      return NextResponse.json({}, { status: 200 });
    }

    // Verify checkout status by calling SumUp API
    const verifyRes = await fetch(`${SUMUP_API_URL}/checkouts/${checkoutId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.SUMUP_API_KEY}`,
      },
    });

    if (!verifyRes.ok) {
      console.error("Failed to verify SumUp checkout:", await verifyRes.text());
      return NextResponse.json({}, { status: 200 });
    }

    const checkout = await verifyRes.json();
    const { status, checkout_reference } = checkout as {
      status: string;
      checkout_reference: string;
    };

    if (!checkout_reference) {
      return NextResponse.json({}, { status: 200 });
    }

    const db = getAdminDb();

    // Try bookings collection first, then giftTickets
    const bookingRef = db.collection("bookings").doc(checkout_reference);
    const bookingSnap = await bookingRef.get();

    if (bookingSnap.exists) {
      if (status === "PAID") {
        await bookingRef.update({
          paymentStatus: "PAID",
          sumupCheckoutId: checkoutId,
        });
      } else if (status === "FAILED" || status === "EXPIRED") {
        await bookingRef.update({ paymentStatus: "FAILED" });
      }
      return NextResponse.json({}, { status: 200 });
    }

    // Check gift tickets
    const giftRef = db.collection("giftTickets").doc(checkout_reference);
    const giftSnap = await giftRef.get();

    if (giftSnap.exists) {
      if (status === "PAID") {
        await giftRef.update({
          paymentStatus: "PAID",
          sumupCheckoutId: checkoutId,
        });
      } else if (status === "FAILED" || status === "EXPIRED") {
        await giftRef.update({ paymentStatus: "FAILED" });
      }
    }

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.error("SumUp webhook error:", err);
    return NextResponse.json({}, { status: 200 });
  }
}
