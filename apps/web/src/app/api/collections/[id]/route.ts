import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { collections } from "@tala/database/src/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;

    const [collection] = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, id),
          eq(collections.userId, session.user.id),
          isNull(collections.deletedAt)
        )
      )
      .limit(1);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
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

    const { name, description } = body;

    const [updatedCollection] = await db
      .update(collections)
      .set({
        name,
        description,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(collections.id, id),
          eq(collections.userId, session.user.id),
          isNull(collections.deletedAt)
        )
      )
      .returning();

    if (!updatedCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection: updatedCollection });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
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

    const [deletedCollection] = await db
      .update(collections)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(collections.id, id),
          eq(collections.userId, session.user.id),
          isNull(collections.deletedAt)
        )
      )
      .returning();

    if (!deletedCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
