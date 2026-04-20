<template>
  <div class="onboarding">
    <!-- Фоновый слой с анимированными фигурами (увеличенная непрозрачность) -->
    <div class="background-layer">
      <Motion
        v-for="(shape, i) in shapes"
        :key="i"
        :initial="{ opacity: 0, scale: 0.8 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.8, delay: i * 0.1 }"
        :class="['floating-shape', `shape${i + 1}`]"
        :style="{ background: shape.gradient }"
      />
      <div class="gradient-overlay"></div>
    </div>

    <!-- Фиксированный хедер -->
    <div class="fixed-header">
      <Motion
        :initial="{ opacity: 0, y: -15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
      >
        <div class="logo">COF</div>
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: -15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.1 }"
      >
        <div class="beta-badge">beta</div>
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: -15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.15 }"
      >
        <button class="skip-btn" @click="finishOnboarding">
          Пропустить
          <ChevronRight :size="16" />
        </button>
      </Motion>
    </div>

    <!-- Основной скроллящийся контент -->
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <!-- Секция 1: Hero с каруселью хештегов -->
      <section id="section-1" class="section hero-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.15 }"
          >
            <h1 class="hero-title">
              <span class="line">Меньше,</span>
              <span class="line">но лучше</span>
            </h1>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.25 }"
          >
            <p class="hero-subtitle">
              Core of Life — система осознанного развития,<br />
              где каждая задача приближает вас к цели
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.35 }"
          >
            <div class="hero-cta">
              <button class="cta-button" @click="finishOnboarding">
                Начать
                <ArrowRight :size="20" class="btn-icon" />
              </button>
              <span class="hint-text">или скролльте, чтобы узнать больше</span>
            </div>
          </Motion>
        </div>
        <div class="hero-visual">
          <div class="hashtag-carousel">
            <div class="carousel-row">
              <div class="carousel-track track-left">
                <span v-for="tag in leftTags" :key="tag" class="hashtag">{{
                  tag
                }}</span>
                <span
                  v-for="tag in leftTags"
                  :key="`dup-${tag}`"
                  class="hashtag"
                  >{{ tag }}</span
                >
              </div>
            </div>
            <div class="carousel-row">
              <div class="carousel-track track-right">
                <span v-for="tag in rightTags" :key="tag" class="hashtag">{{
                  tag
                }}</span>
                <span
                  v-for="tag in rightTags"
                  :key="`dup-${tag}`"
                  class="hashtag"
                  >{{ tag }}</span
                >
              </div>
            </div>
            <div class="carousel-row">
              <div class="carousel-track track-left">
                <span v-for="tag in leftTags2" :key="tag" class="hashtag">{{
                  tag
                }}</span>
                <span
                  v-for="tag in leftTags2"
                  :key="`dup-${tag}`"
                  class="hashtag"
                  >{{ tag }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Секция 2: Философия с анимацией чисел -->
      <section id="section-2" class="section philosophy-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Философия</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Три задачи,<br />
              которые меняют всё
            </h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              Бесконечные списки дел создают иллюзию продуктивности. COF
              предлагает правило трёх — не более 3 активных задач на день,
              неделю, месяц и год. Это освобождает ум и направляет энергию на
              действительно важное.
            </p>
          </Motion>
          <div class="rule-grid">
            <Motion
              v-for="(rule, i) in rules"
              :key="i"
              :initial="{ opacity: 0, scale: 0.8 }"
              :animate="section2Animated ? { opacity: 1, scale: 1 } : {}"
              :transition="{ duration: 0.4, delay: 0.3 + i * 0.08 }"
              class="rule-item"
            >
              <div class="rule-number">
                <span :key="section2Animated">{{ animatedNumbers[i] }}</span>
              </div>
              <div class="rule-label">{{ rule.label }}</div>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 3: Ветки развития – изображение с затемнением -->
      <section id="section-3" class="section branches-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Ветки развития</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Умные ветки<br />
              вашего прогресса
            </h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
            class="board-demo"
          >
            <div class="board-image-wrapper">
              <img
                src="/assets/images/board-demo.png"
                alt="Доска веток развития"
              />
              <div class="image-fade"></div>
            </div>
          </Motion>
        </div>
      </section>

      <!-- Секция 4: Конфиденциальность и хранение -->
      <section id="section-4" class="section privacy-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Конфиденциальность</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Ваши данные —<br />
              только ваши
            </h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              Все задачи, привычки, прогресс и настройки хранятся локально на
              вашем компьютере в зашифрованном виде. Никакие данные не
              передаются на сторонние серверы без вашего явного разрешения.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <div class="privacy-features">
              <div class="privacy-card">
                <Shield :size="32" />
                <h3>Локальное хранение</h3>
                <p>Данные никогда не покидают ваше устройство</p>
              </div>
              <div class="privacy-card">
                <Download :size="32" />
                <h3>Экспорт и импорт</h3>
                <p>Перенесите данные на другое устройство в один клик</p>
              </div>
              <div class="privacy-card">
                <RefreshCw :size="32" />
                <h3>Восстановление</h3>
                <p>Автоматические копии при выходе из приложения</p>
              </div>
            </div>
          </Motion>
        </div>
      </section>

      <!-- Секция 5: Задачи и привычки -->
      <section id="section-5" class="section tasks-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section5Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Задачи и привычки</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section5Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Гибкая система,<br />
              которая работает на вас
            </h2>
          </Motion>
          <div class="tasks-split">
            <Motion
              :initial="{ opacity: 0, x: -25 }"
              :animate="section5Animated ? { opacity: 1, x: 0 } : {}"
              :transition="{ duration: 0.5, delay: 0.2 }"
              class="task-block"
            >
              <div class="task-icon">
                <RotateCw :size="28" />
              </div>
              <h3>Привычки</h3>
              <p>
                Повторяемые действия без ограничений. Выполняйте многократно,
                зарабатывайте прогресс и формируйте базу.
              </p>
            </Motion>
            <Motion
              :initial="{ opacity: 0, x: 25 }"
              :animate="section5Animated ? { opacity: 1, x: 0 } : {}"
              :transition="{ duration: 0.5, delay: 0.3 }"
              class="task-block"
            >
              <div class="task-icon">
                <Calendar :size="28" />
              </div>
              <h3>Задачи</h3>
              <p>
                Ограничены правилом трёх. Фокус на главном, без распыления.
                Выполнили — добавьте новую.
              </p>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 6: Профиль и настройки -->
      <section id="section-6" class="section profile-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Ваше пространство</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Персонализация<br />
              и удобство
            </h2>
          </Motion>
          <div class="features-grid">
            <Motion
              v-for="(feature, i) in features"
              :key="i"
              :initial="{ opacity: 0, y: 25 }"
              :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
              :transition="{ duration: 0.4, delay: 0.2 + i * 0.08 }"
              class="feature-card"
            >
              <component :is="feature.icon" :size="32" />
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 7: О проекте и донаты -->
      <section id="section-7" class="section about-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">О проекте</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">
              Создано одним<br />
              разработчиком
            </h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              Core of Life — это персональный проект, который постоянно
              развивается. Сейчас он находится в стадии бета-тестирования,
              поэтому возможны небольшие недочёты.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <p class="section-text">
              Если вы заметили ошибку или у вас есть идеи по улучшению —
              напишите мне. Ваша обратная связь помогает делать продукт лучше.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="section7Animated ? { opacity: 1, scale: 1 } : {}"
            :transition="{ duration: 0.4, delay: 0.4 }"
            class="donation-block"
          >
            <Heart :size="20" />
            <span>Поддержать проект</span>
            <div class="wallet-address">
              <code>TXjoHFudFFQT6hXSqb55xz5W2KQUAAbnF8</code>
              <span class="network">TRC-20 (USDT)</span>
            </div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 15 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.4, delay: 0.5 }"
            class="contacts"
          >
            <div class="contact-item">
              <Mail :size="16" />
              <span>sergeyborisov_1@vk.ru</span>
            </div>
            <div class="contact-item">
              <Send :size="16" />
              <span>borisov_1 (telegram)</span>
            </div>
            <div class="contact-item">
              <Instagram :size="16" />
              <span>borisov.ph</span>
            </div>
          </Motion>
        </div>
      </section>

      <!-- Секция 8: Финальный CTA -->
      <section id="section-8" class="section final-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 25 }"
            :animate="section8Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <h2 class="final-title">
              Готовы начать<br />
              путь к лучшей версии себя?
            </h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="section8Animated ? { opacity: 1, scale: 1 } : {}"
            :transition="{ duration: 0.4, delay: 0.2 }"
          >
            <button class="cta-button large" @click="finishOnboarding">
              Начать использовать Core of Life
              <ArrowRight :size="24" class="btn-icon" />
            </button>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 15 }"
            :animate="section8Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.4, delay: 0.3 }"
          >
            <p class="final-hint">
              Вы всегда сможете вернуться к этому руководству, нажав на иконку
              вопроса в хедере
            </p>
          </Motion>
        </div>
      </section>
    </div>

    <!-- Прогресс-бар в виде SVG-змейки -->
    <div class="snake-progress">
      <svg viewBox="0 0 100 4" preserveAspectRatio="none">
        <Motion
          as="rect"
          :initial="{ width: '0%' }"
          :animate="{ width: progress + '%' }"
          :transition="{ duration: 0.25 }"
          x="0"
          y="0"
          height="4"
          fill="var(--accent)"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  RotateCw,
  Calendar,
  Palette,
  UserCircle,
  Heart,
  Mail,
  Send,
  Instagram,
  Shield,
  Download,
  RefreshCw,
} from 'lucide-vue-next'
import { useOnboardingStore } from '~/stores/onboarding.store'

const onboardingStore = useOnboardingStore()
const router = useRouter()

const scrollContainer = ref<HTMLElement | null>(null)
const progress = ref(0)

const section1Animated = ref(false)
const section2Animated = ref(false)
const section3Animated = ref(false)
const section4Animated = ref(false)
const section5Animated = ref(false)
const section6Animated = ref(false)
const section7Animated = ref(false)
const section8Animated = ref(false)

const shapes = [
  {
    gradient:
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 70%)',
  },
]

const leftTags = [
  '#финансы',
  '#тело',
  '#интеллект',
  '#лидерство',
  '#привычки',
  '#здоровье',
  '#план',
]
const rightTags = [
  '#фокус',
  '#правилотрёх',
  '#2026',
  '#осознанность',
  '#развитие',
  '#цели',
  '#дисциплина',
]
const leftTags2 = [
  '#рост',
  '#медитация',
  '#чтение',
  '#нетворкинг',
  '#карьера',
  '#баланс',
  '#энергия',
]

const rules = [
  { number: 3, label: 'задачи на день' },
  { number: 3, label: 'задачи на неделю' },
  { number: 3, label: 'задачи на месяц' },
  { number: 3, label: 'задачи на год' },
]

const features = [
  {
    icon: Palette,
    title: 'Тема и акценты',
    desc: 'Выбирайте светлую или тёмную тему, настраивайте акцентный цвет под настроение',
  },
  {
    icon: UserCircle,
    title: 'Профиль',
    desc: 'Имя, аватар, био — система адаптируется под вас',
  },
  {
    icon: Shield,
    title: 'Приватность',
    desc: 'Никакой аналитики, только вы и ваши данные',
  },
]

// Анимация чисел
const animatedNumbers = ref([0, 0, 0, 0])
watch(section2Animated, (val) => {
  if (val) {
    rules.forEach((rule, i) => {
      const target = rule.number
      let current = 0
      const step = target / 15
      const timer = setInterval(() => {
        current += step
        if (current >= target) {
          animatedNumbers.value[i] = target
          clearInterval(timer)
        } else {
          animatedNumbers.value[i] = Math.floor(current)
        }
      }, 30)
    })
  }
})

function finishOnboarding() {
  onboardingStore.markAsSeen()
  router.push('/')
}

function handleScroll() {
  const container = scrollContainer.value
  if (!container) return
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight - container.clientHeight
  progress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0

  const sections = document.querySelectorAll('.section')
  const containerCenter = container.clientHeight / 2
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const sectionCenter = rect.top + rect.height / 2
    const distanceFromCenter = Math.abs(sectionCenter - containerCenter)
    if (distanceFromCenter < rect.height / 2) {
      const id = section.id
      if (id === 'section-1') section1Animated.value = true
      if (id === 'section-2') section2Animated.value = true
      if (id === 'section-3') section3Animated.value = true
      if (id === 'section-4') section4Animated.value = true
      if (id === 'section-5') section5Animated.value = true
      if (id === 'section-6') section6Animated.value = true
      if (id === 'section-7') section7Animated.value = true
      if (id === 'section-8') section8Animated.value = true
    }
  })
}

onMounted(() => {
  const container = scrollContainer.value
  if (!container) return
  container.addEventListener('scroll', handleScroll)
  handleScroll()
  onUnmounted(() => container.removeEventListener('scroll', handleScroll))
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap');

.onboarding {
  position: fixed;
  inset: 0;
  background: #0a0a0a;
  color: var(--accent);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.background-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.floating-shape {
  position: absolute;
  width: 80vmax;
  height: 80vmax;
  border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%;
  animation: float 18s infinite alternate ease-in-out;
  filter: blur(80px);
  opacity: 0.7;
  &.shape1 {
    top: -30vh;
    left: -25vw;
  }
  &.shape2 {
    bottom: -25vh;
    right: -20vw;
    animation-duration: 22s;
    animation-direction: alternate-reverse;
  }
  &.shape3 {
    top: 35vh;
    left: 55vw;
    width: 60vmax;
    height: 60vmax;
    animation-duration: 15s;
  }
}
@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(15%, 15%) rotate(12deg);
  }
}
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.88) 0%,
    rgba(10, 10, 10, 0.65) 100%
  );
  backdrop-filter: blur(60px);
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.beta-badge {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--dim);
}
.skip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 40px;
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
  &::-webkit-scrollbar {
    width: 0;
  }
}

.section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 80px;
  position: relative;
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
.section-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.section-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: var(--dim);
  margin-bottom: 20px;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 30px;
  text-transform: uppercase;
}
.section-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--dim);
  max-width: 650px;
  margin-bottom: 40px;
}

// Hero Section
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  .hero-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(3.5rem, 8vw, 6rem);
    font-weight: 700;
    line-height: 1.05;
    margin-bottom: 24px;
    text-transform: uppercase;
    .line {
      display: block;
    }
  }
  .hero-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--dim);
    margin-bottom: 40px;
  }
  .hero-cta {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 36px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 50px;
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      .btn-icon {
        transform: translateX(5px);
      }
    }
    .btn-icon {
      transition: transform 0.2s;
    }
  }
  .hint-text {
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
    color: var(--dim);
  }
  .hero-visual {
    position: relative;
    height: 400px;
    overflow: hidden;
    mask-image: linear-gradient(
      to right,
      transparent,
      black 10%,
      black 90%,
      transparent
    );
  }
  .hashtag-carousel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 0;
  }
  .carousel-row {
    overflow: hidden;
  }
  .carousel-track {
    display: flex;
    gap: 20px;
    animation: scrollX 12s linear infinite;
    &.track-left {
      animation-direction: normal;
    }
    &.track-right {
      animation-direction: reverse;
    }
  }
  .hashtag {
    padding: 12px 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 40px;
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    white-space: nowrap;
    backdrop-filter: blur(5px);
  }
}
@keyframes scrollX {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

// Casino Numbers
.rule-grid {
  display: flex;
  gap: 50px;
  margin-top: 50px;
}
.rule-item {
  text-align: center;
  .rule-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 4.5rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
    min-width: 120px;
  }
  .rule-label {
    font-family: 'Manrope', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--dim);
    margin-top: 8px;
    text-transform: uppercase;
  }
}

// Board Demo (изображение с затемнением)
.board-demo {
  margin-top: 30px;
}
.board-image-wrapper {
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  .image-fade {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 30%, #0a0a0a 90%);
  }
}

// Privacy Section
.privacy-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}
.privacy-card {
  padding: 35px 25px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  svg {
    color: var(--accent);
    margin-bottom: 20px;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  p {
    font-family: 'Inter', sans-serif;
    color: var(--dim);
    line-height: 1.6;
  }
}

// Tasks Split
.tasks-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 50px 0;
}
.task-block {
  padding: 35px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  .task-icon {
    margin-bottom: 20px;
    color: var(--accent);
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  p {
    font-family: 'Inter', sans-serif;
    color: var(--dim);
    line-height: 1.7;
  }
}

// Features Grid
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;
}
.feature-card {
  padding: 35px 25px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  svg {
    color: var(--accent);
    margin-bottom: 20px;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  p {
    font-family: 'Inter', sans-serif;
    color: var(--dim);
    line-height: 1.6;
  }
}

// About Section
.donation-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 40px 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  text-align: center;
  .wallet-address {
    display: flex;
    flex-direction: column;
    gap: 4px;
    code {
      font-family: 'Manrope', monospace;
      font-size: 1rem;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
    }
    .network {
      font-size: 0.8rem;
      color: var(--dim);
    }
  }
}
.contacts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-top: 30px;
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 40px;
    font-family: 'Manrope', sans-serif;
    font-size: 0.85rem;
    color: var(--dim);
    svg {
      color: var(--accent);
    }
  }
}

// Final Section
.final-section {
  text-align: center;
  .final-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    margin-bottom: 40px;
  }
  .cta-button.large {
    padding: 22px 50px;
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
  .final-hint {
    font-family: 'Manrope', sans-serif;
    color: var(--dim);
  }
}

.snake-progress {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 100;
  svg {
    width: 100%;
    height: 100%;
  }
}

@media (max-width: 1000px) {
  .hero-section {
    grid-template-columns: 1fr;
    .hero-visual {
      height: 300px;
    }
  }
  .privacy-features,
  .tasks-split,
  .features-grid {
    grid-template-columns: 1fr;
  }
  .rule-grid {
    flex-wrap: wrap;
    justify-content: center;
  }
  .fixed-header {
    padding: 15px 25px;
  }
  .section {
    padding: 50px 30px;
  }
}
</style>
