<template>
  <div class="onboarding">
    <div class="top-progress" aria-hidden="true">
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
    </div>

    <ThemeToggleButton class="onboarding-theme-toggle" />

    <div class="stage-shell" aria-hidden="true">
      <AuthBrandStage class="stage-shell__brand" :show-copy="false" />
    </div>

    <div ref="scrollContainer" class="scroll-container" @scroll="handleScroll">
      <div class="first-slide">
        <header class="fixed-header">
          <div class="brand-row">
            <p class="logo">COF</p>
            <AppBadge size="sm" class="beta-badge">beta</AppBadge>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            @click="finishOnboarding"
          >
            Пропустить
            <ChevronRight :size="16" />
          </AppButton>
        </header>

        <section id="step-1" class="section hero-section">
          <div class="hero-stack">
            <p
              class="hero-mark"
              v-motion
              :initial="{ opacity: 0, y: 28 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 700,
                  ease: 'easeOut',
                },
              }"
            >
              COF
            </p>
            <h1
              class="hero-title"
              v-motion
              :initial="{ opacity: 0, y: 36 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { duration: 650, delay: 120, ease: 'easeOut' },
              }"
            >
              <span class="hero-title__line">Сфокусируйтесь</span>
              <span class="hero-title__line hero-title__line--accent"
                >на важном</span
              >
            </h1>
            <p
              class="hero-subtitle"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { duration: 550, delay: 220 },
              }"
            >
              Задачи, привычки и путь развития — в одном спокойном ритме.
            </p>
            <div
              class="hero-cta"
              v-motion
              :initial="{ opacity: 0, y: 16 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { duration: 500, delay: 320 },
              }"
            >
              <AppButton
                type="button"
                variant="primary"
                class="cta"
                @click="scrollToNextStep"
              >
                Смотреть принципы
                <ChevronRight :size="18" />
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                class="cta"
                :disabled="!apkDownloadUrl"
                @click="downloadApk"
              >
                <Download :size="16" />
                {{ apkDownloadUrl ? 'Скачать APK' : 'APK скоро' }}
              </AppButton>
            </div>
            <div
              class="hero-chips"
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{ opacity: 1, transition: { duration: 500, delay: 420 } }"
            >
              <span v-for="chip in heroChips" :key="chip" class="chip">{{
                chip
              }}</span>
            </div>
          </div>
          <button
            type="button"
            class="scroll-cue"
            aria-label="Листать дальше"
            @click="scrollToNextStep"
          >
            <span class="scroll-cue__dot" />
          </button>
        </section>
      </div>

      <section id="step-2" class="section chapter-section">
        <p class="chapter-index" aria-hidden="true">01</p>
        <div class="section-content">
          <p class="section-label">Философия</p>
          <h2
            class="section-title"
            v-motion
            :initial="{ opacity: 0, x: -24 }"
            :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 500 },
            }"
          >
            Три — число осознанности
          </h2>
          <p class="section-text">
            Длинные списки создают иллюзию занятости. Правило трёх на каждый
            горизонт освобождает внимание.
          </p>
          <div class="rule-rail">
            <div
              v-for="(rule, i) in rules"
              :key="rule.label"
              class="rule-card"
              v-motion
              :initial="{ opacity: 0, y: 28 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 420, delay: 80 + i * 70 },
              }"
            >
              <span class="rule-card__n">{{ rule.number }}</span>
              <span class="rule-card__label">{{ rule.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="step-3" class="section chapter-section">
        <p class="chapter-index" aria-hidden="true">02</p>
        <div class="section-content">
          <p class="section-label">Прогресс</p>
          <h2
            class="section-title"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 480 } }"
          >
            Видеть путь
          </h2>
          <p class="section-text">
            Доска связывает цели и вехи: вы всегда знаете, куда движетесь и что
            уже позади.
          </p>
          <div class="feature-strip">
            <div
              v-for="(feature, i) in features"
              :key="feature.label"
              class="feature-pill"
              v-motion
              :initial="{ opacity: 0, scale: 0.94 }"
              :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { duration: 400, delay: 90 + i * 80 },
              }"
            >
              <component :is="feature.icon" :size="20" />
              <span>{{ feature.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="step-4" class="section chapter-section">
        <p class="chapter-index" aria-hidden="true">03</p>
        <div class="section-content">
          <p class="section-label">Инструменты</p>
          <h2 class="section-title">Всё, что нужно</h2>
          <div class="tools-grid">
            <article
              v-for="(tool, i) in tools"
              :key="tool.title"
              class="tool-card"
              v-motion
              :initial="{ opacity: 0, y: 32 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 450, delay: 70 + i * 90 },
              }"
            >
              <component :is="tool.icon" :size="26" class="tool-card__icon" />
              <h3>{{ tool.title }}</h3>
              <p>{{ tool.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="step-5" class="section chapter-section">
        <p class="chapter-index" aria-hidden="true">04</p>
        <div class="section-content">
          <p class="section-label">Данные</p>
          <h2 class="section-title">Только ваши</h2>
          <p class="section-text">
            Облако синхронизирует устройства. Экспорт и локальные копии оставляют
            контроль у вас.
          </p>
          <div class="security-row">
            <AppBadge class="security-chip"
              ><Shield :size="15" /> Синхронизация</AppBadge
            >
            <AppBadge class="security-chip"
              ><Download :size="15" /> Экспорт</AppBadge
            >
            <AppBadge class="security-chip"
              ><Upload :size="15" /> Импорт</AppBadge
            >
          </div>
        </div>
      </section>

      <section id="step-6" class="section chapter-section">
        <p class="chapter-index" aria-hidden="true">05</p>
        <div class="section-content">
          <p class="section-label">О проекте</p>
          <h2 class="section-title">Независимая разработка</h2>
          <p class="section-text">
            COF создаётся одним разработчиком. Бета живая — детали
            дорабатываются постоянно.
          </p>
          <p class="section-text section-text--tight">
            Поддержите проект, если хотите ускорить развитие.
          </p>

          <div class="donation-block">
            <AppButton
              type="button"
              variant="secondary"
              :class="{ 'is-open': showDonation }"
              @click="showDonation = !showDonation"
            >
              <Heart :size="16" />
              Поддержать
              <ChevronRight :size="16" class="donation-chevron" />
            </AppButton>

            <div v-if="showDonation" class="donation-panel">
              <div class="donation-card">
                <span class="meta-badge">TRC-20 · USDT</span>
                <code class="wallet">TXjoHFudFFQT6hXSqb55xz5W2KQUAAbnF8</code>
                <p class="hint">Нажмите на адрес, чтобы скопировать</p>
              </div>
              <div class="donation-card">
                <span class="meta-badge">CloudTips</span>
                <p class="hint">Карта или СБП</p>
                <a
                  class="pay-link"
                  href="https://pay.cloudtips.ru/p/f36fd8ac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Перейти к переводу
                  <ArrowRight :size="15" />
                </a>
              </div>
            </div>
          </div>

          <div class="contacts">
            <a
              href="https://t.me/borisov_1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send :size="15" />
              Telegram
            </a>
            <a
              href="https://www.instagram.com/cof.board/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram :size="15" />
              @cof.board
            </a>
            <a href="mailto:sergeyborisov_1@vk.ru">
              <Mail :size="15" />
              Email
            </a>
          </div>
        </div>
      </section>

      <section id="step-7" class="section start-section">
        <div class="section-content start-content">
          <h2
            class="final-title"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 520 } }"
          >
            Начните сегодня
          </h2>
          <p class="final-text">
            Создайте три задачи — и почувствуйте, как фокус меняет день.
          </p>
          <div class="final-actions">
            <AppButton
              type="button"
              variant="primary"
              class="cta cta--xl"
              @click="finishOnboarding"
            >
              Открыть COF
              <ArrowRight :size="18" />
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              class="cta"
              :disabled="!apkDownloadUrl"
              @click="downloadApk"
            >
              <Download :size="16" />
              {{ apkDownloadUrl ? 'Скачать APK' : 'APK скоро' }}
            </AppButton>
          </div>
          <p class="final-hint">
            Гайд всегда доступен через иконку вопроса в хедере.
          </p>
        </div>
        <nav class="final-links" aria-label="Документы">
          <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
          <NuxtLink to="/terms">Условия</NuxtLink>
          <NuxtLink to="/support">Поддержка</NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Download,
  GitBranch,
  Heart,
  Instagram,
  Mail,
  Move,
  Palette,
  RotateCw,
  Send,
  Shield,
  Target,
  Upload,
  type LucideIcon,
} from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Управление задачами, привычками и целями',
  description:
    'Core of Life объединяет задачи, привычки, цели, аналитику и фокус в одном приложении.',
  ogTitle: 'Core of Life',
  ogDescription:
    'Управляйте задачами, привычками, целями и фокусом в едином личном пространстве.',
  ogType: 'website',
  twitterCard: 'summary',
  robots: 'index, follow',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Core of Life',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        description:
          'Приложение для управления задачами, привычками, целями, аналитикой и фокусом.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }),
    },
  ],
})

const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const router = useRouter()

const scrollContainer = ref<HTMLElement | null>(null)
const progress = ref(0)
const showDonation = ref(false)
const apkDownloadUrl = ''

const heroChips = ['фокус', 'привычки', 'цели', 'ритм']

const rules = [
  { number: 3, label: 'на день' },
  { number: 3, label: 'на неделю' },
  { number: 3, label: 'на месяц' },
  { number: 3, label: 'на год' },
]

const features = [
  { icon: GitBranch, label: 'Связывайте этапы' },
  { icon: Target, label: 'Отмечайте пройденное' },
  { icon: Move, label: 'Меняйте траекторию' },
]

const tools: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: RotateCw,
    title: 'Привычки',
    text: 'Закрепляйте ритуалы без лимита повторов.',
  },
  {
    icon: Calendar,
    title: 'Задачи',
    text: 'Три на горизонт — день, неделя, месяц, год.',
  },
  {
    icon: Palette,
    title: 'Стиль',
    text: 'Тема, акценты и профиль под ваш ритм.',
  },
]

function finishOnboarding() {
  onboardingStore.markAsSeen()
  router.push(authStore.isAuthenticated ? '/' : '/register')
}

function scrollToNextStep() {
  const container = scrollContainer.value
  const target = document.getElementById('step-2')
  if (!container || !target) return
  container.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
}

function downloadApk() {
  if (!apkDownloadUrl) return
  const anchor = document.createElement('a')
  anchor.href = apkDownloadUrl
  anchor.download = 'core-of-life.apk'
  anchor.click()
}

function handleScroll() {
  const container = scrollContainer.value
  if (!container) return
  const max = container.scrollHeight - container.clientHeight
  progress.value = max > 0 ? (container.scrollTop / max) * 100 : 0
}

onMounted(() => {
  handleScroll()
})
</script>

<style scoped lang="scss">
.onboarding {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  isolation: isolate;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: 'Manrope', sans-serif;
}

.stage-shell {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}

.stage-shell__brand {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.onboarding-theme-toggle {
  position: fixed;
  right: max(var(--space-5), env(safe-area-inset-right, 0px));
  bottom: max(var(--space-5), env(safe-area-inset-bottom, 0px));
  z-index: 260;
}

.top-progress {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 200;
  height: 2px;
  background: var(--ui-border-color);

  .progress-fill {
    height: 100%;
    width: 0%;
    background: var(--color-accent);
    transition: width 120ms linear;
  }
}

.scroll-container {
  position: relative;
  z-index: 2;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 0;
  }
}

.first-slide {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.fixed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-block: calc(env(safe-area-inset-top, 0px) + var(--space-4))
    var(--space-3);
  padding-inline: max(var(--space-5), env(safe-area-inset-left, 0px))
    max(var(--space-5), env(safe-area-inset-right, 0px));
  border: none;
  background: color-mix(in srgb, var(--color-bg) 58%, transparent);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.logo {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
}

.beta-badge {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100dvh;
  padding: calc(var(--space-12) + var(--space-2))
    max(var(--space-6), env(safe-area-inset-right, 0px))
    var(--space-12)
    max(var(--space-6), env(safe-area-inset-left, 0px));
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.section-content {
  position: relative;
  z-index: 1;
  width: min(100%, 920px);
  margin-inline: auto;
}

.chapter-index {
  position: absolute;
  right: max(var(--space-4), env(safe-area-inset-right, 0px));
  top: 18%;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(5rem, 18vw, 12rem);
  font-weight: var(--weight-bold);
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: color-mix(in srgb, var(--color-text-primary) 7%, transparent);
  pointer-events: none;
  user-select: none;
}

.section-label {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.section-title {
  margin: 0 0 var(--space-5);
  max-width: 14ch;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.1rem, 6vw, 3.6rem);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.035em;
  color: var(--color-text-primary);
}

.section-text {
  margin: 0 0 var(--space-8);
  max-width: 36rem;
  font-size: clamp(var(--text-md), 2vw, var(--text-lg));
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.section-text--tight {
  margin-top: calc(var(--space-4) * -1);
  margin-bottom: var(--space-6);
}

.hero-section {
  flex-direction: column;
  justify-content: center;
  min-height: calc(100dvh - 88px);
  scroll-snap-align: none;
  padding-top: var(--space-6);
}

.hero-stack {
  width: min(100%, 820px);
  margin-inline: auto;
  text-align: left;
}

.hero-mark {
  margin: 0 0 var(--space-4);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(4.5rem, 18vw, 9.5rem);
  font-weight: var(--weight-bold);
  line-height: 0.86;
  letter-spacing: -0.07em;
  color: var(--color-text-primary);
}

.hero-title {
  margin: 0 0 var(--space-5);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.85rem, 5.5vw, 3.25rem);
  font-weight: var(--weight-semibold);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.hero-title__line {
  display: block;
}

.hero-title__line--accent {
  color: var(--color-text-secondary);
}

.hero-subtitle {
  margin: 0 0 var(--space-7);
  max-width: 28rem;
  font-size: clamp(var(--text-md), 2.2vw, var(--text-xl));
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.hero-cta,
.final-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.cta {
  min-height: 48px;
  padding-inline: var(--space-5);
}

.cta--xl {
  min-height: 52px;
  padding-inline: var(--space-7);
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-7);
}

.chip {
  padding: var(--space-2) var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-1) 80%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: max(var(--space-8), env(safe-area-inset-bottom, 0px));
  display: grid;
  place-items: center;
  width: 28px;
  height: 44px;
  padding: 0;
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-1) 70%, transparent);
  transform: translateX(-50%);
  cursor: pointer;
}

.scroll-cue__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  animation: cue-bounce 1.6s var(--ease-emphasized) infinite;
}

@keyframes cue-bounce {
  0%,
  100% {
    transform: translateY(-6px);
    opacity: 0.35;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}

.rule-rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}

.rule-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-5);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-1) 88%, transparent);
}

.rule-card__n {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: var(--weight-bold);
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--color-accent);
}

.rule-card__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.feature-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.feature-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-1);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);

  svg {
    flex-shrink: 0;
    color: var(--color-accent);
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-2);
}

.tool-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100%;
  padding: var(--space-6);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);

  h3 {
    margin: 0 0 var(--space-2);
    font-family: 'Space Grotesk', sans-serif;
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 0;
    margin-top: auto;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }
}

.tool-card__icon {
  margin-bottom: var(--space-5);
  color: var(--color-accent);
}

.security-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.security-chip {
  gap: var(--space-2);
  min-height: 36px;
  padding-inline: var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-surface-1);
  color: var(--color-text-primary);
  font-weight: var(--weight-semibold);
}

.donation-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.donation-chevron {
  transition: transform var(--transition-standard);
}

.is-open .donation-chevron {
  transform: rotate(90deg);
}

.donation-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  width: min(100%, 720px);
}

.donation-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-5);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);
}

.meta-badge {
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.wallet {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-accent);
  word-break: break-all;
  user-select: all;
  cursor: copy;
}

.hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.pay-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  align-self: flex-start;
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-bg);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  transition: opacity var(--transition-standard);

  &:hover {
    opacity: 0.92;
  }
}

.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    min-height: 40px;
    padding: 0 var(--space-4);
    border: var(--ui-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-1);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    text-decoration: none;
    transition:
      color var(--transition-standard),
      border-color var(--transition-standard),
      background var(--transition-standard);

    &:hover {
      color: var(--color-text-primary);
      border-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 6%, transparent);
    }
  }
}

.start-section {
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding-bottom: calc(var(--space-12) * 2);
}

.start-content {
  display: grid;
  justify-items: center;
}

.final-title {
  margin: 0 0 var(--space-4);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.4rem, 7vw, 4rem);
  font-weight: var(--weight-bold);
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
}

.final-text {
  margin: 0 0 var(--space-8);
  max-width: 28rem;
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.final-hint {
  margin: var(--space-6) 0 0;
  max-width: 26rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.final-links {
  position: absolute;
  inset-inline: var(--space-5);
  bottom: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-xs);

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-text-secondary);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue__dot {
    animation: none;
  }
}

@media (max-width: 900px) {
  .rule-rail,
  .tools-grid,
  .donation-panel {
    grid-template-columns: 1fr;
  }

  .chapter-index {
    top: 12%;
    font-size: clamp(4rem, 22vw, 7rem);
  }
}

@media (max-width: 768px) {
  .onboarding-theme-toggle {
    right: max(var(--space-3), env(safe-area-inset-right, 0px));
    bottom: max(var(--space-3), env(safe-area-inset-bottom, 0px));
  }

  .fixed-header {
    padding-block: calc(env(safe-area-inset-top, 0px) + var(--space-3))
      var(--space-2);
    padding-inline: max(var(--space-3), env(safe-area-inset-left, 0px))
      max(var(--space-3), env(safe-area-inset-right, 0px));
  }

  .beta-badge {
    display: none;
  }

  .section {
    padding: var(--space-8) var(--space-4);
  }

  .hero-cta,
  .final-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .cta,
  .cta--xl,
  .pay-link {
    width: 100%;
    justify-content: center;
  }

  .feature-pill,
  .security-chip {
    width: 100%;
    justify-content: center;
  }

  .contacts a {
    flex: 1 1 calc(50% - var(--space-2));
    justify-content: center;
  }

  .scroll-cue {
    display: none;
  }
}
</style>
