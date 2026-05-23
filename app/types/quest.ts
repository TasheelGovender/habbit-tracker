export type QuestFrequency = 'daily' | 'weekly' | 'monthly' | 'custom'
export type FrequencyPeriod = 'day' | 'week' | 'month'

export interface QuestDocument {
  title: string
  categoryId: string
  difficulty: number
  frequency: QuestFrequency
  frequencyTarget: number
  frequencyPeriod: FrequencyPeriod
  streak: number
  completedDates: string[]
  createdAt: unknown
  updatedAt: unknown
}

export interface QuestRecord extends QuestDocument {
  id: string
}

export interface QuestProgress {
  current: number
  target: number
}

export interface QuestView {
  id: string
  title: string
  type: string
  category: string
  categoryId: string
  difficulty: number
  frequency: QuestFrequency
  frequencyTarget: number
  frequencyPeriod: FrequencyPeriod
  streak: number
  xpReward: number
  completed: boolean
  progress: QuestProgress
}
