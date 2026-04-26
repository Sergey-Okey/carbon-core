# 🏆 Best Practices для Carbon Core

## Дата: 26 апреля 2026

---

## 📋 АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

### 1. Разделение Ответственности (SoC)

**Принцип:** Каждый модуль отвечает за одно

**✅ ХОРОШО:**

```typescript
// stores/tasks.store.ts - только управление состоянием задач
export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  function addTask(data: Omit<Task, 'id'>) {
    // Только добавить в массив
  }

  function completeTask(id: string) {
    // Только отметить как завершено
  }
})

// composables/useXPSystem.ts - отдельно для XP логики
export function useXPSystem() {
  function awardXP(taskId: string, amount: number) {
    // XP logic here
  }
  return { awardXP }
}

// В компоненте - оркестрировать
async function handleTaskComplete(taskId) {
  const tasksStore = useTasksStore()
  const xpSystem = useXPSystem()

  tasksStore.completeTask(taskId)
  xpSystem.awardXP(taskId, 100)
}
```

**❌ ПЛОХО:**

```typescript
// Всё в одном методе - смешивание ответственности
function completeTask(id: string) {
  // Обновить task
  // Посчитать XP
  // Обновить branch
  // Обновить user
  // Обновить reward
  // ... ещё 5 разных логик
}
```

---

### 2. Минимизация Cross-Store Dependencies

**Принцип:** Store должны быть независимы

**✅ ХОРОШО:**

```typescript
// Каждый store отвечает за свою логику
export const useTasksStore = defineStore('tasks', () => {
  function completeTask(id: string) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.done = true // Только своя ответственность
  }
})

// Вызывающий компонент координирует:
async function onTaskComplete(taskId: string) {
  tasksStore.completeTask(taskId)

  // Потом вызвать другие actions
  userStore.incrementCompletedTasks()
  branchesStore.updateProgress()
}
```

**❌ ПЛОХО:**

```typescript
// Store зависит от других stores
function completeTask(id: string) {
  const task = tasks.value.find((t) => t.id === id)
  task.done = true

  // Зависит от других stores ← BAD
  const userStore = useUserStore()
  const branchesStore = useBranchesStore()
  userStore.incrementCompletedTasks()
  branchesStore.updateProgress()
}
```

---

### 3. Типизация Везде

**Принцип:** Никаких `any` типов

**✅ ХОРОШО:**

```typescript
// Типы для API responses
interface SyncResponse {
  user?: User
  tasks?: Task[]
  branches?: Branch[]
  rewards?: Reward[]
}

// Типизировать функции
const data = await $fetch<SyncResponse>('/api/sync', {
  query: { userId },
})

// Типизировать callbacks
const emit = defineEmits<{
  (e: 'complete', taskId: string): void
  (e: 'delete', taskId: string): void
}>()

function handleClick(task: Task) {
  // TypeScript проверит все свойства
}
```

**❌ ПЛОХО:**

```typescript
// Не типизировано
const data: any = await $fetch('/api/sync', { ... })

emit('complete', taskId) // Может быть опечатка в имени события

function handleClick(task: any) {
  // IDE не поможет
}
```

---

## ⚙️ ПРОИЗВОДИТЕЛЬНОСТЬ

### 1. Computed vs Watch

**Используй computed когда:**

- Нужно преобразовать данные
- Зависит от других computed/refs
- Используется в template

**Используй watch когда:**

- Нужно выполнить побочный эффект
- Нужно отслеживать изменения
- Нужна асинхронность

```typescript
// ✅ Computed для преобразования данных
const completedTasks = computed(() => tasksStore.tasks.filter((t) => t.done))

// ✅ Watch для побочных эффектов
watch(
  () => completedTasks.value.length,
  (count) => {
    console.log(`Completed ${count} tasks`)
    saveToLocalStorage()
  }
)

// ❌ ПЛОХО: Watch для простого преобразования
const completedCount = ref(0)
watch(
  () => tasksStore.tasks,
  (tasks) => {
    completedCount.value = tasks.filter((t) => t.done).length
  }
)
```

---

### 2. Debounce для API

**Правило:** Всегда используй debounce/throttle для часто повторяющихся операций

```typescript
// ✅ ХОРОШО: Дебаунс для синхронизации
const syncToCloud = useDebounceFn(async () => {
  await $fetch('/api/sync', { /* ... */ })
}, 2000)

watch([stores...], () => syncToCloud())

// ❌ ПЛОХО: Прямой запрос при каждом изменении
watch([stores...], async () => {
  await $fetch('/api/sync', { /* ... */ }) // Лишние запросы!
})
```

---

### 3. Lazy Loading для Lists

**Правило:** Для больших списков использовать виртуализацию или pagination

```typescript
// ✅ ХОРОШО: Pagination
const pageSize = ref(20)
const currentPage = ref(1)

const visibleTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tasksStore.tasks.slice(start, end)
})

// ✅ ХОРОШО: Virtualization (для очень больших списков)
import { createVirtualizer } from '@tanstack/vue-virtual'

// ❌ ПЛОХО: Всё в DOM сразу
<div>
  <TaskCard v-for="task in allTasks" :key="task.id" :task="task" />
</div>
```

---

## 🎨 UI/UX ПРИНЦИПЫ

### 1. Обратная Связь (Feedback)

**Правило:** Каждое действие должно иметь визуальное подтверждение

```vue
<script setup>
const isLoading = ref(false)

async function handleSubmit() {
  isLoading.value = true
  try {
    await submitForm()
    addNotification({ type: 'success', message: 'Saved!' })
  } catch {
    addNotification({ type: 'error', message: 'Error!' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- ✅ Disabled state пока загружается -->
  <button @click="handleSubmit" :disabled="isLoading">
    {{ isLoading ? 'Saving...' : 'Save' }}
  </button>

  <!-- ✅ Loading spinner -->
  <div v-if="isLoading" class="spinner"></div>
</template>
```

---

### 2. Доступность (a11y)

**Правило:** Обеспечить доступ для screenreaders

```vue
<!-- ✅ ХОРОШО: Правильные ARIA labels -->
<button aria-label="Delete task" @click="deleteTask">
  <Trash2 :size="18" />
</button>

<input type="text" placeholder="Enter task name" aria-labelledby="task-label" />

<!-- ❌ ПЛОХО: Нет alt текстов и aria -->
<button @click="deleteTask">
  <img src="trash.svg" />
</button>
```

---

### 3. Responsive Design

**Правило:** Mobile First - начинай с мобильного, потом расширяй

```scss
// ✅ ХОРОШО: Mobile First
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// ❌ ПЛОХО: Desktop First
.task-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Unit Tests для Stores

```typescript
// tests/stores/tasks.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '~/stores/tasks.store'

describe('TasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add task', () => {
    const store = useTasksStore()
    store.addTask({
      title: 'Test Task',
      type: 'TASK_DAY',
      tagIds: []
    })

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Test Task')
  })

  it('should complete task', () => {
    const store = useTasksStore()
    const task = store.addTask({...})

    store.completeTask(task.id)

    expect(store.tasks[0].done).toBe(true)
  })
})
```

---

### 2. Component Tests

```typescript
// tests/components/TaskCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from '~/components/task/TaskCard.vue'

describe('TaskCard', () => {
  it('should render task info', () => {
    const wrapper = mount(TaskCard, {
      props: {
        task: {
          id: '1',
          title: 'Test',
          done: false,
          type: 'TASK_DAY'
        }
      }
    })

    expect(wrapper.text()).toContain('Test')
    expect(wrapper.find('.task-card').exists()).toBe(true)
  })

  it('should emit toggle event on button click', async () => {
    const wrapper = mount(TaskCard, { props: { task: {...} } })

    await wrapper.find('.complete-btn').trigger('click')

    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
```

---

## 📚 CODING STYLE

### 1. Именование

**Правило:** Используй ясные, описательные имена

```typescript
// ✅ ХОРОШО
const isTaskCompleted = ref(false)
const fetchTasksFromAPI = async () => {}
const calculateBranchProgress = (branch: Branch) => {}

// ❌ ПЛОХО
const completed = ref(false)
const fetch = async () => {}
const calc = (b: Branch) => {}
```

---

### 2. Форматирование Кода

**Правило:** Используй prettier для автоматического форматирования

```typescript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

### 3. Комментарии

**Правило:** Комментарии для ПОЧЕМУ, не ЧТО

```typescript
// ❌ ПЛОХО: Очевидный комментарий
const total = items.reduce((sum, item) => sum + item.price, 0) // Sum all prices

// ✅ ХОРОШО: Объясняет почему
// Используем reduce вместо foreach для лучшей производительности на больших списках
const total = items.reduce((sum, item) => sum + item.price, 0)

// ✅ ХОРОШО: Объясняет нетривиальную логику
// Проверяем daylight saving time transitions
// которые могут случиться между resetTime и now
const shouldReset = isDaylightSavingTime(resetTime, now)
```

---

## 🚀 РАЗВЕРТЫВАНИЕ

### Pre-Deploy Checklist

- [ ] Все тесты проходят
- [ ] Нет console.errors в production build
- [ ] Производительность в норме (Lighthouse score > 80)
- [ ] Нет утечек памяти
- [ ] Работает на всех браузерах
- [ ] Адаптивность на мобильных
- [ ] API endpoints доступны
- [ ] Database миграции применены
- [ ] Environment переменные установлены

---

### Production Monitoring

```typescript
// Логировать важные события
const logEvent = (name: string, data?: any) => {
  console.log(`[${new Date().toISOString()}] ${name}`, data)

  // Отправить в analytics
  if (window._gtag) {
    window._gtag?.event(name, data)
  }
}

// Отслеживать ошибки
window.addEventListener('error', (event) => {
  logEvent('error', {
    message: event.message,
    stack: event.error?.stack,
  })
})

// Отслеживать performance
window.addEventListener('load', () => {
  const perf = performance.getEntriesByType('navigation')[0]
  logEvent('page_load', {
    lcp: perf.loadEventEnd - perf.loadEventStart,
    domInteractive: perf.domInteractive - perf.fetchStart,
  })
})
```

---

## 🔄 CODE REVIEW ПРОЦЕСС

### Перед отправкой PR:

1. **Self Review:** Проверить свой код в PR
2. **Tests:** Запустить все тесты локально
3. **Linting:** Запустить eslint
4. **Performance:** Проверить performance во время разработки
5. **Documentation:** Обновить документацию если нужно

### При review чужого кода:

1. Проверить логику (не только синтаксис)
2. Спросить себя: "Я бы это так написал?"
3. Предложить улучшения (конструктивно)
4. Одобрить, когда код хороший

---

## 📞 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Разработка
npm run dev

# Тестирование
npm run test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Build
npm run build
npm run preview

# Performance analysis
npm run lighthouse
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
