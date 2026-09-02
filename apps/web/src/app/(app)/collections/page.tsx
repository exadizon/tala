"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TalaStarIcon } from "@/components/Logo";
import {
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  X,
  Search,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const ACCENT_COLORS = [
  { name: "Amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", soft: "bg-amber-500/10" },
  { name: "Sage", bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600/20", soft: "bg-emerald-600/10" },
  { name: "Indigo", bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/20", soft: "bg-indigo-500/10" },
  { name: "Rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/20", soft: "bg-rose-500/10" },
  { name: "Violet", bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/20", soft: "bg-purple-500/10" },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        setNewName("");
        setNewDescription("");
        setIsCreating(false);
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCollection || !editName.trim()) return;
    setIsSavingEdit(true);

    try {
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (response.ok) {
        setEditingCollection(null);
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this collection? Items inside will not be deleted.")) return;

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const openEdit = (col: Collection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCollection(col);
    setEditName(col.name);
    setEditDescription(col.description || "");
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

  const filteredCollections = collections.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--faint)] pb-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight">
            Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-sans mt-0.5">
            Curated vaults for your gathered thoughts, projects, and themes
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Search and stats bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter collections..."
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

        <span className="text-xs font-mono text-[var(--muted)]">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </span>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" />
          <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            Loading collections...
          </p>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--faint)] bg-[var(--paper)]/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-xs">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
              {searchQuery ? "No matching collections" : "No collections yet"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {searchQuery
                ? "Try a different search query or clear the filter."
                : "Organize your captured articles, essays, and references by creating themed collections."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium hover:opacity-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCollections.map((col, index) => {
            const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="group relative rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-5 flex flex-col justify-between hover:border-[var(--faint-strong)] hover:shadow-card transition-all cursor-pointer overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${color.soft} ${color.text} flex items-center justify-center border ${color.border}`}>
                        <Folder className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-base font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                        {col.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(col, e)}
                        className="p-1 rounded hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                        title="Edit collection"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(col.id, e)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[var(--muted)] hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {col.description ? (
                    <p className="font-sans text-xs text-[var(--muted)] line-clamp-3 leading-relaxed mb-4">
                      {col.description}
                    </p>
                  ) : (
                    <p className="font-serif italic text-xs text-[var(--muted)]/60 mb-4">
                      No description added
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--faint)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                  <span>{formatDate(col.createdAt)}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
                    Vault
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 shadow-lift space-y-5 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--faint)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                  New Vault
                </span>
                <h2 className="font-serif text-lg font-medium text-[var(--ink)]">
                  Create Collection
                </h2>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
                  placeholder="e.g. Architecture & Design, Essays, Tech..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                  <span>Description</span>
                  <span className="opacity-50">Optional</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] resize-none"
                  placeholder="What belongs in this collection?"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || isSubmitting}
                  className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 shadow-lift space-y-5 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--faint)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                  Edit Vault
                </span>
                <h2 className="font-serif text-lg font-medium text-[var(--ink)]">
                  {editingCollection.name}
                </h2>
              </div>
              <button
                onClick={() => setEditingCollection(null)}
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                  <span>Description</span>
                  <span className="opacity-50">Optional</span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || isSavingEdit || (editName === editingCollection.name && editDescription === (editingCollection.description || ""))}
                  className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}