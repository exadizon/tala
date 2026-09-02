const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_nsGJi8kjMe3Y@ep-dry-band-aznkjtjd-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

async function test() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM "user" LIMIT 1');
    console.log('Query result:', result.rows);
  } finally {
    client.release();
  }
  await pool.end();
}

test().catch(console.error);
