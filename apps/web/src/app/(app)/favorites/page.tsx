"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { TalaStarIcon } from "@/components/Logo";
import {
  Star,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Trash2,
  ArrowUpRight,
  LayoutGrid,
  List as ListIcon,
  Search,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface Favorite {
  id: string;
  createdAt: string | Date;
  item: {
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
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/favorites");
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic remove
    setFavorites((prev) => prev.filter((f) => f.item.id !== itemId));

    try {
      await fetch(`/api/favorites?itemId=${itemId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      fetchFavorites();
    }
  };

  const handleCopy = (url: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const q = searchQuery.toLowerCase();
    return favorites.filter((f) => {
      const item = f.item;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.url?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
        item.sourceDomain?.toLowerCase().includes(q)
      );
    });
  }, [favorites, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--faint)] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent)] mb-1">
            <TalaStarIcon className="w-3.5 h-3.5" glow />
            <span>Cherished Vault</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight">
            Favorites
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-sans mt-0.5">
            Your most meaningful highlights, timeless essays, and key bookmarks
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--panel)] border border-[var(--faint)]">
            {favorites.length} starred {favorites.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorites..."
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

        <div className="flex items-center rounded-lg border border-[var(--faint)] bg-[var(--paper)] p-0.5 shadow-2xs">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[var(--panel)] text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            title="Grid View"
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
          >
            <ListIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Favorites Content */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" />
          <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            Loading your favorites...
          </p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--faint)] bg-[var(--paper)]/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-xs">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
              {searchQuery ? "No matching favorites" : "No favorites yet"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {searchQuery
                ? "Try a different search query or clear the filter."
                : "Click the star icon on any card in your Library to gather your most cherished readings here."}
            </p>
          </div>
          {!searchQuery && (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium hover:opacity-95 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library</span>
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredFavorites.map((fav) => {
            const item = fav.item;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={fav.id}
                className="group relative rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-5 flex flex-col justify-between hover:border-[var(--faint-strong)] hover:shadow-card transition-all overflow-hidden"
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

                  <button
                    onClick={(e) => handleRemoveFavorite(item.id, e)}
                    className="p-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80 transition-all cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="space-y-2.5 mb-4 flex-1">
                  <h3 className="font-serif text-base font-medium text-[var(--ink)] line-clamp-2 leading-snug">
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

                  <div className="flex items-center gap-1">
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
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--accent)] transition-colors"
                          title="Open original website"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] divide-y divide-[var(--faint)] overflow-hidden shadow-card">
          {filteredFavorites.map((fav) => {
            const item = fav.item;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={fav.id}
                className="group p-3.5 sm:p-4 hover:bg-[var(--paper-hover)] flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={(e) => handleRemoveFavorite(item.id, e)}
                    className="p-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80 transition-all shrink-0 cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.sourceDomain && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[var(--panel)] text-[var(--muted)] border border-[var(--faint)] shrink-0">
                          {item.sourceDomain}
                        </span>
                      )}
                      <h3 className="font-serif text-sm font-medium text-[var(--ink)] truncate">
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
                          className="p-1 rounded hover:bg-[var(--panel)] hover:text-[var(--accent)]"
                          title="Open original link"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
