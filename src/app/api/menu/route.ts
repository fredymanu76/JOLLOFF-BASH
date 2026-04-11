import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FULL_MENU } from "@/lib/constants";
import type { MenuItem, MenuItemAvailability } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch all menu items (Firestore first, fallback to constants)
export async function GET(req: NextRequest) {
  try {
    const availability = req.nextUrl.searchParams.get("availability") as MenuItemAvailability | null;

    const db = getAdminDb();
    const snapshot = await db
      .collection("menuItems")
      .orderBy("category")
      .orderBy("name")
      .get();

    if (snapshot.empty) {
      // Seed from constants if collection is empty — add default availability/active
      let items: MenuItem[] = FULL_MENU.map((item) => ({
        ...item,
        availability: item.availability || "BOTH",
        active: item.active !== undefined ? item.active : true,
      }));

      if (availability) {
        items = items.filter(
          (i) => i.availability === availability || i.availability === "BOTH"
        );
      }

      return NextResponse.json({ items, source: "defaults" });
    }

    let items: MenuItem[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        category: data.category || "MAIN",
        emoji: data.emoji || "🍽️",
        availability: data.availability || "BOTH",
        pricePence: data.pricePence,
        active: data.active !== undefined ? data.active : true,
      } as MenuItem;
    });

    if (availability) {
      items = items.filter(
        (i) => i.availability === availability || i.availability === "BOTH"
      );
    }

    return NextResponse.json({ items, source: "firestore" });
  } catch {
    // Firestore not configured — return constants
    const availability = req.nextUrl.searchParams.get("availability") as MenuItemAvailability | null;
    let items: MenuItem[] = FULL_MENU.map((item) => ({
      ...item,
      availability: item.availability || "BOTH",
      active: item.active !== undefined ? item.active : true,
    }));

    if (availability) {
      items = items.filter(
        (i) => i.availability === availability || i.availability === "BOTH"
      );
    }

    return NextResponse.json({ items, source: "defaults" });
  }
}

// POST — add a new menu item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, emoji, availability, pricePence } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category required" }, { status: 400 });
    }

    // Validate takeaway items must have a price
    if ((availability === "TAKEAWAY" || availability === "BOTH") && pricePence !== undefined && pricePence <= 0) {
      return NextResponse.json({ error: "Takeaway items must have a valid price" }, { status: 400 });
    }

    const db = getAdminDb();
    const id = `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`;

    const item: MenuItem = {
      id,
      name,
      description: description || "",
      category,
      emoji: emoji || "🍽️",
      availability: availability || "BOTH",
      pricePence: pricePence || undefined,
      active: true,
    };

    await db.collection("menuItems").doc(id).set(item);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add menu item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update an existing menu item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection("menuItems").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Only allow certain fields to be updated
    const allowedFields = ["name", "description", "category", "emoji", "availability", "pricePence", "active"];
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
    const message = err instanceof Error ? err.message : "Failed to update menu item";
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
