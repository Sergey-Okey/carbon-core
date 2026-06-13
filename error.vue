<template>
  <main class="error-page">
    <header class="error-header">
      <NuxtLink class="brand" to="/" @click.prevent="goHome">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span>COF</span>
      </NuxtLink>
      <span class="status-label">Системное сообщение</span>
    </header>

    <section class="error-content">
      <div class="error-code" aria-hidden="true">{{ statusCode }}</div>

      <div class="error-copy">
        <span class="eyebrow">{{ content.eyebrow }}</span>
        <h1>{{ content.title }}</h1>
        <p>{{ content.description }}</p>

        <div class="error-actions">
          <AppButton variant="primary" @click="handlePrimaryAction">
            <RefreshCw v-if="content.primaryAction === 'reload'" :size="17" />
            <Home v-else :size="17" />
            {{ content.primaryLabel }}
          </AppButton>
          <AppButton variant="secondary" @click="goHome">
            На главную
          </AppButton>
        </div>
      </div>
    </section>

    <footer class="error-footer">
      <span>Core of Life</span>
      <span>Код ошибки: {{ statusCode }}</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Home, RefreshCw } from 'lucide-vue-next'
import type { NuxtError } from '#app'
import AppButton from '~/components/ui/AppButton.vue'

const props = defineProps<{ error: NuxtError }>()

type ErrorContent = {
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryAction: 'home' | 'reload'
}

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

const content = computed<ErrorContent>(() => {
  const messages: Record<number, ErrorContent> = {
    403: {
      eyebrow: 'Доступ ограничен',
      title: 'Эта страница недоступна',
      description: 'У текущего профиля нет доступа к этому разделу.',
      primaryLabel: 'Вернуться в приложение',
      primaryAction: 'home',
    },
    404: {
      eyebrow: 'Страница не найдена',
      title: 'Такого маршрута нет',
      description: 'Возможно, ссылка устарела или страница была перемещена.',
      primaryLabel: 'Вернуться в приложение',
      primaryAction: 'home',
    },
    429: {
      eyebrow: 'Слишком много запросов',
      title: 'Нужна небольшая пауза',
      description: 'Подождите немного и повторите действие.',
      primaryLabel: 'Попробовать снова',
      primaryAction: 'reload',
    },
    503: {
      eyebrow: 'Технические работы',
      title: 'Сервис временно недоступен',
      description: 'Мы уже восстанавливаем работу. Ваши локальные данные останутся на устройстве.',
      primaryLabel: 'Проверить снова',
      primaryAction: 'reload',
    },
  }

  return messages[statusCode.value] || {
    eyebrow: 'Техническая ошибка',
    title: 'Что-то пошло не так',
    description: 'Перезапустите страницу. Если ошибка повторится, вернитесь в приложение.',
    primaryLabel: 'Перезагрузить страницу',
    primaryAction: 'reload',
  }
})

function goHome() {
  clearError({ redirect: '/' })
}

function handlePrimaryAction() {
  if (content.value.primaryAction === 'reload') {
    window.location.reload()
    return
  }
  goHome()
}
</script>

<style scoped lang="scss">
.error-page {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(16px, 3vw, 32px);
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
}

.error-header,
.error-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--dim);
  font-size: 0.75rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 700;

  img {
    width: 30px;
    height: 30px;
  }
}

.status-label {
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.error-content {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(280px, 1fr);
  align-items: center;
  gap: clamp(32px, 8vw, 120px);
  width: min(100%, 980px);
  margin: auto;
}

.error-code {
  min-width: 0;
  width: 100%;
  color: color-mix(in srgb, var(--text) 13%, transparent);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(7rem, 16vw, 13rem);
  font-weight: 700;
  letter-spacing: -0.07em;
  line-height: 0.76;
  text-align: center;
  white-space: nowrap;
  user-select: none;
}

.error-copy {
  max-width: 520px;

  h1 {
    margin: 10px 0 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 5vw, 4.4rem);
    font-weight: 700;
    letter-spacing: -0.055em;
    line-height: 0.98;
  }

  p {
    max-width: 46ch;
    margin: 0;
    color: var(--dim);
    font-size: clamp(0.92rem, 1.6vw, 1.05rem);
    line-height: 1.6;
  }
}

.eyebrow {
  color: var(--dim);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 28px;
}

.error-footer {
  padding-top: 16px;
  border-top: var(--ui-border);
}

@media (max-width: 680px) {
  .error-page {
    padding: 16px;
  }

  .status-label {
    display: none;
  }

  .error-content {
    grid-template-columns: 1fr;
    align-content: center;
    gap: 28px;
  }

  .error-code {
    font-size: clamp(5.5rem, 27vw, 8rem);
    text-align: left;
  }

  .error-copy h1 {
    max-width: 12ch;
  }

  .error-actions {
    display: grid;
    grid-template-columns: 1fr;

    :deep(.app-button) {
      width: 100%;
    }
  }

  .error-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
