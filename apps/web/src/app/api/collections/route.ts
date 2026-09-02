import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { collections } from "@tala/database/src/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const results = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.userId, session.user.id),
          isNull(collections.deletedAt)
        )
      )
      .orderBy(desc(collections.createdAt));

    return NextResponse.json({ collections: results });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const [newCollection] = await db
      .insert(collections)
      .values({
        userId: session.user.id,
        name,
        description,
      })
      .returning();

    return NextResponse.json({ collection: newCollection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
