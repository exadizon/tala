import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: text().notNull(),
  title: text(),
  url: text(),
  content: text(),
  note: text(),
  sourceUrl: text("source_url"),
  sourceDomain: text("source_domain"),
  author: text(),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const collections = pgTable("collections", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemCollections = pgTable(
  "item_collections",
  {
    itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id").references(() => collections.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.collectionId] })],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    itemId: uuid("item_id").references(() => items.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const schema = {
  items,
  collections,
  itemCollections,
  favorites,
};
