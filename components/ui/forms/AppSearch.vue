<template>
  <div
    class="app-search-root"
    :class="[`variant-${variant}`, `size-${size}`, { open: isPanelOpen }]"
  >
    <label
      class="app-search"
      :class="[{ focused: isFocused, filled: hasValue }]"
    >
      <span class="icon leading" aria-hidden="true">
        <Search :size="iconSize" :stroke-width="2.2" />
      </span>

      <input
        ref="inputRef"
        class="field"
        type="search"
        role="combobox"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="ariaLabel"
        :aria-expanded="isPanelOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="activeOptionId"
        :data-disabled="disabled ? '' : undefined"
        autocomplete="off"
        spellcheck="false"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <span v-if="hasValue && results" class="counter" aria-live="polite">
        {{ counterLabel }}
      </span>

      <button
        v-if="hasValue && clearable && !disabled"
        type="button"
        class="clear"
        aria-label="Очистить поиск"
        @mousedown.prevent
        @click="clear"
      >
        <X :size="iconSize - 2" :stroke-width="2.4" />
      </button>
    </label>

    <div
      v-if="isPanelOpen"
      :id="listboxId"
      class="app-search-panel"
      role="listbox"
      :aria-label="ariaLabel"
    >
      <button
        v-for="result in results"
        :id="optionId(result.id)"
        :key="result.id"
        type="button"
        class="result"
        role="option"
        :aria-selected="result.id === activeId"
        :class="{ active: result.id === activeId }"
        @mousedown.prevent
        @click="selectResult(result.id)"
      >
        <span class="result-label">
          <template v-for="(part, index) in highlightParts(result.label)" :key="`${result.id}-${index}`">
            <mark v-if="part.match">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </span>
        <span v-if="result.kind" class="result-kind">{{ result.kind }}</span>
      </button>

      <p v-if="!results.length" class="empty">Ничего не найдено</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

export type AppSearchResult = {
  id: string
  label: string
  kind?: string
}

type HighlightPart = {
  text: string
  match: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    clearable?: boolean
    size?: 'sm' | 'md'
    /** default — form field; compact — toolbar / dense chrome */
    variant?: 'default' | 'compact'
    results?: AppSearchResult[]
    activeId?: string | null
  }>(),
  {
    modelValue: '',
    placeholder: 'Поиск',
    ariaLabel: 'Поиск',
    disabled: false,
    clearable: true,
    size: 'md',
    variant: 'default',
    results: undefined,
    activeId: null,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:activeId', value: string | null): void
  (e: 'enter'): void
  (e: 'clear'): void
  (e: 'select', id: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const listboxId = `app-search-${Math.random().toString(36).slice(2, 9)}`

const hasValue = computed(() => props.modelValue.trim().length > 0)
const hasResultsProp = computed(() => Array.isArray(props.results))
const results = computed(() => props.results ?? [])
const iconSize = computed(() => (props.size === 'sm' || props.variant === 'compact' ? 16 : 18))
const isPanelOpen = computed(
  () => hasResultsProp.value && isFocused.value && hasValue.value && !props.disabled
)

const activeId = computed(() => props.activeId ?? null)
const activeOptionId = computed(() =>
  activeId.value ? optionId(activeId.value) : undefined
)

const activeIndex = computed(() =>
  activeId.value ? results.value.findIndex((item) => item.id === activeId.value) : -1
)

const counterLabel = computed(() => {
  if (!results.value.length) return '0'
  const index = activeIndex.value >= 0 ? activeIndex.value + 1 : 1
  return `${index}/${results.value.length}`
})

watch(
  () => [props.modelValue, results.value.map((item) => item.id).join('|')] as const,
  () => {
    if (!hasResultsProp.value || !hasValue.value) {
      if (activeId.value) emit('update:activeId', null)
      return
    }
    if (!results.value.length) {
      emit('update:activeId', null)
      return
    }
    const stillActive = results.value.some((item) => item.id === activeId.value)
    if (!stillActive) emit('update:activeId', results.value[0].id)
  }
)

function optionId(id: string) {
  return `${listboxId}-option-${id}`
}

function highlightParts(label: string): HighlightPart[] {
  const query = props.modelValue.trim()
  if (!query) return [{ text: label, match: false }]

  const lowerLabel = label.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const parts: HighlightPart[] = []
  let cursor = 0

  while (cursor < label.length) {
    const index = lowerLabel.indexOf(lowerQuery, cursor)
    if (index === -1) {
      parts.push({ text: label.slice(cursor), match: false })
      break
    }
    if (index > cursor) {
      parts.push({ text: label.slice(cursor, index), match: false })
    }
    parts.push({ text: label.slice(index, index + query.length), match: true })
    cursor = index + query.length
  }

  return parts.length ? parts : [{ text: label, match: false }]
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onFocus() {
  isFocused.value = true
}

function onBlur() {
  window.setTimeout(() => {
    isFocused.value = false
  }, 120)
}

function clear() {
  emit('update:modelValue', '')
  emit('update:activeId', null)
  emit('clear')
  inputRef.value?.focus()
}

function selectResult(id: string) {
  emit('update:activeId', id)
  emit('select', id)
  inputRef.value?.focus()
}

function moveActive(delta: number) {
  if (!results.value.length) return
  const current = activeIndex.value >= 0 ? activeIndex.value : 0
  const next = (current + delta + results.value.length) % results.value.length
  emit('update:activeId', results.value[next].id)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    if (!isPanelOpen.value) return
    event.preventDefault()
    moveActive(1)
    return
  }
  if (event.key === 'ArrowUp') {
    if (!isPanelOpen.value) return
    event.preventDefault()
    moveActive(-1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    if (isPanelOpen.value && activeId.value) {
      emit('select', activeId.value)
      return
    }
    emit('enter')
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    if (hasValue.value) {
      clear()
      return
    }
    inputRef.value?.blur()
  }
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<style scoped lang="scss">
.app-search-root {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  inline-size: 100%;

  &.variant-compact {
    inline-size: auto;
  }
}

.app-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  inline-size: 100%;
  padding-inline: var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-xs);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard),
    color var(--transition-standard);

  .size-md & {
    min-height: var(--control-height-md);
  }

  .size-sm & {
    min-height: var(--control-height-sm);
    padding-inline: var(--space-2);
    gap: var(--space-1);
  }

  .variant-compact & {
    inline-size: auto;
    min-height: var(--control-icon-size);
    height: var(--control-icon-size);
    padding-inline: 8px 6px;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--color-bg, var(--bg)) 35%, transparent);
    box-shadow: none;
    border-color: transparent;

    .field {
      width: 132px;
      font-size: 0.8rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:has([data-disabled])) {
      border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
      color: var(--color-text-primary);
    }

    .variant-compact &:hover:not(:has([data-disabled])) {
      border-color: transparent;
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }
  }

  &.focused {
    color: var(--color-text-primary);
    border-color: var(--color-accent);
    background: var(--color-surface-2);
    box-shadow: var(--shadow-sm);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  .variant-compact &.focused {
    border-color: transparent;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    box-shadow: none;
    outline: none;
  }

  .icon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: inherit;
    pointer-events: none;
  }

  .field {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    line-height: var(--leading-tight);
    appearance: none;
    -webkit-appearance: none;

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 1;
    }

    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      appearance: none;
      display: none;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .counter {
    flex: 0 0 auto;
    color: var(--color-text-muted);
    font-size: 0.68rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .clear {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      color: var(--color-text-primary);
      background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
      outline-offset: 1px;
    }
  }

  &:has([data-disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.app-search-panel {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 220px;
  padding: 6px;
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-md, var(--shadow-sm));

  .variant-default & {
    top: calc(100% + 6px);
  }

  .variant-compact & {
    right: auto;
    bottom: calc(100% + 8px);
    width: max(220px, 100%);
  }
}

.result {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-standard);

  &:hover,
  &.active {
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }
}

.result-label {
  min-width: 0;
  font-size: 0.82rem;
  line-height: 1.35;
  overflow-wrap: anywhere;

  mark {
    padding: 0;
    border-radius: 2px;
    background: color-mix(in srgb, var(--color-accent) 28%, transparent);
    color: inherit;
    font-weight: 700;
  }
}

.result-kind {
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.empty {
  margin: 0;
  padding: 10px 8px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  text-align: center;
}

@media (pointer: coarse), (max-width: 767px) {
  .size-md .app-search,
  .size-sm .app-search {
    min-height: var(--space-11);
  }

  .variant-compact .app-search {
    min-height: 44px;
    height: 44px;

    .field {
      width: 96px;
      font-size: var(--text-md);
    }
  }
}
</style>
