# Frontend feature notes — Reports UI & Route Points

This document explains everything added for two features:

1. **Reports** — users can report content (UC-10); admins moderate reports (UC-11).
2. **Route points** — viewing, adding, and removing the points that make up a route,
   including creating a brand-new point and attaching it to a route.

Everything here is **frontend** (Angular). The backend endpoints already existed.

---

## 1. Reports

### Backend endpoints used (already existed)
| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/reports` | any signed-in user | File a report `{ reason, note?, targetType, targetId }` |
| `GET` | `/api/reports?status=&targetType=&sort=` | admin | List reports **grouped by target** |
| `GET` | `/api/reports/:type/:id` | admin | The individual reports filed against one target |
| `PATCH` | `/api/reports/:type/:id` | admin | Set all of a target's reports to `resolved` or `dismissed` |

- `targetType` is `destination | review | user`.
- `status` is `pending | resolved | dismissed`.
- `reason` is an **enum**: `spam | inappropriate | inaccurate | duplicate | other`
  (backed by the Prisma `ReportReason` enum + Zod validation — so the client must send one of
  these exact values, not free text).

### Files

**`src/app/models/report.model.ts`** — matches the real API:
- `ReportTargetType`, `ReportStatus`, `ReportSort`, and `ReportReason` types.
- `ReportedTarget` = `{ type, id, count, latest }` — one row per reported target (admin list).
- `TargetReport` = `{ id, reason, note, createdAt, user }` — one individual report (admin drill-down).
- `CreateReportPayload` and `ReportedTargetsQuery`. `reason` on both `TargetReport` and
  `CreateReportPayload` is typed as `ReportReason`.

> Merge note: an upstream change made `reason` an enum. The resolved model keeps the **grouped**
> `ReportedTarget` (what `GET /reports` actually returns) and applies the `ReportReason` enum to the
> individual report + the create payload.

**`src/app/core/services/report.service.ts`** (new) — thin HTTP wrapper:
- `create(payload)` — file a report.
- `getReportedTargets(query)` — admin grouped list.
- `getReportsForTarget(type, id)` — admin drill-down.
- `setStatus(type, id, status)` — resolve/dismiss.

**`src/app/core/services/admin.service.ts`** — removed the old `getReports/approveReport/declineReport`
methods (they belonged to the old flat model and are now in `ReportService`).

**`src/app/shared/components/report-dialog/`** (new, reusable modal):
- `report-dialog.component.ts` — a modal dialog. Inputs `targetType`, `targetId`, `targetLabel`;
  emits `close`. The reason is the `ReportReason` enum, shown as labelled chips (value → label, e.g.
  `spam` → "Spam or advertising"), plus an optional free-text note, then a success state.
- `report-dialog.component.scss` — its styles (kept in a separate file like the other components).
- It calls `ReportService.create()` itself, so any screen can drop it in.

### Where reporting appears (user-facing)

In the **map detail panel** (`features/map/`):
- A **"⚑ Report this destination"** link under the description — shown only to a signed-in
  user who is **not** the owner/admin.
- A small **"⚑"** button on each review — shown to signed-in users who aren't the review's
  author (admins delete instead of report).
- Clicking either opens `<app-report-dialog>`. State is held in the `reportTarget` signal in
  `map.component.ts` (`openReport()` / `closeReport()`).

### Admin moderation (admin dashboard → Reports tab)

`features/admin/admin.component.*` Reports tab uses the grouped model:
- **Filter chips**: Pending / Resolved / Dismissed (status).
- **Dropdowns**: target type (all/destinations/reviews/users) and sort (most reported / newest / oldest).
- **Table**: each row is a reported target — type badge, `#id`, report count, latest date.
- **Expand a row** to load and show the individual reports (reason, note, reporter, date).
- **Resolve / Dismiss** buttons call `PATCH` and remove the target from the current list.

Relevant component state: `reportedTargets`, `reportStatus`, `reportType`, `reportSort`,
`openTargetKey`, `targetReports`, `loadingTargetReports`. Key methods: `loadReports()`,
`toggleTarget()`, `resolveTarget()`.

---

## 2. Route points

A "route" destination is a polyline; it can have a set of "point" destinations attached to it
(the `route_points` join table on the backend). These show up as **"Points along the route"** in
the route's detail panel.

### Backend endpoints used (already existed)
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/destinations/:id/points` | Link a point to a route — body `{ pointId }` |
| `DELETE` | `/api/destinations/:id/points/:pointId` | Unlink a point from a route |

Both are owner/admin-only (enforced server-side) and return the **updated route**, including its
refreshed `points` array. The route detail (`GET /destinations/:id`) already returns `points` too.

### Files

**`src/app/models/destination.model.ts`**:
- Added `RoutePoint` = `{ id, title, description, geometry }`.
- Added `points: RoutePoint[]` to the `Destination` interface (empty for non-routes).

**`src/app/core/services/destination.service.ts`**:
- `addPoint(routeId, pointId)` → `POST /:id/points`.
- `removePoint(routeId, pointId)` → `DELETE /:id/points/:pointId`.

### UI in the map detail panel (`features/map/`)

When a **route** is open in the detail panel, a "Points along the route" section shows:
- The current points (everyone can see them; clicking one opens that point's detail).
- For the **owner or an admin**, a **✕** to remove each point and a **"＋ Add a point"** button.

#### How "owner/admin" is determined
The detail payload doesn't include the owner id, so the component loads the signed-in user's own
destination ids once (via `getMine()`) into the `ownedIds` signal. `canModifySelected` = admin OR
the destination id is in `ownedIds`. `canManagePoints` = `canModifySelected` AND the destination
is a route.

#### Adding a point — two paths
Clicking **"＋ Add a point"** opens a small panel with two options:

1. **Create a new point on the map**
   - `startCreatePointForRoute()` remembers the route id (`addPointRouteId`) and switches into the
     existing create flow, **locked to the "point" type** (the Point/Route chooser is hidden, the
     heading/button text change).
   - On publish, the new point is created, then **automatically linked** to the route via
     `addPoint()`, and the panel returns to the route's detail with the new point already listed
     (`finishCreateForRoute()`). Cancelling returns to the route detail.

2. **Pick an existing nearby point**
   - The picker loads candidate points (`getAll({ type: 'point' })`) and shows only those **near
     the route polyline**:
     - `availablePoints` computes each candidate's shortest distance to the polyline
       (`pointToPolylineMeters`, a local planar projection — accurate at city scale), filters out
       points already on the route, applies the text search, keeps those within the selected
       **radius**, and sorts **nearest-first** with the distance shown.
     - A radius dropdown (`pointRadius`, options 1 / 3 / 5 / 10 / 25 km, default 3 km) controls the
       cutoff. Empty state: "No points within X of this route."

> **Why distance filtering?** Without it the list would show every point on the map, most of which
> are nowhere near the route. The filter is currently client-side over the loaded candidates; if the
> points dataset grows large, the natural optimization is to pass the route's bounding box (expanded
> by the radius) to the `getAll` query so the server pre-trims.

---

## 3. Report moderation — view the reported content & jump to it

The admin Reports tab originally showed only `Destination #id` / `Review #id`. This adds the actual
content of what was reported and a way to navigate to it, so an admin can judge whether to act.
It's **frontend-only** and reuses existing detail endpoints — no new backend work.

### Backend endpoints used (already existed)
| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/destinations/:id` | Reported destination's details |
| `GET` | `/api/reviews/:id` | Reported review's details — now includes its `destination {id, title}` |

> The `reviews/:id` endpoint was extended (server side, by the backend dev) to also return the
> review's `destination`, which is what makes "go to the review" possible.

### Files

**`src/app/models/review.model.ts`** — added `ReviewDetail` (a `DestinationReview` plus
`destination: { id, title } | null`), the shape returned by `GET /reviews/:id`.

**`src/app/core/services/review.service.ts`** — added `getById(reviewId)`.

**`src/app/features/admin/admin.component.*`** — on expanding a reported target it now also fetches
the target's content:
- **destination** → `destinationService.getById(id)` → shows title, location, description.
- **review** → `reviewService.getById(id)` → shows stars, author, comment, and which destination
  it's on.
- A **"Go to …"** action routes to the map:
  - destination report → **"Go to destination →"** → `/map?dest=<id>` (assess the destination).
  - review report → **"Go to the review →"** → `/map?dest=<parentId>&review=<reviewId>` (assess the
    specific review).
- New state: `targetDestination`, `targetReview`, `loadingTargetContent`. New methods:
  `goToDestination(target)`, `stars()`.

**`src/app/features/map/map.component.*`** — reads the `?dest=` / `?review=` query params on load
(`openDestinationById`): opens that destination's detail (via `getById`, so it works even when the
spot isn't in the current map view), flies/fits to it, and — for a review link — **scrolls to and
pulses** the reported review (`highlightedReviewId`, `highlightReview()`).

### Destination vs. review reports — the distinction
Both kinds let the admin jump to the map, but for different purposes:

| | Destination report | Review report |
| --- | --- | --- |
| User triggers from | "⚑ Report this route/point" on the destination | "⚑" on a specific review |
| Admin sees | "Reported destination" + its details | "Reported review" + the review content |
| Button | "Go to destination →" | "Go to the review →" |
| Lands on | The destination's detail (judge the destination) | The parent destination, with the review highlighted (judge the review) |

> Note: the user-facing report buttons are hidden for the target's **owner** and for **admins**
> (they moderate/edit directly rather than report).

---

## Summary of files

**New**
- `src/app/core/services/report.service.ts`
- `src/app/shared/components/report-dialog/report-dialog.component.ts`
- `src/app/shared/components/report-dialog/report-dialog.component.scss`

**Changed**
- `src/app/models/report.model.ts`
- `src/app/models/destination.model.ts` (added `RoutePoint`, `points`)
- `src/app/models/review.model.ts` (added `ReviewDetail`)
- `src/app/core/services/admin.service.ts` (removed stale report methods)
- `src/app/core/services/destination.service.ts` (added `addPoint`, `removePoint`)
- `src/app/core/services/review.service.ts` (added `getById`)
- `src/app/features/admin/admin.component.{ts,html,scss}` (Reports tab + reported-content view & "go to")
- `src/app/features/map/map.component.{ts,html,scss}` (report buttons, route-points UI, deep-link + review highlight)

---

## Note: the "database error" when adding a point

This was **not** a code bug. The endpoint works (verified: `POST /destinations/:id/points`
returns `201 Created`). It happened because the running backend was still connected to an **old
database** where the `route_points` table still had a NOT-NULL `position` column, so the insert
violated the not-null constraint. `DATABASE_URL` is read once at server startup, so after switching
the `.env` to the dev DB you must **restart the backend** for it to take effect.
