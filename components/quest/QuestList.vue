<template>
  <div class="quest-list">
    <div class="list-header">
      <h3>Квесты</h3>
      <button class="add-btn" @click="showForm = true">
        <Plus :size="20" />
      </button>
    </div>
    <div class="quests">
      <QuestCard
        v-for="quest in questsStore.getActiveQuests()"
        :key="quest.id"
        :quest="quest"
        @toggle="questsStore.toggleQuest"
        @delete="questsStore.deleteQuest"
      />
    </div>
    <Teleport to="body">
      <QuestForm v-if="showForm" @close="showForm = false" @save="handleSave" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuestsStore } from '~/stores/quests.store'
import QuestCard from './QuestCard.vue'
import QuestForm from './QuestForm.vue'
import { Plus } from 'lucide-vue-next'

const questsStore = useQuestsStore()
const showForm = ref(false)

function handleSave(questData: any) {
  questsStore.addQuest(questData)
  showForm.value = false
}
</script>

<style scoped lang="scss">
.quest-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h3 {
      font-weight: 600;
      font-size: 1.2rem;
      color: var(--accent);
    }
  }
  .add-btn {
    @include glass;
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    &:hover {
    }
  }
  .quests {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
