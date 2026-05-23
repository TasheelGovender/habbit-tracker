import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { formatInTimeZone } from 'date-fns-tz'

import type { AuthUserSeed, CategoryRecord, PlayerRecord } from '~/types/player'
import { createDefaultCategories, createDefaultPlayer } from '~/utils/player-defaults'

function getTodayString(timezone: string) {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

export function usePlayer() {
  const db = useFirestore()

  const getPlayerRef = (uid: string) => doc(db, 'users', uid)
  const getCategoriesRef = (uid: string) => collection(db, 'users', uid, 'categories')
  const getDefaultCategoryRef = (uid: string, categoryOrder: number) =>
    doc(getCategoriesRef(uid), `default-${categoryOrder}`)

  async function bootstrapPlayerIfNeeded(
    user: AuthUserSeed,
    timezone: string,
  ): Promise<PlayerRecord> {
    const playerRef = getPlayerRef(user.uid)
    await runTransaction(db, async (transaction) => {
      const playerSnapshot = await transaction.get(playerRef)

      if (playerSnapshot.exists()) {
        return
      }

      const now = serverTimestamp()
      const player = createDefaultPlayer(user, timezone, getTodayString(timezone))
      const categories = createDefaultCategories()

      transaction.set(playerRef, { ...player, createdAt: now, updatedAt: now })

      for (const category of categories) {
        const categoryRef = getDefaultCategoryRef(user.uid, category.order)
        transaction.set(categoryRef, { ...category, createdAt: now })
      }
    })

    const hydratedPlayer = await getDoc(playerRef)

    if (!hydratedPlayer.exists()) {
      throw new Error('Player bootstrap failed.')
    }

    return {
      id: hydratedPlayer.id,
      ...(hydratedPlayer.data() as Omit<PlayerRecord, 'id'>),
    }
  }

  async function loadPlayer(uid: string): Promise<PlayerRecord | null> {
    const playerSnapshot = await getDoc(getPlayerRef(uid))

    if (!playerSnapshot.exists()) {
      return null
    }

    return {
      id: playerSnapshot.id,
      ...(playerSnapshot.data() as Omit<PlayerRecord, 'id'>),
    }
  }

  async function loadCategories(uid: string): Promise<CategoryRecord[]> {
    const categorySnapshots = await getDocs(getCategoriesRef(uid))

    return categorySnapshots.docs
      .map((categorySnapshot) => ({
        id: categorySnapshot.id,
        ...(categorySnapshot.data() as Omit<CategoryRecord, 'id'>),
      }))
      .sort((left, right) => left.order - right.order)
  }

  return {
    bootstrapPlayerIfNeeded,
    loadPlayer,
    loadCategories,
  }
}
