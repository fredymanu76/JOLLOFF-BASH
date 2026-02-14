import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("giftTickets")
      .where("recipientPhone", "==", phone.trim())
      .orderBy("createdAt", "desc")
      .get();

    const gifts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ gifts });
  } catch (err) {
    // If Firestore isn't configured yet, return empty results gracefully
    const message = err instanceof Error ? err.message : "Lookup failed";

    if (message.includes("project_id") || message.includes("credentials")) {
      return NextResponse.json({ gifts: [] });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
