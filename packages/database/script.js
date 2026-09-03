import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('ALTER TABLE \"items\" ADD COLUMN IF NOT EXISTS \"tags\" text[] DEFAULT ARRAY[]::text[];')
  .then(() => pool.query('CREATE TABLE IF NOT EXISTS \"api_tokens\" (\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, \"user_id\" text NOT NULL REFERENCES \"public\".\"user\"(\"id\") ON DELETE cascade, \"name\" text NOT NULL, \"token\" text NOT NULL UNIQUE, \"created_at\" timestamp DEFAULT now() NOT NULL, \"last_used_at\" timestamp);'))
  .then(() => console.log('Done'))
  .catch(e => console.error(e))
  .finally(() => pool.end());
