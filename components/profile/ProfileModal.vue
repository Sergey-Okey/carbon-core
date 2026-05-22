<template>
  <AppModal title="Профиль" as-form size="md" @close="emit('close')" @submit="saveProfile">
    <div class="avatar-section">
      <button type="button" class="avatar" @click="triggerFileInput">
        <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
        <UserCircle v-else :size="48" />
        <span class="avatar-overlay">
          <Camera :size="20" />
        </span>
      </button>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="file-input"
        @change="handleFileChange"
      />

      <div class="avatar-actions">
        <AppButton type="button" variant="ghost" size="sm" @click="triggerFileInput">
          {{ form.avatar ? 'Сменить фото' : 'Добавить фото' }}
        </AppButton>
        <AppButton
          v-if="form.avatar"
          type="button"
          variant="danger"
          size="sm"
          @click="removeAvatar"
        >
          Удалить
        </AppButton>
      </div>
    </div>

    <AppFormField label="Имя">
      <AppInput v-model="form.name" placeholder="Ваше имя" maxlength="30" />
    </AppFormField>

    <AppFormField label="О себе">
      <AppInput
        v-model="form.bio"
        multiline
        placeholder="Расскажите о себе или своих целях"
        rows="3"
        maxlength="150"
      />
    </AppFormField>

    <AppFormField label="Email">
      <AppInput v-model="form.email" type="email" placeholder="email@example.com" />
    </AppFormField>

    <div class="stats-info">
      <div class="stat-item">
        <Zap :size="18" />
        <span>Уровень {{ userStore.level }} ({{ userStore.totalXP }} XP)</span>
      </div>
      <div class="stat-item">
        <component :is="leagueIcon" :size="18" :class="leagueClass" />
        <span>{{ userStore.league }}</span>
      </div>
      <div class="stat-item">
        <Coins :size="18" />
        <span>{{ userStore.gold }} золота</span>
      </div>
    </div>

    <template #footer>
      <AppButton type="button" variant="secondary" @click="emit('close')">
        Отмена
      </AppButton>
      <AppButton type="submit" variant="primary">Сохранить</AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Award, Camera, Coins, Crown, Gem, Medal, UserCircle, Zap } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import { useNotification } from '~/composables/useNotification'
import { useUserStore } from '~/stores/user.store'

const emit = defineEmits<{ (e: 'close'): void }>()

const userStore = useUserStore()
const { addNotification } = useNotification()
const fileInput = ref<HTMLInputElement>()

const form = reactive({
  name: userStore.profile.name,
  bio: userStore.profile.bio,
  email: userStore.profile.email,
  avatar: userStore.profile.avatar,
})

const leagueIcon = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return Medal
  if (league === 'Серебро') return Award
  if (league === 'Золото') return Gem
  return Crown
})

const leagueClass = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return 'bronze'
  if (league === 'Серебро') return 'silver'
  if (league === 'Золото') return 'gold'
  return 'platinum'
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  form.avatar = ''
  if (fileInput.value) fileInput.value.value = ''
}

function saveProfile() {
  userStore.updateProfile({
    name: form.name,
    bio: form.bio,
    email: form.email,
    avatar: form.avatar,
  })
  addNotification({ type: 'success', message: 'Профиль обновлен' })
  emit('close')
}
</script>

<style scoped lang="scss">
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.avatar {
  @include glass;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  color: var(--dim);
  background: color-mix(in srgb, var(--surface) 42%, transparent);
  border: 2px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  transition: border-color var(--transition-standard), transform var(--transition-standard);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--surface);
  background: color-mix(in srgb, var(--bg) 42%, transparent);
  opacity: 0;
  transition: opacity var(--transition-standard);
}

.avatar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.file-input {
  display: none;
}

.stats-info {
  @include glass;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--surface) 42%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent);
  font-size: 0.95rem;

  .bronze {
    color: var(--bronze);
  }

  .silver {
    color: var(--silver);
  }

  .gold {
    color: var(--gold);
  }

  .platinum {
    color: var(--platinum);
  }
}

@media (max-width: 420px) {
  .avatar {
    width: 88px;
    height: 88px;
  }
}
</style>
