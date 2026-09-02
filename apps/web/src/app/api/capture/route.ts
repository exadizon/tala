import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items } from "@tala/database/src/schema";
import * as cheerio from "cheerio";

interface Metadata {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  author: string | null;
  sourceDomain: string | null;
}

async function extractMetadata(url: string): Promise<Metadata> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Tala/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      $('meta[name="title"]').attr("content");

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content");

    const imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");

    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content");

    const domain = new URL(url).hostname;

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      author: author?.trim() || null,
      sourceDomain: domain,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {
      title: null,
      description: null,
      imageUrl: null,
      author: null,
      sourceDomain: new URL(url).hostname,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const { url, type = "url", content, note, title: customTitle } = body;

    if (!url && type === "url") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let metadata: Metadata = {
      title: customTitle || null,
      description: null,
      imageUrl: null,
      author: null,
      sourceDomain: null,
    };

    if (url && type === "url") {
      metadata = await extractMetadata(url);
    }

    const [newItem] = await db
      .insert(items)
      .values({
        userId: session.user.id,
        type,
        title: customTitle || metadata.title,
        url,
        content,
        note,
        sourceUrl: url,
        sourceDomain: metadata.sourceDomain,
        author: metadata.author,
        imageUrl: metadata.imageUrl,
        thumbnailUrl: metadata.imageUrl,
      })
      .returning();

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error capturing item:", error);
    return NextResponse.json(
      { error: "Failed to capture item" },
      { status: 500 }
    );
  }
}
