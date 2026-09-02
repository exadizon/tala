# Tala — Product & Engineering Brief

## 1. Product

**Tala** is a minimalist personal knowledge-capture and inspiration library.

The product should feel like a quiet place where you put things you discover on the internet so they don't disappear into browser history, bookmarks, screenshots, random notes, or social-media saves.

The core loop is:

> **See something → save it → organize it lightly → find it again later.**

Tala is inspired by the interaction model of Sublime: a personal library of ideas and references containing links, text, highlights, images, screenshots, videos, PDFs and other pieces of inspiration.

Sublime currently positions itself around capturing interesting things from the web, organizing them into collections, searching them, and discovering related ideas; its extension supports one-click saving, text highlighting, image capture, and screenshots. Tala should capture the spirit and utility of that workflow without directly copying its visual identity, branding, proprietary implementation, or exact UI.

The goal is a **minimal, independent, subscription-free alternative for personal use**.

---

## 2. Product Philosophy

### Calm over complexity

Tala should feel like a personal library, not a productivity dashboard.

Avoid:
- excessive controls
- complicated databases
- rich workspace builders
- unnecessary metadata
- social feeds
- gamification
- notification overload
- forced organization

The user should be able to save something in seconds and move on.

### Capture first, organize later

The capture flow should require as little thought as possible.

A user should be able to save:

```text
URL
↓
Optional note
↓
Optional collection
↓
Save
```

The app should not force the user to assign many properties before saving.

### Your library, not a social network

The initial product is personal.

Do not build likes, followers, comments, engagement metrics, or public profiles into the MVP.

### No subscription dependency

The core personal library should not require a recurring subscription.

Infrastructure should be intentionally inexpensive and designed around the possibility of a free/very-low-cost personal deployment.

Do not artificially limit basic personal usage to create a paywall.

---

## 3. Primary Experience

Tala should revolve around three concepts:

```text
CAPTURE
LIBRARY
COLLECTIONS
```

Everything else is secondary.

---

## 4. Main Library

The default web application should resemble a quiet personal archive.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────┐
│ tala                                  search            + │
│                                                             │
│ All        Collections        Favorites                    │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ A beautiful article title                             │   │
│ │                                                       │   │
│ │ Interesting excerpt or preview text from the page...  │   │
│ │                                                       │   │
│ │ example.com                              • Design     │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ An image / visual reference                           │   │
│ │                                                       │   │
│ │                                           • Inspiration│   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

The interface should be sparse and content-focused.

Cards/items can be vertically stacked or presented in another restrained layout if that produces a better reading experience.

Do not blindly reproduce Sublime's current UI.

---

## 5. Capture Types

The MVP should support the following content types.

### Link

Save:

```text
URL
title
domain
thumbnail/preview
description when available
```

### Highlight / Quote

Save:

```text
selected text
source URL
page title
author/source if available
```

The source context should remain attached to the highlight.

### Image

Allow users to save an image from the browser extension.

Store:

```text
image
source URL
page URL
optional note
```

### Screenshot

Allow the browser extension to capture a selected viewport/area.

### Text

Allow users to manually create a text card.

Example:

```text
The best design is the one people forget is there.
```

### Optional future types

Architect the data model so it can eventually accommodate:
- PDF
- video
- audio
- book
- social post
- article

Do not build all of them before the core capture experience works.

---

## 6. Browser Extension

The browser extension is a **core part of Tala**, not an afterthought.

Initial target:

**Chrome / Chromium-based browsers**

Architecture should allow Firefox and Safari support later.

The extension should provide:

### Save current page

Click extension icon:

```text
[Tala]
Save this page

Title
URL

Collection: [None ▼]

Note:
____________________

        Save
```

### Save highlighted text

Select text on any webpage.

Context menu:

```text
Save to Tala
```

or an unobtrusive floating control.

The extension should capture:

```text
selected text
page title
page URL
source domain
timestamp
```

### Save image

Right-click an image:

```text
Save image to Tala
```

### Screenshot

Provide an optional screenshot capture action.

---

## 7. Capture UX

Capture must feel extremely fast.

Do not open a large application window unnecessarily.

Preferred flow:

```text
Browser
  ↓
Extension
  ↓
Tiny capture popup
  ↓
Save
  ↓
Done
```

The extension should authenticate against the user's Tala account and send the capture to the Tala backend.

If technically feasible, support optimistic/local capture so a temporary network failure does not destroy the user's save.

---

## 8. Collections

Collections are the primary method of intentional organization.

Examples:

```text
Design
Writing
Ideas
Places
Books
Products
Inspiration
Research
Things to make
```

A card can belong to one or more collections.

Collections should be easy to create from the capture flow.

Example:

```text
Save to:
[ Design ] [ + New collection ]
```

A collection page should show:

```text
Design

42 items

[card]
[card]
[card]
...
```

Collections should not behave like complicated Notion databases.

They are simply **containers for things worth keeping together**.

---

## 9. Favorites / Pinning

Users should be able to mark cards as favorites/pinned.

This creates a lightweight “important things” view.

Do not build complicated priority systems.

---

## 10. Search

Search is an important part of the product.

The first implementation should support:
- title search
- content/text search
- domain search
- collection search
- notes
- highlighted text

Examples:

```text
type: design
```

```text
figma
```

```text
web typography
```

The search experience should be fast and simple.

### Future direction

The architecture should leave room for semantic/vector search later.

Eventually users should be able to search by meaning rather than exact keywords.

However, **do not require an LLM or vector database for the MVP**.

Build reliable full-text search first.

---

## 11. Related Ideas

Tala should eventually support a quiet “related ideas” experience.

For MVP, use simple signals:

```text
same collection
shared tags
similar domains
matching keywords
full-text similarity
```

Later, optionally add semantic embeddings.

This feature should never become noisy recommendation spam.

It should feel like **quiet serendipity**.

---

## 12. Notes

Each saved item may have an optional personal note.

Example:

```text
Source:
https://example.com/design

Quote:
"A useful passage..."

My note:
This is exactly the feeling I want for Tala.
```

The user's note must remain clearly distinct from the original captured content.

---

## 13. Item Detail

Clicking a card should open a clean detail view.

Conceptually:

```text
← Back

The Art of Simplicity

example.com

"A useful passage..."

This reminded me of...

────────────────────

Collections
Design · UX

Saved September 2, 2026
```

For links, provide a clear:

> Open source

action.

Never hide the original source.

---

## 14. Data Model

Use a simple relational model.

Conceptually:

```text
users
─────
id
email
created_at

items
─────
id
user_id
type
title
url
content
source_url
source_domain
author
image_url
thumbnail_url
created_at
updated_at
deleted_at

collections
───────────
id
user_id
name
description
created_at
updated_at

item_collections
────────────────
item_id
collection_id

favorites
─────────
user_id
item_id
created_at
```

Additional tables may be introduced for:

```text
tags
item_tags
attachments
screenshots
highlights
sync events
sessions
```

but do not create complexity without a concrete requirement.

---

## 15. Cloud Database

Use:

**Neon PostgreSQL**

The database should store the canonical cloud representation of the user's library.

The application should not depend on Neon-specific frontend behavior.

Use a proper backend/API layer.

Conceptually:

```text
Browser / Web
      │
      ▼
Tala API
      │
      ▼
Neon PostgreSQL
```

Potential future architecture:

```text
                         ┌─────────────┐
                         │   Neon DB   │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   Tala API  │
                         └──────┬──────┘
                ┌───────────────┼────────────────┐
                │               │                │
             Web App        Extension         Mobile
```

---

## 16. Authentication

Accounts are required because captures need to synchronize across devices.

Initially support:
- email/password
- persistent sessions
- logout
- password reset

Design the authentication abstraction so OAuth/passkeys can be added later.

The account should primarily exist to provide:

> **One Tala library everywhere.**

---

## 17. Synchronization

Although the initial prototype is primarily web based, synchronization must be considered from the beginning.

The same account should allow a user to access their library from:
- web
- browser extension
- future desktop app
- future mobile app

The web and extension can initially use the server as the source of truth.

Future native clients should introduce local caching/offline support.

Do not make each client implement its own data model.

Define shared types and API contracts.

---

## 18. Web Application

The web application is the primary product for the first prototype.

Use:

### Next.js
### TypeScript
### Tailwind CSS

The application should provide:

```text
/login

/library

/collection/[id]

/item/[id]

/settings
```

Potentially:

```text
/search
/favorites
```

The interface should remain extremely lightweight.

---

## 19. Next.js Architecture

Use modern Next.js patterns appropriately.

Suggested structure:

```text
app/
├── (auth)/
│   ├── login/
│   └── signup/
│
├── library/
├── collection/
│   └── [id]/
├── item/
│   └── [id]/
├── settings/
│
├── api/
│   ├── auth/
│   ├── items/
│   ├── collections/
│   └── extension/
│
components/
lib/
db/
types/
```

The exact architecture can evolve.

Prioritize clear separation between:

```text
UI
API
database
authentication
extension integration
```

---

## 20. Tailwind / Visual System

Use Tailwind CSS, but do not make the UI look like a generic Tailwind dashboard.

The design should feel closely related to Munimuni:

**quiet, minimal, warm, typographic, intentional.**

Visual priorities:
- whitespace
- typography
- subtle dividers
- soft hover states
- restrained radius
- restrained shadows
- very little chrome
- content first

Avoid:
- gradients everywhere
- giant marketing cards
- colorful dashboards
- excessive badges
- excessive iconography

---

## 21. Theme

Support:

```text
System
Light
Dark
```

The aesthetic should work beautifully in both modes.

Allow a subtle customizable accent color.

The color system should primarily affect:
- selected navigation
- buttons
- highlights
- links
- focus states

Do not turn every card into a different color.

---

## 22. Typography

Typography is a central part of the product.

Support at least:

### Serif
Literary / editorial.

### Sans
Clean / modern.

### Mono
Technical / archival.

The setting should apply primarily to content and reading views.

The UI itself should maintain a consistent interface typeface.

This should align visually with Munimuni so the two applications feel like part of the same product family.

---

## 23. Minimal Navigation

Desktop/web navigation should be approximately:

```text
tala

Library
Collections
Favorites

──────────

Your collections
Design
Writing
Inspiration
Research

──────────

Settings
```

No giant navigation tree.

The library should remain the center of gravity.

---

## 24. Card Design

Cards should present enough context to make browsing pleasant.

For a link:

```text
┌─────────────────────────────────┐
│ The article title               │
│                                 │
│ A useful excerpt from the page  │
│ that gives enough context...    │
│                                 │
│ example.com                     │
│ Design                          │
└─────────────────────────────────┘
```

For a highlight:

```text
┌─────────────────────────────────┐
│ "A beautiful passage..."         │
│                                 │
│ — Author Name                   │
│                                 │
│ book.com                        │
└─────────────────────────────────┘
```

For an image:

Show the image prominently while preserving source information.

Cards should not become giant dashboard widgets.

---

## 25. Browser Extension Architecture

Create the extension inside the same monorepo.

Suggested:

```text
apps/
├── web/
├── extension/
├── desktop/
└── mobile/
```

The initial extension can target Chromium.

Use TypeScript.

The extension should contain:

```text
background/service worker
content scripts
popup UI
context menu handlers
capture utilities
authentication bridge
```

The extension should communicate with the Tala API.

---

## 26. Authentication for Extension

The extension must provide a practical login flow.

Example:

```text
Extension
↓
"Sign in to Tala"
↓
Open Tala web authentication
↓
Authorize extension
↓
Return to extension
```

Do not store raw passwords in the extension.

Use secure browser storage for session credentials according to the chosen authentication architecture.

---

## 27. Screenshot Capture

Implement only after link/highlight/image capture is stable.

Possible flow:

```text
Extension
↓
Capture screenshot
↓
Crop/select area
↓
Preview
↓
Add note/collection
↓
Save to Tala
```

Images should be uploaded to object storage rather than stored directly inside PostgreSQL.

The implementation agent should choose an inexpensive S3-compatible/object-storage provider.

Do not store large binary files inside Neon.

---

## 28. Attachments & Media

Separate metadata from media.

Example:

```text
Postgres
    ↓
metadata

Object storage
    ↓
images
screenshots
future PDFs
```

The system should support signed/private object URLs where appropriate.

---

## 29. Desktop & Mobile Future Architecture

Desktop and mobile applications should already have placeholders in the monorepo.

Suggested:

```text
apps/
├── web/
├── extension/
├── desktop/
└── mobile/
```

### Desktop

Potential future stack:

**Tauri + React**

Primary use:
- fast library browsing
- keyboard workflows
- local caching
- desktop capture

### Mobile

Potential future stack:

**React Native + Expo**

Primary use:
- quick browsing
- sharing content into Tala
- saving links/images
- accessing collections

The mobile app should eventually support the native share sheet:

```text
iOS / Android
      ↓
Share
      ↓
Tala
      ↓
Choose collection
      ↓
Save
```

Do not build these apps as fake wrappers around the web app.

---

## 30. Monorepo

Use a single GitHub repository.

Suggested structure:

```text
tala/
│
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
├── tooling/
│
├── package.json
├── README.md
└── ...
```

Use a sensible monorepo system such as Turborepo or pnpm workspaces.

Do not create unnecessary packages simply for architectural purity.

---

## 31. MVP Prototype

The first prototype should be **fully functional**, not a static mockup.

The prototype must support:

### Web
- create account
- log in
- library
- save URL manually
- create text card
- add note
- create collections
- assign item to collection
- favorite item
- search
- dark/light theme
- font selection
- accent color
- edit/delete saved content

### Extension
- authenticate
- save current URL
- save selected text
- save image
- optionally assign collection
- add note
- send to Tala

### Backend
- authentication
- PostgreSQL/Neon
- item CRUD
- collection CRUD
- favorites
- search
- extension capture endpoint

That is enough to prove the product.

---

## 32. MVP Capture Flow

The following should work end-to-end:

### Flow A — Web

```text
Open Tala
↓
Create collection "Design"
↓
Paste URL
↓
Tala fetches metadata
↓
Save
↓
Card appears in library
```

### Flow B — Browser

```text
Open interesting webpage
↓
Highlight quote
↓
Right click → Save to Tala
↓
Choose "Design"
↓
Save
↓
Quote appears in Tala
```

### Flow C — Image

```text
Find interesting image
↓
Right click image
↓
Save to Tala
↓
Image appears in library
```

The third-party website should never need to know Tala exists.

---

## 33. Metadata Extraction

When saving a URL, attempt to extract:

```text
title
description
og:image
favicon
site name
author
published date
```

Use standard page metadata such as Open Graph and Twitter card metadata.

If extraction fails, the user should still be able to save the URL.

Never block the save operation merely because metadata is incomplete.

---

## 34. Duplicate Handling

If the same URL has already been saved by the same user:

Do not blindly create endless duplicates.

Instead, detect likely duplicates and provide a lightweight option:

```text
Already saved

Design Inspiration
Saved Aug 21

[Open] [Save anyway]
```

The user should still be allowed to save the same source more than once when appropriate.

Highlights from the same page are not necessarily duplicates.

---

## 35. Data Ownership

Users must be able to export their library.

Initial export support:

```text
JSON
CSV
Markdown
```

At minimum, export should contain:
- title
- URL
- content
- notes
- collections
- timestamps

Media export can come later.

The product should never make the user's library impossible to leave.

---

## 36. Privacy

The application should treat saved material and personal notes as private user data.

Required:
- HTTPS
- authenticated APIs
- authorization checks
- secure session handling
- users can access only their own private library
- safe object storage access
- no secret keys in frontend code

Public sharing can be introduced later as an explicit feature.

Do not make saved libraries public by default.

---

## 37. Pricing / Business Model

There is intentionally **no subscription requirement for the personal MVP**.

The project should prioritize:
- low infrastructure cost
- self-hostability where practical
- inexpensive storage
- reasonable free-tier infrastructure

Neon should be used as the initial PostgreSQL provider.

Do not introduce artificial feature caps into the prototype.

The architecture may eventually support optional paid infrastructure, but this is not an MVP concern.

---

## 38. Important Product Boundary

Tala is **not**:

- Notion
- Evernote
- Pocket
- Pinterest
- a bookmark manager
- a social network
- a project manager

It overlaps with all of them slightly, but the product should occupy a narrower space:

> **A beautiful personal library for the things you want to remember.**

The user should be able to save something in seconds and later rediscover why they cared about it.

---

## 39. Future Features — Do Not Build Yet

Leave architectural room for:
- semantic search
- AI-assisted search
- related ideas
- Canvas / visual boards
- automatic tagging
- browser history-assisted suggestions
- PDF import
- Readwise import
- Kindle import
- social bookmark imports
- public collections
- sharing
- native desktop capture
- native mobile share sheet
- end-to-end encryption

These should be considered inspiration for the long-term roadmap, not MVP requirements.

---

## 40. Definition of Done

The prototype is successful when a user can:

```text
1. Create a Tala account.

2. Open the Tala website.

3. Create a collection called "Design."

4. Browse the web normally.

5. Highlight something interesting.

6. Right-click → Save to Tala.

7. Add a short note.

8. Choose "Design."

9. Save.

10. Open Tala.

11. See the captured idea in the library.

12. Search for it later.

13. Open the source page.

14. Move the item to another collection.

15. Open Tala from another browser/device and see the same library.
```

The entire experience should feel fast and quiet.

---

## 41. Engineering Priorities

When making implementation decisions, prioritize:

1. **Capture reliability**
2. **Simplicity**
3. **Fast library browsing**
4. **Good typography**
5. **Data ownership**
6. **Low infrastructure cost**
7. **Cross-platform readiness**
8. **Extensibility**

Do not over-engineer the MVP.

In particular, do not build a full semantic/AI recommendation system before basic capture and retrieval are excellent.

---

## 42. Agent Instruction

Build Tala as a **real working prototype**, not a visual approximation.

Start with the web application and browser extension.

The desktop and mobile applications should have their intended folders/configuration in the monorepo, but they do not need full production implementations during the first milestone.

The first milestone should produce:

```text
Next.js web app
+
Neon PostgreSQL backend
+
Authentication
+
Working library
+
Working collections
+
Working search
+
Working capture
+
Working browser extension
```

Use:

```text
Next.js
TypeScript
Tailwind CSS
Neon PostgreSQL
```

and choose appropriate supporting libraries for:
- database access
- authentication
- browser extension development
- validation
- metadata extraction
- object storage

Do not copy another product's source code, proprietary assets, branding, or exact interface.

Instead, understand the **product mechanics** and implement an original Tala experience with the same general class of functionality.

The guiding question for every feature is:

> **Does this help the user save something interesting and find it again later with less friction?**

If not, leave it out.

---

## Tala's north-star experience

```text
                see something interesting
                           ↓
                      save to Tala
                           ↓
                    forget about it
                           ↓
                  come back weeks later
                           ↓
                    "oh, I saved this"
                           ↓
                   find / read / connect
```

That is the product.

**Tala should feel like a quiet second brain for the things you find on the internet—not another workspace you have to manage.**
