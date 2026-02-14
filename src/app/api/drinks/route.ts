import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { AddOn, AddOnCategory } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch active drinks from Firestore addOns collection
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("addOns").get();

    const items = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as AddOn)
      .filter((item) => item.active)
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// POST — add a new drink
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, pricePence, category, description } = body as {
      name: string;
      pricePence: number;
      category: AddOnCategory;
      description?: string;
    };

    if (!name || !pricePence || !category) {
      return NextResponse.json(
        { error: "Name, price and category required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const id = `drink-${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`;

    const item: AddOn = {
      id,
      name,
      description: description || "",
      pricePence,
      category,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await db.collection("addOns").doc(id).set(item);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add drink";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update a drink's price or details
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, pricePence, name, description, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Drink ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    const updates: Record<string, unknown> = {};
    if (pricePence !== undefined) updates.pricePence = pricePence;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;

    await db.collection("addOns").doc(id).update(updates);
    return NextResponse.json({ updated: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update drink";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a drink
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Drink ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("addOns").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete drink";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
