import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { itemCollections, collections, items } from "@tala/database/src/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;

    const results = await db
      .select({
        collectionId: itemCollections.collectionId,
        collection: collections,
      })
      .from(itemCollections)
      .innerJoin(collections, eq(itemCollections.collectionId, collections.id))
      .where(
        and(
          eq(itemCollections.itemId, id),
          eq(collections.userId, session.user.id)
        )
      );

    return NextResponse.json({ collections: results });
  } catch (error) {
    console.error("Error fetching item collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch item collections" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json();

    const { collectionId } = body;

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    const [newItemCollection] = await db
      .insert(itemCollections)
      .values({
        itemId: id,
        collectionId,
      })
      .returning();

    return NextResponse.json({ itemCollection: newItemCollection }, { status: 201 });
  } catch (error) {
    console.error("Error adding item to collection:", error);
    return NextResponse.json(
      { error: "Failed to add item to collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(itemCollections)
      .where(
        and(
          eq(itemCollections.itemId, id),
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
