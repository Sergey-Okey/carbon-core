export function clampXP(xp: number, min = 0, max = Infinity): number {
  return Math.min(max, Math.max(min, xp))
}
