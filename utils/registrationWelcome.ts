export const WELCOME_REGISTRATION_FLAG = 'cof-welcome-registration'

export const WELCOME_TOAST_MESSAGE = 'Добро пожаловать в Core of Life! Аккаунт создан.'

export const WELCOME_INBOX_TITLE = 'Добро пожаловать'

export const WELCOME_INBOX_MESSAGE = [
  'Регистрация прошла успешно. Коротко, как пользоваться:',
  '',
  '• Доска — ветки целей и вехи, ваш общий план.',
  '• Задачи — привычки и дневные дела; привычки копятся, задачи закрывают день.',
  '• Фокус — таймер для глубокой работы без отвлечений.',
  '• Теги и аналитика — ритм за неделю и прогресс по направлениям.',
  '',
  'Начните с одной ветки и пары привычек — остальное нарастите по ходу.',
].join('\n')

export function markWelcomeRegistrationPending() {
  if (!import.meta.client) return
  sessionStorage.setItem(WELCOME_REGISTRATION_FLAG, '1')
}

export function consumeWelcomeRegistrationPending() {
  if (!import.meta.client) return false
  if (sessionStorage.getItem(WELCOME_REGISTRATION_FLAG) !== '1') return false
  sessionStorage.removeItem(WELCOME_REGISTRATION_FLAG)
  return true
}
