"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TalaStarIcon } from "@/components/Logo";
import { TagInput } from "@/components/TagInput";
import {
  ArrowLeft,
  Globe,
  FileText,
  Edit3,
  ExternalLink,
  Trash2,
  Calendar,
  User,
  Image as ImageIcon,
  Loader2,
  Save,
  Bookmark,
  Share2,
  ArrowUpRight,
  Tag
} from "lucide-react";

interface Item {
  id: string;
  type: string;
  title: string | null;
  url: string | null;
  content: string | null;
  note: string | null;
  sourceUrl: string | null;
  sourceDomain: string | null;
  author: string | null;
  imageUrl: string | null;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function ItemReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const itemId = unwrappedParams.id;
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit State
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/items/${itemId}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/library");
        return;
      }
      const data = await res.json();
      setItem(data.item);
      setEditTitle(data.item.title || "");
      setEditContent(data.item.content || "");
      setEditNote(data.item.note || "");
      setEditTags(data.item.tags || []);
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleSave = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim() || undefined,
          content: editContent.trim() || undefined,
          note: editNote.trim() || undefined,
          tags: editTags,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchItem();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item moving it to trash?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/library");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 justify-center items-center flex py-32 flex-col gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)]">Loading content</span>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20 mt-4 md:mt-8 px-2 md:px-0">
      {/* Top Nav */}
      <div className="flex items-center justify-between border-[var(--faint)] pb-4 opacity-50 hover:opacity-100 transition-opacity">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors border border-transparent hover:border-[var(--faint)]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Original</span>
            </a>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isEditing 
                ? "bg-[var(--panel)] text-[var(--ink)] border-[var(--faint-strong)]"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] border-transparent hover:border-[var(--faint)]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Layout / Editor */}
      {isEditing ? (
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1 mb-1.5 block">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-3 text-lg font-serif font-medium text-[var(--ink)] focus:border-[var(--accent)]"
              placeholder="Title..."
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1 mb-1.5 block">Tags</label>
            <TagInput tags={editTags} onChange={setEditTags} placeholder="Add a tag..." />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1 mb-1.5 block">My Thoughts</label>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-3 text-sm font-sans text-[var(--ink)] focus:border-[var(--accent)] resize-y"
              placeholder="Add your note or reflection..."
            />
          </div>

          <div>
             <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1 mb-1.5 block">
                {item.type === 'note' ? 'Content' : 'Extracted Content (Partial)'}
             </label>
             <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={15}
              className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-3 text-[15px] font-serif leading-relaxed text-[var(--ink)] focus:border-[var(--accent)] resize-y"
              placeholder="The main body content..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--faint)]">
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <article className="space-y-8">
          {/* Article Header */}
          <header className="space-y-5">
             <div className="flex items-center flex-wrap gap-2">
               <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] bg-[var(--panel)] px-2.5 py-1 rounded-md border border-[var(--faint)]">
                  {item.type === "url" && <Globe className="w-3 h-3" />}
                  {item.type === "article" && <FileText className="w-3 h-3" />}
                  {item.type === "note" && <Edit3 className="w-3 h-3" />}
                  <span>{item.type}</span>
                  {item.sourceDomain && (
                    <>
                      <span className="opacity-50">•</span>
                      <span>{item.sourceDomain}</span>
                    </>
                  )}
               </div>
               
               {item.tags && item.tags.length > 0 && (
                 <div className="flex items-center flex-wrap gap-1.5 ml-2">
                   {item.tags.map(tag => (
                     <Link key={tag} href={`/library?tag=${encodeURIComponent(tag)}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[var(--ink)] bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors">
                       <Tag className="w-3 h-3" />
                       {tag}
                     </Link>
                   ))}
                 </div>
               )}
             </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[var(--ink)] leading-snug">
              {item.title || "Untitled Capture"}
            </h1>

            <div className="flex items-center gap-4 text-xs font-sans text-[var(--muted)] border-b border-[var(--faint)] pb-6">
              {item.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  }).format(new Date(item.createdAt))}
                </span>
              </div>
            </div>
          </header>

          {item.imageUrl && (
            <figure className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-[var(--faint)] bg-[var(--panel)]">
              <img
                src={item.imageUrl}
                alt={item.title || "Cover"}
                className="w-full h-full object-cover"
              />
            </figure>
          )}

          {/* User's Note / Abstract */}
          {item.note && (
             <div className="bg-[var(--accent-soft)]/30 border border-[var(--accent)]/10 text-[var(--ink)] p-5 sm:p-6 rounded-2xl text-sm sm:text-base font-sans leading-relaxed">
               <div className="flex items-center gap-2 mb-2 text-[var(--accent)] font-medium text-xs font-mono uppercase tracking-wider">
                 <Bookmark className="w-3.5 h-3.5" />
                 Reflection
               </div>
               {item.note}
             </div>
          )}

          {/* Full content Reader */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert prose-p:font-serif prose-p:leading-relaxed prose-headings:font-serif mx-auto max-w-none text-[var(--ink)] pb-12">
            {item.content ? (
               <div
                 className="whitespace-pre-wrap font-serif text-[17px] sm:text-lg leading-[1.8] sm:leading-[1.9] tracking-[-0.01em] text-[var(--ink)]/90"
               >
                {item.content}
               </div>
            ) : item.type !== "note" ? (
               <div className="py-12 text-center space-y-4 border-t border-[var(--faint)] opacity-60">
                 <div className="w-10 h-10 rounded-xl bg-[var(--panel)] border border-[var(--faint)] flex items-center justify-center mx-auto text-[var(--muted)]">
                   <ExternalLink className="w-4 h-4" />
                 </div>
                 <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
                   Full article extraction is not enabled for this capture. Read the rest on the original site.
                 </p>
                 {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Open Link
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                 )}
               </div>
            ) : null}
          </div>
        </article>
      )}
    </div>
  );
}
