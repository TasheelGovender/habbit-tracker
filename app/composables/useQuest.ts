import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { formatInTimeZone } from 'date-fns-tz'

import type { QuestRecord } from '~/types/quest'
import { calculateLevelUp, calculateXpReward, reverseLevelUp } from '~/utils/xp'

function getTodayString(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
}

export function useQuest() {
  const db = useFirestore()

  const getQuestsRef = (uid: string) => collection(db, 'users', uid, 'quests')
  const getQuestRef = (uid: string, questId: string) => doc(db, 'users', uid, 'quests', questId)
  const getCategoryRef = (uid: string, categoryId: string) => doc(db, 'users', uid, 'categories', categoryId)
  const getPlayerRef = (uid: string) => doc(db, 'users', uid)

  async function createQuest(
    uid: string,
    data: { title: string; categoryId: string; difficulty: number },
  ): Promise<QuestRecord> {
    const now = serverTimestamp()
    const questData = {
      title: data.title,
      categoryId: data.categoryId,
      difficulty: data.difficulty,
      streak: 0,
      completedDates: [] as string[],
      createdAt: now,
      updatedAt: now,
    }

    const ref = await addDoc(getQuestsRef(uid), questData)

    return {
      id: ref.id,
      ...questData,
    }
  }

  async function loadQuests(uid: string): Promise<QuestRecord[]> {
    const snapshot = await getDocs(getQuestsRef(uid))

    return snapshot.docs.map((questSnapshot) => ({
      id: questSnapshot.id,
      ...(questSnapshot.data() as Omit<QuestRecord, 'id'>),
    }))
  }

  async function completeQuest(
    uid: string,
    questId: string,
    categoryId: string,
    difficulty: number,
    streak: number,
  ): Promise<{ xpAwarded: number; categoryLevel: number; categoryXp: number; playerLevel: number; playerXp: number }> {
    const questRef = getQuestRef(uid, questId)
    const categoryRef = getCategoryRef(uid, categoryId)
    const playerRef = getPlayerRef(uid)

    const result = await runTransaction(db, async (transaction) => {
      const [questSnap, categorySnap, playerSnap] = await Promise.all([
        transaction.get(questRef),
        transaction.get(categoryRef),
        transaction.get(playerRef),
      ])

      const questData = questSnap.data()!
      const categoryData = categorySnap.data()!
      const playerData = playerSnap.data()!

      const today = getTodayString(playerData.timezone || 'UTC')
      const xpAwarded = calculateXpReward(difficulty, streak)

      const categoryResult = calculateLevelUp(categoryData.xp, xpAwarded, categoryData.level)
      const playerResult = calculateLevelUp(playerData.xp, xpAwarded, playerData.level)

      transaction.update(questRef, {
        completedDates: arrayUnion(today),
        streak: (questData.streak || 0) + 1,
        updatedAt: serverTimestamp(),
      })

      transaction.update(categoryRef, {
        xp: categoryResult.xp,
        level: categoryResult.level,
      })

      transaction.update(playerRef, {
        xp: playerResult.xp,
        level: playerResult.level,
        updatedAt: serverTimestamp(),
      })

      return {
        xpAwarded,
        categoryLevel: categoryResult.level,
        categoryXp: categoryResult.xp,
        playerLevel: playerResult.level,
        playerXp: playerResult.xp,
      }
    })

    return result
  }

  async function uncompleteQuest(
    uid: string,
    questId: string,
    categoryId: string,
    difficulty: number,
    streak: number,
  ): Promise<{ xpReversed: number; categoryLevel: number; categoryXp: number; playerLevel: number; playerXp: number }> {
    const questRef = getQuestRef(uid, questId)
    const categoryRef = getCategoryRef(uid, categoryId)
    const playerRef = getPlayerRef(uid)

    const result = await runTransaction(db, async (transaction) => {
      const [questSnap, categorySnap, playerSnap] = await Promise.all([
        transaction.get(questRef),
        transaction.get(categoryRef),
        transaction.get(playerRef),
      ])

      const questData = questSnap.data()!
      const categoryData = categorySnap.data()!
      const playerData = playerSnap.data()!

      const today = getTodayString(playerData.timezone || 'UTC')
      const xpReversed = calculateXpReward(difficulty, streak)

      const categoryResult = reverseLevelUp(categoryData.xp, xpReversed, categoryData.level)
      const playerResult = reverseLevelUp(playerData.xp, xpReversed, playerData.level)

      transaction.update(questRef, {
        completedDates: arrayRemove(today),
        streak: Math.max(0, (questData.streak || 0) - 1),
        updatedAt: serverTimestamp(),
      })

      transaction.update(categoryRef, {
        xp: categoryResult.xp,
        level: categoryResult.level,
      })

      transaction.update(playerRef, {
        xp: playerResult.xp,
        level: playerResult.level,
        updatedAt: serverTimestamp(),
      })

      return {
        xpReversed,
        categoryLevel: categoryResult.level,
        categoryXp: categoryResult.xp,
        playerLevel: playerResult.level,
        playerXp: playerResult.xp,
      }
    })

    return result
  }

  async function deleteQuest(uid: string, questId: string): Promise<void> {
    await deleteDoc(getQuestRef(uid, questId))
  }

  return {
    createQuest,
    loadQuests,
    completeQuest,
    uncompleteQuest,
    deleteQuest,
  }
}
