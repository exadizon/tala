import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const sql = neon(process.env.DATABASE_URL);
async function run() {
  await sql('ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT ARRAY[]::text[];');
  await sql('CREATE TABLE IF NOT EXISTS "api_tokens" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" text NOT NULL REFERENCES "public"."user"("id") ON DELETE cascade, "name" text NOT NULL, "token" text NOT NULL UNIQUE, "created_at" timestamp DEFAULT now() NOT NULL, "last_used_at" timestamp);');
  console.log('done via neon-http');
}
run();
