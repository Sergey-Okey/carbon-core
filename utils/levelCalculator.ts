export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100))
}

export function calculateCurrentXP(totalXP: number, level: number): number {
  const xpForCurrentLevel = Math.pow(level, 2) * 100
  return totalXP - xpForCurrentLevel
}

export function calculateNeededXPForNextLevel(level: number): number {
  return Math.pow(level + 1, 2) * 100 - Math.pow(level, 2) * 100
}
