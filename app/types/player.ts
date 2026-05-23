export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export interface AuthUserSeed {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

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

export interface PlayerRecord extends PlayerDocument {
  id: string
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

export interface CategoryRecord extends CategoryDocument {
  id: string
}
