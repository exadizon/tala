export type ItemType = "link" | "text" | "highlight" | "image" | "screenshot";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
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
  deletedAt: Date | null;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemCollection {
  itemId: string;
  collectionId: string;
}

export interface Favorite {
  userId: string;
  itemId: string;
  createdAt: Date;
}

export interface CreateItemInput {
  type: ItemType;
  title?: string | null;
  url?: string | null;
  content?: string | null;
  note?: string | null;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  collectionIds?: string[];
}

export interface UpdateItemInput {
  title?: string | null;
  url?: string | null;
  content?: string | null;
  note?: string | null;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  collectionIds?: string[];
}

export interface CreateCollectionInput {
  name: string;
  description?: string | null;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
}

export interface SearchResult {
  items: Item[];
  query: string;
}

export interface Settings {
  theme: "system" | "light" | "dark";
  font: "serif" | "sans" | "mono";
  accentColor: string;
}
