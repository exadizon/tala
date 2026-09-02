"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TalaStarIcon } from "@/components/Logo";
import {
  ArrowLeft,
  FolderOpen,
  Search,
  Plus,
  Trash2,
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
  Bookmark,
  Star,
  Copy,
  Check,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const collectionId = unwrappedParams.id;
  const router = useRouter();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "url" | "article" | "note">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Collection Modal
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [editColName, setEditColName] = useState("");
  const [editColDesc, setEditColDesc] = useState("");
  const [isSavingCol, setIsSavingCol] = useState(false);

  // Detail / Edit modal state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchCollectionAndItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const [colRes, itemsRes, favsRes] = await Promise.all([
        fetch(`/api/collections/${collectionId}`),
        fetch(`/api/items?collectionId=${collectionId}`),
        fetch("/api/favorites"),
      ]);

      if (!colRes.ok) {
        router.push("/collections");
        return;
      }

      const colData = await colRes.json();
      const itemsData = await itemsRes.json();
      const favsData = await favsRes.json();

      setCollection(colData.collection);
      setItems(itemsData.items || []);

      if (favsData.favorites) {
        const favSet = new Set<string>(
          favsData.favorites.map((f: { item?: { id: string }; id?: string }) => f.item?.id || f.id)
        );
        setFavoriteIds(favSet);
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, router]);

  useEffect(() => {
    fetchCollectionAndItems();
  }, [fetchCollectionAndItems]);

  const handleSaveCollectionConfig = async () => {
    if (!editColName.trim()) return;
    setIsSavingCol(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editColName.trim(),
          description: editColDesc.trim() || null,
        }),
      });

      if (response.ok) {
        setIsEditingCollection(false);
        await fetchCollectionAndItems();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setIsSavingCol(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this item from your entire library?")) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollectionAndItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleRemoveFromCollection = async (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this item from the collection? (It will remain in your library)")) return;

    try {
      const response = await fetch(`/api/items/${itemId}/collections?collectionId=${collectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollectionAndItems();
      }
    } catch (error) {
      console.error("Error removing item from collection:", error);
    }
  };


  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isFav = favoriteIds.has(itemId);

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
      // Revert optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
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
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditNote(item.note || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);

    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim() || undefined,
          note: editNote.trim() || undefined,
        }),
      });

      if (response.ok) {
        setEditingItem(null);
        await fetchCollectionAndItems();
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
        year: "numeric",
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

  // Filter and Sort Logic
  const filteredAndSortedItems = items
    .filter((item) => {
      if (activeFilter !== "all" && item.type !== activeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.url?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
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

  if (isLoading && !collection) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          Loading vault...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div>
        <Link 
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Vaults
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--faint)] pb-4">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-7 h-7 text-[var(--accent)] hidden sm:block" />
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight">
                {collection?.name || "Vault"}
              </h1>
            </div>
            {collection?.description && (
              <p className="text-sm text-[var(--muted)] font-sans mt-2 leading-relaxed max-w-xl">
                {collection.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditColName(collection?.name || "");
                setEditColDesc(collection?.description || "");
                setIsEditingCollection(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--faint)] text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] hover:border-[var(--faint-strong)] transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Vault
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-14 z-10 bg-[var(--bg)]/90 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar rounded-lg border border-[var(--faint)] p-1 bg-[var(--paper)]">
          {(["all", "url", "article", "note"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
                activeFilter === filter
                  ? "bg-[var(--panel)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-1.5 opacity-50 text-[10px]">
                {filter === "all"
                  ? items.length
                  : items.filter((i) => i.type === filter).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault..."
              className="w-full rounded-lg border border-[var(--faint)] bg-[var(--paper)] pl-8.5 pr-7 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] p-0.5"
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

      {/* Content Grid/List */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--faint)] bg-[var(--paper)]/40 p-12 text-center space-y-4 max-w-2xl mx-auto mt-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
              {searchQuery ? "No matches found" : "This vault is empty"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {searchQuery
                ? "Try a different search term or change your filters."
                : "You can add items to this collection directly from the Library."}
            </p>
          </div>
          {!searchQuery && (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium hover:opacity-95 shadow-xs transition-opacity"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Go to Library</span>
            </Link>
          )}
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
                </Link>

                {/* Footer Meta & Actions */}
                <div className="pt-4 mt-auto border-t border-[var(--faint)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                  <span>{formatDate(item.createdAt)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => openEditor(item, e)}
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
                      title="Edit item details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveFromCollection(item.id, e)}
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--ink)] transition-colors hover:bg-[var(--panel)]"
                      title="Remove from vault"
                    >
                      <Plus className="w-3.5 h-3.5 rotate-45" />
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
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
                    <span className="bg-[var(--panel)] border border-[var(--faint)] px-1.5 py-0.5 rounded text-[10px]">
                      {getDomainLabel(item.url, item.sourceDomain)}
                    </span>
                    <span className="hidden sm:inline-block text-[var(--faint-strong)]">•</span>
                    <span className="hidden sm:inline-block">{formatDate(item.createdAt)}</span>
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
                  className="p-2 sm:p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors"
                  title="Edit item"
                >
                  <Edit3 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                  {(item.type === "url" || item.type === "article") && item.url && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => copyToClipboard(item.url!, item.id, e)}
                        className="p-2 sm:p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-500" /> : <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 sm:p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors"
                        title="Open original"
                      >
                        <ArrowUpRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </a>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleRemoveFromCollection(item.id, e)}
                    className="p-2 sm:p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-1"
                    title="Remove from vast"
                  >
                    <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 rotate-45" />
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
              <h3 className="font-serif font-medium text-lg text-[var(--ink)] tracking-tight">Edit Detail</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--ink)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || (editTitle === editingItem.title && editNote === (editingItem.note || ""))}
                  className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {isEditingCollection && collection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 shadow-lift space-y-5 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--faint)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                  Edit Vault
                </span>
                <h2 className="font-serif text-lg font-medium text-[var(--ink)]">
                  {collection.name}
                </h2>
              </div>
              <button
                onClick={() => setIsEditingCollection(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editColName}
                  onChange={(e) => setEditColName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                  <span>Description</span>
                  <span className="opacity-50">Optional</span>
                </label>
                <textarea
                  value={editColDesc}
                  onChange={(e) => setEditColDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCollection(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCollectionConfig}
                  disabled={!editColName.trim() || isSavingCol || (editColName === collection.name && editColDesc === (collection.description || ""))}
                  className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isSavingCol ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
