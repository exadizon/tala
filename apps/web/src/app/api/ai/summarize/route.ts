import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items } from "@tala/database/src/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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

    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, session.user.id)));

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (!item.content || item.content.length < 50) {
      return NextResponse.json(
        { error: "Item content is too short to summarize" },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: "You are an assistant designed to summarize articles, websites, and text. Provide a succinct 1-3 paragraph summary of the following content. Keep the tone professional, clear, and focused on the key takeaways.",
      prompt: `Title: ${item.title}\\n\\nContent:\\n${item.content}`,
    });

    // We can save the summary into the `note` field of the item if we want, or just return it for the UI to display dynamically.
    // Saving it to `note` if it is empty sounds good to augment the item.
    if (!item.note) {
      await db
        .update(items)
        .set({ note: text })
        .where(eq(items.id, item.id));
    }

    return NextResponse.json({ summary: text, savedToNote: !item.note });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
