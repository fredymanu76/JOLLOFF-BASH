import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { TimeSlot } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch all active time slots, ordered by startTime
// Optional ?date=YYYY-MM-DD to check availability for a specific date
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");

    const db = getAdminDb();
    let query = db
      .collection("timeSlots")
      .where("active", "==", true)
      .orderBy("startTime", "asc");

    const snapshot = await query.get();

    let items: TimeSlot[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as TimeSlot
    );

    // Filter by specific date if provided
    if (date) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();

      items = items.filter((slot) => {
        // Match by specific date
        if (slot.specificDate && slot.specificDate === date) {
          return true;
        }
        // Match by day of week (if no specific date set on slot)
        if (!slot.specificDate && slot.dayOfWeek !== undefined && slot.dayOfWeek === dayOfWeek) {
          return true;
        }
        // Slots with neither specificDate nor dayOfWeek are available every day
        if (!slot.specificDate && slot.dayOfWeek === undefined) {
          return true;
        }
        return false;
      });
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// POST — create a new time slot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, startTime, endTime, maxOrders, dayOfWeek, specificDate } = body as {
      label: string;
      startTime: string;
      endTime: string;
      maxOrders: number;
      dayOfWeek?: number;
      specificDate?: string;
    };

    if (!label || !startTime || !endTime || !maxOrders) {
      return NextResponse.json(
        { error: "Label, startTime, endTime, and maxOrders are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const ref = db.collection("timeSlots").doc();

    const timeSlot: TimeSlot = {
      id: ref.id,
      label,
      startTime,
      endTime,
      maxOrders,
      currentOrders: 0,
      active: true,
      ...(dayOfWeek !== undefined && { dayOfWeek }),
      ...(specificDate && { specificDate }),
    };

    await ref.set(timeSlot);
    return NextResponse.json({ item: timeSlot });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create time slot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update a time slot by id
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Time slot ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection("timeSlots").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Time slot not found" }, { status: 404 });
    }

    const allowedFields = ["label", "startTime", "endTime", "maxOrders", "dayOfWeek", "specificDate", "active"];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }

    await docRef.update(filtered);
    const updated = { ...doc.data(), ...filtered, id };

    return NextResponse.json({ item: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update time slot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — delete a time slot by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Time slot ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("timeSlots").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete time slot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
