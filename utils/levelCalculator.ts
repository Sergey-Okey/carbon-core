export function calculateLevel(completedTasks: number): number {
  // Уровень растет на основе количества выполненных задач
  // Каждые 10 задач = 1 уровень (можно настроить)
  return Math.floor(completedTasks / 20) + 1
}

export function calculateTasksForNextLevel(level: number, league: string): number {
  // Базовое количество задач для уровня = 20
  // Чем выше лига, тем больше задач нужно
  const baseTasks = 20
  
  // Множитель лиги
  let leagueMultiplier = 1
  if (league === 'Серебро') leagueMultiplier = 1.25
  else if (league === 'Золото') leagueMultiplier = 1.5
  else if (league === 'Платина') leagueMultiplier = 2
  
  return Math.floor(baseTasks * level * leagueMultiplier)
}

export function calculateBonusXPForMilestone(requiredXP: number): number {
  // Бонус XP за завершение узла/раздела в ветке (50% от требуемого XP)
  return Math.floor(requiredXP * 0.5)
}
