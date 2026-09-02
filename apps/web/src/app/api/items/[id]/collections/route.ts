import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items, itemCollections, collections } from "@tala/database/src/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id: itemId } = await params;
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        { error: "collectionId is required" },
        { status: 400 }
      );
    }

    // Verify ownership of the item and collection
    const [item] = await db
      .select({ id: items.id })
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, session.user.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const [collection] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    await db
      .delete(itemCollections)
      .where(
        and(
          eq(itemCollections.itemId, itemId),
          eq(itemCollections.collectionId, collectionId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove item from collection" },
      { status: 500 }
    );
  }
}
