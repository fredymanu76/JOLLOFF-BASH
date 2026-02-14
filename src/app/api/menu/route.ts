import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FULL_MENU, type MenuItem } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET — fetch all menu items (Firestore first, fallback to constants)
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("menuItems")
      .orderBy("category")
      .orderBy("name")
      .get();

    if (snapshot.empty) {
      // Seed from constants if collection is empty
      return NextResponse.json({ items: FULL_MENU, source: "defaults" });
    }

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ items, source: "firestore" });
  } catch {
    // Firestore not configured — return constants
    return NextResponse.json({ items: FULL_MENU, source: "defaults" });
  }
}

// POST — add a new menu item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, emoji } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category required" }, { status: 400 });
    }

    const db = getAdminDb();
    const id = `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`;

    const item: MenuItem = {
      id,
      name,
      description: description || "",
      category,
      emoji: emoji || "🍽️",
    };

    await db.collection("menuItems").doc(id).set(item);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add menu item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a menu item
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("menuItems").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete menu item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
