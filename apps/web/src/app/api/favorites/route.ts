import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { favorites, items } from "@tala/database/src/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const results = await db
      .select({
        id: favorites.itemId,
        createdAt: favorites.createdAt,
        item: items,
      })
      .from(favorites)
      .innerJoin(items, eq(favorites.itemId, items.id))
      .where(eq(favorites.userId, session.user.id))
      .orderBy(desc(favorites.createdAt));

    return NextResponse.json({ favorites: results });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const [newFavorite] = await db
      .insert(favorites)
      .values({
        userId: session.user.id,
        itemId,
      })
      .returning();

    return NextResponse.json({ favorite: newFavorite }, { status: 201 });
  } catch (error) {
    console.error("Error creating favorite:", error);
    return NextResponse.json(
      { error: "Failed to create favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.itemId, itemId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
}
