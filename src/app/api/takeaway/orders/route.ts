import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateOrderCode } from "@/lib/utils";
import type { TakeawayOrder, TakeawayOrderItem, TakeawayOrderStatus, FulfilmentType, DeliveryAddress } from "@/types";

export const dynamic = "force-dynamic";

// Valid order status transitions
const VALID_TRANSITIONS: Record<TakeawayOrderStatus, TakeawayOrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED", "REFUNDED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COLLECTED", "OUT_FOR_DELIVERY"],
  COLLECTED: [],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// GET — list takeaway orders with optional filters
// ?status=PAID&date=2026-04-15&userId=abc123
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const date = req.nextUrl.searchParams.get("date");
    const userId = req.nextUrl.searchParams.get("userId");

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db
      .collection("takeawayOrders")
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("orderStatus", "==", status);
    }

    if (userId) {
      query = query.where("userId", "==", userId);
    }

    if (date) {
      query = query.where("date", "==", date);
    }

    const snapshot = await query.get();

    const items: TakeawayOrder[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as TakeawayOrder
    );

    return NextResponse.json({ orders: items });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}

// POST — create a new takeaway order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      userName,
      userEmail,
      items,
      fulfilmentType,
      date,
      timeSlotId,
      timeSlotLabel,
      deliveryAddress,
      dietaryNotes,
    } = body as {
      userId: string;
      userName: string;
      userEmail: string;
      items: TakeawayOrderItem[];
      fulfilmentType: FulfilmentType;
      date: string;
      timeSlotId: string;
      timeSlotLabel: string;
      deliveryAddress?: DeliveryAddress;
      dietaryNotes?: string;
    };

    if (!userId || !userEmail || !items?.length || !fulfilmentType || !date || !timeSlotId) {
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

    // Validate menu items exist
    for (const item of items) {
      const menuDoc = await db.collection("menuItems").doc(item.menuItemId).get();
      if (!menuDoc.exists) {
        return NextResponse.json(
          { error: `Menu item not found: ${item.menuItemId}` },
          { status: 400 }
        );
      }
    }

    // Check time slot capacity
    const timeSlotRef = db.collection("timeSlots").doc(timeSlotId);
    const timeSlotDoc = await timeSlotRef.get();

    if (!timeSlotDoc.exists) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 400 }
      );
    }

    const timeSlotData = timeSlotDoc.data()!;
    if (timeSlotData.currentOrders >= timeSlotData.maxOrders) {
      return NextResponse.json(
        { error: "Time slot is fully booked" },
        { status: 409 }
      );
    }

    // Calculate subtotal from items
    const subtotalPence = items.reduce(
      (sum, item) => sum + item.unitPricePence * item.quantity,
      0
    );

    // Get delivery fee from settings if delivery
    let deliveryFeePence = 0;
    if (fulfilmentType === "DELIVERY") {
      const settingsDoc = await db.collection("takeawaySettings").doc("config").get();
      deliveryFeePence = settingsDoc.exists
        ? (settingsDoc.data()!.deliveryFeePence || 300)
        : 300;
    }

    const totalPence = subtotalPence + deliveryFeePence;

    // Create the order document
    const orderRef = db.collection("takeawayOrders").doc();
    const orderCode = generateOrderCode();

    const order: TakeawayOrder = {
      id: orderRef.id,
      userId,
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
    };

    await orderRef.set(order);

    // Increment currentOrders on the time slot
    await timeSlotRef.update({
      currentOrders: FieldValue.increment(1),
    });

    return NextResponse.json({ item: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update order status (admin workflow)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderStatus } = body as {
      id: string;
      orderStatus: TakeawayOrderStatus;
    };

    if (!id || !orderStatus) {
      return NextResponse.json(
        { error: "Order ID and orderStatus are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = db.collection("takeawayOrders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = doc.data()!.orderStatus as TakeawayOrderStatus;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(orderStatus)) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${orderStatus}` },
        { status: 400 }
      );
    }

    await docRef.update({ orderStatus });
    return NextResponse.json({ updated: id, orderStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
