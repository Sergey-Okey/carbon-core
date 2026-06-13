<template>
  <ErrorDocPage
    :code="statusCode"
    :eyebrow="content.eyebrow"
    :title="content.title"
    :description="content.description"
    :joke="content.joke"
    :primary-label="content.primaryLabel"
    :primary-action="content.primaryAction"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'

const props = defineProps<{ error: NuxtError }>()

type ErrorContent = {
  eyebrow: string
  title: string
  description: string
  joke: string
  primaryLabel: string
  primaryAction: 'home' | 'reload'
}

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

const content = computed<ErrorContent>(() => {
  const messages: Record<number, ErrorContent> = {
    401: {
      eyebrow: 'Нужен вход',
      title: 'Сюда пускают только после знакомства',
      description: 'Чтобы открыть эту часть приложения, сначала войдите в профиль.',
      joke: 'Дверь не заперта. Она просто делает вид, что очень серьёзная.',
      primaryLabel: 'Обновить страницу',
      primaryAction: 'reload',
    },
    403: {
      eyebrow: 'Доступ ограничен',
      title: 'Эта страница пока не для текущего профиля',
      description: 'У текущего профиля нет доступа к этому разделу или действию.',
      joke: 'Охранник вежливый, но сегодня без компромиссов.',
      primaryLabel: 'На главную',
      primaryAction: 'home',
    },
    404: {
      eyebrow: 'Страница не найдена',
      title: 'Похоже, маршрут ушёл в отпуск',
      description: 'Ссылка могла устареть, измениться или страница была перемещена.',
      joke: 'Мы поискали под диваном. Там тоже пусто.',
      primaryLabel: 'На главную',
      primaryAction: 'home',
    },
    429: {
      eyebrow: 'Слишком много запросов',
      title: 'Нужна небольшая пауза',
      description: 'Сервер просит чуть-чуть передохнуть и попробовать ещё раз позже.',
      joke: 'Даже хорошие идеи иногда лучше отправлять по одной.',
      primaryLabel: 'Обновить страницу',
      primaryAction: 'reload',
    },
    500: {
      eyebrow: 'Внутренняя ошибка',
      title: 'Что-то внутри решило импровизировать',
      description: 'Мы не планировали такой сценарий. Попробуйте перезагрузить страницу.',
      joke: 'Код уверял, что всё под контролем. Код, как выяснилось, преувеличивал.',
      primaryLabel: 'Обновить страницу',
      primaryAction: 'reload',
    },
    503: {
      eyebrow: 'Технические работы',
      title: 'Сервис временно недоступен',
      description: 'Сейчас идёт восстановление работы. Попробуйте зайти ещё раз чуть позже.',
      joke: 'Сервер вышел за кофе и обещал вернуться собранным.',
      primaryLabel: 'Проверить снова',
      primaryAction: 'reload',
    },
  }

  return messages[statusCode.value] || messages[500]
})
</script>
