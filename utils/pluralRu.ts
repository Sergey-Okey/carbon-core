
export function pluralRu(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(Math.trunc(count)) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}

export function formatNotificationCountRu(count: number): string {
  if (!count) return 'Нет уведомлений'
  const word = pluralRu(count, 'уведомление', 'уведомления', 'уведомлений')
  return `${count} ${word}`
}
