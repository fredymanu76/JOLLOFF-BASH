import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderType, userId, userEmail } = (await req.json()) as {
      orderId: string;
      orderType: "booking" | "takeaway" | "gift";
      userId: string;
      userEmail: string;
    };

    if (!orderId || !orderType || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getAdminDb();

    // Determine collection and userId field name
    let collection: string;
    let userIdField: string;
    let emailField: string;

    if (orderType === "booking") {
      collection = "bookings";
      userIdField = "userId";
      emailField = "userEmail";
    } else if (orderType === "takeaway") {
      collection = "takeawayOrders";
      userIdField = "userId";
      emailField = "userEmail";
    } else if (orderType === "gift") {
      collection = "giftTickets";
      userIdField = "purchaserUserId";
      emailField = "purchaserEmail";
    } else {
      return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
    }

    // Verify the order exists and email matches
    const docRef = db.collection(collection).doc(orderId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data[emailField] !== userEmail) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    // Link this specific order
    await docRef.update({ [userIdField]: userId });

    // Also link any other orders with matching email and no userId
    const otherOrders = await db
      .collection(collection)
      .where(emailField, "==", userEmail)
      .where(userIdField, "==", null)
      .get();

    const batch = db.batch();
    otherOrders.docs.forEach((doc) => {
      batch.update(doc.ref, { [userIdField]: userId });
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to link order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
