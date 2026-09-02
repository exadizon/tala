import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items, itemCollections } from "@tala/database/src/schema";
import { eq, desc, like, or, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type");
    const collectionId = searchParams.get("collectionId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const whereConditions = [
      eq(items.userId, session.user.id),
      isNull(items.deletedAt),
      or(
        like(items.title, `%${query}%`),
        like(items.url, `%${query}%`),
        like(items.note, `%${query}%`),
        like(items.content, `%${query}%`),
        like(items.sourceDomain, `%${query}%`),
        like(items.author, `%${query}%`)
      )!,
    ];

    if (type) {
      whereConditions.push(eq(items.type, type));
    }

    let results;

    if (collectionId) {
      results = await db
        .select()
        .from(items)
        .innerJoin(itemCollections, eq(items.id, itemCollections.itemId))
        .where(
          and(
            ...whereConditions,
            eq(itemCollections.collectionId, collectionId)
          )
        )
        .orderBy(desc(items.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      results = await db
        .select()
        .from(items)
        .where(and(...whereConditions))
        .orderBy(desc(items.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return NextResponse.json({ items: results, query });
  } catch (error) {
    console.error("Error searching items:", error);
    return NextResponse.json(
      { error: "Failed to search items" },
      { status: 500 }
    );
  }
}
