import { isMailConfigured, sendMail } from './smtp'

type WelcomeMailInput = {
  name: string
  email: string
}

export function buildWelcomeRegistrationMail(input: WelcomeMailInput) {
  const name = input.name.trim() || 'друг'
  return {
    to: input.email.trim().toLowerCase(),
    subject: 'Добро пожаловать в Core of Life',
    text: [
      `${name}, здравствуйте!`,
      '',
      'Регистрация в Core of Life прошла успешно — аккаунт готов к работе.',
      '',
      'С чего начать:',
      '• На доске создайте ветки целей и вехи — это карта вашего прогресса.',
      '• В задачах добавьте привычки и дневные дела: привычки копятся, задачи закрывают день.',
      '• Откройте таймер фокуса, когда нужна глубокая работа без отвлечений.',
      '• Теги и аналитика помогут увидеть ритм за неделю и месяц.',
      '',
      'Если письмо пришло по ошибке — просто проигнорируйте его.',
      '',
      'Берегите фокус и свой ритм.',
      'Core of Life',
    ].join('\n'),
  }
}

export async function sendWelcomeRegistrationMail(input: WelcomeMailInput) {
  if (!isMailConfigured()) return false
  if (!input.email.includes('@')) return false

  try {
    return await sendMail(buildWelcomeRegistrationMail(input))
  } catch (error) {
    console.error('[auth] welcome registration mail failed', error)
    return false
  }
}
