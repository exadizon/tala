import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items } from "@tala/database/src/schema";
import { eq, desc, like, or, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const collectionId = searchParams.get("collectionId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [
      eq(items.userId, session.user.id),
      isNull(items.deletedAt),
    ];

    if (query) {
      whereConditions.push(
        or(
          like(items.title, `%${query}%`),
          like(items.url, `%${query}%`),
          like(items.note, `%${query}%`),
          like(items.content, `%${query}%`)
        )!
      );
    }

    if (type) {
      whereConditions.push(eq(items.type, type));
    }

    const results = await db
      .select()
      .from(items)
      .where(and(...whereConditions))
      .orderBy(desc(items.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const { type, title, url, content, note, sourceUrl, sourceDomain, author, imageUrl, thumbnailUrl } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    const [newItem] = await db
      .insert(items)
      .values({
        userId: session.user.id,
        type,
        title,
        url,
        content,
        note,
        sourceUrl,
        sourceDomain,
        author,
        imageUrl,
        thumbnailUrl,
      })
      .returning();

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
