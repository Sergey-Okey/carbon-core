<template>
  <div class="onboarding">
    <div class="top-progress">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <div class="background-layer" aria-hidden="true">
      <span class="orb orb--one" />
      <span class="orb orb--two" />
      <span class="orb orb--three" />
      <span class="noise-mask" />
    </div>

    <header class="fixed-header">
      <div class="brand">
        <span class="brand-mark">CL</span>
        <span class="brand-name">Core of Life</span>
      </div>
      <div class="header-meta">
        <span class="beta-badge">active beta</span>
        <button class="skip-btn" @click="finishOnboarding">
          Пропустить
          <ChevronRight :size="16" />
        </button>
      </div>
    </header>

    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <section class="screen hero-screen">
        <div class="screen-content">
          <div class="section-label">Ваш новый ритм</div>
          <h1 class="hero-title">
            Меньше хаоса.
            <br />
            Больше смысла каждый день.
          </h1>
          <p class="hero-text">
            Core of Life помогает держать фокус, видеть прогресс и двигаться по
            своей траектории без перегруза списками.
          </p>
          <div class="hero-cta">
            <button class="cta-button" @click="finishOnboarding">
              Начать сейчас
              <ArrowRight :size="18" class="btn-icon" />
            </button>
            <p class="hint-text">
              Или листайте вниз — покажем философию и ключевые инструменты.
            </p>
          </div>

          <div class="stat-strip">
            <article v-for="item in heroStats" :key="item.title" class="stat-card">
              <span class="stat-title">{{ item.title }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </div>

        <aside class="hero-panel">
          <div class="hero-panel__frame">
            <div class="hero-panel__header">
              <span>Фокус-сессия</span>
              <Clock3 :size="16" />
            </div>
            <ul class="pulse-list">
              <li v-for="task in demoTasks" :key="task" class="pulse-item">
                <span class="pulse-dot" />
                <span>{{ task }}</span>
              </li>
            </ul>
            <div class="hero-tags">
              <span v-for="tag in tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </aside>
      </section>

      <section class="screen focus-screen">
        <div class="screen-content">
          <div class="section-label">Принцип фокуса</div>
          <h2 class="section-title">Правило трёх работает на каждом горизонте</h2>
          <p class="section-text">
            Вместо бесконечных списков — управляемый объём задач. Вы всегда
            понимаете, что важно сегодня, на неделе, в месяце и в году.
          </p>

          <div class="rules-grid">
            <article v-for="rule in rules" :key="rule.label" class="rule-card">
              <div class="rule-card__icon">
                <component :is="rule.icon" :size="20" />
              </div>
              <div class="rule-number">3</div>
              <div class="rule-label">{{ rule.label }}</div>
              <div class="rule-desc">{{ rule.desc }}</div>
            </article>
          </div>
        </div>
      </section>

      <section class="screen author-screen">
        <div class="screen-content">
          <div class="section-label">Третий экран: за кулисами</div>
          <h2 class="section-title">Проект создаёт один человек. Личность скрыта.</h2>
          <p class="section-text">
            Без громких обещаний и команды маркетинга. Только постоянная работа,
            реальные итерации и внимательное отношение к деталям.
          </p>

          <div class="mystery-layout">
            <article class="mystery-card">
              <div class="mystery-card__head">
                <Ghost :size="18" />
                <span>Кто разработчик?</span>
              </div>
              <p>
                Пока это остаётся интригой. Важно не имя, а качество продукта и
                прозрачный прогресс.
              </p>
            </article>
            <article class="mystery-card">
              <div class="mystery-card__head">
                <FlaskConical :size="18" />
                <span>Текущий статус</span>
              </div>
              <p>
                Core of Life находится в стадии активной разработки и бета-тестирования.
                Функции обновляются и улучшаются регулярно.
              </p>
            </article>
            <article class="mystery-card">
              <div class="mystery-card__head">
                <Radar :size="18" />
                <span>Что дальше</span>
              </div>
              <p>
                Впереди оптимизация UX, новые сценарии планирования и развитие
                аналитики прогресса.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="screen features-screen">
        <div class="screen-content">
          <div class="section-label">Что внутри</div>
          <h2 class="section-title">Инструменты, которые работают вместе</h2>
          <p class="section-text">
            Всё в едином рабочем пространстве: задачи, привычки, карта развития,
            аналитика и персональные настройки.
          </p>

          <div class="features-grid">
            <article v-for="feature in features" :key="feature.title" class="feature-card">
              <div class="feature-icon">
                <component :is="feature.icon" :size="20" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </article>
          </div>

          <div class="security-row">
            <div class="security-pill"><Shield :size="16" /> Локальное хранение</div>
            <div class="security-pill"><Download :size="16" /> Экспорт и импорт</div>
            <div class="security-pill"><Sparkles :size="16" /> Гибкая персонализация</div>
          </div>
        </div>
      </section>

      <section class="screen final-screen">
        <div class="screen-content final-content">
          <div class="section-label">Старт</div>
          <h2 class="final-title">Готовы собрать свой фокус?</h2>
          <p class="final-text">
            Начните с трёх задач на сегодня и почувствуйте, как меняется ритм
            дня, когда приоритеты действительно ясны.
          </p>
          <button class="cta-button cta-button--large" @click="finishOnboarding">
            Открыть Core of Life
            <ArrowRight :size="20" class="btn-icon" />
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  FlaskConical,
  Ghost,
  GitBranch,
  Radar,
  Shield,
  Sparkles,
  Target,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth.store'
import { useOnboardingStore } from '~/stores/onboarding.store'

definePageMeta({
  layout: false,
})

const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const router = useRouter()

const scrollContainer = ref<HTMLElement | null>(null)
const progress = ref(0)

const heroStats = [
  { title: 'Фокус', value: '3 приоритета' },
  { title: 'Прогресс', value: 'ежедневно' },
  { title: 'Ритм', value: 'без перегруза' },
]

const demoTasks = [
  'Закрыть ключевую задачу дня',
  'Поддержать важную привычку',
  'Сдвинуть личный проект на шаг',
]

const tags = ['#focus', '#discipline', '#progress', '#coreoflife']

const rules = [
  {
    icon: Target,
    label: 'На день',
    desc: 'Только три приоритета, которые реально закрыть.',
  },
  {
    icon: Calendar,
    label: 'На неделю',
    desc: 'Фиксируйте вектор недели, а не хаотичные списки.',
  },
  {
    icon: Compass,
    label: 'На месяц',
    desc: 'Собирайте крупные результаты из малых шагов.',
  },
  {
    icon: GitBranch,
    label: 'На год',
    desc: 'Держите курс и отслеживайте путь развития.',
  },
]

const features = [
  {
    icon: Calendar,
    title: 'Задачи и привычки',
    desc: 'Единый контур для повседневных действий и долгих серий.',
  },
  {
    icon: GitBranch,
    title: 'Карта развития',
    desc: 'Визуализируйте траекторию и отмечайте пройденные этапы.',
  },
  {
    icon: Radar,
    title: 'Аналитика',
    desc: 'Наблюдайте динамику прогресса и стабильность фокуса.',
  },
  {
    icon: Sparkles,
    title: 'Персонализация',
    desc: 'Настраивайте тему, акцент, анимации и рабочее окружение.',
  },
]

function finishOnboarding() {
  onboardingStore.markAsSeen()
  router.push(authStore.isAuthenticated ? '/' : '/register')
}

function handleScroll() {
  const container = scrollContainer.value
  if (!container) return
  const maxScroll = container.scrollHeight - container.clientHeight
  progress.value = maxScroll > 0 ? (container.scrollTop / maxScroll) * 100 : 0
}

function attachScrollListener() {
  const container = scrollContainer.value
  if (!container) return
  container.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
}

function detachScrollListener() {
  const container = scrollContainer.value
  if (!container) return
  container.removeEventListener('scroll', handleScroll)
}

onMounted(() => {
  attachScrollListener()
})

onUnmounted(() => {
  detachScrollListener()
})
</script>

<style scoped lang="scss">
.onboarding {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--accent);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: 3px;
  background: var(--border);

  .progress-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s linear;
  }
}

.background-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  opacity: 0.35;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  animation: drift 20s ease-in-out infinite alternate;
}

.orb--one {
  top: -12rem;
  left: -6rem;
  width: 24rem;
  height: 24rem;
}

.orb--two {
  right: -10rem;
  top: 25%;
  width: 28rem;
  height: 28rem;
  animation-duration: 26s;
}

.orb--three {
  left: 40%;
  bottom: -12rem;
  width: 22rem;
  height: 22rem;
  animation-duration: 22s;
}

.noise-mask {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--bg) 80%, transparent) 0%,
    var(--bg) 100%
  );
}

.fixed-header {
  position: fixed;
  top: 12px;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
}

.brand-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.header-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.beta-badge {
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.skip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--transition-standard),
    border-color var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    color: var(--accent);
    border-color: var(--accent);
    transform: translateY(-1px);
  }
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  padding-top: 64px;
}

.screen {
  min-height: calc(100dvh - 64px);
  display: flex;
  align-items: center;
  scroll-snap-align: start;
  padding: 48px 24px 52px;
}

.screen-content {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.section-label {
  margin-bottom: 14px;
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.77rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-title {
  margin: 0 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.9rem, 4.8vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.section-text {
  max-width: 70ch;
  margin: 0 0 28px;
  color: var(--dim);
  font-size: clamp(0.98rem, 1.8vw, 1.1rem);
  line-height: 1.65;
}

.hero-screen {
  .screen-content {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 22px;
    align-items: stretch;
  }
}

.hero-title {
  margin: 0 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.1rem, 6vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.hero-text {
  max-width: 60ch;
  margin: 0;
  color: var(--dim);
  font-size: clamp(1rem, 2.2vw, 1.18rem);
  line-height: 1.7;
}

.hero-cta {
  margin-top: 24px;
  display: grid;
  gap: 10px;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: fit-content;
  min-width: 180px;
  padding: 14px 24px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--accent);
  color: var(--bg);
  font-family: 'Manrope', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    box-shadow var(--transition-standard),
    opacity var(--transition-standard);

  .btn-icon {
    transition: transform var(--transition-standard);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);

    .btn-icon {
      transform: translateX(2px);
    }
  }
}

.cta-button--large {
  width: auto;
  min-width: 250px;
  padding: 16px 28px;
  font-size: 1rem;
}

.hint-text {
  margin: 0;
  color: var(--dim);
  font-size: 0.86rem;
}

.stat-strip {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  display: grid;
  gap: 2px;

  .stat-title {
    color: var(--dim);
    font-size: 0.78rem;
  }

  strong {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
  }
}

.hero-panel__frame {
  height: 100%;
  min-height: 280px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface) 92%, transparent),
      color-mix(in srgb, var(--surface) 80%, transparent)
    );
  padding: 18px;
  display: grid;
  gap: 16px;
  box-shadow: var(--shadow-md);
}

.hero-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--dim);
  font-size: 0.84rem;
  font-weight: 600;
}

.pulse-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pulse-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--accent);
  font-size: 0.92rem;
}

.pulse-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 20%, transparent);
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface) 90%, transparent);
    color: var(--dim);
    font-size: 0.76rem;
  }
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.rule-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  padding: 16px;
  display: grid;
  gap: 10px;
}

.rule-card__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.rule-number {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  line-height: 1;
}

.rule-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.94rem;
  font-weight: 700;
}

.rule-desc {
  color: var(--dim);
  font-size: 0.86rem;
  line-height: 1.5;
}

.mystery-layout {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.mystery-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background:
    radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--accent) 10%, transparent),
      transparent 40%
    ),
    color-mix(in srgb, var(--surface) 90%, transparent);
  display: grid;
  gap: 10px;

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.9rem;
    line-height: 1.6;
  }
}

.mystery-card__head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.86rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.feature-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  display: grid;
  gap: 8px;

  h3 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.9rem;
    line-height: 1.55;
  }
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.security-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.security-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  color: var(--dim);
  font-size: 0.8rem;
  font-weight: 600;
}

.final-content {
  max-width: 760px;
  text-align: center;
}

.final-title {
  margin: 0 0 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.1rem, 5vw, 3.6rem);
  line-height: 1.06;
  letter-spacing: -0.03em;
}

.final-text {
  margin: 0 auto 24px;
  color: var(--dim);
  max-width: 58ch;
  font-size: 1rem;
  line-height: 1.7;
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(8%, -6%, 0);
  }
}

@media (max-width: 1024px) {
  .hero-screen .screen-content {
    grid-template-columns: 1fr;
  }

  .rules-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mystery-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .fixed-header {
    top: 10px;
    padding: 0 12px;
  }

  .brand-name {
    display: none;
  }

  .beta-badge {
    display: none;
  }

  .skip-btn {
    padding: 8px 11px;
    font-size: 0.78rem;
  }

  .scroll-container {
    padding-top: 58px;
  }

  .screen {
    min-height: calc(100dvh - 58px);
    padding: 26px 12px 34px;
  }

  .section-title {
    font-size: clamp(1.7rem, 8vw, 2.3rem);
  }

  .hero-title {
    font-size: clamp(1.9rem, 11vw, 2.8rem);
  }

  .stat-strip {
    grid-template-columns: 1fr;
  }

  .rules-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-button,
  .cta-button--large {
    width: 100%;
  }
}
</style>
