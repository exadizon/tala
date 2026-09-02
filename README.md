# Tala

> A quiet library for the things you want to remember.

Tala is a minimalist personal knowledge-capture app inspired by tools like Sublime.

It is designed for saving interesting things from the internet—links, highlights, images, screenshots, notes, and eventually other media—then organizing and rediscovering them later.

The core experience is:

**See something → save it → forget about it → find it again later.**

Tala is intentionally simpler than a general-purpose workspace or knowledge-management application.

---

## Product Goals

Tala should be:

* Minimal
* Fast
* Private
* Easy to capture into
* Easy to search
* Easy to organize
* Cheap to operate
* Cross-platform

The initial experience is web-first, with a browser extension as a core part of the product.

Future clients will include Windows desktop and mobile applications.

---

## Current Stack

### Web

* Next.js
* TypeScript
* Tailwind CSS

### Database

* PostgreSQL
* Neon

### Browser Extension

* TypeScript
* Chromium extension APIs

### Future clients

* Windows: Tauri + React
* Mobile: React Native + Expo

The repository is intended to be a monorepo.

---

## Repository Structure

```text
tala/
├── apps/
│   ├── web/
│   ├── extension/
│   ├── desktop/
│   └── mobile/
│
├── packages/
│   ├── types/
│   ├── api-client/
│   ├── database/
│   └── config/
│
├── backend/
│   └── api/
│
├── docs/
│   ├── PRODUCT_BRIEF.md
│   └── ARCHITECTURE.md
│
├── AGENTS.md
├── README.md
├── package.json
└── ...
```

Not every application needs to be fully implemented initially.

The first milestone is a working web application and browser extension.

---

## Core Features

### Library

A personal collection of saved items.

Supported initial content types:

* URLs
* Text
* Highlights
* Images
* Screenshots

### Collections

Lightweight groups such as:

```text
Design
Writing
Ideas
Research
Inspiration
Books
Products
Places
```

Items may belong to multiple collections.

### Search

Search across:

* titles
* URLs
* domains
* notes
* highlights
* text
* collections

### Favorites

Users can mark especially valuable items as favorites.

### Browser Capture

The extension should allow users to:

* save the current page
* save highlighted text
* save images
* eventually capture screenshots

### Accounts

Accounts exist primarily so the same Tala library can be accessed from multiple devices.

### Cloud Sync

The web application and future clients should use the same backend and account.

### Export

Users should be able to export their data rather than being trapped in Tala.

---

## Design Philosophy

Tala should feel like:

* a personal library
* a commonplace book
* a quiet archive
* a digital notebook

It should not feel like:

* Notion
* a project manager
* a social network
* a productivity dashboard

Visual priorities:

* typography
* whitespace
* restrained color
* subtle interaction
* minimal chrome
* content first

The same design language should eventually be shared with Munimuni.

---

## Development

Install dependencies:

```bash
pnpm install
```

Run the web application:

```bash
pnpm dev
```

The exact commands may evolve as the monorepo is established.

---

## Environment Variables

Use an environment file locally.

Never commit secrets.

Provide:

```text
.env.example
```

Typical variables may include:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
```

Only variables explicitly intended for the browser should use a `NEXT_PUBLIC_` prefix.

---

## Database

Tala uses PostgreSQL hosted on Neon.

Database changes should always use migrations.

Never manually change the production schema without a corresponding migration.

---

## Development Principles

When implementing Tala:

1. Keep the UX minimal.
2. Prefer simple solutions.
3. Make capture fast.
4. Make saved content reliable.
5. Preserve original source URLs.
6. Keep user data private.
7. Keep data exportable.
8. Avoid premature AI features.
9. Avoid unnecessary infrastructure.
10. Commit progress frequently.

See `AGENTS.md` for engineering workflow and agent-specific instructions.

See `docs/PRODUCT_BRIEF.md` for the full product definition.

See `docs/ARCHITECTURE.md` for technical architecture decisions.

---

## MVP Definition

The first useful prototype should allow a user to:

1. Create an account.
2. Log in.
3. Open the Tala library.
4. Create collections.
5. Save a URL.
6. Add a note.
7. Search saved content.
8. Favorite content.
9. Save a page through the browser extension.
10. Save highlighted text through the browser extension.
11. Save an image through the browser extension.
12. See everything in the Tala web application.

The application should be fully functional rather than a static visual prototype.

---

## Philosophy

Tala exists to make the internet feel a little more memorable.

The goal is not to collect everything.

The goal is to make it easy to keep the things that mattered.
