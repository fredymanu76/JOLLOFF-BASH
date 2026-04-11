import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type");

  if (!id || !type) {
    return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    let docRef;
    if (type === "booking") {
      docRef = db.collection("bookings").doc(id);
    } else if (type === "takeaway") {
      docRef = db.collection("takeawayOrders").doc(id);
    } else if (type === "gift") {
      docRef = db.collection("giftTickets").doc(id);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snap.data()!;

    if (type === "booking") {
      return NextResponse.json({
        userName: data.userName || "",
        userEmail: data.userEmail || "",
        bookingCode: data.bookingCode || "",
        userId: data.userId || null,
      });
    } else if (type === "takeaway") {
      return NextResponse.json({
        userName: data.userName || "",
        userEmail: data.userEmail || "",
        orderCode: data.orderCode || "",
        userId: data.userId || null,
        timeSlotLabel: data.timeSlotLabel || "",
        date: data.date || "",
        deliveryAddress: data.deliveryAddress || null,
      });
    } else {
      return NextResponse.json({
        purchaserName: data.purchaserName || "",
        purchaserEmail: data.purchaserEmail || "",
        giftCode: data.code || "",
        purchaserUserId: data.purchaserUserId || null,
        recipientName: data.recipientName || "",
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch order details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
