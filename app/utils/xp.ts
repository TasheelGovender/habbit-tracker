export function calculateXpReward(difficulty: number, streak: number): number {
  return difficulty * 10 + streak * 2
}

export function calculateXpToNextLevel(_level: number): number {
  return 100
}

export function calculateLevelUp(
  currentXp: number,
  xpGained: number,
  currentLevel: number,
): { xp: number; level: number } {
  let xp = currentXp + xpGained
  let level = currentLevel

  let threshold = calculateXpToNextLevel(level)
  while (xp >= threshold) {
    xp -= threshold
    level++
    threshold = calculateXpToNextLevel(level)
  }

  return { xp, level }
}
