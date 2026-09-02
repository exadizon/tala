# Tala Architecture

## 1. Overview

Tala is a web-first personal knowledge-capture application with a browser extension and future native desktop/mobile clients.

The initial architecture is intentionally simple:

```text
Browser
   │
   ├──────────────┐
   │              │
   ▼              ▼
Tala Web       Extension
   │              │
   └──────┬───────┘
          │
          ▼
       Tala API
          │
          ▼
   Neon PostgreSQL
```

Future:

```text
                         ┌──────────────┐
                         │ Neon Postgres│
                         └───────┬──────┘
                                 │
                           ┌─────▼─────┐
                           │  Tala API │
                           └─────┬─────┘
                 ┌───────────────┼────────────────┐
                 │               │                │
              Web App        Extension        Native Apps
                                                  │
                                          ┌───────┴───────┐
                                          │               │
                                       Windows          Mobile
```

---

# 2. Monorepo

Use a single GitHub repository.

Suggested structure:

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
└── docs/
```

Use pnpm workspaces and/or Turborepo where appropriate.

Do not create packages without a real reason to share code.

---

# 3. Web Application

The web application is the primary implementation.

Recommended stack:

```text
Next.js
TypeScript
Tailwind CSS
```

The web application is responsible for:

* authentication UI
* library
* collections
* item details
* search
* settings
* export
* account management

A suggested route structure:

```text
app/
├── (auth)/
│   ├── login/
│   └── signup/
│
├── library/
├── collections/
│   └── [id]/
├── items/
│   └── [id]/
├── favorites/
├── settings/
│
└── api/
    ├── items/
    ├── collections/
    ├── search/
    └── capture/
```

The exact structure may change as the implementation evolves.

---

# 4. API

The browser extension should communicate with Tala through the backend API.

The frontend should not directly expose privileged database credentials.

Conceptually:

```text
Web / Extension
      │
      ▼
Authentication
      │
      ▼
Tala API
      │
      ▼
PostgreSQL
```

API responsibilities include:

* authentication
* authorization
* item creation
* item updates
* item deletion
* collections
* favorites
* search
* capture
* metadata enrichment
* export

---

# 5. Database

Use PostgreSQL on Neon.

The core data model should stay relational and understandable.

Initial entities:

```text
users
items
collections
item_collections
favorites
```

Potential future entities:

```text
attachments
tags
item_tags
sync_events
sessions
```

---

# 6. Item Model

An item represents one saved thing.

Conceptually:

```text
id
user_id
type
title
url
source_url
source_domain
content
note
author
image_url
thumbnail_url
created_at
updated_at
deleted_at
```

`type` may initially contain:

```text
link
text
highlight
image
screenshot
```

Additional types can be introduced later.

The original source URL should be preserved whenever one exists.

---

# 7. Collections

Collections are lightweight organizational containers.

Example:

```text
collections
------------
id
user_id
name
description
created_at
updated_at
```

Items can belong to multiple collections:

```text
item_collections
----------------
item_id
collection_id
```

Do not turn collections into complex databases.

---

# 8. Authentication

Authentication exists primarily to provide:

> One private Tala library across devices.

Initial capabilities:

* signup
* login
* logout
* persistent session
* password reset
* account deletion

OAuth/passkeys can be added later.

All authorization must occur on the server.

Never trust a client-supplied `user_id`.

Every protected query must scope data to the authenticated user.

---

# 9. Capture Pipeline

The capture pipeline should prioritize reliability.

When a user saves a URL:

```text
URL received
    ↓
Create item
    ↓
Return success
    ↓
Attempt metadata extraction
    ↓
Update metadata
```

Metadata may include:

```text
title
description
Open Graph image
favicon
site name
author
published date
```

Metadata extraction failure must not prevent the user from saving the URL.

The original URL is the most important piece of information.

---

# 10. Browser Extension

The browser extension lives at:

```text
apps/extension/
```

It should initially target Chromium browsers.

Core functionality:

### Save page

```text
Current tab
   ↓
Tala extension
   ↓
Capture URL + metadata
   ↓
Optional note
   ↓
Optional collection
   ↓
Save
```

### Save highlight

```text
Selected text
   ↓
Page title
   ↓
Source URL
   ↓
Optional collection
   ↓
Save
```

### Save image

```text
Image
   ↓
Source URL
   ↓
Optional note
   ↓
Save
```

### Future

Screenshot capture.

---

# 11. Extension Authentication

The extension should use an explicit authentication flow.

Do not store a user's password.

A suitable flow is:

```text
Extension
   ↓
Sign in to Tala
   ↓
Web authentication
   ↓
Authorize extension
   ↓
Secure session/token storage
```

The exact implementation depends on the authentication provider chosen.

---

# 12. Search

The initial search implementation should use PostgreSQL/database-backed search.

Search useful fields:

```text
title
url
source_domain
content
note
author
collection
```

Do not introduce semantic/vector search into the initial prototype.

Future semantic search can be added as a separate capability.

---

# 13. Media Storage

Do not store large images or screenshots directly inside PostgreSQL.

Use object storage for media.

Conceptually:

```text
Postgres
   │
   └── metadata + storage key

Object Storage
   │
   └── actual image/screenshot
```

Use private/signed URLs where appropriate.

The exact storage provider can be chosen based on cost and implementation simplicity.

---

# 14. Cloud Sync

The initial web application can treat the server as the primary source of truth.

Future native clients should use local caching and synchronization.

Eventually:

```text
Windows
  │
SQLite
  │
  ├──── Push ────► API ────► Neon
  │
  ◄──── Pull ───── API ◄──── Neon
  │
SQLite
```

Mobile follows the same pattern.

The synchronization protocol should remain client-independent.

Do not create separate sync rules for Windows and mobile.

---

# 15. Future Native Clients

## Windows

Potential implementation:

```text
Tauri + React
```

Responsibilities:

* fast local library access
* keyboard-friendly browsing
* local caching
* eventual offline support
* native desktop capture

## Mobile

Potential implementation:

```text
React Native + Expo
```

Responsibilities:

* mobile library
* quick capture
* native share sheet
* offline access
* background synchronization

The native clients should use the same API and data model as the web application.

---

# 16. Web Offline Behavior

The initial web prototype does not need a sophisticated offline database.

However, the architecture should avoid making the UI fundamentally dependent on slow network requests.

Future PWA/local-first functionality may use:

```text
IndexedDB
```

or another browser-local persistence layer.

Native clients should use SQLite.

---

# 17. Duplicate URLs

The system should detect likely duplicate URLs for the same user.

However, duplication should not be prohibited.

For example:

```text
Already saved in Design.

[Open Existing]
[Save Anyway]
```

The user may intentionally save the same source multiple times with different notes or collections.

---

# 18. Data Export

Export should not depend on proprietary formats.

Support at least:

```text
JSON
Markdown
CSV
```

Exported data should include:

* titles
* URLs
* content
* notes
* collections
* timestamps

Media export can be added later.

---

# 19. Privacy

All user libraries are private by default.

Required:

* HTTPS
* authenticated APIs
* server-side authorization
* secure sessions
* secure media access
* proper secret handling

Future end-to-end encryption should be possible without redesigning the entire data model.

Do not claim end-to-end encryption until it is actually implemented.

---

# 20. Performance

Tala should feel instant.

Priorities:

* fast library load
* efficient database queries
* pagination/incremental loading
* optimized images
* minimal JavaScript where practical
* optimistic interactions where appropriate

The application should not load a user's entire library unnecessarily.

---

# 21. Design System

Tala should share a visual family with Munimuni.

Characteristics:

```text
minimal
quiet
warm
typographic
spacious
restrained
```

Use Tailwind for implementation but avoid generic dashboard styling.

The interface should primarily use:

* typography
* whitespace
* subtle dividers
* restrained color
* simple interaction states

---

# 22. Future Semantic Features

Possible later architecture:

```text
Saved item
   ↓
Text extraction
   ↓
Embedding
   ↓
Vector index
   ↓
Semantic search / related ideas
```

These features are explicitly deferred.

They should not complicate the initial architecture unnecessarily.

---

# 23. Infrastructure Philosophy

Prefer:

```text
One web application
One API
One PostgreSQL database
One object-storage service
One browser extension
```

Avoid unnecessary microservices.

The application should remain inexpensive to operate.

Neon is initially used because PostgreSQL is a good fit for the relational data model and can scale as the project grows.

---

# 24. Architecture Decision Rules

When uncertain, favor:

1. Simple over clever.
2. Reliable over novel.
3. Local data ownership over network dependence.
4. Explicit relational models over opaque structures.
5. Shared protocols over platform-specific behavior.
6. Incremental features over speculative architecture.
7. Low operational complexity.

---

# 25. Definition of Architectural Success

The architecture is successful when these future workflows are possible without rebuilding the backend:

```text
Phone
  ↓
Save something
  ↓
Cloud
  ↓
Windows
  ↓
Find it later
```

and:

```text
Windows
  ↓
Save something
  ↓
Cloud
  ↓
Phone
  ↓
Find it later
```

The user should perceive Tala as one library, regardless of which device they use.
