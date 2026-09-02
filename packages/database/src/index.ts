import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle({ client: pool, schema });

export { schema };

export type {
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm/pg-core";

export { items, collections, itemCollections, favorites } from "./schema";
