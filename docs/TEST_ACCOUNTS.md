# Test Accounts

## Primary Test Account

| Field | Value |
|-------|-------|
| **Name** | Test User |
| **Email** | test@tala.app |
| **Password** | test1234 |
| **User ID** | jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq |

### Sample Data Included

- **5 items**: URLs and notes about Next.js, Drizzle ORM, Tailwind CSS, plus a highlight and a note
- **2 collections**: "Web Development" and "Favorites"
- **2 favorites**: Next.js and Drizzle ORM items

---

## Secondary Test Account

| Field | Value |
|-------|-------|
| **Name** | Demo User |
| **Email** | demo@tala.app |
| **Password** | demo1234 |
| **User ID** | g7mIrCkm08xxSsQS4xrvpGLyR0iGggHC |

### Sample Data Included

- Empty account for testing fresh state

---

## How to Use

1. Start the dev server:
   ```bash
   cd apps/web
   pnpm dev
   ```

2. Open http://localhost:3000

3. Sign in with either account above

4. You should see the library with pre-populated items for the primary test account

---

## Database Info

- **Provider**: Neon PostgreSQL (serverless)
- **Connection**: via `@neondatabase/serverless` (HTTP driver)
- **Schema**: BetterAuth (user, session, account, verification) + Tala (items, collections, item_collections, favorites)
