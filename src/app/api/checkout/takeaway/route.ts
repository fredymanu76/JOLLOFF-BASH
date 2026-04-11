import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { SUMUP_API_URL, SUMUP_CURRENCY } from "@/lib/constants";
import { generateOrderCode } from "@/lib/utils";
import type { TakeawayOrderItem, FulfilmentType, DeliveryAddress } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      fulfilmentType,
      date,
      timeSlotId,
      timeSlotLabel,
      deliveryAddress,
      dietaryNotes,
      userName,
      userEmail,
      userId,
    } = body as {
      items: TakeawayOrderItem[];
      fulfilmentType: FulfilmentType;
      date: string;
      timeSlotId: string;
      timeSlotLabel: string;
      deliveryAddress?: DeliveryAddress;
      dietaryNotes?: string;
      userName: string;
      userEmail: string;
      userId?: string;
    };

    if (!items?.length || !fulfilmentType || !date || !timeSlotId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (fulfilmentType === "DELIVERY" && !deliveryAddress) {
      return NextResponse.json(
        { error: "Delivery address required for delivery orders" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Fetch takeaway settings for delivery fee
    let deliveryFeePence = 0;
    if (fulfilmentType === "DELIVERY") {
      const settingsDoc = await db.collection("takeawaySettings").doc("config").get();
      deliveryFeePence = settingsDoc.exists
        ? (settingsDoc.data()!.deliveryFeePence || 300)
        : 300;
    }

    // Calculate total from items + delivery fee
    const subtotalPence = items.reduce(
      (sum, item) => sum + item.unitPricePence * item.quantity,
      0
    );
    const totalPence = subtotalPence + deliveryFeePence;
    const totalPounds = totalPence / 100;

    // Create takeaway order doc with PENDING_PAYMENT status
    const orderRef = db.collection("takeawayOrders").doc();
    const orderId = orderRef.id;
    const orderCode = generateOrderCode();

    await orderRef.set({
      id: orderId,
      userId: userId || null,
      userName: userName || "",
      userEmail,
      items,
      fulfilmentType,
      date,
      timeSlotId,
      timeSlotLabel: timeSlotLabel || "",
      deliveryFeePence,
      subtotalPence,
      totalPence,
      paymentStatus: "PENDING",
      orderStatus: "PENDING_PAYMENT",
      orderCode,
      createdAt: new Date().toISOString(),
      ...(deliveryAddress && { deliveryAddress }),
      ...(dietaryNotes && { dietaryNotes }),
    });

    // Create SumUp checkout
    const origin = req.nextUrl.origin;
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const sumupRes = await fetch(`${SUMUP_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: orderId,
        amount: totalPounds,
        currency: SUMUP_CURRENCY,
        pay_to_email: process.env.SUMUP_PAY_TO_EMAIL,
        description: `Jollof Bash Takeaway – ${itemCount} item(s)`,
        redirect_url: `${origin}/order/success?checkout_id=${orderId}`,
        hosted_checkout: { enabled: true },
      }),
    });

    if (!sumupRes.ok) {
      const errBody = await sumupRes.text();
      // On SumUp failure, delete the order doc
      await orderRef.delete();
      return NextResponse.json(
        { error: `SumUp checkout failed: ${errBody}` },
        { status: 502 }
      );
    }

    const checkout = await sumupRes.json();

    // Store the SumUp checkout ID on the order
    await orderRef.update({ sumupCheckoutId: checkout.id });

    return NextResponse.json({ url: checkout.hosted_checkout_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
