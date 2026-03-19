import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { JollofEvent, EventStatus } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch all events ordered by dateTime desc
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("events")
      .orderBy("dateTime", "desc")
      .get();

    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as JollofEvent
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// POST — create a new event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dateTime, monthKey, capacity, pricing, venue } = body as {
      dateTime: string;
      monthKey: string;
      capacity: number;
      pricing: { seatPricePence: number; corkageFeePence: number };
      venue: { name: string; address: string; postcode: string };
    };

    if (!dateTime || !monthKey) {
      return NextResponse.json(
        { error: "Date/time and month key are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const ref = db.collection("events").doc();

    const event: JollofEvent = {
      id: ref.id,
      dateTime,
      monthKey,
      capacity: capacity || 30,
      seatsBooked: 0,
      pricing: pricing || { seatPricePence: 2500, corkageFeePence: 200 },
      status: "DRAFT" as EventStatus,
      venue: venue || { name: "", address: "", postcode: "" },
      menu: [],
      createdAt: new Date().toISOString(),
    };

    await ref.set(event);
    return NextResponse.json({ item: event });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update event fields (status, capacity, pricing, venue, dateTime, menu)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, capacity, pricing, venue, dateTime, monthKey, menu } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (capacity !== undefined) updates.capacity = capacity;
    if (pricing !== undefined) updates.pricing = pricing;
    if (venue !== undefined) updates.venue = venue;
    if (dateTime !== undefined) updates.dateTime = dateTime;
    if (monthKey !== undefined) updates.monthKey = monthKey;
    if (menu !== undefined) updates.menu = menu;

    await db.collection("events").doc(id).update(updates);
    return NextResponse.json({ updated: id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove an event by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("events").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
