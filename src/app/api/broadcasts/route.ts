import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Broadcast, BroadcastAudience, BroadcastChannel } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch all broadcasts ordered by createdAt desc
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("broadcasts")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Broadcast
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// POST — create a new broadcast
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, audience, channel } = body as {
      title: string;
      message: string;
      audience: BroadcastAudience;
      channel: BroadcastChannel;
    };

    if (!title || !message || !audience || !channel) {
      return NextResponse.json(
        { error: "title, message, audience and channel required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const ref = db.collection("broadcasts").doc();

    const item: Broadcast = {
      id: ref.id,
      title,
      message,
      audience,
      channel,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await ref.set(item);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create broadcast";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a broadcast
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Broadcast ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("broadcasts").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete broadcast";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
