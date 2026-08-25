<template>
  <section class="ai-hub" aria-label="Агент">
    <div class="ai-hub__hero">
      <p class="ai-hub__kicker">Ассистент</p>
      <h1 class="ai-hub__title">
        <span>{{ helloLine }}</span>
        <span>Чем помочь сегодня?</span>
      </h1>
    </div>

    <div class="ai-hub__actions">
      <button
        v-for="card in prompts"
        :key="card.hint"
        type="button"
        class="ai-hub__chip"
        :style="{
          '--chip-x': card.x,
          '--chip-y': card.y,
          '--chip-rot': card.rot,
          '--chip-dur': card.dur,
          '--chip-delay': card.delay,
        }"
        @click="openChat(card.hint)"
      >
        <component :is="card.icon" :size="16" :stroke-width="2" aria-hidden="true" />
        <span>{{ card.title }}</span>
      </button>
    </div>

    <BoardDock v-if="!uiStore.showAiAgent">
      <form class="ai-hub__composer" @submit.prevent="submitDraft">
        <input
          v-model="draft"
          class="ai-hub__input"
          type="text"
          maxlength="2000"
          placeholder="Спросите что угодно..."
          aria-label="Сообщение агенту"
          autocomplete="off"
        />
        <button
          type="submit"
          class="ai-hub__send"
          :disabled="!canSend"
          aria-label="Отправить"
        >
          <ArrowUp :size="18" :stroke-width="2.4" />
        </button>
      </form>
    </BoardDock>
  </section>
</template>

<script setup lang="ts">
import {
  ArrowUp,
  CalendarDays,
  GitBranch,
  ListTodo,
  Repeat,
  Sparkles,
} from 'lucide-vue-next'

const uiStore = useUIStore()
const userStore = useUserStore()
const draft = ref('')

const prompts = [
  { title: 'Что делать сегодня', hint: 'Что делать сегодня?', icon: ListTodo, x: '-26px', y: '16px', rot: '-9deg', dur: '5.4s', delay: '0s' },
  { title: 'Разложить цели', hint: 'Разложи текущие цели на этапы', icon: GitBranch, x: '22px', y: '-20px', rot: '7deg', dur: '6.2s', delay: '0.25s' },
  { title: 'Новая привычка', hint: 'Добавь привычку читать 20 минут', icon: Repeat, x: '32px', y: '18px', rot: '-6deg', dur: '4.8s', delay: '0.12s' },
  { title: 'План на неделю', hint: 'Собери план на неделю по текущим задачам', icon: CalendarDays, x: '-18px', y: '-14px', rot: '8deg', dur: '6.8s', delay: '0.4s' },
  { title: 'Сводка по доске', hint: 'Кратко расскажи, что сейчас на доске', icon: Sparkles, x: '10px', y: '24px', rot: '-7deg', dur: '5.6s', delay: '0.2s' },
]

const helloLine = computed(() => {
  const hour = new Date().getHours()
  const hello =
    hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const raw = userStore.profile.name.trim()
  const first = raw.split(/\s+/)[0] || ''
  if (!first || first.toLowerCase() === 'cof') return `${hello}.`
  return `${hello}, ${first}.`
})

const canSend = computed(() => draft.value.trim().length > 1)

function openChat(hint = '') {
  uiStore.openAiAgent(hint)
}

function submitDraft() {
  const text = draft.value.trim()
  if (text.length < 2) {
    openChat()
    return
  }
  uiStore.openAiAgent(text)
  draft.value = ''
}
</script>

<style scoped lang="scss">
.ai-hub {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-6);
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: var(--space-2) 0 calc(var(--control-height-md) + var(--space-8));
  animation: hub-enter var(--duration-emphasized) var(--ease-emphasized) both;
}

.ai-hub__hero {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  text-align: center;
}

.ai-hub__kicker,
.ai-hub__title,
.ai-hub__chip span {
  min-width: 0;
}

.ai-hub__kicker {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  line-height: var(--leading-tight);
  text-transform: uppercase;
  animation: hub-copy-in var(--duration-emphasized) var(--ease-emphasized) both;
}

.ai-hub__title {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  max-width: 18ch;
  color: var(--color-text-primary);
  font-size: clamp(var(--text-xl), 7vw, var(--text-2xl));
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  animation: hub-copy-in var(--duration-emphasized) var(--ease-emphasized) calc(var(--duration-fast) + 80ms) both;

  span {
    @include text-clamp(2);
    overflow-wrap: break-word;
  }
}

.ai-hub__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-4) var(--space-3);
  min-width: 0;
  padding: var(--space-4) var(--space-2) var(--space-6);
}

.ai-hub__chip {
  @include glass;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 100%;
  min-width: 0;
  min-height: var(--control-height-sm);
  padding: var(--space-2) var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background-color: color-mix(in srgb, var(--color-surface-1) 94%, var(--color-bg));
  backdrop-filter: blur(24px) saturate(1.55);
  -webkit-backdrop-filter: blur(24px) saturate(1.55);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  cursor: pointer;
  animation:
    hub-chip-in var(--duration-emphasized) var(--ease-emphasized) both,
    hub-chip-drift var(--chip-dur, 8s) ease-in-out var(--chip-delay, 0s) infinite;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  svg {
    flex: 0 0 auto;
    color: var(--color-text-primary);
  }

  span {
    @include text-ellipsis;
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
    animation-play-state: paused;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: var(--color-surface-1);
      border-color: color-mix(in srgb, var(--color-accent) 40%, var(--ui-border-color));
      animation-play-state: paused;
    }
  }

  :global(html.light-theme) & {
    background-color: var(--color-surface-1);
    box-shadow: var(--shadow-sm);
  }
}

.ai-hub__composer {
  @include glass;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-sizing: border-box;
  width: 100%;
  height: var(--board-island-height, calc(var(--space-12) + 2 * var(--space-2)));
  min-height: var(--board-island-height, calc(var(--space-12) + 2 * var(--space-2)));
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background-color: var(--island-surface);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
  box-shadow: var(--shadow-xs);

  :global(html.light-theme) & {
    box-shadow: var(--shadow-sm);
  }
}

.ai-hub__send {
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  width: var(--space-12);
  height: var(--space-12);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-bg);
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }
}

.ai-hub__input {
  flex: 1;
  min-width: 0;
  height: var(--space-12);
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: var(--space-12);
  appearance: none;

  @include mobile {
    font-size: 16px;
  }

  &::placeholder {
    color: var(--color-text-muted);
    line-height: var(--space-12);
  }

  &:focus {
    outline: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-hub,
  .ai-hub__chip,
  .ai-hub__kicker,
  .ai-hub__title {
    animation: none;
    transform: none;
  }
}

@keyframes hub-enter {
  from {
    opacity: 0;
    transform: translateY(var(--space-6));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hub-copy-in {
  from {
    opacity: 0;
    transform: translateY(var(--space-5));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hub-chip-in {
  from {
    opacity: 0;
    transform: translate(0, var(--space-6)) rotate(0deg);
  }

  to {
    opacity: 1;
    transform: translate(var(--chip-x, 0px), var(--chip-y, 0px)) rotate(var(--chip-rot, 0deg));
  }
}

@keyframes hub-chip-drift {
  0%,
  100% {
    transform: translate(var(--chip-x, 0px), var(--chip-y, 0px)) rotate(var(--chip-rot, 0deg));
  }

  35% {
    transform: translate(
        calc(var(--chip-x, 0px) * -0.85),
        calc(var(--chip-y, 0px) * -1.1)
      )
      rotate(calc(var(--chip-rot, 0deg) * -1.15));
  }

  68% {
    transform: translate(
        calc(var(--chip-x, 0px) * 1.2),
        calc(var(--chip-y, 0px) * 0.35)
      )
      rotate(calc(var(--chip-rot, 0deg) * 0.4));
  }
}
</style>
