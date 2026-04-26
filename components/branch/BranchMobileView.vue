<template>
  <div class="branch-mobile-view">
    <!-- ✅ АЛЬТЕРНАТИВНЫЙ ВИД ДЛЯ МОБИЛЬНЫХ: Вертикальный список веток -->
    <div class="branches-list">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="branch-item"
        :class="{ expanded: expandedBranch === branch.id }"
      >
        <div class="branch-header" @click="toggleBranch(branch.id)">
          <div class="branch-info">
            <component :is="getIconComponent(branch.icon)" :size="20" />
            <div class="branch-text">
              <h4>{{ branch.displayName }}</h4>
              <span class="milestone-count"
                >{{ branch.milestones.length }} этапов</span
              >
            </div>
          </div>
          <ChevronDown
            :size="16"
            :class="{ rotated: expandedBranch === branch.id }"
          />
        </div>

        <Transition name="expand">
          <div v-if="expandedBranch === branch.id" class="milestones">
            <div
              v-for="(milestone, index) in branch.milestones"
              :key="milestone.id"
              class="milestone-item"
              :class="milestone.status"
            >
              <div class="milestone-number">{{ index + 1 }}</div>
              <div class="milestone-content">
                <div class="milestone-header">
                  <h5>{{ milestone.name }}</h5>
                  <span
                    v-if="milestone.status === 'completed'"
                    class="badge completed"
                  >
                    ✓
                  </span>
                  <span
                    v-else-if="milestone.status === 'active'"
                    class="badge active"
                  >
                    ◐
                  </span>
                </div>
                <p v-if="milestone.description" class="description">
                  {{ milestone.description }}
                </p>
                <div class="xp-bar">
                  <div
                    class="xp-fill"
                    :style="{
                      width:
                        (milestone.currentXP / milestone.requiredXP) * 100 +
                        '%',
                    }"
                  ></div>
                </div>
                <span class="xp-text"
                  >{{ milestone.currentXP }} /
                  {{ milestone.requiredXP }} XP</span
                >
              </div>
              <button
                class="milestone-edit"
                @click.stop="editMilestone(milestone)"
              >
                <Edit :size="16" />
              </button>
            </div>

            <button
              class="add-milestone-btn"
              @click.stop="addMilestone(branch.id)"
            >
              <Plus :size="16" /> Добавить этап
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Plus, Edit } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import type { Milestone } from '~/types/branch.types'

const branchesStore = useBranchesStore()
const expandedBranch = ref<string | null>(null)

const branches = computed(() => branchesStore.branches)

const emit = defineEmits<{
  (e: 'edit-milestone', milestone: Milestone): void
  (e: 'add-milestone', branchId: string): void
}>()

function toggleBranch(branchId: string) {
  expandedBranch.value = expandedBranch.value === branchId ? null : branchId
}

function editMilestone(milestone: Milestone) {
  emit('edit-milestone', milestone)
}

function addMilestone(branchId: string) {
  emit('add-milestone', branchId)
}

function getIconComponent(iconName: string) {
  // Можно добавить динамический импорт иконок
  return 'div'
}
</script>

<style scoped lang="scss">
.branch-mobile-view {
  padding: 12px;
  max-width: 100%;
  overflow-y: auto;
}

.branches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.branch-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all 0.2s ease;

  &.expanded {
    box-shadow: var(--shadow-md);
  }
}

.branch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:active {
    background: var(--border);
  }
}

.branch-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.branch-text {
  h4 {
    font-weight: 600;
    font-size: 0.95rem;
    margin: 0;
    color: var(--accent);
  }

  .milestone-count {
    display: block;
    font-size: 0.75rem;
    color: var(--dim);
    margin-top: 2px;
  }
}

.milestones {
  border-top: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.milestone-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--border);
  transition: all 0.2s;

  &.pending {
    border-left-color: var(--dim);
  }

  &.active {
    border-left-color: var(--warning);
    background: color-mix(in srgb, var(--warning) 5%, var(--bg));
  }

  &.completed {
    border-left-color: var(--success);
    background: color-mix(in srgb, var(--success) 5%, var(--bg));
  }
}

.milestone-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--surface);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
  color: var(--dim);
}

.milestone-content {
  flex: 1;
  min-width: 0;
}

.milestone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;

  h5 {
    font-weight: 600;
    font-size: 0.9rem;
    margin: 0;
    color: var(--accent);
  }

  .badge {
    display: inline-block;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 700;

    &.active {
      background: var(--warning);
      color: var(--bg);
    }

    &.completed {
      background: var(--success);
      color: var(--bg);
    }
  }
}

.description {
  font-size: 0.8rem;
  color: var(--dim);
  margin: 4px 0;
  line-height: 1.3;
}

.xp-bar {
  height: 4px;
  background: var(--surface);
  border-radius: 2px;
  overflow: hidden;
  margin: 6px 0 2px;
}

.xp-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s;
}

.xp-text {
  display: block;
  font-size: 0.7rem;
  color: var(--dim);
}

.milestone-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--dim);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;
  flex-shrink: 0;

  &:active {
    background: var(--surface);
    color: var(--accent);
  }
}

.add-milestone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: var(--border-radius-sm);
  color: var(--dim);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: var(--surface);
    border-style: solid;
    color: var(--accent);
  }
}

/* ✅ АНИМАЦИИ ДЛЯ РАСКРЫТИЯ */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ✅ РОТАЦИЯ ИКОНКИ */
svg {
  transition: transform 0.3s;

  &.rotated {
    transform: rotate(180deg);
  }
}
</style>
