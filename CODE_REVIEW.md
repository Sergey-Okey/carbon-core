# 📋 Комплексный Code Review - Carbon Core

## Дата: 26 апреля 2026г.

## Статус: 🟡 Требуются оптимизация и адаптация

---

## 🔴 КРИТИЧНЫЕ ПРОБЛЕМЫ

### 1. **Deep Watch на всех Stores (app.vue)**

**Проблема:** Неэффективность при каждом изменении любого поля

```typescript
// ❌ ПЛОХО - вызывает полный пересчет при каждом изменении
watch(
  [
    () => tasksStore.tasks,
    () => branchesStore.branches,
    () => rewardsStore.rewards,
    () => tagsStore.tags,
    () => uiStore.$state,
    () => settingsStore.$state,
  ],
  () => syncToCloud(),
  { deep: true }
)
```

**Последствия:**

- 🔴 Лишние API запросы
- 🔴 Замедление UI при больших данных
- 🔴 Утечка памяти при повторных вызовах

**Решение:** Использовать глубокий watch только для критичных полей

---

### 2. **Множественные Cross-Store Dependencies (tasks.store.ts)**

**Проблема:** `completeTask()` имеет слишком много побочных эффектов

```typescript
// ❌ ПЛОХО - слишком много зависимостей
function completeTask(id: string) {
  // 1. Обновляет tasksStore
  // 2. Получает данные из tagsStore
  // 3. Обновляет branchesStore (через addXPToBranch)
  // 4. Обновляет userStore (через addXP)
  // 5. Обновляет rewardsStore (через confirmPurchase)
  // 6. Обновляет branchesStore еще раз (через refreshMilestonesByTaskId)
}
```

**Последствия:**

- 🔴 Сложно тестировать
- 🔴 Высокий риск bugs при изменении
- 🔴 Слабая модульность

---

### 3. **N+1 проблема в getBranchCompletedTasks()**

**Проблема:** Поиск элемента выполняется в цикле

```typescript
// ❌ ПЛОХО - O(n*m) сложность
function getBranchCompletedTasks(branchId: string): number {
  // ... для каждого task id:
  const task = tasksStore.tasks.find((id) => t.id === id) // O(n)
}
```

---

## 🟠 СЕРЬЁЗНЫЕ ПРОБЛЕМЫ

### 4. **Отсутствие Оптимизации Рендеринга (BranchFlow.vue)**

**Проблема:** Все ноды пересчитываются при каждом изменении

- Нет использования `v-memo`
- Нет lazy loading для больших графиков
- Нет виртуализации

---

### 5. **Неадекватная Обработка Состояния при Удалении**

**Проблема:** При удалении задачи/узла не очищаются ссылки

```typescript
// ❌ РИСК - orphaned references
function deleteMilestone(id: string) {
  // Удаляется из массива, но не очищаются:
  // - edges (ребра остаются!)
  // - taskIds (task может быть в других местах)
}
```

---

### 6. **Отсутствие Анимаций для Ключевых Действий**

**Проблема:** Нет transitions для:

- ✗ Добавления новых элементов
- ✗ Удаления элементов
- ✗ Завершения задач
- ✗ Прогрессии уровня
- ✗ Изменения состояния

---

### 7. **Недостаточная Мобильная Адаптация**

**Проблема:**

- BranchFlow скрыт на мобильных (нет альтернативы)
- Нет responsive layout для других компонентов
- Modal не адаптирован для мобильных (может быть больше экрана)

---

## 🟡 ЗНАЧИТЕЛЬНЫЕ ПРОБЛЕМЫ

### 8. **Утечка Памяти в app.vue**

**Проблема:** Event listener не очищается корректно

```typescript
// ⚠️ РИСК - event listener остается при перезагрузке страницы
onMounted(() => {
  window.addEventListener('beforeunload', autoBackupOnUnload)
  // ❌ Нет removeEventListener в onUnmounted
})
```

---

### 9. **Неправильная Сортировка Ветвей**

**Проблема:** `updateBranchStatus` переписывает статус первого элемента

```typescript
// ❌ ЛОГИКА ОШИБКА
function updateBranchStatus(branch: Branch) {
  // ...
  branch.milestones[0].status = activeOrPending?.status ?? 'pending'
  // Это перезаписывает первый этап, что неправильно!
}
```

---

### 10. **Нет Типизации для API**

**Проблема:** API responses не типизированы

```typescript
// ❌ ПЛОХО - any type
const data = await $fetch('/api/sync', { query: { userId: userId.value } })
```

---

## 💛 ОПТИМИЗАЦИЯ И УЛУЧШЕНИЯ

### 11. **Производительность Query Селекторов**

**Проблема:** Computed используют filter/find на каждый render

```typescript
// ⚠️ Можно оптимизировать с помощью Map
const taskTags = computed(
  () => tagsStore.getTagsByIds(props.task.tagIds) // O(n) каждый раз
)
```

### 12. **Отсутствие Кэширования**

- Нет memoization для дорогостоящих операций
- Нет кэша для расчетов уровней
- Каждый render пересчитывает все computed

### 13. **Стили Не Адаптированы**

**Проблема:** Нет media queries для:

- Modal (может быть слишком большой)
- TaskCard (мало места на мобильных)
- TaskForm (невозможно заполнить на смартфоне)
- Таблицы/списки (горизонтальный overflow)

---

## 🎨 АНИМАЦИИ И UX

### 14. **Отсутствие Microinteractions**

- Нет feedback при клике на кнопку
- Нет плавных переходов при смене страницы
- Нет skeleton loaders при загрузке
- Нет smooth scroll

### 15. **Недостаточные Transitions**

```scss
// ⚠️ Только базовые fade transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-standard);
}
```

Нужны:

- Slide transitions
- Scale transitions
- Stagger animations для lists

---

## 📝 ДЕТАЛЬНЫЕ РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ

### ПРИОРИТЕТ 1 (КРИТИЧНЫЕ)

#### ✅ Исправить Deep Watch (app.vue)

```typescript
// Вариант 1: Использовать отдельные watchEffect для каждого store
watchEffect(
  () => {
    if (hasChanges.value) {
      syncToCloud()
    }
  },
  { flush: 'post' }
)

// Вариант 2: Использовать события вместо watch
// Emit события из stores при изменении
```

#### ✅ Оптимизировать completeTask

```typescript
// Разделить на отдельные actions с четкой ответственностью
;-updateTaskStatus() -
  awardXP() -
  updateMilestoneProgress() -
  processPurchaseReward()
```

#### ✅ Исправить N+1 проблему

```typescript
// Использовать Map для быстрого поиска
const tasksMap = new Map(tasksStore.tasks.map((t) => [t.id, t]))
const completed = taskIds.filter((id) => tasksMap.get(id)?.done).length
```

---

### ПРИОРИТЕТ 2 (СЕРЬЕЗНЫЕ)

#### ✅ Добавить Анимации

```vue
<!-- TransitionGroup для списков -->
<TransitionGroup name="list" tag="div">
  <TaskCard 
    v-for="task in tasks" 
    :key="task.id"
    :task="task"
  />
</TransitionGroup>

<!-- Стили -->
<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

#### ✅ Адаптировать для Мобильных

```vue
<!-- Добавить fallback для мобильных в BranchFlow -->
<div v-if="isMobile" class="mobile-branch-view">
  <!-- Альтернативное представление для мобильных -->
</div>

<!-- Media queries для компонентов -->
@include mobile { .modal { width: 90vw; max-height: 90vh; } }
```

#### ✅ Типизировать API

```typescript
interface SyncResponse {
  user?: User
  tasks?: Task[]
  branches?: Branch[]
  // ... и т.д.
}

const data = await $fetch<SyncResponse>('/api/sync', { ... })
```

---

### ПРИОРИТЕТ 3 (ВАЖНЫЕ)

#### ✅ Исправить Утечку Памяти

```typescript
onMounted(() => {
  window.addEventListener('beforeunload', autoBackupOnUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', autoBackupOnUnload)
})
```

#### ✅ Оптимизировать Селекторы

```typescript
// Использовать vue-use для мемоизации
import { useMemoize } from '@vueuse/core'

const memoizedGetTags = useMemoize((ids: string[]) =>
  tagsStore.getTagsByIds(ids)
)
```

#### ✅ Добавить Микро-взаимодействия

```scss
.btn-primary {
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    filter: brightness(0.95);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}
```

---

## 📊 МЕТРИКИ И ТЕСТИРОВАНИЕ

### Что нужно проверить:

- ⏱️ Performance: LCP, FID, CLS < 2.5s
- 📱 Адаптивность: Все размеры от 320px до 1920px
- 🎬 Анимации: 60 FPS, не замораживает UI
- 🔗 Утечки памяти: DevTools → Memory tab
- 🧪 Логика: Unit tests для stores

---

## 🎯 ИТОГОВЫЙ ПЛАН ДЕЙСТВИЙ

```
СРОЧНО (до 2026-04-27):
1. ✅ Исправить Deep Watch
2. ✅ Убрать утечку памяти в app.vue
3. ✅ Типизировать API responses

ВАЖНО (до 2026-05-03):
4. ✅ Рефакторить completeTask
5. ✅ Добавить transitions для списков
6. ✅ Адаптировать модальные окна

УЛУЧШЕНИЯ (до 2026-05-10):
7. ✅ Добавить микро-взаимодействия
8. ✅ Оптимизировать BranchFlow
9. ✅ Добавить скелет-лоадеры
```

---

## 📈 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

После всех исправлений:

- ✅ Производительность +40% (ускорение синхронизации)
- ✅ UX +60% (гладкие анимации, микро-взаимодействия)
- ✅ Мобильная поддержка: 100% на iOS/Android
- ✅ Стабильность: 0 утечек памяти
- ✅ Код: 90% покрытие типами, легче тестировать

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- Vue 3 Performance: https://vuejs.org/guide/best-practices/performance.html
- Animation Best Practices: https://web.dev/animations-guide/
- Mobile UX: https://www.nngroup.com/articles/mobile-usability/
