import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { db } from "@tala/database";
import { items, itemCollections } from "@tala/database/src/schema";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

interface Metadata {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  author: string | null;
  sourceDomain: string | null;
  fullContent?: string | null;
}

async function extractMetadata(url: string, expandContent: boolean = false): Promise<Metadata> {
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
    
    let fullContent = null;
    let articleAuthor: string | undefined;
    
    // Only parse full readability content if this is marked as an "article" explicitly
    if (expandContent) {
      try {
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        if (article && article.textContent) {
          // We could store HTML (article.content) or just raw text (article.textContent).
          // Storing text is safer and easier to style initially, but optionally HTML structure is nice.
          // Let's store textContent for a totally distraction-free reading experience.
          fullContent = article.textContent.trim().replace(/\n{3,}/g, '\n\n'); 
          
          if (!author && article.byline) {
             // Fallback author
             articleAuthor = article.byline;
          }
        }
      } catch (domErr) {
        console.error("DOM Parse error:", domErr);
      }
    }

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      author: (author || articleAuthor || null)?.trim() || null,
      sourceDomain: domain,
      fullContent
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

    const { url, type = "url", content, note, title: customTitle, tags } = body;

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
      fullContent: null
    };

    if (url && (type === "url" || type === "article")) {
      metadata = await extractMetadata(url, type === "article");
    }

    const finalContent = content || metadata.fullContent || metadata.description;

    const [newItem] = await db
      .insert(items)
      .values({
        userId: session.user.id,
        type,
        title: customTitle || metadata.title,
        url,
        content: finalContent,
        note,
        sourceUrl: url,
        sourceDomain: metadata.sourceDomain,
        author: metadata.author,
        imageUrl: metadata.imageUrl,
        thumbnailUrl: metadata.imageUrl,
        tags: Array.isArray(tags) ? tags : [],
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

