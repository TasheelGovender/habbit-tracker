# Auth + Live Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real end-to-end slice of the app: Google sign-in, first-login player/category bootstrap, protected dashboard access, and live Firestore-backed dashboard data.

**Architecture:** Keep identity, persistence, routing, and rendering separate. `useAuth` owns Firebase auth state and actions, `usePlayer` owns player bootstrap and reads, the player store owns app-facing state, and `/dashboard` renders only live data or explicit loading/empty/error states.

**Tech Stack:** Nuxt 4 SPA, Vue 3, Pinia, Firebase Auth, Firestore, VueFire, Tailwind CSS, Vitest, Vue Test Utils, jsdom

---

## File structure map

### Create

- `app/types/player.ts` — shared domain types for player and category documents
- `app/utils/player-defaults.ts` — pure factory helpers for default player/category data
- `app/utils/firebase-config.ts` — dev-time Firebase public config checks
- `app/utils/auth-route.ts` — pure redirect decision helper for route protection
- `app/composables/useAuth.ts` — Google auth wrapper with loading/error state
- `app/composables/usePlayer.ts` — player read/bootstrap logic
- `app/stores/player.ts` — app-facing player state and orchestration
- `app/middleware/auth.ts` — `/dashboard` route guard
- `app/components/player/PlayerOverview.vue` — live player HUD card
- `app/components/player/CategoryGrid.vue` — category level grid
- `app/components/dashboard/DashboardQuestEmptyState.vue` — explicit empty-state panel for pre-quest slice
- `tests/setup.ts` — Vitest setup
- `tests/unit/player-defaults.test.ts` — unit tests for default factories
- `tests/unit/firebase-config.test.ts` — unit tests for Firebase config guard
- `tests/unit/use-player.test.ts` — unit tests for player bootstrap composable
- `tests/unit/auth-route.test.ts` — unit tests for route decision helper
- `tests/unit/player-store.test.ts` — store tests with mocked composables
- `tests/components/player-overview.test.ts` — render tests for the player HUD component
- `tests/components/category-grid.test.ts` — render tests for category grid
- `vitest.config.ts` — Vitest config for app/unit/component tests

### Modify

- `package.json` — add test scripts and dev dependencies
- `nuxt.config.ts` — mirror Firebase env values into `runtimeConfig.public` for page-side config checks
- `app/pages/index.vue` — replace placeholder CTA with real Google sign-in flow
- `app/pages/dashboard.vue` — remove mock data and consume store-backed live data

---

### Task 1: Test harness + player default factories

**Files:**
- Create: `app/types/player.ts`
- Create: `app/utils/player-defaults.ts`
- Create: `tests/setup.ts`
- Create: `tests/unit/player-defaults.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`

- [x] **Step 1: Add test scripts and dev dependencies**

Update `package.json`:

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Run:

```bash
npm install -D vitest @vue/test-utils jsdom
```

Expected: packages install successfully and `package-lock.json` updates.

- [x] **Step 2: Create Vitest config and setup**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
```

Create `tests/setup.ts`:

```ts
import { vi } from 'vitest'

vi.stubGlobal('navigateTo', vi.fn())
```

- [x] **Step 3: Write the failing test for player/category defaults**

Create `tests/unit/player-defaults.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createDefaultPlayer, createDefaultCategories } from '~/utils/player-defaults'

describe('createDefaultPlayer', () => {
  it('creates a level 1 hunter profile from auth user data', () => {
    const player = createDefaultPlayer(
      {
        uid: 'hunter-1',
        displayName: 'Sung Jin-Woo',
        email: 'jinwoo@example.com',
        photoURL: 'https://example.com/jinwoo.png',
      },
      'Africa/Johannesburg',
      '2026-05-22',
    )

    expect(player.level).toBe(1)
    expect(player.rank).toBe('E')
    expect(player.hp).toBe(50)
    expect(player.maxHp).toBe(50)
    expect(player.timezone).toBe('Africa/Johannesburg')
    expect(player.lastActiveDate).toBe('2026-05-22')
    expect(player.displayName).toBe('Sung Jin-Woo')
  })
})

describe('createDefaultCategories', () => {
  it('creates the five starter categories in display order', () => {
    const categories = createDefaultCategories()

    expect(categories.map((category) => category.name)).toEqual([
      'Fitness',
      'Learning',
      'Productivity',
      'Health',
      'Social',
    ])
    expect(categories.every((category) => category.level === 1)).toBe(true)
    expect(categories.every((category) => category.xp === 0)).toBe(true)
    expect(categories.map((category) => category.order)).toEqual([0, 1, 2, 3, 4])
  })
})
```

- [x] **Step 4: Run the test to verify it fails**

Run:

```bash
npx vitest run tests/unit/player-defaults.test.ts
```

Expected: FAIL with module resolution error for `~/utils/player-defaults`.

- [x] **Step 5: Write the minimal types and factory helpers**

Create `app/types/player.ts`:

```ts
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export interface PlayerDocument {
  displayName: string
  email: string
  photoURL: string | null
  level: number
  xp: number
  rank: Rank
  hp: number
  maxHp: number
  title: string | null
  inPenaltyZone: boolean
  lastActiveDate: string
  timezone: string
  streakFreezes: number
  createdAt: unknown
  updatedAt: unknown
}

export interface CategoryDocument {
  name: string
  icon: string
  color: string
  level: number
  xp: number
  order: number
  createdAt: unknown
}

export interface AuthUserSeed {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}
```

Create `app/utils/player-defaults.ts`:

```ts
import type { AuthUserSeed, CategoryDocument, PlayerDocument } from '~/types/player'

const STARTER_CATEGORIES = [
  { name: 'Fitness', icon: '💪', color: '#EF4444', order: 0 },
  { name: 'Learning', icon: '📚', color: '#3B82F6', order: 1 },
  { name: 'Productivity', icon: '⚡', color: '#F59E0B', order: 2 },
  { name: 'Health', icon: '🧘', color: '#10B981', order: 3 },
  { name: 'Social', icon: '👥', color: '#8B5CF6', order: 4 },
]

export function createDefaultPlayer(user: AuthUserSeed, timezone: string, lastActiveDate: string): PlayerDocument {
  return {
    displayName: user.displayName ?? 'New Hunter',
    email: user.email ?? '',
    photoURL: user.photoURL,
    level: 1,
    xp: 0,
    rank: 'E',
    hp: 50,
    maxHp: 50,
    title: null,
    inPenaltyZone: false,
    lastActiveDate,
    timezone,
    streakFreezes: 2,
    createdAt: null,
    updatedAt: null,
  }
}

export function createDefaultCategories(): CategoryDocument[] {
  return STARTER_CATEGORIES.map((category) => ({
    ...category,
    level: 1,
    xp: 0,
    createdAt: null,
  }))
}
```

- [x] **Step 6: Run the test to verify it passes**

Run:

```bash
npx vitest run tests/unit/player-defaults.test.ts
```

Expected: PASS with 2 tests passed.

- [x] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/unit/player-defaults.test.ts app/types/player.ts app/utils/player-defaults.ts
git commit -m "test: add player default factories"
```

---

### Task 2: Firebase config guard + auth composable

**Files:**
- Create: `app/utils/firebase-config.ts`
- Create: `app/composables/useAuth.ts`
- Create: `tests/unit/firebase-config.test.ts`
- Modify: `nuxt.config.ts`

- [x] **Step 1: Write the failing test for Firebase public config validation**

Create `tests/unit/firebase-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getMissingFirebaseKeys, hasFirebasePublicConfig } from '~/utils/firebase-config'

describe('firebase config helpers', () => {
  it('returns the missing public keys', () => {
    const missing = getMissingFirebaseKeys({
      firebaseApiKey: '',
      firebaseAuthDomain: 'demo.firebaseapp.com',
      firebaseProjectId: '',
      firebaseStorageBucket: 'demo.firebasestorage.app',
      firebaseMessagingSenderId: '123',
      firebaseAppId: '',
    })

    expect(missing).toEqual([
      'firebaseApiKey',
      'firebaseProjectId',
      'firebaseAppId',
    ])
  })

  it('returns true when all Firebase public config keys exist', () => {
    expect(hasFirebasePublicConfig({
      firebaseApiKey: 'key',
      firebaseAuthDomain: 'demo.firebaseapp.com',
      firebaseProjectId: 'demo',
      firebaseStorageBucket: 'demo.firebasestorage.app',
      firebaseMessagingSenderId: '123',
      firebaseAppId: 'app-id',
    })).toBe(true)
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
npx vitest run tests/unit/firebase-config.test.ts
```

Expected: FAIL with module resolution error for `~/utils/firebase-config`.

- [x] **Step 3: Implement the config helper**

Create `app/utils/firebase-config.ts`:

```ts
export interface FirebasePublicConfig {
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseProjectId: string
  firebaseStorageBucket: string
  firebaseMessagingSenderId: string
  firebaseAppId: string
}

const FIREBASE_CONFIG_KEYS: Array<keyof FirebasePublicConfig> = [
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
]

export function getMissingFirebaseKeys(config: FirebasePublicConfig): Array<keyof FirebasePublicConfig> {
  return FIREBASE_CONFIG_KEYS.filter((key) => !config[key])
}

export function hasFirebasePublicConfig(config: FirebasePublicConfig): boolean {
  return getMissingFirebaseKeys(config).length === 0
}
```

- [x] **Step 4: Run the test to verify it passes**

Run:

```bash
npx vitest run tests/unit/firebase-config.test.ts
```

Expected: PASS with 2 tests passed.

- [x] **Step 5: Add the auth composable**

Create `app/composables/useAuth.ts`:

```ts
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

export function useAuth() {
  const auth = useFirebaseAuth()
  const currentUser = useCurrentUser()
  const isSigningIn = useState('auth:isSigningIn', () => false)
  const authError = useState<string | null>('auth:error', () => null)

  async function signInWithGoogle() {
    if (!auth) {
      authError.value = 'Firebase Auth is not available.'
      return null
    }

    isSigningIn.value = true
    authError.value = null

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result.user
    }
    catch (error) {
      authError.value = error instanceof Error ? error.message : 'Unable to sign in with Google.'
      throw error
    }
    finally {
      isSigningIn.value = false
    }
  }

  async function signOutUser() {
    if (!auth) {
      return
    }

    await signOut(auth)
  }

  return {
    auth,
    currentUser,
    isSigningIn,
    authError,
    signInWithGoogle,
    signOutUser,
  }
}
```

- [x] **Step 6: Add a dev warning for missing config**

Update `nuxt.config.ts` by filling `runtimeConfig.public` from env:

```ts
runtimeConfig: {
  public: {
    firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
    firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
  },
},
```

Keep the existing `vuefire.config` block unchanged for now.

- [x] **Step 7: Commit**

```bash
git add app/utils/firebase-config.ts app/composables/useAuth.ts tests/unit/firebase-config.test.ts nuxt.config.ts
git commit -m "feat: add Firebase config guard and auth composable"
```

---

### Task 3: Player bootstrap composable

**Files:**
- Create: `app/composables/usePlayer.ts`
- Modify: `app/types/player.ts`
- Modify: `app/utils/player-defaults.ts`
- Test: `tests/unit/use-player.test.ts`

- [x] **Step 1: Extend the shared types for live reads**

Update `app/types/player.ts`:

```ts
export interface PlayerRecord extends PlayerDocument {
  id: string
}

export interface CategoryRecord extends CategoryDocument {
  id: string
}
```

- [x] **Step 2: Write the failing test for player bootstrap**

Create `tests/unit/use-player.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlayer } from '~/composables/usePlayer'

const getDoc = vi.fn()
const getDocs = vi.fn()
const setDoc = vi.fn()
const writeBatch = vi.fn()
const docFn = vi.fn((...parts) => ({ path: parts.join('/') }))
const collectionFn = vi.fn((...parts) => ({ path: parts.join('/') }))

vi.mock('firebase/firestore', () => ({
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  doc: docFn,
  collection: collectionFn,
  serverTimestamp: () => 'server-timestamp',
}))

vi.mock('date-fns-tz', () => ({
  formatInTimeZone: () => '2026-05-22',
}))

vi.stubGlobal('useFirestore', () => ({ name: 'db' }))

describe('usePlayer', () => {
  beforeEach(() => {
    getDoc.mockReset()
    getDocs.mockReset()
    writeBatch.mockReset()
  })

  it('creates a player and starter categories for a first-time user', async () => {
    const commit = vi.fn().mockResolvedValue(undefined)
    const set = vi.fn()
    writeBatch.mockReturnValue({ set, commit })

    getDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({
        id: 'hunter-1',
        data: () => ({
          displayName: 'Hunter',
          email: 'hunter@example.com',
          photoURL: null,
          level: 1,
          xp: 0,
          rank: 'E',
          hp: 50,
          maxHp: 50,
          title: null,
          inPenaltyZone: false,
          lastActiveDate: '2026-05-22',
          timezone: 'Africa/Johannesburg',
          streakFreezes: 2,
          createdAt: null,
          updatedAt: null,
        }),
      })

    const { bootstrapPlayerIfNeeded } = usePlayer()

    const player = await bootstrapPlayerIfNeeded({
      uid: 'hunter-1',
      displayName: 'Hunter',
      email: 'hunter@example.com',
      photoURL: null,
    }, 'Africa/Johannesburg')

    expect(commit).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledTimes(6)
    expect(player.id).toBe('hunter-1')
    expect(player.rank).toBe('E')
  })
})
```

- [x] **Step 3: Run the test to verify it fails**

Run:

```bash
npx vitest run tests/unit/use-player.test.ts
```

Expected: FAIL because `~/composables/usePlayer` does not exist yet.

- [x] **Step 4: Write the player bootstrap composable**

Create `app/composables/usePlayer.ts`:

```ts
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { formatInTimeZone } from 'date-fns-tz'
import { createDefaultCategories, createDefaultPlayer } from '~/utils/player-defaults'
import type { AuthUserSeed, CategoryRecord, PlayerRecord } from '~/types/player'

function getTodayString(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

export function usePlayer() {
  const db = useFirestore()

  function getPlayerRef(uid: string) {
    return doc(db, 'users', uid)
  }

  function getCategoriesRef(uid: string) {
    return collection(db, 'users', uid, 'categories')
  }

  async function bootstrapPlayerIfNeeded(user: AuthUserSeed, timezone: string): Promise<PlayerRecord> {
    const playerRef = getPlayerRef(user.uid)
    const snapshot = await getDoc(playerRef)

    if (!snapshot.exists()) {
      const batch = writeBatch(db)
      const now = serverTimestamp()
      const player = createDefaultPlayer(user, timezone, getTodayString(timezone))
      const categories = createDefaultCategories()

      batch.set(playerRef, {
        ...player,
        createdAt: now,
        updatedAt: now,
      })

      for (const category of categories) {
        const categoryRef = doc(getCategoriesRef(user.uid))
        batch.set(categoryRef, {
          ...category,
          createdAt: now,
        })
      }

      await batch.commit()
    }

    const hydratedPlayer = await getDoc(playerRef)
    return {
      id: hydratedPlayer.id,
      ...(hydratedPlayer.data() as Omit<PlayerRecord, 'id'>),
    }
  }

  async function loadPlayer(uid: string): Promise<PlayerRecord | null> {
    const snapshot = await getDoc(getPlayerRef(uid))

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<PlayerRecord, 'id'>),
    }
  }

  async function loadCategories(uid: string): Promise<CategoryRecord[]> {
    const snapshot = await getDocs(getCategoriesRef(uid))

    return snapshot.docs
      .map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<CategoryRecord, 'id'>),
      }))
      .sort((left, right) => left.order - right.order)
  }

  return {
    bootstrapPlayerIfNeeded,
    loadPlayer,
    loadCategories,
  }
}
```

- [x] **Step 5: Run the player bootstrap test to verify it passes**

Run:

```bash
npx vitest run tests/unit/use-player.test.ts
```

Expected: PASS with 1 test passed.

- [x] **Step 6: Run the app type/build check**

Run:

```bash
npm run build
```

Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add app/composables/usePlayer.ts app/types/player.ts app/utils/player-defaults.ts tests/unit/use-player.test.ts
git commit -m "feat: add player bootstrap composable"
```

---

### Task 4: Player store + route guard logic

**Files:**
- Create: `app/stores/player.ts`
- Create: `app/utils/auth-route.ts`
- Create: `app/middleware/auth.ts`
- Create: `tests/unit/auth-route.test.ts`
- Create: `tests/unit/player-store.test.ts`

- [x] **Step 1: Write the failing test for route guard decisions**

Create `tests/unit/auth-route.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getProtectedRouteRedirect } from '~/utils/auth-route'

describe('getProtectedRouteRedirect', () => {
  it('redirects signed-out users away from dashboard', () => {
    expect(getProtectedRouteRedirect('/dashboard', false)).toBe('/')
  })

  it('allows signed-in users to stay on dashboard', () => {
    expect(getProtectedRouteRedirect('/dashboard', true)).toBeNull()
  })
})
```

- [x] **Step 2: Run the guard test to verify it fails**

Run:

```bash
npx vitest run tests/unit/auth-route.test.ts
```

Expected: FAIL with module resolution error for `~/utils/auth-route`.

- [x] **Step 3: Implement the route helper**

Create `app/utils/auth-route.ts`:

```ts
export function getProtectedRouteRedirect(path: string, isAuthenticated: boolean): string | null {
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    return '/'
  }

  return null
}
```

- [x] **Step 4: Write the failing test for the player store**

Create `tests/unit/player-store.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '~/stores/player'

const bootstrapPlayerIfNeeded = vi.fn()
const loadCategories = vi.fn()

vi.mock('~/composables/usePlayer', () => ({
  usePlayer: () => ({
    bootstrapPlayerIfNeeded,
    loadCategories,
  }),
}))

describe('usePlayerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    bootstrapPlayerIfNeeded.mockReset()
    loadCategories.mockReset()
  })

  it('hydrates player and categories after bootstrap', async () => {
    bootstrapPlayerIfNeeded.mockResolvedValue({
      id: 'hunter-1',
      displayName: 'Hunter',
      email: 'hunter@example.com',
      photoURL: null,
      level: 1,
      xp: 0,
      rank: 'E',
      hp: 50,
      maxHp: 50,
      title: null,
      inPenaltyZone: false,
      lastActiveDate: '2026-05-22',
      timezone: 'Africa/Johannesburg',
      streakFreezes: 2,
      createdAt: null,
      updatedAt: null,
    })

    loadCategories.mockResolvedValue([
      { id: 'cat-1', name: 'Fitness', icon: '💪', color: '#EF4444', level: 1, xp: 0, order: 0, createdAt: null },
    ])

    const store = usePlayerStore()

    await store.initializeForUser({
      uid: 'hunter-1',
      displayName: 'Hunter',
      email: 'hunter@example.com',
      photoURL: null,
    })

    expect(store.player?.id).toBe('hunter-1')
    expect(store.categories).toHaveLength(1)
    expect(store.error).toBeNull()
  })
})
```

- [x] **Step 5: Run the store test to verify it fails**

Run:

```bash
npx vitest run tests/unit/player-store.test.ts
```

Expected: FAIL because `~/stores/player` does not exist yet.

- [x] **Step 6: Implement the player store**

Create `app/stores/player.ts`:

```ts
import { defineStore } from 'pinia'
import type { AuthUserSeed, CategoryRecord, PlayerRecord } from '~/types/player'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    player: null as PlayerRecord | null,
    categories: [] as CategoryRecord[],
    isLoading: false,
    isBootstrapping: false,
    error: null as string | null,
  }),
  actions: {
    async initializeForUser(user: AuthUserSeed) {
      const { bootstrapPlayerIfNeeded, loadCategories } = usePlayer()

      this.isLoading = true
      this.isBootstrapping = true
      this.error = null

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        this.player = await bootstrapPlayerIfNeeded(user, timezone)
        this.categories = await loadCategories(user.uid)
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to initialize hunter profile.'
        throw error
      }
      finally {
        this.isLoading = false
        this.isBootstrapping = false
      }
    },
    clearPlayer() {
      this.player = null
      this.categories = []
      this.error = null
      this.isLoading = false
      this.isBootstrapping = false
    },
  },
})
```

- [x] **Step 7: Implement the middleware**

Create `app/middleware/auth.ts`:

```ts
import { getProtectedRouteRedirect } from '~/utils/auth-route'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const redirectPath = getProtectedRouteRedirect(to.path, Boolean(user))

  if (redirectPath) {
    return navigateTo(redirectPath)
  }
})
```

- [x] **Step 8: Run the tests to verify they pass**

Run:

```bash
npx vitest run tests/unit/auth-route.test.ts tests/unit/player-store.test.ts
```

Expected: PASS with all tests green.

- [x] **Step 9: Commit**

```bash
git add app/stores/player.ts app/utils/auth-route.ts app/middleware/auth.ts tests/unit/auth-route.test.ts tests/unit/player-store.test.ts
git commit -m "feat: add player store and auth route guard"
```

---

### Task 5: Extract and test live dashboard presentation components

**Files:**
- Create: `app/components/player/PlayerOverview.vue`
- Create: `app/components/player/CategoryGrid.vue`
- Create: `app/components/dashboard/DashboardQuestEmptyState.vue`
- Create: `tests/components/player-overview.test.ts`
- Create: `tests/components/category-grid.test.ts`

- [x] **Step 1: Write the failing test for the player overview component**

Create `tests/components/player-overview.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlayerOverview from '~/components/player/PlayerOverview.vue'

describe('PlayerOverview', () => {
  it('renders live player fields', () => {
    const wrapper = mount(PlayerOverview, {
      props: {
        player: {
          displayName: 'Hunter',
          rank: 'E',
          title: null,
          level: 1,
          xp: 0,
          hp: 50,
          maxHp: 50,
        },
      },
      global: {
        stubs: {
          ProgressBar: true,
          SystemWindow: { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.text()).toContain('Hunter')
    expect(wrapper.text()).toContain('E')
    expect(wrapper.text()).toContain('Unawakened')
  })
})
```

- [x] **Step 2: Write the failing test for the category grid**

Create `tests/components/category-grid.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CategoryGrid from '~/components/player/CategoryGrid.vue'

describe('CategoryGrid', () => {
  it('renders category levels', () => {
    const wrapper = mount(CategoryGrid, {
      props: {
        categories: [
          { id: '1', name: 'Fitness', level: 2, icon: '💪', color: '#EF4444', xp: 0, order: 0, createdAt: null },
        ],
      },
    })

    expect(wrapper.text()).toContain('Fitness')
    expect(wrapper.text()).toContain('Lv. 2')
  })
})
```

- [x] **Step 3: Run the component tests to verify they fail**

Run:

```bash
npx vitest run tests/components/player-overview.test.ts tests/components/category-grid.test.ts
```

Expected: FAIL because the new components do not exist yet.

- [x] **Step 4: Implement the player overview component**

Create `app/components/player/PlayerOverview.vue`:

```vue
<script setup lang="ts">
defineProps<{
  player: {
    displayName: string
    rank: string
    title: string | null
    level: number
    xp: number
    hp: number
    maxHp: number
  }
}>()
</script>

<template>
  <SystemWindow eyebrow="Player" :title="player.displayName">
    <div class="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
      <div class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-5">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.26em] text-slate-400">Rank</p>
            <p class="mt-1 text-6xl font-black text-cyan-200">{{ player.rank }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs uppercase tracking-[0.26em] text-slate-400">Title</p>
            <p class="mt-1 text-sm text-slate-200">{{ player.title ?? 'Unawakened' }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <ProgressBar label="Level XP" :value="player.xp" :max="100" />
        <ProgressBar label="HP" :value="player.hp" :max="player.maxHp" tone="hp" />
      </div>
    </div>
  </SystemWindow>
</template>
```

- [x] **Step 5: Implement the category grid and quest empty state**

Create `app/components/player/CategoryGrid.vue`:

```vue
<script setup lang="ts">
defineProps<{
  categories: Array<{
    id: string
    name: string
    level: number
    icon: string
    color: string
  }>
}>()
</script>

<template>
  <SystemWindow eyebrow="Categories" title="Current growth">
    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="category in categories"
        :key="category.id"
        class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-4"
      >
        <p class="text-xs uppercase tracking-[0.26em] text-slate-400">{{ category.name }}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-100">Lv. {{ category.level }}</p>
      </div>
    </div>
  </SystemWindow>
</template>
```

Create `app/components/dashboard/DashboardQuestEmptyState.vue`:

```vue
<template>
  <SystemWindow eyebrow="Today" title="Active quests">
    <div class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-6 text-sm leading-7 text-slate-300">
      No quests created yet. Quest management is the next feature slice.
    </div>
  </SystemWindow>
</template>
```

- [x] **Step 6: Run the component tests to verify they pass**

Run:

```bash
npx vitest run tests/components/player-overview.test.ts tests/components/category-grid.test.ts
```

Expected: PASS with both component tests green.

- [x] **Step 7: Commit**

```bash
git add app/components/player/PlayerOverview.vue app/components/player/CategoryGrid.vue app/components/dashboard/DashboardQuestEmptyState.vue tests/components/player-overview.test.ts tests/components/category-grid.test.ts
git commit -m "feat: add live dashboard presentation components"
```

---

### Task 6: Wire landing page and dashboard to live auth/store state

**Files:**
- Modify: `app/pages/index.vue`
- Modify: `app/pages/dashboard.vue`

- [x] **Step 1: Replace the landing page CTA logic**

Update `app/pages/index.vue` `<script setup>`:

```ts
definePageMeta({
  layout: 'auth',
})

const runtimeConfig = useRuntimeConfig()
const { currentUser, isSigningIn, authError, signInWithGoogle } = useAuth()
const playerStore = usePlayerStore()

const firebaseConfigMissing = computed(() => {
  return !runtimeConfig.public.firebaseApiKey || !runtimeConfig.public.firebaseProjectId
})

async function handleGoogleSignIn() {
  const user = await signInWithGoogle()

  if (!user) {
    return
  }

  await playerStore.initializeForUser({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  })

  await navigateTo('/dashboard')
}
```

Update the main CTA button area:

```vue
<div class="flex flex-col gap-3 sm:flex-row">
  <GlowButton
    size="lg"
    @click="handleGoogleSignIn"
  >
    {{ isSigningIn ? 'Connecting...' : currentUser ? 'Continue to Dashboard' : 'Sign in with Google' }}
  </GlowButton>
  <GlowButton variant="ghost" size="lg" to="#roadmap">
    View roadmap
  </GlowButton>
</div>

<p v-if="firebaseConfigMissing" class="text-sm text-amber-200">
  Firebase public config is incomplete. Fill in `.env` before testing sign-in.
</p>

<p v-if="authError" class="text-sm text-rose-300">
  {{ authError }}
</p>
```

- [x] **Step 2: Replace the mock dashboard with live state**

Update `app/pages/dashboard.vue` `<script setup>`:

```ts
definePageMeta({
  middleware: ['auth'],
})

const { currentUser, signOutUser } = useAuth()
const playerStore = usePlayerStore()

await callOnce(async () => {
  if (!currentUser.value) {
    return
  }

  await playerStore.initializeForUser({
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName,
    email: currentUser.value.email,
    photoURL: currentUser.value.photoURL,
  })
})

async function handleSignOut() {
  await signOutUser()
  playerStore.clearPlayer()
  await navigateTo('/')
}
```

Replace the template body with:

```vue
<div class="flex flex-col gap-6 py-4 sm:py-6">
  <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-xs uppercase tracking-[0.32em] text-cyan-200/70">System Window</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-50 sm:text-4xl">Hunter Dashboard</h1>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <GlowButton variant="ghost" to="/">Return</GlowButton>
      <GlowButton variant="secondary" @click="handleSignOut">Sign out</GlowButton>
    </div>
  </header>

  <div v-if="playerStore.isLoading" class="pixel-corners border border-cyan-300/15 bg-slate-950/45 p-6 text-sm text-slate-300">
    Initializing hunter profile...
  </div>

  <div v-else-if="playerStore.error" class="pixel-corners border border-rose-300/25 bg-rose-500/10 p-6 text-sm text-rose-100">
    {{ playerStore.error }}
  </div>

  <template v-else-if="playerStore.player">
    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <PlayerOverview :player="playerStore.player" />
      <CategoryGrid :categories="playerStore.categories" />
    </section>

    <DashboardQuestEmptyState />
  </template>
</div>
```

- [x] **Step 3: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS with all unit and component tests green.

- [x] **Step 4: Run build and static generation**

Run:

```bash
NITRO_TELEMETRY_DISABLED=1 NUXT_TELEMETRY_DISABLED=1 npm run build
NITRO_TELEMETRY_DISABLED=1 NUXT_TELEMETRY_DISABLED=1 npm run generate
```

Expected: PASS for both commands. `.output/public` is generated.

- [x] **Step 5: Commit**

```bash
git add app/pages/index.vue app/pages/dashboard.vue
git commit -m "feat: wire auth bootstrap and live dashboard"
```

---

## Self-review checklist

### Spec coverage

- Google sign-in: Task 2 + Task 6
- first-login player bootstrap: Task 3 + Task 4 + Task 6
- default categories: Task 1 + Task 3
- protected dashboard route: Task 4 + Task 6
- live dashboard data: Task 5 + Task 6
- loading/error/empty states: Task 6

### Placeholder scan

This plan contains:

- explicit file paths
- concrete test files
- exact commands
- concrete code snippets for each code-writing step

No placeholder markers or deferred instructions remain.

### Type consistency

Shared types used consistently:

- `AuthUserSeed`
- `PlayerDocument`
- `PlayerRecord`
- `CategoryDocument`
- `CategoryRecord`

Store/action names used consistently:

- `initializeForUser`
- `clearPlayer`
- `bootstrapPlayerIfNeeded`
- `loadCategories`
