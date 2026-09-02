"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "url" | "article" | "note" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Capture bar state
  const [captureUrl, setCaptureUrl] = useState("");
  const [captureNote, setCaptureNote] = useState("");
  const [captureType, setCaptureType] = useState<"url" | "article" | "note">("url");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail / Edit modal state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
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
    if (!captureUrl.trim()) return;

    setIsCapturing(true);
    try {
      const normalizedUrl = captureUrl.startsWith("http") ? captureUrl : `https://${captureUrl}`;
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          type: captureType,
          note: captureNote.trim() || undefined,
        }),
      });

      if (response.ok) {
        setCaptureUrl("");
        setCaptureNote("");
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
      if (isFav) {
        await fetch(`/api/favorites?itemId=${itemId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to remove this item from your sanctuary?")) return;

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCopy = (url: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (item: Item, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditNote(item.note || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingItem,
          title: editTitle,
          note: editNote,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updated.item : item))
        );
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Filter tabs
        if (activeFilter === "favorites") {
          if (!favoriteIds.has(item.id)) return false;
        } else if (activeFilter !== "all") {
          if (item.type !== activeFilter) return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.url?.toLowerCase().includes(q) ||
          item.note?.toLowerCase().includes(q) ||
          item.sourceDomain?.toLowerCase().includes(q) ||
          item.content?.toLowerCase().includes(q)
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
  }, [items, favoriteIds, activeFilter, searchQuery, sortBy]);

  const formatDate = (dateValue: string | Date) => {
    try {
      const d = new Date(dateValue);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--faint)] pb-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight">
            Library
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-sans mt-0.5">
            Your collected readings, references, and reflections
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--panel)] border border-[var(--faint)]">
            {items.length} {items.length === 1 ? "entry" : "entries"} total
          </span>
        </div>
      </div>

      {/* Quick Capture Bar */}
      <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-4 sm:p-5 shadow-card transition-all">
        <form onSubmit={handleCapture} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={captureUrl}
                onChange={(e) => setCaptureUrl(e.target.value)}
                placeholder="Paste article URL, bookmark link, or reference..."
                className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] pl-10 pr-24 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] transition-all font-sans"
              />
              {detectedDomain && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
                    {detectedDomain}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showNoteInput || captureNote
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--faint)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                title="Add an annotation or note"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Note</span>
              </button>

              <button
                type="submit"
                disabled={isCapturing || !captureUrl.trim()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium shadow-xs hover:opacity-95 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Capture</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Annotation Field */}
          {showNoteInput && (
            <div className="pt-2 animate-fade-in">
              <textarea
                value={captureNote}
                onChange={(e) => setCaptureNote(e.target.value)}
                placeholder="Add a thought, note, or quote to accompany this capture..."
                rows={2}
                className="w-full rounded-xl border border-[var(--faint)] bg-[var(--bg)] p-3 text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] transition-all font-sans resize-none"
              />
            </div>
          )}
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Items" },
            { id: "favorites", label: "Starred" },
            { id: "url", label: "Links" },
            { id: "article", label: "Articles" },
            { id: "note", label: "Notes" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--ink)] text-[var(--bg)] shadow-xs"
                    : "border border-[var(--faint)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--faint-strong)]"
                }`}
              >
                {tab.id === "favorites" && (
                  <Star className={`w-3 h-3 inline-block mr-1.5 ${isActive ? "fill-current" : ""}`} />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search, Sort, and View Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
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

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--faint)] bg-[var(--paper)] p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--panel)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--panel)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              title="List View"
              aria-label="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Items Display */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" />
          <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            Fetching your sanctuary...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--faint)] bg-[var(--paper)]/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-xs">
            <TalaStarIcon className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
              {searchQuery
                ? "No entries match your search"
                : activeFilter === "favorites"
                ? "No starred items yet"
                : "Your sanctuary is ready"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {searchQuery
                ? `Try searching with different terms or clear the filter.`
                : activeFilter === "favorites"
                ? `Star your most cherished articles and bookmarks to display them here.`
                : `Paste any article link, newsletter, or quote above to start building your library.`}
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.has(item.id);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="group relative rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-5 flex flex-col justify-between hover:border-[var(--faint-strong)] hover:shadow-card transition-all cursor-pointer overflow-hidden"
              >
                {/* Top Row: Domain / Type badge & Star button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.sourceDomain ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-[var(--panel)] text-[var(--muted)] border border-[var(--faint)] truncate">
                        <Globe className="w-3 h-3 shrink-0 text-[var(--accent)]" />
                        <span className="truncate">{item.sourceDomain}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider bg-[var(--panel)] text-[var(--muted)] border border-[var(--faint)]">
                        {item.type}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isFav
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                      }`}
                      title={isFav ? "Starred in favorites" : "Star this item"}
                      aria-label="Star item"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${isFav ? "fill-[var(--accent)]" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-2.5 mb-4 flex-1">
                  <h3 className="font-serif text-base font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug">
                    {item.title || "Untitled Capture"}
                  </h3>

                  {item.note && (
                    <div className="p-2.5 rounded-lg border border-[var(--faint)] bg-[var(--bg)]/60">
                      <p className="font-serif italic text-xs text-[var(--muted)] line-clamp-3">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    </div>
                  )}

                  {item.url && (
                    <p className="font-mono text-[11px] text-[var(--muted)] truncate">
                      {item.url}
                    </p>
                  )}
                </div>

                {/* Bottom Footer Actions */}
                <div className="pt-3 border-t border-[var(--faint)] flex items-center justify-between text-xs text-[var(--muted)] font-mono">
                  <span className="text-[10px] uppercase tracking-wider">
                    {formatDate(item.createdAt)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.url && (
                      <>
                        <button
                          onClick={(e) => handleCopy(item.url!, item.id, e)}
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                          title={isCopied ? "Copied to clipboard!" : "Copy link"}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--accent)] transition-colors"
                          title="Open original website"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] divide-y divide-[var(--faint)] overflow-hidden shadow-card">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.has(item.id);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="group p-3.5 sm:p-4 hover:bg-[var(--paper-hover)] flex items-center justify-between gap-4 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isFav
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                    }`}
                    title={isFav ? "Starred" : "Star"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${isFav ? "fill-[var(--accent)]" : ""}`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.sourceDomain && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[var(--panel)] text-[var(--muted)] border border-[var(--faint)] shrink-0">
                          {item.sourceDomain}
                        </span>
                      )}
                      <h3 className="font-serif text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)] truncate">
                        {item.title || "Untitled Capture"}
                      </h3>
                    </div>

                    {item.note && (
                      <p className="font-serif italic text-xs text-[var(--muted)] truncate">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* List Row Meta & Actions */}
                <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-[var(--muted)]">
                  <span className="hidden sm:inline text-[11px]">
                    {formatDate(item.createdAt)}
                  </span>

                  <div className="flex items-center gap-1">
                    {item.url && (
                      <>
                        <button
                          onClick={(e) => handleCopy(item.url!, item.id, e)}
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--ink)] cursor-pointer"
                          title="Copy link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--accent)]"
                          title="Open original link"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Detail Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 shadow-lift space-y-5 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--faint)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                  Edit Sanctuary Entry
                </span>
                <h2 className="font-serif text-lg font-medium text-[var(--ink)]">
                  Captured Item Details
                </h2>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
                  placeholder="Item title"
                />
              </div>

              {editingItem.url && (
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                    Original URL
                  </label>
                  <a
                    href={editingItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-mono break-all"
                  >
                    <span>{editingItem.url}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  Personal Annotation / Note
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] font-serif italic resize-none"
                  placeholder="Your personal note, excerpt, or reflections..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--faint)]">
              <button
                type="button"
                onClick={() => handleDelete(editingItem.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                Delete Entry
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--faint)] bg-[var(--paper)] text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
