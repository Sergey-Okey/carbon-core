<template>
  <div class="onboarding" :class="{ exiting: isExiting }">
    <!-- Анимированный фон -->
    <div class="background-layer">
      <div class="floating-shape shape1"></div>
      <div class="floating-shape shape2"></div>
      <div class="floating-shape shape3"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Эффект вспышки -->
    <div v-if="showFlash" class="flash-overlay"></div>

    <div class="onboarding-modal" ref="modalRef">
      <!-- Прогресс-бар -->
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: (currentSection / totalSections) * 100 + '%' }"
        ></div>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <section :key="currentSection" class="section-content">
          <!-- 1. Приветствие -->
          <div v-if="currentSection === 1" class="welcome-section">
            <div class="logo-wrapper" ref="logoWrapper">
              <div class="logo-glow"></div>
              <span class="big-logo">COF</span>
            </div>
            <h1>Core of Life</h1>
            <p class="tagline">осознанное развитие • системный подход</p>
            <p class="intro-text">
              Добро пожаловать в экосистему персонального роста.<br />
              COF объединяет планирование, привычки и визуализацию прогресса в
              едином минималистичном пространстве.
            </p>
            <div class="hint">
              <span class="hint-icon">→</span> листайте вправо, чтобы узнать
              больше
            </div>
          </div>

          <!-- 2. Философия -->
          <div v-else-if="currentSection === 2" class="content-block">
            <div class="section-icon">
              <div class="icon-ring"></div>
              <Sparkles :size="28" class="icon-svg" />
            </div>
            <h2>Меньше, но лучше</h2>
            <p class="description">
              Мы отказались от бесконечных списков. Правило трёх — ваш компас:
              <strong>3 задачи на день, неделю, месяц, год</strong>. Это
              освобождает ум и направляет энергию на действительно важное.
            </p>
            <div class="quote-block">
              «Не количество задач определяет успех, а их значимость.»
            </div>
          </div>

          <!-- 3. Доска веток -->
          <div v-else-if="currentSection === 3" class="content-block">
            <div class="section-icon">
              <div class="icon-ring"></div>
              <LayoutGrid :size="28" class="icon-svg" />
            </div>
            <h2>Визуализация роста</h2>
            <p class="description">
              Четыре столпа вашего развития: <strong>Финансы</strong>,
              <strong>Тело</strong>, <strong>Интеллект</strong> и
              <strong>Лидерство</strong>. Каждый имеет собственную шкалу
              прогресса и контрольные точки. Выполняя задачи, вы продвигаетесь
              по веткам и видите, как меняется ваша жизнь.
            </p>
            <div class="mockup-branches">
              <div class="mockup-item">FIN</div>
              <div class="mockup-item">BODY</div>
              <div class="mockup-item">MIND</div>
              <div class="mockup-item">LDR</div>
            </div>
          </div>

          <!-- 4. Задачи и привычки -->
          <div v-else-if="currentSection === 4" class="content-block">
            <div class="section-icon">
              <div class="icon-ring"></div>
              <CheckSquare :size="28" class="icon-svg" />
            </div>
            <h2>Гибкая система задач</h2>
            <p class="description">
              <strong>Привычки</strong> можно выполнять многократно — они
              формируют базу. <strong>Задачи</strong> ограничены правилом трёх и
              распределены по горизонтам. Каждая задача связана с тегами,
              которые автоматически прокачивают соответствующие ветки.
            </p>
            <div class="example-tags">
              <span class="tag-example">#финансы</span>
              <span class="tag-example">#спорт</span>
              <span class="tag-example">#учёба</span>
              <span class="tag-example">#нетворкинг</span>
            </div>
          </div>

          <!-- 5. Лиги и монеты -->
          <div v-else-if="currentSection === 5" class="content-block">
            <div class="section-icon">
              <div class="icon-ring"></div>
              <Trophy :size="28" class="icon-svg" />
            </div>
            <h2>Игровая мотивация</h2>
            <p class="description">
              Завершая задачи, вы зарабатываете <strong>опыт (XP)</strong> и
              <strong>монеты</strong>. Опыт повышает уровень и ранг в лиге:
              Бронза → Серебро → Золото → Платина. Монеты можно обменять на
              награды в магазине, но их ещё нужно подтвердить реальным
              действием.
            </p>
            <div class="league-progress-example">
              <span class="league-dot bronze"></span>
              <span class="league-dot silver"></span>
              <span class="league-dot gold"></span>
              <span class="league-dot platinum"></span>
            </div>
          </div>

          <!-- 6. Профиль и данные -->
          <div v-else-if="currentSection === 6" class="content-block">
            <div class="section-icon">
              <div class="icon-ring"></div>
              <User :size="28" class="icon-svg" />
            </div>
            <h2>Ваше пространство</h2>
            <p class="description">
              Настройте тему и акцентный цвет под себя. Управляйте резервными
              копиями: экспорт, импорт, автоматический бэкап. В профиле можно
              указать имя и загрузить аватар — COF адаптируется под вас.
            </p>
          </div>

          <!-- 7. Финальный экран -->
          <div v-else-if="currentSection === 7" class="welcome-section final">
            <div class="logo-wrapper" ref="finalLogoWrapper">
              <div class="logo-glow"></div>
              <span class="big-logo">COF</span>
            </div>
            <h2>Вы готовы</h2>
            <p class="intro-text">
              Теперь система настроена. Создайте первую задачу и наблюдайте, как
              ваш мир становится структурированнее и осознаннее.
            </p>
            <button class="cta-button" @click="startJourney">
              Начать использовать Core of Life
            </button>
          </div>
        </section>
      </Transition>

      <!-- Навигация -->
      <div class="navigation-controls">
        <button
          class="nav-arrow"
          :class="{ hidden: currentSection === 1 }"
          @click="prevSection"
        >
          <ChevronLeft :size="24" />
        </button>

        <div class="section-dots">
          <span
            v-for="i in totalSections"
            :key="i"
            class="dot"
            :class="{ active: currentSection === i }"
            @click="currentSection = i"
          ></span>
        </div>

        <button
          class="nav-arrow"
          :class="{ hidden: currentSection === totalSections }"
          @click="nextSection"
        >
          <ChevronRight :size="24" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sparkles,
  LayoutGrid,
  CheckSquare,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import { useOnboardingStore } from '~/stores/onboarding.store'

const onboardingStore = useOnboardingStore()
const router = useRouter()

const totalSections = 7
const currentSection = ref(1)
const isExiting = ref(false)
const showFlash = ref(false)

const modalRef = ref<HTMLElement | null>(null)
const logoWrapper = ref<HTMLElement | null>(null)
const finalLogoWrapper = ref<HTMLElement | null>(null)

function nextSection() {
  if (currentSection.value < totalSections) {
    currentSection.value++
  }
}
function prevSection() {
  if (currentSection.value > 1) {
    currentSection.value--
  }
}

function startJourney() {
  // Анимация вспышки и ухода логотипа
  showFlash.value = true
  isExiting.value = true

  // Находим логотип для анимации
  const logoEl = finalLogoWrapper.value?.querySelector(
    '.big-logo'
  ) as HTMLElement
  if (logoEl) {
    const rect = logoEl.getBoundingClientRect()
    // Создаём клон для полёта
    const clone = logoEl.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.left = rect.left + 'px'
    clone.style.top = rect.top + 'px'
    clone.style.fontSize = '5rem'
    clone.style.fontWeight = '800'
    clone.style.color = 'var(--accent)'
    clone.style.textShadow = '0 0 20px rgba(255,255,255,0.3)'
    clone.style.transition = 'all 0.8s cubic-bezier(0.2, 0.9, 0.4, 1)'
    clone.style.zIndex = '10000'
    document.body.appendChild(clone)

    // Целевая позиция — левый верхний угол (где хедер)
    const targetX = 24
    const targetY = 24

    requestAnimationFrame(() => {
      clone.style.left = targetX + 'px'
      clone.style.top = targetY + 'px'
      clone.style.fontSize = '1.2rem'
      clone.style.opacity = '0.8'
    })

    setTimeout(() => {
      clone.remove()
      onboardingStore.markAsSeen()
      router.push('/')
    }, 800)
  } else {
    // Если логотип не найден, просто завершаем
    setTimeout(() => {
      onboardingStore.markAsSeen()
      router.push('/')
    }, 600)
  }
}
</script>

<style scoped lang="scss">
.onboarding {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  z-index: 9999;
  transition: opacity 0.6s;
  &.exiting {
    opacity: 0;
    pointer-events: none;
  }
}

.flash-overlay {
  position: fixed;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  z-index: 10001;
  pointer-events: none;
  animation: flash 0.8s ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}

.background-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  width: 40vmax;
  height: 40vmax;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 70%
  );
  animation: float 20s infinite alternate ease-in-out;
  filter: blur(40px);

  &.shape1 {
    top: -10vh;
    left: -10vw;
    background: radial-gradient(
      circle,
      rgba(200, 200, 200, 0.04) 0%,
      transparent 70%
    );
    animation-duration: 25s;
  }
  &.shape2 {
    bottom: -5vh;
    right: -5vw;
    width: 50vmax;
    height: 50vmax;
    background: radial-gradient(
      circle,
      rgba(150, 150, 150, 0.03) 0%,
      transparent 70%
    );
    animation-duration: 30s;
    animation-direction: alternate-reverse;
  }
  &.shape3 {
    top: 30vh;
    left: 60vw;
    width: 30vmax;
    height: 30vmax;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.02) 0%,
      transparent 70%
    );
    animation-duration: 18s;
  }
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.9) 0%,
    rgba(10, 10, 10, 0.6) 100%
  );
  backdrop-filter: blur(20px);
}

.onboarding-modal {
  position: relative;
  width: 90%;
  max-width: 760px;
  min-height: 560px;
  @include glass;
  border-radius: 40px;
  padding: 40px 30px 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 10;
  backdrop-filter: blur(20px);
  background: rgba(18, 18, 18, 0.6);
  transition: opacity 0.4s;
  .exiting & {
    opacity: 0;
  }
}

.progress-track {
  position: absolute;
  top: 0;
  left: 30px;
  right: 30px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1);
  box-shadow: 0 0 8px var(--accent);
}

.section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 400px;
}

.welcome-section {
  text-align: center;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin: 0 auto 20px;
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  opacity: 0.15;
  filter: blur(20px);
  animation: pulse 3s infinite alternate;
}

.big-logo {
  font-size: 5rem;
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--accent);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

h1 {
  font-size: 2.8rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.tagline {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: var(--dim);
  margin-bottom: 32px;
}

.intro-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--accent);
  margin-bottom: 40px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 350;
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: var(--bg);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--dim);
  font-size: 0.9rem;
  .hint-icon {
    animation: bounce 2s infinite;
  }
}

.content-block {
  text-align: left;
  padding: 0 10px;
}

.section-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  .icon-ring {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    animation: spin 10s linear infinite;
  }
  .icon-svg {
    position: relative;
    z-index: 2;
    color: var(--accent);
  }
}

h2 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
  letter-spacing: -0.01em;
}

.description {
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--accent);
  margin-bottom: 30px;
  font-weight: 350;
  strong {
    font-weight: 500;
    color: var(--accent);
  }
}

.quote-block {
  text-align: center;
  font-style: italic;
  padding: 20px 24px;
  background: var(--bg);
  border-left: 2px solid var(--accent);
  border-radius: 12px;
  font-size: 1.1rem;
  margin-top: 10px;
}

.mockup-branches {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  .mockup-item {
    padding: 12px 24px;
    border-radius: 40px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-weight: 500;
    letter-spacing: 1px;
    backdrop-filter: blur(5px);
    transition: all 0.2s;
    &:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }
  }
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
  .tag-example {
    padding: 8px 18px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
  }
}

.league-progress-example {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  .league-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #333;
    &.bronze {
      background: #cd7f32;
      box-shadow: 0 0 10px #cd7f32;
    }
    &.silver {
      background: #c0c0c0;
      box-shadow: 0 0 10px #c0c0c0;
    }
    &.gold {
      background: #ffd700;
      box-shadow: 0 0 10px #ffd700;
    }
    &.platinum {
      background: #e5e4e2;
      box-shadow: 0 0 10px #e5e4e2;
    }
  }
}

.final {
  .cta-button {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 18px 40px;
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 40px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }
  }
}

.navigation-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--accent);
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--accent);
  }
  &.hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.section-dots {
  display: flex;
  gap: 16px;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s;
    &.active {
      width: 28px;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent);
    }
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(10%, 10%) rotate(10deg);
  }
}
@keyframes pulse {
  0% {
    opacity: 0.1;
    transform: scale(1);
  }
  100% {
    opacity: 0.25;
    transform: scale(1.2);
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.4s,
    transform 0.4s;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 600px) {
  .onboarding-modal {
    padding: 30px 20px 20px;
    min-height: 500px;
  }
  h1 {
    font-size: 2.2rem;
  }
  h2 {
    font-size: 1.6rem;
  }
  .big-logo {
    font-size: 3.5rem;
  }
  .intro-text {
    font-size: 1rem;
  }
  .description {
    font-size: 1rem;
  }
  .progress-track {
    left: 20px;
    right: 20px;
  }
  .mockup-branches {
    flex-wrap: wrap;
  }
}
</style>
