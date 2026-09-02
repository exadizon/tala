"use client";

import { useState, useEffect } from "react";

interface Favorite {
  id: string;
  createdAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId: string) => {
    try {
      await fetch(`/api/favorites?itemId=${itemId}`, { method: "DELETE" });
      setFavorites(favorites.filter((f) => f.item.id !== itemId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No favorites yet. Add items to your favorites from the library.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {favorite.item.type}
                    </span>
                    {favorite.item.sourceDomain && (
                      <span className="text-xs text-gray-500">
                        {favorite.item.sourceDomain}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {favorite.item.title || "Untitled"}
                  </h3>
                  {favorite.item.url && (
                    <a
                      href={favorite.item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 truncate block"
                    >
                      {favorite.item.url}
                    </a>
                  )}
                  {favorite.item.note && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {favorite.item.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.item.id)}
                  className="ml-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  title="Remove from favorites"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
