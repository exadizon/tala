import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { apiTokens } from "@tala/database/src/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const tokens = await db
      .select({
        id: apiTokens.id,
        name: apiTokens.name,
        createdAt: apiTokens.createdAt,
        lastUsedAt: apiTokens.lastUsedAt,
      })
      .from(apiTokens)
      .where(eq(apiTokens.userId, session.user.id))
      .orderBy(desc(apiTokens.createdAt));

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const rawToken = "tl_" + crypto.randomBytes(32).toString("hex");

    const [newToken] = await db
      .insert(apiTokens)
      .values({
        userId: session.user.id,
        name: name.trim(),
        token: rawToken,
      })
      .returning();

    return NextResponse.json(
      {
        token: rawToken,
        tokenMetadata: {
          id: newToken.id,
          name: newToken.name,
          createdAt: newToken.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
