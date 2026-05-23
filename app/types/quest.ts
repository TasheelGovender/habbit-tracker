export interface QuestDocument {
  title: string
  categoryId: string
  difficulty: number
  streak: number
  completedDates: string[]
  createdAt: unknown
  updatedAt: unknown
}

export interface QuestRecord extends QuestDocument {
  id: string
}

export interface QuestView {
  id: string
  title: string
  type: string
  category: string
  categoryId: string
  difficulty: number
  streak: number
  xpReward: number
  completed: boolean
}
