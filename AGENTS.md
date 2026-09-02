# AGENTS.md

## Tala Agent Instructions

Tala is a minimalist personal knowledge-capture application.

Before making changes, read:

```text
README.md
docs/PRODUCT_BRIEF.md
docs/ARCHITECTURE.md
AGENTS.md
```

The product brief defines **what Tala is**.

The architecture document defines **how the system is currently intended to work**.

This document defines **how agents should work on the repository**.

---

# 1. Build the Real Product

Do not create fake interfaces or static mockups when functionality is expected.

When a feature is described as working, implement the actual:

```text
UI
→ API
→ database
```

flow where applicable.

Do not report placeholder behavior as complete functionality.

---

# 2. Keep Tala Minimal

The primary product principles are:

* minimal
* fast
* quiet
* reliable
* private
* inexpensive
* easy to capture into
* easy to retrieve from

Do not introduce complexity just because another application has a feature.

Before adding a feature, ask:

> Does this meaningfully improve capturing, organizing, or rediscovering something?

If not, defer it.

---

# 3. Work in Small Vertical Slices

Prefer completing a feature from end to end:

```text
Database
→ API
→ UI
→ tests
→ commit
```

rather than building large incomplete layers separately.

Example:

```text
Create collection
→ database migration
→ API endpoint
→ UI
→ validation
→ test
→ commit
```

---

# 4. Commit Frequently

Git commits are an important part of preserving progress.

Create a commit after every meaningful, coherent milestone.

Do not wait until an entire large feature is complete.

Good examples:

```text
feat: initialize tala web app
feat: add database schema
feat: implement authentication
feat: add library page
feat: implement collections
feat: add URL capture
feat: add extension popup
feat: add highlight capture
feat: implement search
fix: handle failed metadata extraction
fix: prevent unauthorized item access
refactor: extract shared API client
test: add collection API tests
style: refine library spacing
docs: document environment setup
```

Prefer several small commits over one enormous commit.

---

# 5. Commit Requirements

Before committing:

```text
1. Run relevant tests.
2. Run type checking.
3. Run linting.
4. Run the build when appropriate.
5. Review the Git diff.
6. Check for accidentally included files.
7. Check for secrets.
```

Do not commit:

```text
.env
.env.local
database passwords
API keys
private tokens
credentials
temporary debug files
```

Use `.env.example`.

---

# 6. Preserve Working Progress

The repository should always contain recoverable progress.

Before starting a large task, make sure the current work is committed.

During large tasks, create stable checkpoints.

If a task becomes unexpectedly large, split it into smaller milestones and commit each one.

Do not leave a large amount of valuable work only in an uncommitted working tree.

---

# 7. Do Not Rewrite Git History

Do not use destructive Git commands unless explicitly instructed.

Avoid:

```bash
git reset --hard
git push --force
git clean -fd
```

Do not rewrite or squash existing history merely for aesthetic reasons.

The commit history should make it easy to understand progress and recover earlier working states.

---

# 8. Keep the Main Development State Healthy

Do not intentionally leave the repository broken after completing a milestone.

A completed commit should generally:

* type-check
* lint
* build
* pass relevant tests

When this is impossible, keep the broken area small and clearly document the reason.

---

# 9. Do Not Over-Engineer

Prefer the simplest working implementation.

Do not introduce:

* microservices
* complex distributed systems
* CRDTs
* unnecessary abstraction layers
* complex state-management frameworks
* vector databases
* AI services

until a real requirement exists.

For Tala MVP:

```text
Next.js
TypeScript
Tailwind
PostgreSQL
Neon
API
Browser extension
```

is enough.

---

# 10. Keep Architecture Boundaries Clear

Maintain a clear separation between:

```text
UI
↓
application logic
↓
API
↓
database
```

Do not scatter database queries throughout UI components.

Do not allow the browser extension to directly access privileged database credentials.

Do not place server-only secrets in client-side code.

---

# 11. Database Safety

All schema changes must use migrations.

Do not manually mutate production schemas.

Use stable IDs.

Persistent records should generally contain:

```text
created_at
updated_at
```

Use `deleted_at` when soft deletion is needed.

Database queries involving user-owned content must always be scoped to the authenticated user.

---

# 12. Authorization

Authentication is not authorization.

For every protected operation:

```text
Who is the authenticated user?
↓
Does this resource belong to them?
↓
Only then perform the operation.
```

Never trust:

```text
user_id
```

provided by the client.

The server must derive ownership from authenticated context.

Users must never be able to access another user's:

* items
* collections
* notes
* favorites
* attachments
* exports

---

# 13. Capture Reliability

Capture is one of the most important Tala workflows.

Saving an item should be robust even when external websites are imperfect.

Do not fail a URL save simply because:

* title extraction failed
* OG metadata is missing
* an image is unavailable
* a site blocks metadata requests

Preserve the original URL whenever possible.

Metadata enrichment should be secondary to successful capture.

---

# 14. Browser Extension

Treat the extension as a first-class application.

Initial priorities:

```text
1. Save page
2. Save highlight
3. Save image
```

Keep capture interaction fast.

Avoid forcing users through a long form.

The extension should communicate with the Tala API through authenticated requests.

Do not duplicate backend business rules unnecessarily in the extension.

---

# 15. Search

Start with normal database search.

Prioritize:

* title
* URL
* domain
* note
* text
* highlight
* collection

Do not build AI search simply because it sounds impressive.

Basic search must be fast and reliable first.

---

# 16. UI Guidelines

Tala should remain visually minimal.

Prefer:

* whitespace
* typography
* subtle borders
* simple states
* restrained colors
* small number of controls

Avoid:

* dashboard-heavy layouts
* excessive cards
* gradients
* excessive shadows
* excessive animation
* unnecessary badges
* overuse of icons

The saved content is the interface's most important content.

---

# 17. Accessibility

Use:

* semantic HTML
* accessible labels
* keyboard navigation
* visible focus states
* sufficient contrast
* appropriate heading hierarchy

Do not sacrifice accessibility for visual minimalism.

---

# 18. Responsive Design

The web application should work well on:

* desktop
* laptop
* tablet
* mobile browser

Do not simply shrink the desktop interface.

Adapt navigation and interaction intentionally for smaller screens.

---

# 19. Performance

Prioritize perceived speed.

Use:

* efficient queries
* pagination
* lazy loading
* image optimization
* optimistic interactions where appropriate

Do not prematurely optimize without evidence.

---

# 20. Error Handling

Errors should be recoverable and understandable.

Prefer:

> Couldn't save this item. Your original URL is still available. Try again.

over:

> Error 500.

Do not silently swallow errors.

Log useful technical information server-side without exposing sensitive information to the user.

---

# 21. Dependencies

Before adding a dependency, consider:

1. Do we really need it?
2. Is the functionality already available?
3. Is the package mature and maintained?
4. Will it increase maintenance significantly?
5. Does it fit the existing stack?

Prefer fewer dependencies when reasonable.

---

# 22. Documentation

Update documentation when changing:

* environment variables
* setup instructions
* architecture
* database schema
* extension development
* deployment
* important workflows

Keep:

```text
README.md
docs/PRODUCT_BRIEF.md
docs/ARCHITECTURE.md
```

consistent with the implementation.

---

# 23. Testing

Focus tests on meaningful behavior.

Important areas:

### Authentication

* signup
* login
* logout
* authorization

### Items

* create
* edit
* delete
* favorite

### Collections

* create
* rename
* delete
* assign items

### Search

* relevant results
* filtering

### Capture

* URL capture
* highlight capture
* image capture
* metadata failure

### Security

* cross-user access attempts must fail

### Sync

When native clients are implemented:

* offline changes
* retries
* duplicate operations
* stale updates
* deletion propagation
* multiple devices

Do not chase arbitrary coverage percentages.

---

# 24. Agent Autonomy

Make reasonable decisions without asking for approval on minor implementation choices.

The agent should pause for clarification only when the decision materially changes:

* data ownership
* security
* product scope
* architecture
* core UX

Otherwise, choose a sensible solution and document important decisions.

---

# 25. External Product Research

Tala is inspired by existing products such as Sublime.

When researching or recreating product behavior:

* understand the user workflow
* identify the underlying requirement
* implement an original solution

Do not copy:

* proprietary source code
* private implementation details
* proprietary assets
* exact branding
* copyrighted interface assets

The goal is to build Tala, not reproduce another company's implementation.

---

# 26. Do Not Add Premature Features

Explicitly defer unless required:

* AI assistants
* semantic search
* automatic knowledge graphs
* collaboration
* public profiles
* social feeds
* recommendation engines
* Canvas-style workspaces
* complex tagging
* subscriptions
* advertisements

These may become useful later.

They are not reasons to complicate the first version.

---

# 27. Definition of Done

Before reporting a task complete:

```text
[ ] Feature is actually implemented
[ ] Relevant tests pass
[ ] Type-check passes
[ ] Lint passes
[ ] Build passes when appropriate
[ ] No secrets committed
[ ] Git diff reviewed
[ ] Progress committed
[ ] Documentation updated if needed
```

Do not claim completion for mockups or partially implemented flows.

---

# 28. Final Principle

The user should experience Tala as something incredibly simple.

They should think:

> “I found something interesting, so I saved it.”

They should not have to think about:

* databases
* APIs
* synchronization
* metadata extraction
* authentication
* object storage
* infrastructure

Put complexity in the system.

Keep the experience quiet.
