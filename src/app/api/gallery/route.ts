import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminStorage } from "@/lib/firebase/admin";
import type { GalleryItem } from "@/types";

export const dynamic = "force-dynamic";

// GET — fetch all gallery items ordered by createdAt desc
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("gallery")
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as GalleryItem
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// POST — save gallery item metadata (file uploaded client-side)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, storagePath, mediaType, caption, eventDate } = body as {
      url: string;
      storagePath: string;
      mediaType: string;
      caption?: string;
      eventDate?: string;
    };

    if (!url || !storagePath || !mediaType) {
      return NextResponse.json(
        { error: "url, storagePath and mediaType required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const ref = db.collection("gallery").doc();

    const item: Record<string, string> = {
      id: ref.id,
      url,
      storagePath,
      mediaType,
      createdAt: new Date().toISOString(),
    };
    if (caption) item.caption = caption;
    if (eventDate) item.eventDate = eventDate;

    await ref.set(item);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add gallery item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove gallery item (Storage file + Firestore doc)
export async function DELETE(req: NextRequest) {
  try {
    const { id, storagePath } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Gallery item ID required" }, { status: 400 });
    }

    const db = getAdminDb();
    const storage = getAdminStorage();

    // Delete from Storage if path provided
    if (storagePath) {
      try {
        await storage.bucket().file(storagePath).delete();
      } catch {
        // File may already be deleted — continue
      }
    }

    await db.collection("gallery").doc(id).delete();
    return NextResponse.json({ deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete gallery item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
