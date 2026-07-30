<template>
  <section class="analytics" aria-label="Аналитика" data-tour="analytics-page">
    <div class="analytics-grid" :class="{ 'is-reordering': Boolean(dragWidgetId) }">
      <AnalyticsWidgetShell
        title="Активность"
        subtitle="Столбцы выполнений по дням"
        :icon="Activity"
        :span="8"
        enter="fade-up"
        :style="tileStyle('activity')"
        :dragging="isDragging('activity')"
        :drop-target="isDrop('activity')"
        drag-label="Перетащить виджет активности"
        v-bind="dragHandlers('activity')"
      >
        <template #aside>
          <span class="trend" :class="activityTrend.dir">{{ activityTrend.label }}</span>
        </template>
        <AnalyticsLineChart
          v-model="rangeDays"
          :series="activitySeries"
          :empty="!hasActivityData"
        />
      </AnalyticsWidgetShell>

      <AnalyticsWidgetShell
        title="Продуктивные часы"
        subtitle="Когда вы выполняете больше всего"
        :icon="Clock"
        :span="4"
        enter="slide-left"
        :style="tileStyle('hours')"
        :dragging="isDragging('hours')"
        :drop-target="isDrop('hours')"
        drag-label="Перетащить виджет часов"
        v-bind="dragHandlers('hours')"
      >
        <AnalyticsHourBarChart :items="hourBarStats" :empty="!hourBarStats.length" />
      </AnalyticsWidgetShell>

      <AnalyticsWidgetShell
        title="Прогресс"
        subtitle="Сводка по направлениям"
        :icon="Target"
        :span="4"
        enter="scale-pop"
        :style="tileStyle('focus')"
        :dragging="isDragging('focus')"
        :drop-target="isDrop('focus')"
        drag-label="Перетащить виджет прогресса"
        v-bind="dragHandlers('focus')"
      >
        <AnalyticsNestedArcs
          :key="progressArcsKey"
          :arcs="nestedArcs"
          :score="progressScore"
          :empty="!nestedArcs.length"
          empty-hint="Закройте задачи и этапы — дуги появятся здесь"
        />
      </AnalyticsWidgetShell>

      <AnalyticsWidgetShell
        title="Категории"
        subtitle="Структура задач"
        :icon="LayoutGrid"
        :aside="`${analyticsTasks.length}`"
        :span="4"
        enter="spin-soft"
        :style="tileStyle('categories')"
        :dragging="isDragging('categories')"
        :drop-target="isDrop('categories')"
        drag-label="Перетащить виджет категорий"
        v-bind="dragHandlers('categories')"
      >
        <AnalyticsCategoryChart
          :items="categoryItems"
          :empty="!analyticsTasks.length"
          empty-title="Нет задач"
          empty-hint="Добавьте задачи — появится структура категорий"
        />
      </AnalyticsWidgetShell>

      <AnalyticsWidgetShell
        title="Баланс"
        subtitle="Радар метрик фокуса"
        :icon="Radar"
        :span="4"
        enter="expand-blur"
        :style="tileStyle('radar')"
        :dragging="isDragging('radar')"
        :drop-target="isDrop('radar')"
        drag-label="Перетащить радар"
        v-bind="dragHandlers('radar')"
      >
        <AnalyticsRadarChart
          :items="radarItems"
          :empty="focusScore === 0 && !analyticsTasks.length"
        />
      </AnalyticsWidgetShell>

      <div
        class="analytics-stack"
        :class="{
          'is-dragging': isDragging('habits'),
          'is-drop-target': isDrop('habits'),
        }"
        :style="tileStyle('habits')"
        @dragover.prevent="onTileDragOver('habits')"
        @dragenter.prevent="onTileDragEnter('habits')"
        @dragleave="onTileDragLeave('habits', $event)"
        @drop.prevent="onTileDrop('habits')"
      >
        <AnalyticsWidgetShell
          title="Привычки"
          :subtitle="habitsSubtitle"
          :icon="Flame"
          :span="1"
          fluid
          enter="bounce-in"
          :dragging="false"
          :drop-target="false"
          drag-label="Перетащить блок привычек"
          v-bind="dragHandlers('habits')"
        >
          <AnalyticsHeroProgress
            :value="activeHabitsToday"
            unit="сегодня"
            :progress="habitsProgress"
            :metrics="habitMetrics"
            :empty="!habitsCount"
            empty-title="Нет привычек"
            empty-hint="Создайте привычки — прогресс появится здесь"
          />
        </AnalyticsWidgetShell>

        <AnalyticsWidgetShell
          title="Голограмма"
          subtitle="Волновой пульс из активности"
          :icon="Sparkles"
          :span="1"
          fluid
          enter="expand-blur"
          :draggable="false"
        >
          <AnalyticsHologram
            :series="activitySeries"
            :metrics="hologramMetrics"
            :empty="!hasActivityData && focusScore === 0"
          />
        </AnalyticsWidgetShell>
      </div>

      <AnalyticsWidgetShell
        title="Тепловая карта"
        subtitle="Активность за 30 дней"
        :icon="CalendarDays"
        :span="4"
        enter="wipe-up"
        :style="tileStyle('heatmap')"
        :dragging="isDragging('heatmap')"
        :drop-target="isDrop('heatmap')"
        drag-label="Перетащить тепловую карту"
        v-bind="dragHandlers('heatmap')"
      >
        <AnalyticsHeatmap :days="heatmapDays" :empty="!heatmapDays.length" />
      </AnalyticsWidgetShell>

      <AnalyticsWidgetShell
        title="Теги"
        subtitle="Какие теги преобладают"
        :icon="Tags"
        :span="4"
        enter="slide-right"
        :style="tileStyle('tags')"
        :dragging="isDragging('tags')"
        :drop-target="isDrop('tags')"
        drag-label="Перетащить гистограмму тегов"
        v-bind="dragHandlers('tags')"
      >
        <AnalyticsTagChart
          :items="tagStats"
          :empty="!tagStats.length"
          empty-title="Нет тегов"
          empty-hint="Добавьте теги к задачам — здесь появится гистограмма"
        />
      </AnalyticsWidgetShell>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity,
  CalendarDays,
  Clock,
  Crown,
  Flame,
  LayoutGrid,
  Radar,
  Sparkles,
  Tags,
  Target,
  Zap,
} from 'lucide-vue-next'
import AnalyticsCategoryChart from '~/components/analytics/widgets/AnalyticsCategoryChart.vue'
import AnalyticsHeatmap from '~/components/analytics/widgets/AnalyticsHeatmap.vue'
import AnalyticsHeroProgress from '~/components/analytics/widgets/AnalyticsHeroProgress.vue'
import AnalyticsHologram from '~/components/analytics/widgets/AnalyticsHologram.vue'
import AnalyticsHourBarChart from '~/components/analytics/widgets/AnalyticsHourBarChart.vue'
import AnalyticsLineChart from '~/components/analytics/widgets/AnalyticsLineChart.vue'
import AnalyticsNestedArcs from '~/components/analytics/widgets/AnalyticsNestedArcs.vue'
import AnalyticsRadarChart from '~/components/analytics/widgets/AnalyticsRadarChart.vue'
import AnalyticsTagChart from '~/components/analytics/widgets/AnalyticsTagChart.vue'
import AnalyticsWidgetShell from '~/components/analytics/AnalyticsWidgetShell.vue'
import { useAnalyticsMetrics } from '~/composables/useAnalyticsMetrics'
import {
  type AnalyticsWidgetId,
  useUIStore,
} from '~/stores/ui.store'

const uiStore = useUIStore()
const rangeDays = computed({
  get: () => uiStore.analyticsRangeDays,
  set: (value: 7 | 14 | 30) => uiStore.setAnalyticsRangeDays(value),
})

const {
  activitySeries,
  heatmapDays,
  periodAverage,
  activityTrend,
  hasActivityData,
  currentStreak,
  longestStreak,
  hourBarStats,
  taskTypeStats,
  habitsCount,
  activeHabitsToday,
  focusMetrics,
  focusScore,
  branchesProgressScore,
  topBranchStats,
  tagStats,
  analyticsTasks,
} = useAnalyticsMetrics(rangeDays)

const dragWidgetId = ref<AnalyticsWidgetId | null>(null)
const dropTargetId = ref<AnalyticsWidgetId | null>(null)

const WIDGET_HEIGHT = 500

const nestedArcs = computed(() => {
  const branches = topBranchStats.value.slice(0, 4)
  if (branches.length) {
    return branches.map((branch) => ({
      key: branch.id,
      label: branch.name,
      percent: branch.progress,
      done: branch.done,
      total: Math.max(branch.total, 1),
      color: branch.color,
    }))
  }
  return focusMetrics.value.slice(0, 4).map((metric) => ({
    key: metric.key,
    label: metric.label,
    percent: metric.value,
    done: metric.value,
    total: 100,
    color: 'var(--accent)',
  }))
})

const progressScore = computed(() => {
  if (topBranchStats.value.length) return branchesProgressScore.value
  return focusScore.value
})

const progressArcsKey = computed(() =>
  nestedArcs.value.map((arc) => arc.key).join('|')
)

const categoryItems = computed(() =>
  taskTypeStats.value
    .filter((item) => item.count > 0)
    .map((item) => ({
      key: item.key,
      label: item.label,
      value: item.count,
    }))
)

const radarItems = computed(() =>
  focusMetrics.value.map((metric) => ({
    key: metric.key,
    label: metric.label,
    value: metric.value,
  }))
)

const habitsProgress = computed(() =>
  habitsCount.value
    ? Math.round((activeHabitsToday.value / habitsCount.value) * 100)
    : 0
)

const habitsSubtitle = computed(
  () => `${activeHabitsToday.value} из ${habitsCount.value} сегодня`
)

const habitMetrics = computed(() => [
  {
    key: 'avg',
    label: '/день',
    value: periodAverage.value,
    icon: Zap,
  },
  {
    key: 'streak',
    label: 'стрик',
    value: currentStreak.value,
    icon: Flame,
  },
  {
    key: 'best',
    label: 'рекорд',
    value: longestStreak.value,
    icon: Crown,
  },
])

const hologramMetrics = computed(() =>
  focusMetrics.value.slice(0, 4).map((metric) => ({
    key: metric.key,
    label: metric.label,
    value: metric.value,
  }))
)

function widgetOrderIndex(id: AnalyticsWidgetId) {
  const index = uiStore.analyticsWidgetOrder.indexOf(id)
  return index === -1 ? 99 : index
}

function tileStyle(id: AnalyticsWidgetId) {
  return {
    order: widgetOrderIndex(id),
    '--tile-h': `${WIDGET_HEIGHT}px`,
    '--enter-delay': `${widgetOrderIndex(id) * 55}ms`,
  }
}

function isDragging(id: AnalyticsWidgetId) {
  return dragWidgetId.value === id
}

function isDrop(id: AnalyticsWidgetId) {
  return dropTargetId.value === id && dragWidgetId.value !== id
}

function dragHandlers(id: AnalyticsWidgetId) {
  return {
    onDragstart: (event: DragEvent) => onTileDragStart(id, event),
    onDragend: onTileDragEnd,
    onDragover: () => onTileDragOver(id),
    onDragenter: () => onTileDragEnter(id),
    onDragleave: (event: DragEvent) => onTileDragLeave(id, event),
    onDrop: () => onTileDrop(id),
  }
}

function onTileDragStart(id: AnalyticsWidgetId, event: DragEvent) {
  dragWidgetId.value = id
  dropTargetId.value = null
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
  const tile =
    (event.currentTarget as HTMLElement | null)?.closest('.analytics-stack') ||
    (event.currentTarget as HTMLElement | null)?.closest('.widget-shell')
  if (tile instanceof HTMLElement) {
    const rect = tile.getBoundingClientRect()
    event.dataTransfer.setDragImage(tile, Math.min(36, rect.width / 4), 24)
  }
}

function onTileDragOver(id: AnalyticsWidgetId) {
  if (!dragWidgetId.value || dragWidgetId.value === id) return
  dropTargetId.value = id
}

function onTileDragEnter(id: AnalyticsWidgetId) {
  if (!dragWidgetId.value || dragWidgetId.value === id) return
  dropTargetId.value = id
}

function onTileDragLeave(id: AnalyticsWidgetId, event: DragEvent) {
  const related = event.relatedTarget as Node | null
  const current = event.currentTarget as HTMLElement | null
  if (current && related && current.contains(related)) return
  if (dropTargetId.value === id) dropTargetId.value = null
}

function onTileDrop(id: AnalyticsWidgetId) {
  if (dragWidgetId.value) {
    uiStore.swapAnalyticsWidgets(dragWidgetId.value, id)
  }
  dragWidgetId.value = null
  dropTargetId.value = null
}

function onTileDragEnd() {
  dragWidgetId.value = null
  dropTargetId.value = null
}
</script>

<style scoped lang="scss">
.analytics {
  display: grid;
  gap: var(--space-4);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  user-select: none;
  -webkit-user-select: none;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: var(--space-4);
  width: 100%;
  align-items: start;

  &.is-reordering :deep(.widget-shell:not(.is-dragging):not(.is-drop-target)),
  &.is-reordering .analytics-stack:not(.is-dragging):not(.is-drop-target) {
    opacity: 0.72;
  }

  :deep(.widget-shell[class*='enter-']) {
    animation-delay: var(--enter-delay, 0ms);
  }
}

.analytics-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-sizing: border-box;
  grid-column: span 4;
  height: var(--tile-h, 500px);
  min-width: 0;
  transition:
    outline-color var(--transition-standard),
    opacity var(--transition-standard);

  &.is-dragging {
    opacity: 0.45;
  }

  &.is-drop-target {
    outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
    outline-offset: 2px;
    border-radius: var(--radius-lg);
  }
}

.trend {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);

  &.up {
    color: var(--accent);
  }

  &.down {
    color: var(--color-error);
  }

  &.flat {
    color: var(--color-text-secondary);
  }
}

@media (max-width: 1100px) {
  .analytics-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .analytics-stack {
    grid-column: span 3;
    height: 380px;
  }
}

@media (max-width: 767px) {
  .analytics {
    gap: var(--space-3);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .analytics-stack {
    grid-column: span 1;
    height: auto;
    min-height: 0;
    gap: var(--space-3);
  }
}

@media (max-width: 420px) {
  .analytics,
  .analytics-grid {
    gap: var(--space-2);
  }
}
</style>
