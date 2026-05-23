# Auth, Player Bootstrap, and Live Dashboard Design

## Goal

Implement the first real end-to-end product slice for the app:

1. Users sign in with Google
2. First-time users get a seeded player profile and default categories
3. `/dashboard` becomes a protected route backed by live Firestore player data

This slice intentionally stops before quest CRUD and gameplay loops. Its purpose is to establish identity, persistence, and a trustworthy dashboard foundation.

## Why this slice now

The project already has:

- a Nuxt 4 SPA scaffold
- responsive themed landing and dashboard pages
- Tailwind, Pinia, Firebase, and VueFire configured

What is missing is the first vertical slice that turns the UI from a mock shell into a working product. Authentication plus player bootstrap is the narrowest slice that unlocks every later feature without leaving fake data in core screens.

## Recommended approach

Use a single vertical slice that includes:

- Google auth
- auth route protection
- first-login player bootstrap
- default category seeding
- live player-backed dashboard rendering

This is preferred over shipping auth alone because it avoids a half-real app where sign-in works but the main product screen still renders fake data.

## Architecture

The slice is divided into four focused units.

### 1. `useAuth`

Responsibilities:

- expose current Firebase user state
- perform Google sign-in
- perform sign-out
- surface auth loading and auth errors

Non-responsibilities:

- no player document reads or writes
- no category seeding
- no dashboard projection logic

This keeps identity concerns separate from app-domain concerns.

### 2. `usePlayer`

Responsibilities:

- read the `users/{uid}` document
- bootstrap the player document when missing
- seed default categories on first login
- expose live player state to stores and pages

Non-responsibilities:

- no sign-in UI
- no auth provider selection
- no quest logic

This composable is the boundary between Firebase identity and game-domain persistence.

### 3. Auth middleware

Responsibilities:

- guard authenticated routes such as `/dashboard`
- wait for Firebase auth resolution before redirecting
- redirect unauthenticated users to `/`

Non-responsibilities:

- no player bootstrap writes
- no Firestore reads beyond what is needed to determine whether the user is authenticated

### 4. Dashboard live-data integration

Responsibilities:

- render real player fields from store/composable state
- show loading while auth/player state resolves
- show empty states for not-yet-implemented quest data

Non-responsibilities:

- no quest creation or completion
- no derived gameplay logic beyond simple display

## Data model used in this slice

### Player document

Path: `users/{uid}`

Fields used now:

- `displayName`
- `email`
- `photoURL`
- `level`
- `xp`
- `rank`
- `hp`
- `maxHp`
- `title`
- `inPenaltyZone`
- `lastActiveDate`
- `timezone`
- `streakFreezes`
- `createdAt`
- `updatedAt`

Initial values:

- `level: 1`
- `xp: 0`
- `rank: 'E'`
- `hp: 50`
- `maxHp: 50`
- `title: null`
- `inPenaltyZone: false`
- `streakFreezes: 2`
- `lastActiveDate`: current local date string in the detected timezone

### Category documents

Path: `users/{uid}/categories/{categoryId}`

Seed once on first login with:

1. Fitness
2. Learning
3. Productivity
4. Health
5. Social

Each category includes:

- `name`
- `icon`
- `color`
- `level`
- `xp`
- `order`
- `createdAt`

Initial values:

- `level: 1`
- `xp: 0`

## Runtime flow

### Returning user

1. User opens app
2. Firebase auth restores session if present
3. Middleware allows `/dashboard` only if a user exists
4. `usePlayer` loads `users/{uid}`
5. Dashboard renders live player state

### First-time user

1. User clicks Google sign-in on landing page
2. Firebase returns authenticated user
3. App checks whether `users/{uid}` exists
4. If absent, app creates the player document
5. App seeds default categories
6. App loads player state into the store
7. App redirects to `/dashboard`

## Bootstrap rules

Bootstrap must be safe to run more than once without corrupting data.

Rules:

- treat the existence of `users/{uid}` as the bootstrap gate
- only seed categories during first-time bootstrap
- if player creation fails, do not continue to dashboard
- if a partial failure occurs during bootstrap, recover by retrying bootstrap rather than silently proceeding

Implementation expectation:

- player creation and category seeding should be structured to minimize partial setup
- if full transactional behavior is awkward client-side, the recovery rule is more important than forced over-abstraction

## Store and page behavior

### Player store

The player store should be thin and focused on app-facing state:

- `player`
- `isLoading`
- `error`
- `isBootstrapping`

Actions:

- `loadPlayer()`
- `bootstrapPlayerIfNeeded()`
- `clearPlayer()`

The store should consume composables instead of containing raw Firebase logic inline.

### Landing page

Replace placeholder CTA behavior with:

- sign-in button
- sign-in pending state
- visible auth error state

The page remains visually themed and responsive.

### Dashboard page

Replace mock values with:

- real rank
- real title
- real HP
- real XP
- real category progress

Quest content remains out of scope. Instead of fake quest cards, show an empty state such as:

> No quests created yet. Quest management is the next feature slice.

## Route protection

Protected now:

- `/dashboard`

Behavior:

- unauthenticated user visiting `/dashboard` goes to `/`
- authenticated user visiting `/` may remain there for now or be redirected later; automatic redirect from `/` is not required in this slice

This keeps route behavior simple while still enforcing the important protection boundary.

## Loading, empty, and error states

### Loading states

- app startup: resolving auth
- dashboard load: resolving player document
- first login: initializing hunter profile

### Empty states

- no quest data yet on dashboard
- optional no title equipped state if `title` is `null`

### Error states

- Google popup blocked or cancelled
- Firebase auth failure
- missing or invalid Firebase config in development
- player bootstrap failure
- player load failure

Error handling rules:

- never fall back to mock player data
- never silently ignore bootstrap failure
- show retry-capable UI where practical

## Mobile and responsiveness

This slice must preserve the current mobile-first foundation.

Requirements:

- auth CTA remains tap-friendly
- loading and error states fit comfortably on small screens
- dashboard live-data replacement does not assume desktop-only layout density
- empty states should be readable without requiring wide panels

No new desktop-only patterns are introduced in this slice.

## Scope

### In scope

- Google sign-in
- sign-out
- auth state restoration
- `/dashboard` protection
- first-user player document creation
- first-user default category creation
- live player data on dashboard
- loading, empty, and error states for this flow

### Out of scope

- quest CRUD
- daily completion flow
- XP gain interactions
- penalty engine
- achievements
- boss raids
- history page
- profile page expansion
- rank-up ceremonies

## File-level design targets

Expected additions or updates:

- `app/composables/useAuth.ts`
- `app/composables/usePlayer.ts`
- `app/stores/player.ts`
- `app/middleware/auth.ts`
- `app/pages/index.vue`
- `app/pages/dashboard.vue`
- supporting utility/constants files if needed for player defaults

The implementation should stay surgical and avoid building future abstractions for quests or achievements before they are needed.

## Success criteria

This slice is complete when all of the following are true:

1. A user can sign in with Google from the landing page
2. A first-time user gets a player document and default categories
3. `/dashboard` is inaccessible when signed out
4. `/dashboard` renders real Firestore-backed player values
5. Refreshing the app preserves authenticated access and reloads player state
6. Failure states are visible and do not silently fall back to fake data

## Next slice after this one

Once this design is implemented, the next implementation plan should target:

- quest CRUD
- quest assignment to categories
- dashboard empty state transition into real quest list data

That sequence builds directly on the player identity and persistence layer established here.
