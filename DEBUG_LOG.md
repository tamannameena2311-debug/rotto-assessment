# Debug Log

## Bug 1

**File:** `backend/src/middleware/auth.js`
**What was wrong:** Tokens were verified with `process.env.JWT_SECRET`, but tokens are signed with `process.env.ROTTO_JWT_SECRET` and `.env.example` only defines `ROTTO_JWT_SECRET`. Protected routes rejected valid login/register tokens.
**How I found it:** Compared `authController.js`, `auth.js`, and `.env.example`.
**What I changed:** Updated the middleware to verify JWTs with `ROTTO_JWT_SECRET`.

---

## Bug 2

**File:** `backend/src/index.js`
**What was wrong:** `errorHandler` was mounted before the routes, so errors passed from controllers with `next(err)` skipped the app's JSON error envelope.
**How I found it:** Checked Express middleware order while tracing route error flow.
**What I changed:** Moved `app.use(errorHandler)` after the API routes and 404 handler.

---

## Bug 3

**File:** `backend/src/models/Booking.js`
**What was wrong:** `userId` was declared as `String` while referencing `User`. This breaks ObjectId consistency and user population.
**How I found it:** Compared `Booking.userId` with `Car.userId`, the controller writes, and `.populate('userId')` usage.
**What I changed:** Changed `userId` to `mongoose.Schema.Types.ObjectId`.

---

## Bug 4

**File:** `backend/src/controllers/bookingController.js`
**What was wrong:** Pagination used `skip = page * limit`, causing page 1 to skip the first page of bookings.
**How I found it:** Read the pagination math in `getMyBookings`.
**What I changed:** Changed it to `skip = (page - 1) * limit`.

---

## Bug 5

**File:** `frontend/src/lib/api.ts`
**What was wrong:** The API client sent the raw token in `Authorization`; the backend expects `Authorization: Bearer <token>`.
**How I found it:** Compared the frontend request headers with `authenticate` middleware's `startsWith('Bearer ')` check.
**What I changed:** Added the `Bearer` prefix and typed API responses.
**Screenshot:** N/A - found through source inspection.

---

## Bug 6

**File:** `frontend/src/hooks/useAuth.ts`
**What was wrong:** The auth hook read `auth_token`, but login/register saved `rotto_token` via `TOKEN_KEY`. Refreshing the app made authenticated users look logged out.
**How I found it:** Compared the storage key used by `useAuth` with `TOKEN_KEY` in `api.ts`.
**What I changed:** Read and remove tokens through `TOKEN_KEY`.
**Screenshot:** N/A - found through source inspection.

---

## Bug 7

**File:** `frontend/src/app/login/page.tsx`
**What was wrong:** The login form submit handler did not call `e.preventDefault()`, so the browser could refresh/navigate away during login.
**How I found it:** Compared login's submit handler with register's working submit handler.
**What I changed:** Added `e.preventDefault()` before the API call.
**Screenshot:** N/A - found through source inspection.

---

## Bug 8

**File:** `frontend/src/styles/globals.css`
**What was wrong:** `.rt-cars-grid` used fixed `280px` columns, which leaves unused row space on wide screens and can overflow narrow containers.
**How I found it:** The stylesheet included a note pointing to the CSS grid issue; this is also visible in DevTools by inspecting `.rt-cars-grid`.
**What I changed:** Switched to `repeat(auto-fill, minmax(280px, 1fr))`.
**Screenshot:** Capture with DevTools grid overlay before submission if the reviewer requires visual proof.

---

## Additional UI Fix

**File:** `frontend/src/components/Modal.tsx`
**What was wrong:** The modal backdrop used `position: static`, so it rendered in document flow instead of as an overlay.
**What I changed:** Changed it to a fixed full-screen backdrop.

## Additional Build Fix

**File:** `frontend/next.config.ts` -> `frontend/next.config.mjs`
**What was wrong:** Next.js 14.2.5 does not support TypeScript config files, so `next build` failed before compiling the app.
**What I changed:** Replaced the TypeScript config with a supported ESM config file.

**File:** `frontend/.eslintrc.json`, `frontend/package.json`
**What was wrong:** ESLint enabled `@typescript-eslint` rules without loading the plugin/parser, so `next build` failed during linting.
**What I changed:** Added the compatible `@typescript-eslint` parser/plugin and loaded them explicitly in `.eslintrc.json`.

---

## Hard Feature

**Option A - Aggregation Stats Endpoint:** Added `GET /api/admin/stats` behind `authenticate` and `requireAdmin`. The endpoint uses one MongoDB `$facet` aggregation to return booking counts by status, counts by service type, the last five bookings with car/user data joined through `$lookup`, and total estimated revenue.

**Option B - Debounce Hook from Scratch:** Added `useDebounce<T>(value, delayMs)` without external libraries and wired it to the Cars page search input. The Cars page calls `GET /api/cars?search=...`, and the backend filters by make, model, registration number, or fuel type.

**Option C - Sliding Window Rate Limiter:** Added Express middleware backed by a `Map` of per-IP request timestamps. It prunes timestamps outside the rolling window on each request, returns `429` when the current sliding window exceeds the limit, and includes a `Retry-After` header.

**Option D - Optimistic UI:** Added admin booking management on the Bookings page. Admin status changes update the UI immediately, call `PUT /api/bookings/:id/status`, and roll back the changed booking if the API call fails.
