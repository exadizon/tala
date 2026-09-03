"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { TalaStarIcon } from "@/components/Logo";
import {
  Search,
  Plus,
  Bookmark,
  ExternalLink,
  Star,
  Trash2,
  Copy,
  Check,
  LayoutGrid,
  List as ListIcon,
  Globe,
  FileText,
  Sparkles,
  ArrowUpRight,
  Filter,
  Loader2,
  Calendar,
  X,
  Edit3,
  MessageSquare,
  Share2,
  Tag,
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
  thumbnailUrl: string | null;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "url" | "article" | "note" | "favorites">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Capture bar state
  const [captureUrl, setCaptureUrl] = useState("");
  const [captureNote, setCaptureNote] = useState("");
  const [captureTags, setCaptureTags] = useState("");
  const [captureType, setCaptureType] = useState<"url" | "article" | "note">("url");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail / Edit modal state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editTags, setEditTags] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchItemsAndFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const [itemsRes, favsRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/favorites"),
      ]);

      const itemsData = await itemsRes.json();
      const favsData = await favsRes.json();

      setItems(itemsData.items || []);

      if (favsData.favorites) {
        const favSet = new Set<string>(
          favsData.favorites.map((f: { item?: { id: string }; id?: string }) => f.item?.id || f.id)
        );
        setFavoriteIds(favSet);
      }
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItemsAndFavorites();
  }, [fetchItemsAndFavorites]);

  // Extract domain preview on typing URL
  const detectedDomain = useMemo(() => {
    if (!captureUrl.trim()) return null;
    try {
      const url = captureUrl.startsWith("http") ? captureUrl : `https://${captureUrl}`;
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }, [captureUrl]);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureUrl.trim() && captureType !== "note") return;
    if (captureType === "note" && !captureNote.trim()) return;

    setIsCapturing(true);
    try {
      const normalizedUrl = captureUrl.startsWith("http") ? captureUrl : (captureUrl ? `https://${captureUrl}` : undefined);
      
      const parsedTags = captureTags.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean);

      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          type: captureType,
          note: captureNote.trim() || undefined,
          tags: parsedTags.length > 0 ? parsedTags : undefined,
        }),
      });

      if (response.ok) {
        setCaptureUrl("");
        setCaptureNote("");
        setCaptureTags("");
        setShowNoteInput(false);
        await fetchItemsAndFavorites();
      }
    } catch (error) {
      console.error("Error capturing URL:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isFav = favoriteIds.has(itemId);

    // Optimistic UI update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

    try {
      await fetch("/api/favorites", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
    } catch (error) {
      // Revert optimistic update on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Optimistic delete
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const copyToClipboard = async (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const openEditor = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditNote(item.note || "");
    setEditTags(item.tags?.join(", ") || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);

    try {
      const parsedTags = editTags.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean);

      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim() || undefined,
          note: editNote.trim() || undefined,
          tags: parsedTags,
        }),
      });

      if (response.ok) {
        setEditingItem(null);
        await fetchItemsAndFavorites();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(dateString));
    } catch {
      return "";
    }
  };

  const getDomainLabel = (url: string | null, domain: string | null) => {
    if (domain) return domain;
    if (url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "link";
      }
    }
    return "note";
  };

  const getFaviconUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  // Derive unique tags from items
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  // Filter and Sort Logic
  const filteredAndSortedItems = items
    .filter((item) => {
      if (activeFilter === "favorites") {
        if (!favoriteIds.has(item.id)) return false;
      } else if (activeFilter !== "all" && item.type !== activeFilter) {
        return false;
      }
      
      if (activeTag && !(item.tags?.includes(activeTag))) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.url?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        item.content?.toLowerCase().includes(q) ||
        item.sourceDomain?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      {/* Search and Capture Bar */}
      <div className="sticky top-14 z-20 max-w-4xl mx-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <form onSubmit={handleCapture} className="relative group">
          <div className="flex items-start lg:items-center bg-[var(--paper)] rounded-2xl border border-[var(--faint)] shadow-lift p-2 transition-all focus-within:border-[var(--accent)] focus-within:shadow-card">
            
            <div className="flex-1 flex flex-col justify-center min-w-[200px]">
              <div className="flex items-center">
                <Search className="min-w-4 w-4 h-4 text-[var(--muted)] ml-3 hidden sm:block" />
                <input
                  type="text"
                  value={captureUrl}
                  onChange={(e) => setCaptureUrl(e.target.value)}
                  placeholder={captureType === 'note' ? "Start typing a note..." : "Paste a URL or search..."}
                  className="w-full bg-transparent border-none focus:ring-0 text-[15px] px-3 sm:px-4 py-2 sm:py-3 font-sans placeholder:text-[var(--muted)] text-[var(--ink)]"
                />
              </div>

              {/* Expandable note/tags section */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showNoteInput ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-3 sm:px-4 pb-3 flex flex-col gap-2">
                  <textarea
                    placeholder="Add a remark (optional)"
                    value={captureNote}
                    onChange={(e) => setCaptureNote(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--bg)] border border-[var(--faint)] rounded-xl focus:ring-0 focus:border-[var(--accent)] text-sm px-3 py-2 font-sans placeholder:text-[var(--muted)] text-[var(--ink)] resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated, e.g. ai, design)"
                    value={captureTags}
                    onChange={(e) => setCaptureTags(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--faint)] rounded-xl focus:ring-0 focus:border-[var(--accent)] text-sm px-3 py-1.5 font-sans placeholder:text-[var(--muted)] text-[var(--ink)]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 px-2 pb-2 lg:pb-0 shrink-0 self-end lg:self-center ml-auto">
              {(captureUrl || captureType === "note") && (
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className={`hidden sm:flex text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    showNoteInput 
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20" 
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--faint)] hover:text-[var(--ink)]"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  Note
                </button>
              )}
              
              <div className="h-6 w-px bg-[var(--faint)] hidden sm:block mx-1"></div>
              
              <select
                value={captureType}
                onChange={(e) => setCaptureType(e.target.value as any)}
                className="bg-[var(--panel)] border border-[var(--faint)] text-xs text-[var(--ink)] rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="url">Link</option>
                <option value="article">Article</option>
                <option value="note">Note</option>
              </select>

              <button
                type="submit"
                disabled={isCapturing || (!captureUrl.trim() && captureType !== "note")}
                className="bg-[var(--ink)] text-[var(--paper)] rounded-xl px-3 sm:px-5 py-2 font-medium shadow-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
              >
                {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
          
          {detectedDomain && captureType !== "note" && (
            <div className="absolute -bottom-8 left-6 flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] bg-[var(--paper)]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-[var(--faint)] shadow-xs animate-fade-in z-20">
              <Globe className="w-3 h-3" />
              <span>Saving to: {detectedDomain}</span>
            </div>
          )}
        </form>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar rounded-lg border border-[var(--faint)] p-1 bg-[var(--paper)] max-w-full">
          {[
            { id: "all", label: "All" },
            { id: "favorites", label: "Stars", icon: Star },
            { id: "url", label: "Links" },
            { id: "article", label: "Reader" },
            { id: "note", label: "Notes" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                activeFilter === filter.id
                  ? "bg-[var(--panel)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
              }`}
            >
              {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
              {filter.label}
              <span className="opacity-40 text-[10px]">
                {filter.id === "all"
                  ? items.length
                  : filter.id === "favorites"
                  ? items.filter((i) => favoriteIds.has(i.id)).length
                  : items.filter((i) => i.type === filter.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto">
          {/* Quick Search Box (fallback if not using main bar) */}
          <div className="relative w-full md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find..."
              className="w-full rounded-lg border border-[var(--faint)] bg-[var(--paper)] pl-8.5 pr-7 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-[var(--faint)] hidden sm:block"></div>

          {/* View Toggles */}
          <div className="hidden sm:flex items-center gap-0.5 border border-[var(--faint)] bg-[var(--paper)] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-[var(--panel)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "list" ? "bg-[var(--panel)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {allTags.length > 0 && (
         <div className="flex items-center flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mr-1">Tags:</span>
            {allTags.map(tag => (
              <button
                 key={tag}
                 onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                 className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors border ${
                   activeTag === tag 
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" 
                    : "bg-[var(--panel)] text-[var(--ink)] border-[var(--faint)] hover:border-[var(--accent)]/50"
                 }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
         </div>
      )}

      {/* Content Grid/List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" />
          <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            Loading library...
          </p>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--faint)] bg-[var(--paper)]/40 p-12 text-center space-y-4 max-w-2xl mx-auto mt-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-xs">
            {searchQuery || activeTag ? <Search className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
              {(searchQuery || activeTag) ? "No matches found" : "Your library is empty"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {(searchQuery || activeTag)
                ? "Try a different search term or clear your filters."
                : "Capture your first article, video, or inspiration using the bar above."}
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col h-full rounded-2xl border border-[var(--faint)] bg-[var(--paper)] overflow-hidden hover:border-[var(--faint-strong)] hover:shadow-card transition-all"
            >
              {/* Card Image */}
              {item.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--panel)] border-b border-[var(--faint)]">
                  <img
                    src={item.imageUrl}
                    alt={item.title || "Preview"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              )}

              <div className="flex flex-col flex-1 p-5">
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--muted)] bg-[var(--panel)] px-2 py-0.5 rounded-md border border-[var(--faint)] max-w-full overflow-hidden">
                    {item.type === "url" && <Globe className="w-3 h-3 shrink-0" />}
                    {item.type === "article" && <FileText className="w-3 h-3 shrink-0" />}
                    {item.type === "note" && <Edit3 className="w-3 h-3 shrink-0" />}
                    <span className="truncate">
                      {getDomainLabel(item.url, item.sourceDomain)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 -mr-2">
                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                        favoriteIds.has(item.id)
                          ? "opacity-100 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                          : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <TalaStarIcon className="w-4 h-4" glow={favoriteIds.has(item.id)} />
                    </button>
                    {(item.type === "url" || item.type === "article") && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--panel)] cursor-pointer"
                        title="Open external link"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Title & Note */}
                <Link href={`/items/${item.id}`} className="group/link flex-1 block">
                  <h3 className="font-serif text-[17px] font-medium leading-snug tracking-tight text-[var(--ink)] line-clamp-2 mb-2 group-hover/link:text-[var(--accent)] transition-colors">
                    {item.title || "Untitled Capture"}
                  </h3>
                  {item.note && (
                    <p className="font-sans text-[13px] text-[var(--muted)] line-clamp-3 leading-relaxed mb-4">
                      {item.note}
                    </p>
                  )}
                  {!item.note && item.content && item.type === "note" && (
                    <p className="font-sans text-[13px] text-[var(--muted)] line-clamp-3 leading-relaxed mb-4">
                      {item.content}
                    </p>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-[var(--panel)] border text-[var(--muted)] border-[var(--faint)] rounded text-[10px] uppercase font-mono tracking-wider truncate max-w-[120px]">
                            {tag}
                          </span>
                        ))}
                     </div>
                  )}
                </Link>

                {/* Footer Meta & Actions */}
                <div className="pt-4 mt-auto border-t border-[var(--faint)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                  <span>{formatDate(item.createdAt)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => openEditor(item, e)}
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                      title="Quick Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 rounded text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="flex flex-col gap-2 relative">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 rounded-xl border border-transparent hover:border-[var(--faint)] hover:bg-[var(--paper)] hover:shadow-xs transition-all"
            >
              <div className="flex flex-1 items-center gap-4 min-w-0">
                {/* Visual Icon per type */}
                <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-lg bg-[var(--panel)] border border-[var(--faint)] items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : item.type === "url" || item.type === "article" ? (
                    item.url && getFaviconUrl(item.url) ? (
                      <img src={getFaviconUrl(item.url)!} alt="" className="w-4 h-4 opacity-70" />
                    ) : (
                      <Globe className="w-4 h-4 text-[var(--muted)]" />
                    )
                  ) : (
                    <FileText className="w-4 h-4 text-[var(--muted)]" />
                  )}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/items/${item.id}`} className="truncate">
                      <span className="font-serif font-medium text-[15px] sm:text-[16px] text-[var(--ink)] hover:text-[var(--accent)] transition-colors truncate block">
                        {item.title || "Untitled Capture"}
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono text-[var(--muted)]">
                    <span className="bg-[var(--panel)] border border-[var(--faint)] px-1.5 py-0.5 rounded text-[10px]">
                      {getDomainLabel(item.url, item.sourceDomain)}
                    </span>
                    <span className="hidden sm:inline-block text-[var(--faint-strong)]">•</span>
                    <span className="hidden sm:inline-block">{formatDate(item.createdAt)}</span>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-[var(--faint)] pl-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs text-[var(--muted)]">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                <button
                  onClick={(e) => handleToggleFavorite(item.id, e)}
                  className={`p-2 sm:p-1.5 rounded-lg transition-all ${
                    favoriteIds.has(item.id)
                      ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                  }`}
                >
                  <TalaStarIcon className="w-4 h-4" glow={favoriteIds.has(item.id)} />
                </button>
                <button
                  onClick={(e) => openEditor(item, e)}
                  className="p-2 sm:p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                  title="Quick Edit"
                >
                  <Edit3 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                  <div className="flex items-center gap-1">
                    {(item.type === "url" || item.type === "article") && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 sm:p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                        title="Open original"
                      >
                        <ArrowUpRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 sm:p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-1 cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 shadow-lift animate-fade-in">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--faint)]">
              <h3 className="font-serif font-medium text-lg text-[var(--ink)] tracking-tight">Quick Edit</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)]"
                  placeholder="Capture title"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
                  placeholder="design, architecture, ai..."
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] pl-1">
                  Note
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] resize-none"
                  placeholder="Add your thoughts or summary..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || (!editTitle.trim() && editTitle !== editingItem.title)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
