import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items } from "@tala/database/src/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;

    const [item] = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.id, id),
          eq(items.userId, session.user.id),
          isNull(items.deletedAt)
        )
      )
      .limit(1);

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json();

    const { title, url, content, note, sourceUrl, sourceDomain, author, imageUrl, thumbnailUrl } = body;

    const [updatedItem] = await db
      .update(items)
      .set({
        title,
        url,
        content,
        note,
        sourceUrl,
        sourceDomain,
        author,
        imageUrl,
        thumbnailUrl,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(items.id, id),
          eq(items.userId, session.user.id),
          isNull(items.deletedAt)
        )
      )
      .returning();

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
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

    const [deletedItem] = await db
      .update(items)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(items.id, id),
          eq(items.userId, session.user.id),
          isNull(items.deletedAt)
        )
      )
      .returning();

    if (!deletedItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
