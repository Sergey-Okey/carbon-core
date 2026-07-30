export function calculateLevel(completedTasks: number): number {
  return Math.floor(completedTasks / 20) + 1
}

export function calculateTasksForNextLevel(level: number, league: string): number {
  const baseTasks = 20

  let leagueMultiplier = 1
  if (league === 'Серебро') leagueMultiplier = 1.25
  else if (league === 'Золото') leagueMultiplier = 1.5
  else if (league === 'Платина') leagueMultiplier = 2

  return Math.floor(baseTasks * level * leagueMultiplier)
}
