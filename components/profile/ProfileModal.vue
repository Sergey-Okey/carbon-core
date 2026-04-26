<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Профиль</h3>
          <button class="close-btn" @click="emit('close')">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveProfile">
          <div class="avatar-section">
            <div class="avatar" @click="triggerFileInput">
              <img
                v-if="userStore.profile.avatar"
                :src="userStore.profile.avatar"
                alt="avatar"
              />
              <UserCircle v-else :size="48" />
              <div class="avatar-overlay">
                <Camera :size="20" />
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <button
              type="button"
              class="change-avatar-btn"
              @click="triggerFileInput"
            >
              {{ userStore.profile.avatar ? 'Сменить фото' : 'Добавить фото' }}
            </button>
            <button
              v-if="userStore.profile.avatar"
              type="button"
              class="remove-avatar-btn"
              @click="removeAvatar"
            >
              Удалить
            </button>
          </div>

          <div class="form-group">
            <label>Имя</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ваше имя"
              maxlength="30"
            />
          </div>

          <div class="form-group">
            <label>О себе</label>
            <textarea
              v-model="form.bio"
              placeholder="Расскажите о себе или своих целях"
              rows="3"
              maxlength="150"
            />
          </div>

          <div class="form-group">
            <label>Email (опционально)</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div class="stats-info">
            <div class="stat-item">
              <Zap :size="18" />
              <span
                >Уровень {{ userStore.level }} ({{
                  userStore.totalXP
                }}
                XP)</span
              >
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

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button type="submit" class="btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import {
  X,
  UserCircle,
  Zap,
  Coins,
  Medal,
  Award,
  Gem,
  Crown,
  Camera,
} from 'lucide-vue-next'
import { useUserStore } from '~/stores/user.store'
import { useNotification } from '~/composables/useNotification'

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

const leagueClass = computed(() => userStore.league.toLowerCase())

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    form.avatar = base64
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
  addNotification({ type: 'success', message: 'Профиль обновлён' })
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  backdrop-filter: blur(6px);
}

.modal {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  background: var(--bg);
  @include glass;
  color: var(--accent);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;

  h3 {
    font-weight: 600;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--dim);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--transition-standard);

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}

form {
  padding: 20px 24px 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border);
    color: var(--dim);
    position: relative;
    cursor: pointer;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--bg) 40%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      color: var(--surface);
    }

    &:hover .avatar-overlay {
      opacity: 1;
    }
  }

  .change-avatar-btn,
  .remove-avatar-btn {
    font-size: 0.85rem;
    color: var(--dim);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 16px;
    transition: all 0.1s;
    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }

  .remove-avatar-btn {
    color: var(--error);
    &:hover {
      background: color-mix(in srgb, var(--error) 10%, transparent);
    }
  }
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--dim);
  }

  input,
  textarea {
    width: 100%;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-md);
    color: var(--accent);
    font-size: 1rem;
    transition: border-color var(--transition-standard);

    &::placeholder {
      color: var(--dim);
      opacity: 0.6;
    }

    &:focus {
      border-color: var(--accent);
      outline: none;
    }
  }

  textarea {
    resize: vertical;
  }
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border);

  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    color: var(--accent);
  }

  .бронза {
    color: var(--bronze);
  }
  .серебро {
    color: var(--silver);
  }
  .золото {
    color: var(--gold);
  }
  .платина {
    color: var(--platinum);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;

  button {
    padding: 12px 24px;
    border-radius: var(--border-radius-md);
    font-weight: 500;
    font-size: 0.95rem;
    transition: all var(--transition-standard);
    cursor: pointer;
    border: none;
  }

  .btn-secondary {
    background: transparent;
    color: var(--dim);
    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }

  .btn-primary {
    background: var(--accent);
    color: var(--bg);
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }
}
</style>
