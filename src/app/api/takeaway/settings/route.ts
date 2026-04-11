import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { TakeawaySettings } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: TakeawaySettings = {
  deliveryFeePence: 300,
  deliveryEnabled: true,
  pickupEnabled: true,
  leadTimeHours: 2,
};

// GET — fetch takeaway settings (or defaults)
export async function GET() {
  try {
    const db = getAdminDb();
    const doc = await db.collection("takeawaySettings").doc("config").get();

    if (!doc.exists) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }

    return NextResponse.json({ settings: doc.data() as TakeawaySettings });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

// PUT — admin updates takeaway settings (merge)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const db = getAdminDb();
    await db.collection("takeawaySettings").doc("config").set(body, { merge: true });

    const updated = await db.collection("takeawaySettings").doc("config").get();
    return NextResponse.json({ settings: updated.data() as TakeawaySettings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
