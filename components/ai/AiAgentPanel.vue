<template>
  <Teleport to="body">
    <Transition name="sheet-backdrop">
      <button
        type="button"
        class="sheet-backdrop"
        aria-label="Закрыть агента"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="agent-widget" appear>
      <form
        ref="shellRef"
        class="agent-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Агент"
        @submit.prevent="submit"
        @click.stop
        @keydown.esc.prevent="emit('close')"
      >
        <header class="agent-head">
          <div class="agent-handle" aria-hidden="true" />
          <div class="panel-head-text">
            <h3>Агент</h3>
            <p class="panel-head-note">Меняет доску, задачи и привычки</p>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            icon-only
            aria-label="Закрыть агента"
            @click="emit('close')"
          >
            <X :size="20" />
          </AppButton>
        </header>

        <div class="agent-panel">
      <div ref="threadRef" class="agent-thread" role="log" aria-live="polite" aria-relevant="additions">
        <div v-if="showEmpty" class="agent-empty">
          <p>Напишите, что изменить — доску, привычки или задачи.</p>
          <div class="agent-suggestions">
            <button
              v-for="hint in suggestions"
              :key="hint"
              type="button"
              class="agent-chip"
              :disabled="pending || typing"
              @click="submitHint(hint)"
            >
              {{ hint }}
            </button>
          </div>
        </div>

        <div
          v-for="row in visibleThread"
          :key="row.id"
          class="agent-row"
          :class="row.role"
        >
          <div class="agent-bubble" :class="{ failed: row.failed }">
            <p class="agent-text">{{ visibleText(row) }}</p>
            <div v-if="row.links?.length && !isStreaming(row.id)" class="agent-links">
              <button
                v-for="link in row.links"
                :key="`${link.kind}-${link.id}`"
                type="button"
                class="agent-link"
                :aria-label="linkAria(link)"
                @click="openLink(link)"
              >
                <span class="agent-link-kind" aria-hidden="true">{{ kindLabel(link) }}</span>
                <span class="agent-link-name">{{ link.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="liveRequest" class="agent-row user">
          <div class="agent-bubble">
            <p class="agent-text">{{ liveRequest }}</p>
          </div>
        </div>

        <div v-if="typing" class="agent-row assistant">
          <div class="agent-bubble is-waiting" aria-label="Агент печатает">
            <span class="agent-typing" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>
        </div>

        <div v-if="liveError && !typing" class="agent-row assistant">
          <div class="agent-bubble failed">
            <p class="agent-text">{{ liveError }}</p>
          </div>
        </div>
        </div>

        <div class="agent-composer" :class="{ 'is-waiting': typing }">
          <textarea
            ref="composerRef"
            v-model="request"
            class="agent-input"
            rows="1"
            maxlength="2000"
            placeholder="Сообщение агенту"
            aria-label="Сообщение агенту"
            @keydown.enter.exact.prevent="submit"
            @input="resizeComposer"
          />
          <AppButton
            type="submit"
            variant="primary"
            icon-only
            :disabled="!canSubmit"
            aria-label="Отправить"
          >
            <ArrowUp :size="18" />
          </AppButton>
        </div>
        </div>
      </form>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowUp, X } from 'lucide-vue-next'
import type { AiEntityRef, AiMemoryEntry } from '~/types/ai.types'
import { useAiAgent } from '~/composables/useAiAgent'
import { linksFromQuotedTitles, stripPublicFallbackNotice } from '~/utils/ai/chat'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const uiStore = useUIStore()
const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { ask, pending, memory, liveRequest, liveError } = useAiAgent()
const request = ref('')
const composerRef = ref<HTMLTextAreaElement | null>(null)
const threadRef = ref<HTMLElement | null>(null)
const shellRef = ref<HTMLElement | null>(null)
const streamId = ref('')
const streamed = ref('')
const shouldStream = ref(false)
const typing = ref(false)
const heldRowId = ref('')
let streamTimer: number | null = null
let typingTimer: number | null = null
let typingUntil = 0
let queuedStream: { id: string; text: string } | null = null

// The local agent can answer in under 100 ms, so the dots need a floor to be seen.
const TYPING_MIN_MS = 700

const suggestions = [
  'Что делать сегодня?',
  'Разложи текущие цели на этапы',
  'Добавь привычку читать 20 минут',
]

type ChatRow = {
  id: string
  role: 'user' | 'assistant'
  text: string
  links?: AiEntityRef[]
  failed?: boolean
}

const showEmpty = computed(
  () => !memory.value.length && !liveRequest.value && !pending.value && !liveError.value
)

const canSubmit = computed(
  () => request.value.trim().length > 1 && !pending.value && !typing.value
)

const thread = computed<ChatRow[]>(() => {
  const catalog = {
    tasks: tasksStore.tasks.map((task) => ({ id: task.id, title: task.title })),
    branches: branchesStore.branches.map((branch) => ({
      id: branch.id,
      displayName: branch.displayName,
      milestones: (branch.milestones || []).map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
      })),
    })),
  }
  const rows: ChatRow[] = []
  for (const entry of [...memory.value].slice().reverse() as AiMemoryEntry[]) {
    const text = stripPublicFallbackNotice(entry.message)
    rows.push({ id: `u-${entry.at}`, role: 'user', text: entry.request })
    rows.push({
      id: `a-${entry.at}`,
      role: 'assistant',
      text,
      links: entry.links?.length ? entry.links : linksFromQuotedTitles(text, catalog),
    })
  }
  return rows
})

const visibleThread = computed(() =>
  thread.value.filter((row) => row.id !== heldRowId.value)
)

function isHabitLink(link: AiEntityRef) {
  if (link.kind !== 'task') return false
  return tasksStore.tasks.find((task) => task.id === link.id)?.type === 'HABIT'
}

function kindLabel(link: AiEntityRef) {
  if (link.kind === 'branch') return 'Ветка'
  if (link.kind === 'milestone') return 'Этап'
  if (link.kind === 'tag') return 'Тег'
  if (link.kind === 'reward') return 'Награда'
  return isHabitLink(link) ? 'Привычка' : 'Задача'
}

function linkAria(link: AiEntityRef) {
  return `${kindLabel(link)} ${link.label}`
}

function isStreaming(id: string) {
  return streamId.value === id && streamed.value !== thread.value.find((row) => row.id === id)?.text
}

function visibleText(row: ChatRow) {
  if (row.role === 'assistant' && streamId.value === row.id && streamed.value) return streamed.value
  return row.text
}

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function stopStream() {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer)
    streamTimer = null
  }
}

function startStream(id: string, text: string) {
  stopStream()
  streamId.value = id
  if (prefersReducedMotion() || text.length < 4) {
    streamed.value = text
    return
  }
  streamed.value = ''
  let index = 0
  const step = Math.max(3, Math.ceil(text.length / 28))
  streamTimer = window.setInterval(() => {
    index += step
    streamed.value = text.slice(0, index)
    scrollThread()
    if (index >= text.length) stopStream()
  }, 16)
}

function scrollThread() {
  const root = threadRef.value
  if (!root) return
  root.scrollTop = root.scrollHeight
}

function resizeComposer() {
  const el = composerRef.value
  if (!el) return
  el.style.height = 'auto'
  const maxHeight = Number.parseFloat(getComputedStyle(el).maxHeight)
  const cap = Number.isFinite(maxHeight) ? maxHeight : Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--space-16')
  ) * 2
  el.style.height = `${Math.min(el.scrollHeight, cap)}px`
}

function isMobileViewport() {
  return import.meta.client && window.matchMedia('(max-width: 767px)').matches
}

function firstTaskId(link: AiEntityRef) {
  if (link.kind === 'task') return link.id
  if (link.kind === 'milestone') {
    for (const branch of branchesStore.branches) {
      const milestone = (branch.milestones || []).find((item) => item.id === link.id)
      if (milestone?.taskIds?.[0]) return milestone.taskIds[0]
    }
  }
  if (link.kind === 'branch') {
    const branch = branchesStore.branches.find((item) => item.id === link.id)
    for (const milestone of branch?.milestones || []) {
      if (milestone.taskIds?.[0]) return milestone.taskIds[0]
    }
  }
  return ''
}

function openLink(link: AiEntityRef) {
  if (link.kind === 'task') {
    uiStore.navigateToTarget({ kind: 'task', id: link.id })
    emit('close')
    return
  }
  if (link.kind !== 'branch' && link.kind !== 'milestone') return
  if (isMobileViewport()) {
    const taskId = firstTaskId(link)
    if (taskId) uiStore.navigateToTarget({ kind: 'task', id: taskId })
    else uiStore.setActiveNav('tasks')
    emit('close')
    return
  }
  uiStore.navigateToTarget({ kind: link.kind, id: link.id })
  emit('close')
}

async function submit() {
  if (!canSubmit.value) return
  const text = request.value
  request.value = ''
  nextTick(resizeComposer)
  shouldStream.value = true
  const ok = await ask(text)
  if (!ok && !request.value.trim()) {
    request.value = text
    nextTick(resizeComposer)
  }
}

function submitHint(hint: string) {
  request.value = hint
  void submit()
}

watch(
  () => uiStore.aiDraft,
  (draft) => {
    if (!draft || pending.value) return
    request.value = uiStore.consumeAiDraft()
    nextTick(() => {
      resizeComposer()
      void submit()
    })
  },
  { immediate: true }
)

function stopTypingTimer() {
  if (typingTimer === null) return
  window.clearTimeout(typingTimer)
  typingTimer = null
}

function releaseTyping() {
  typing.value = false
  heldRowId.value = ''
  const next = queuedStream
  queuedStream = null
  if (next) startStream(next.id, next.text)
}

watch(pending, (value) => {
  if (value) {
    stopTypingTimer()
    typingUntil = Date.now() + TYPING_MIN_MS
    typing.value = true
    return
  }
  const rest = Math.max(0, typingUntil - Date.now())
  if (!rest) {
    releaseTyping()
    return
  }
  typingTimer = window.setTimeout(() => {
    typingTimer = null
    releaseTyping()
  }, rest)
})

watch(
  () => memory.value[0]?.at,
  (at) => {
    if (!at || !shouldStream.value) return
    shouldStream.value = false
    const id = `a-${at}`
    const text = stripPublicFallbackNotice(memory.value[0]?.message || '')
    if (typing.value) {
      // Hold the answer back so the dots are not overtaken by the reply.
      heldRowId.value = id
      queuedStream = { id, text }
      return
    }
    startStream(id, text)
  }
)

watch([thread, typing, liveRequest, liveError, streamed], () => {
  nextTick(scrollThread)
})

function handleDocumentClick(event: MouseEvent) {
  if (!import.meta.client || isMobileViewport()) return
  const target = event.target as Node
  if (shellRef.value?.contains(target)) return
  const trigger = document.querySelector('.header-agent-button')
  if (trigger?.contains(target)) return
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function syncBodyLock(locked: boolean) {
  if (!import.meta.client) return
  document.body.style.overflow = locked && isMobileViewport() ? 'hidden' : ''
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  syncBodyLock(true)
  nextTick(() => {
    resizeComposer()
    scrollThread()
    composerRef.value?.focus()
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  syncBodyLock(false)
  stopStream()
  stopTypingTimer()
})
</script>

<style scoped lang="scss">
.agent-shell {
  @include glass;
  position: fixed;
  inset-block-start: calc(var(--overlay-offset-top) + env(safe-area-inset-top, 0px));
  inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  inline-size: min(380px, calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  block-size: min(480px, calc(100dvh - var(--overlay-offset-block) - env(safe-area-inset-bottom, 0px)));
  overflow: hidden;
  margin: 0;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: none;
}

.agent-head {
  @include panel-head;
}

.sheet-backdrop {
  display: none;
}

.agent-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.agent-handle {
  display: none;
  width: var(--space-9);
  height: var(--space-1);
  margin: 0 auto var(--space-2);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-muted) 55%, transparent);
}

.agent-thread {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
  padding: var(--space-3) var(--space-4);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.agent-empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: auto;
  margin-bottom: auto;
  min-width: 0;

  p {
    @include meta-text;
    overflow-wrap: break-word;
  }
}

.agent-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-width: 0;
}

.agent-chip,
.agent-link {
  min-width: 0;
  max-width: 100%;
  padding: var(--space-2) var(--space-3);
  overflow: hidden;
  border: var(--ui-border);
  background: var(--color-surface-1);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  line-height: var(--leading-tight);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.agent-chip {
  @include text-ellipsis;
  border-radius: var(--radius-full);

  &:hover:not(:disabled) {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.agent-row {
  display: flex;
  min-width: 0;

  &.user {
    justify-content: flex-end;
  }

  &.assistant {
    justify-content: flex-start;
  }
}

.agent-bubble {
  @include nest-shell(var(--radius-lg), var(--space-3));
  width: fit-content;
  max-width: min(100%, 420px);
  min-width: 0;
  background: var(--color-surface-2);
  color: #f4f4f4;

  &.failed {
    background: color-mix(in srgb, var(--color-error) 10%, var(--color-surface-2));
  }

  :global(html.light-theme) & {
    color: var(--color-text-primary);
  }
}

.agent-row.user .agent-bubble {
  background: color-mix(in srgb, var(--accent) 16%, var(--color-surface-2));
}

.agent-text {
  margin: 0;
  min-width: 0;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
  text-align: start;
  overflow-wrap: break-word;
  word-break: normal;
  white-space: pre-wrap;
}

.agent-typing {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--space-5);
}

.agent-typing i {
  display: block;
  width: var(--space-2);
  height: var(--space-2);
  border-radius: var(--radius-full);
  background: #fff;
  animation: agent-typing 1.1s ease-in-out infinite;

  :global(html.light-theme) & {
    background: var(--color-text-primary);
  }

  &:nth-child(2) {
    animation-delay: 0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0.32s;
  }
}

@keyframes agent-typing {
  0%,
  80%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(calc(-1 * var(--space-1)));
  }
}

.agent-links {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  min-width: 0;
  margin-top: var(--space-3);
}

.agent-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  @include nest-item;
  color: var(--color-text-primary);

  &:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
}

.agent-link-kind {
  color: var(--color-text-muted);
  flex: 0 0 auto;
}

.agent-link-name {
  flex: 1;
  min-width: 0;
  @include text-ellipsis;
}

.agent-bubble.is-waiting {
  width: fit-content;
}

.agent-composer {
  @include island-shell;
  @include neon-wait-edge;
  align-items: flex-end;
  gap: var(--island-gap);
  height: auto;
  margin: var(--space-3) var(--space-4);
  width: auto;

  :deep(.app-button) {
    @include island-control;
    flex-shrink: 0;
  }
}

.agent-input {
  @include island-field;
  flex: 1;
  height: var(--island-item);
  min-height: var(--island-item);
  max-height: calc(2 * var(--space-16));
  overflow-x: hidden;
  overflow-y: auto;
  resize: none;

  @include mobile {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-typing i {
    animation: none;
    opacity: 0.7;
  }

  .agent-widget-enter-active,
  .agent-widget-leave-active,
  .sheet-backdrop-enter-active,
  .sheet-backdrop-leave-active {
    animation: none;
    transition: none;
  }
}

.agent-widget-enter-active,
.agent-widget-leave-active,
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition:
    opacity var(--transition-emphasized),
    transform var(--transition-emphasized);
}

.agent-widget-enter-from,
.agent-widget-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--space-4)));
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

@include mobile {
  .sheet-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-modal) - 1);
    margin: 0;
    padding: 0;
    border: none;
    background: color-mix(in srgb, var(--color-bg) 48%, transparent);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .agent-shell {
    inset-block-start: auto;
    inset-block-end: 0;
    inset-inline: 0;
    z-index: var(--z-modal);
    inline-size: 100%;
    max-inline-size: none;
    block-size: min(92dvh, 760px);
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    background-color: var(--color-bg, #121212);
  }

  .agent-head {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block-start: var(--space-2);
  }

  .agent-handle {
    display: block;
    grid-column: 1 / -1;
  }

  .agent-widget-enter-from,
  .agent-widget-leave-to {
    transform: translateY(100%);
  }

  .agent-thread {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-3);
  }

  .agent-bubble {
    max-width: 92%;
  }

  .agent-chip,
  .agent-link {
    min-height: var(--space-9);
    padding: var(--space-2) var(--space-3);
  }

  .agent-input {
    min-height: var(--island-item);
  }

  .agent-composer {
    margin: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
