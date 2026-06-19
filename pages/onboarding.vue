<template>
  <div class="onboarding">
    <div class="top-progress">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <ThemeToggleButton class="onboarding-theme-toggle" />

    <div class="background-layer">
      <div class="board-sphere">
        <div class="sphere-core"></div>
        <div class="marker-orbit marker-orbit--outer">
          <span class="board-marker branch-marker marker-one"></span>
          <span class="board-marker milestone-marker marker-two"></span>
          <span class="board-marker milestone-marker marker-three"></span>
        </div>
        <div class="marker-orbit marker-orbit--middle">
          <span class="board-marker milestone-marker marker-one"></span>
          <span class="board-marker branch-marker marker-two"></span>
          <span class="board-marker milestone-marker marker-three"></span>
        </div>
        <div class="marker-orbit marker-orbit--inner">
          <span class="board-marker branch-marker marker-one"></span>
          <span class="board-marker milestone-marker marker-two"></span>
        </div>
      </div>
      <div class="gradient-overlay"></div>
    </div>

    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <div class="first-slide">
        <div class="fixed-header">
          <div
            v-motion
            :initial="{ opacity: 0, y: -10 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 240 } }"
          >
            <div class="logo">COF</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: -10 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 240, delay: 60 } }"
          >
            <div class="beta-badge">beta</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: -10 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 240, delay: 90 } }"
          >
            <button class="skip-btn" @click="finishOnboarding">
              Пропустить
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <section id="step-1" class="section hero-section">
          <div class="section-content">
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 360, delay: 60 },
              }"
            >
              <h1 class="hero-title">
                <span class="line">Сфокусируйтесь</span>
                <span class="line">на важном</span>
              </h1>
            </div>
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 360, delay: 120 },
              }"
            >
              <p class="hero-subtitle">
                COF — минималистичная система для тех, кто хочет управлять
                задачами, привычками и видеть прогресс без лишнего шума.
              </p>
            </div>
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 360, delay: 180 },
              }"
            >
              <div class="hero-cta">
                <button
                  class="cta-button cta-button--details"
                  type="button"
                  aria-label="Подробнее"
                  @click="scrollToNextStep"
                >
                  Подробнее
                  <ChevronRight :size="20" class="btn-icon" />
                </button>
                <button
                  class="apk-button"
                  :class="{ disabled: !apkDownloadUrl }"
                  type="button"
                  :disabled="!apkDownloadUrl"
                  @click="downloadApk"
                >
                  <Download :size="18" />
                  <span>{{ apkDownloadUrl ? 'Скачать APK' : 'APK скоро' }}</span>
                </button>
                <span class="hint-text"
                  >или листайте дальше, чтобы узнать принципы</span
                >
              </div>
            </div>
          </div>
          <div
            class="hero-visual"
            ref="heroVisualRef"
            @pointermove="handlePointerMove"
            @pointerleave="handlePointerLeave"
          >
            <div class="hashtag-cloud">
              <span
                v-for="(tag, i) in allTags"
                :key="tag.id"
                :ref="(el) => setTagRef(el, i)"
                class="hashtag"
              >
                {{ tag.label }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section id="step-2" class="section rule-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <div class="section-label">Философия</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <h2 class="section-title">Три — число осознанности</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 120 },
            }"
          >
            <p class="section-text">
              Длинные списки создают иллюзию занятости. Правило трёх на каждый
              горизонт освобождает внимание и направляет энергию туда, где она
              действительно нужна.
            </p>
          </div>
          <div class="rule-grid">
            <div
              v-for="(rule, i) in rules"
              :key="i"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: 180 + i * 60 },
              }"
              class="rule-item"
            >
              <div class="rule-number">{{ rule.number }}</div>
              <div class="rule-label">{{ rule.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="step-3" class="section visual-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <div class="section-label">Прогресс</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <h2 class="section-title">Видеть путь</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 120 },
            }"
          >
            <p class="section-text">
              Интерактивная доска позволяет строить маршрут развития: добавляйте
              этапы, связывайте их, отмечайте пройденное. Вы всегда знаете, куда
              движетесь и что уже позади.
            </p>
          </div>
          <div class="visual-features">
            <div class="feature-row">
              <GitBranch :size="28" />
              <span>Связывайте этапы</span>
            </div>
            <div class="feature-row">
              <Target :size="28" />
              <span>Отмечайте пройденное</span>
            </div>
            <div class="feature-row">
              <Move :size="28" />
              <span>Меняйте траекторию</span>
            </div>
          </div>
        </div>
      </section>

      <section id="step-4" class="section tools-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <div class="section-label">Инструменты</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <h2 class="section-title">Всё, что нужно</h2>
          </div>
          <div class="tools-grid">
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: 120 },
              }"
              class="tool-card"
            >
              <RotateCw :size="32" />
              <h3>Привычки</h3>
              <p>Повторяйте без ограничений — закрепляйте ритуалы</p>
            </div>
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: 180 },
              }"
              class="tool-card"
            >
              <Calendar :size="32" />
              <h3>Задачи</h3>
              <p>Три на день, неделю, месяц, год — фокус на главном</p>
            </div>
            <div
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: 240 },
              }"
              class="tool-card"
            >
              <Palette :size="32" />
              <h3>Персонализация</h3>
              <p>Тема, акценты, аватар — настройте под себя</p>
            </div>
          </div>
        </div>
      </section>

      <section id="step-5" class="section security-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <div class="section-label">Данные</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <h2 class="section-title">Только ваши</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 120 },
            }"
          >
            <p class="section-text">
              Облачный аккаунт синхронизирует данные между устройствами, а
              экспорт, импорт и локальные резервные копии оставляют контроль у вас.
            </p>
          </div>
          <div class="security-badges">
            <div class="badge"><Shield :size="20" /> Синхронизация</div>
            <div class="badge"><Download :size="20" /> Экспорт</div>
            <div class="badge"><Upload :size="20" /> Импорт</div>
          </div>
        </div>
      </section>

      <section id="step-6" class="section about-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <div class="section-label">О проекте</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <h2 class="section-title">Независимая разработка</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 120 },
            }"
          >
            <p class="section-text about-text">
              COF создаётся одним разработчиком как персональный инструмент для
              осознанного управления задачами. Проект находится в активной
              бета‑стадии — возможны мелкие недочёты, но каждая деталь
              дорабатывается.
            </p>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 180 },
            }"
          >
            <p class="section-text about-text">
              Поддержите разработку — любая сумма помогает быстрее выпускать
              новые возможности.
            </p>
          </div>
          <div class="donation-wrapper">
            <button
              class="donation-btn"
              :class="{ expanded: showDonation }"
              @click="showDonation = !showDonation"
            >
              <Heart :size="20" />
              <span>Поддержать проект</span>
              <ChevronRight :size="16" class="chevron" />
            </button>
            <div v-if="showDonation" class="donation-content">
              <div class="donation-options">
                <div class="wallet-info">
                  <span class="network-badge">TRC-20 (USDT)</span>
                  <code class="wallet-code"
                    >TXjoHFudFFQT6hXSqb55xz5W2KQUAAbnF8</code
                  >
                  <p class="donation-hint">Нажмите на адрес, чтобы скопировать</p>
                </div>
                <div class="cloudtips-card">
                  <div class="cloudtips-head">
                    <span class="network-badge">CloudTips</span>
                    <span>Быстрый перевод</span>
                  </div>
                  <p>Поддержать разработку банковской картой или через СБП.</p>
                  <a
                    class="cloudtips-link"
                    href="https://pay.cloudtips.ru/p/f36fd8ac"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Перейти к переводу
                    <ArrowRight :size="16" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="contacts">
            <a href="https://t.me/borisov_1" target="_blank" rel="noopener noreferrer">
              <Send :size="16" />
              <span>Telegram</span>
            </a>
            <a
              href="https://www.instagram.com/borisov.volkov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram :size="16" />
              <span>Instagram</span>
            </a>
            <a href="mailto:sergeyborisov_1@vk.ru">
              <Mail :size="16" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>

      <section id="step-7" class="section start-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 360 } }"
          >
            <h2 class="final-title">Начните сегодня</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 360, delay: 60 },
            }"
          >
            <p class="final-text">
              Создайте три задачи и почувствуйте, как фокус меняет всё.
            </p>
          </div>
          <div
            v-motion
            class="final-actions"
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible-once="{
              opacity: 1,
              scale: 1,
              transition: { duration: 300, delay: 120 },
            }"
          >
            <button class="cta-button large" @click="finishOnboarding">
              Открыть COF
              <ArrowRight :size="24" class="btn-icon" />
            </button>
            <button
              class="apk-button final-apk"
              :class="{ disabled: !apkDownloadUrl }"
              type="button"
              :disabled="!apkDownloadUrl"
              @click="downloadApk"
            >
              <Download :size="18" />
              <span>{{ apkDownloadUrl ? 'Скачать APK' : 'APK скоро' }}</span>
            </button>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 300, delay: 180 },
            }"
          >
            <p class="final-hint">
              В любой момент вернитесь к гайду через иконку вопроса в хедере.
            </p>
          </div>
        </div>
        <div class="final-links">
          <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
          <NuxtLink to="/terms">Условия</NuxtLink>
          <NuxtLink to="/support">Поддержка</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue'
import {
  ChevronRight,
  ArrowRight,
  RotateCw,
  Calendar,
  Palette,
  GitBranch,
  LayoutGrid,
  Target,
  Move,
  Shield,
  Download,
  Upload,
  Heart,
  Instagram,
  Mail,
  Send,
} from 'lucide-vue-next'
import { useOnboardingStore } from '~/stores/onboarding.store'
import { useAuthStore } from '~/stores/auth.store'
import ThemeToggleButton from '~/components/ui/ThemeToggleButton.vue'

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

const allTags = [
  { id: 't1', label: '#фокус' },
  { id: 't2', label: '#осознанность' },
  { id: 't3', label: '#правилотрёх' },
  { id: 't4', label: '#cof' },
  { id: 't5', label: '#развитие' },
  { id: 't6', label: '#привычки' },
  { id: 't7', label: '#цели' },
  { id: 't8', label: '#работа' },
  { id: 't9', label: '#бизнес' },
  { id: 't10', label: '#работа' },
  { id: '11', label: '#фитнес' },
  { id: '12', label: '#практика' },
]

const rules = [
  { number: 3, label: 'задачи на день' },
  { number: 3, label: 'на неделю' },
  { number: 3, label: 'на месяц' },
  { number: 3, label: 'на год' },
]

const heroVisualRef = ref<HTMLElement | null>(null)
const tagRefs = ref<(HTMLElement | null)[]>([])
const pointer = ref({ x: 0, y: 0, active: false })
let animationFrameId: number | null = null

function setTagRef(
  el: Element | ComponentPublicInstance | null,
  index: number
) {
  tagRefs.value[index] = el as HTMLElement | null
}

function handlePointerMove(event: PointerEvent) {
  pointer.value = { x: event.clientX, y: event.clientY, active: true }
}

function handlePointerLeave() {
  pointer.value.active = false
}

function animateTags(time: number) {
  const tags = tagRefs.value
  const p = pointer.value
  const container = heroVisualRef.value
  const isMobile = window.innerWidth < 768

  tags.forEach((tagEl, i) => {
    if (!tagEl) return

    const baseX = Math.sin(time * 0.0007 + i * 0.9) * (isMobile ? 4 : 8)
    const baseY = Math.cos(time * 0.0009 + i * 0.8) * (isMobile ? 3 : 6)

    let repelX = 0
    let repelY = 0

    if (p.active && container) {
      const rect = tagEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = cx - p.x
      const dy = cy - p.y
      const distance = Math.hypot(dx, dy)
      const radius = isMobile ? 72 : 120

      if (distance < radius && distance > 0.001) {
        const force = ((radius - distance) / radius) * (isMobile ? 8 : 16)
        repelX = (dx / distance) * force
        repelY = (dy / distance) * force
      }
    }

    tagEl.style.transform = `translate3d(${(baseX + repelX).toFixed(2)}px, ${(baseY + repelY).toFixed(2)}px, 0)`
  })

  animationFrameId = window.requestAnimationFrame(animateTags)
}

function finishOnboarding() {
  onboardingStore.markAsSeen()
  router.push(authStore.isAuthenticated ? '/' : '/register')
}

function scrollToNextStep() {
  const container = scrollContainer.value
  const target = document.getElementById('step-2')
  if (!container || !target) return

  container.scrollTo({
    top: target.offsetTop,
    behavior: 'smooth',
  })
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
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight - container.clientHeight
  progress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

onMounted(() => {
  handleScroll()
  animationFrameId = window.requestAnimationFrame(animateTags)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped lang="scss">
.onboarding {
  position: fixed;
  inset: 0;
  background: var(--bg);
  color: var(--accent);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  isolation: isolate;
}

.onboarding-theme-toggle {
  position: fixed;
  right: max(20px, env(safe-area-inset-right, 0px));
  bottom: max(20px, env(safe-area-inset-bottom, 0px));
  z-index: 260;
}

.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--ui-border-color);
  z-index: 200;
  .progress-fill {
    height: 100%;
    background: var(--accent);
    width: 0%;
    transition: width 0.14s linear;
  }
}

.background-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.board-sphere {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(58vw, 660px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 24px 54px color-mix(in srgb, var(--accent) 8%, transparent));
}

.sphere-core {
  position: absolute;
  inset: 35%;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--surface) 42%, transparent);
  outline: 1px solid color-mix(in srgb, var(--accent) 7%, transparent);
  outline-offset: 12px;
  box-shadow:
    inset 12px 14px 22px color-mix(in srgb, var(--accent) 8%, transparent),
    inset -18px -22px 34px color-mix(in srgb, var(--bg) 42%, transparent),
    0 0 48px color-mix(in srgb, var(--accent) 8%, transparent),
    0 0 0 24px color-mix(in srgb, var(--surface) 4%, transparent);
}

.marker-orbit {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--accent) 13%, transparent);
  border-radius: 50%;
  will-change: transform;
  transform-origin: center;
  box-shadow:
    inset 0 0 24px color-mix(in srgb, var(--accent) 3%, transparent),
    0 0 18px color-mix(in srgb, var(--accent) 3%, transparent);
}

.marker-orbit--outer {
  inset: 8% -8% 20%;
  border-style: dashed;
  animation: orbit-spin-outer 34s linear infinite;
}

.marker-orbit--middle {
  inset: 17% 4% 12%;
  border-color: color-mix(in srgb, var(--accent) 18%, transparent);
  animation: orbit-spin-middle 26s linear infinite;
}

.marker-orbit--inner {
  inset: 27% 17% 25%;
  border-style: dotted;
  border-color: color-mix(in srgb, var(--accent) 22%, transparent);
  animation: orbit-spin-inner 20s linear infinite;
}

.board-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  border: none;
  background: var(--accent);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--accent) 7%, transparent),
    0 0 18px color-mix(in srgb, var(--accent) 52%, transparent);
  transition:
    top 0.85s ease-out,
    left 0.85s ease-out,
    background 0.85s ease-out;
}

.branch-marker {
  border-radius: 2px;
}

.milestone-marker {
  border-radius: 50%;
}

.marker-one {
  top: -5px;
  left: 50%;
  animation:
    marker-float 2.8s ease-in-out infinite alternate,
    marker-shuffle-a 17s ease-in-out infinite;
}

.marker-two {
  top: 50%;
  left: calc(100% - 5px);
  animation:
    marker-float 3.1s -1.2s ease-in-out infinite alternate,
    marker-shuffle-b 23s -7s ease-in-out infinite;
}

.marker-three {
  top: 82%;
  left: 14%;
  animation:
    marker-float 3.4s -2.4s ease-in-out infinite alternate,
    marker-shuffle-c 19s -12s ease-in-out infinite;
}

.marker-orbit--middle .marker-one {
  animation-duration: 4.6s, 21s;
  animation-delay: -2s, -13s;
}

.marker-orbit--middle .marker-two {
  animation-duration: 3.9s, 18s;
  animation-delay: -1s, -4s;
}

.marker-orbit--middle .marker-three {
  animation-duration: 5.4s, 25s;
  animation-delay: -3s, -17s;
}

.marker-orbit--inner .marker-one {
  animation-duration: 4.1s, 14s;
  animation-delay: -2.6s, -8s;
}

.marker-orbit--inner .marker-two {
  animation-duration: 5.2s, 20s;
  animation-delay: -1.8s, -15s;
}

@keyframes orbit-spin-outer {
  from {
    transform: rotate(-14deg);
  }
  to {
    transform: rotate(346deg);
  }
}

@keyframes orbit-spin-middle {
  from {
    transform: rotate(34deg);
  }
  to {
    transform: rotate(-326deg);
  }
}

@keyframes orbit-spin-inner {
  from {
    transform: rotate(-52deg);
  }
  to {
    transform: rotate(308deg);
  }
}

@keyframes marker-float {
  from {
    translate: 0 -2px;
    scale: 0.92;
    opacity: 0.62;
  }
  to {
    translate: 0 3px;
    scale: 1.12;
    opacity: 1;
  }
}

@keyframes marker-shuffle-a {
  0%,
  100% {
    top: -5px;
    left: 50%;
    background: var(--accent);
  }
  28% {
    top: 22%;
    left: 92%;
    background: color-mix(in srgb, var(--accent) 70%, var(--success));
  }
  57% {
    top: 88%;
    left: 68%;
    background: color-mix(in srgb, var(--success) 70%, var(--text));
  }
  81% {
    top: 62%;
    left: 4%;
    background: color-mix(in srgb, var(--warning) 70%, var(--text));
  }
}

@keyframes marker-shuffle-b {
  0%,
  100% {
    top: 50%;
    left: calc(100% - 5px);
    background: var(--accent);
  }
  24% {
    top: 86%;
    left: 20%;
    background: color-mix(in srgb, var(--error) 45%, var(--text));
  }
  52% {
    top: 8%;
    left: 18%;
    background: color-mix(in srgb, var(--accent) 65%, var(--bg));
  }
  76% {
    top: 68%;
    left: 86%;
    background: color-mix(in srgb, var(--accent) 55%, var(--text));
  }
}

@keyframes marker-shuffle-c {
  0%,
  100% {
    top: 82%;
    left: 14%;
    background: var(--accent);
  }
  31% {
    top: 4%;
    left: 62%;
    background: color-mix(in srgb, var(--warning) 75%, var(--text));
  }
  63% {
    top: 46%;
    left: 94%;
    background: color-mix(in srgb, var(--success) 75%, var(--text));
  }
  84% {
    top: 72%;
    left: 42%;
    background: color-mix(in srgb, var(--accent) 72%, var(--bg));
  }
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
  background: color-mix(in srgb, var(--bg) 34%, transparent);
}

.fixed-header,
.scroll-container {
  position: relative;
  z-index: 10;
}

.first-slide {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.fixed-header {
  position: static;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-block: calc(env(safe-area-inset-top, 0px) + 18px) 12px;
  padding-inline: max(20px, env(safe-area-inset-left, 0px))
    max(20px, env(safe-area-inset-right, 0px));
  background: color-mix(in srgb, var(--bg) 68%, transparent);
  border: none;
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}
.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--accent);
  white-space: nowrap;
}
.beta-badge {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: var(--ui-border);
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
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  border: var(--ui-border);
  border-radius: 40px;
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.1s,
    border-color 0.1s,
    color 0.1s;
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
  will-change: transform;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 0;
  }
}

.section {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 52px 40px 44px;
  position: relative;
  transform: translate3d(0, 0, 0);
  scroll-snap-align: start;
  scroll-snap-stop: always;

  @media (max-width: 768px) {
  .onboarding-theme-toggle {
    right: max(14px, env(safe-area-inset-right, 0px));
    bottom: max(14px, env(safe-area-inset-bottom, 0px));
  }
    padding: 40px 20px 32px;
    min-height: 100dvh;
  }
}
.section-content {
  max-width: 1100px;
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
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 25px;
  color: var(--accent);
}
.section-text {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 4vw, 1.2rem);
  line-height: 1.7;
  color: var(--dim);
  max-width: 700px;
  margin-bottom: 40px;
}

.hero-section {
  min-height: calc(100dvh - 88px);
  scroll-snap-align: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  @media (max-width: 768px) {
    min-height: calc(100dvh - 68px);
    grid-template-columns: 1fr;
    justify-content: center;
    align-items: center;
  }
}
.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.2rem, 7vw, 4.8rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 20px;
  .line {
    display: block;
  }
}
.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 4vw, 1.25rem);
  line-height: 1.6;
  color: var(--dim);
  margin-bottom: 28px;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
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
  transition:
    background var(--transition-standard),
    color var(--transition-standard);
  &:hover {
    background: color-mix(in srgb, var(--accent) 92%, var(--bg));
  }
  .btn-icon {
    transition: color var(--transition-standard);
  }
}

.cta-button--details {
  font-size: 1.1rem;
  animation: details-cta-in 420ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both;

  .btn-icon {
    animation: details-icon-drift 900ms ease-in-out infinite;
  }

  &:hover .btn-icon {
    animation-duration: 820ms;
  }
}

@keyframes details-cta-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes details-icon-drift {
  0%,
  100% {
    transform: translateX(0);
  }

  45% {
    transform: translateX(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-button--details,
  .cta-button--details .btn-icon {
    animation: none;
  }
}

.hint-text {
  display: none;
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  color: var(--dim);
  max-width: 34ch;
}

.apk-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 50px;
  padding: 0 22px;
  border: var(--ui-border);
  border-radius: 50px;
  background: var(--glass-surface);
  color: var(--accent);
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  font-size: 0.98rem;
  font-weight: 600;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    opacity var(--transition-standard);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  &.disabled,
  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
  }
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}
.hashtag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 400px;
}
.hashtag {
  padding: 10px 20px;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: 40px;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  color: var(--accent);
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    background 0.16s ease;
  will-change: transform;

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 34%, var(--ui-border-color));
    color: var(--accent);
    background: color-mix(in srgb, var(--surface) 86%, transparent);
  }
}

.rule-grid {
  display: flex;
  gap: 40px;
  margin-top: 50px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 20px;
    justify-content: space-around;
  }
}
.rule-item {
  text-align: center;

  .rule-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 5rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;

    @media (max-width: 768px) {
      font-size: 2.8rem;
    }
  }
  .rule-label {
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--dim);
    margin-top: 10px;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 0.8rem;
      margin-top: 2px;
    }
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-direction: row;
    justify-content: center;
  }
}

.visual-features {
  display: flex;
  gap: 40px;
  margin: 40px 0;
  flex-wrap: wrap;
}
.feature-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--accent);
  font-family: 'Manrope', sans-serif;
  font-weight: 500;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-top: 40px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
.tool-card {
  padding: 35px 25px;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: 30px;
  text-align: center;
  svg {
    color: var(--accent);
    margin-bottom: 20px;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.4rem;
    margin-bottom: 12px;
    color: var(--accent);
  }
  p {
    color: var(--dim);
  }
}

.security-badges {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  flex-wrap: wrap;
}
.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: 40px;
  font-family: 'Manrope', sans-serif;
  color: var(--accent);
}

.about-section {
  .about-text {
    margin-bottom: 24px;
  }
}

.donation-wrapper {
  margin: 32px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.donation-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--accent);
  font-family: 'Manrope', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  .chevron {
    transition: transform 0.25s ease;
    opacity: 0.7;
  }

  &.expanded .chevron {
    transform: rotate(90deg);
  }

  &:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  }
}

.donation-content {
  margin-top: 14px;
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.donation-options {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 10px;
  width: 100%;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: var(--border-radius-sm);
}

.network-badge {
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dim);
  padding: 4px 10px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-radius: 999px;
  white-space: nowrap;
}

.wallet-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--accent);
  word-break: break-all;
  user-select: all;
  cursor: copy;
  line-height: 1.5;
}

.donation-hint {
  font-size: 0.8rem;
  color: var(--dim);
  margin: 0;
}

.cloudtips-card {
  min-width: 0;
  padding: 14px 16px;
  overflow: hidden;
  background: var(--glass-surface);
  border: var(--ui-border);
  border-radius: var(--border-radius-sm);

  p {
    margin: 0 0 14px;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}

.cloudtips-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.72rem;
}

.cloudtips-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 9px 14px;
  border-radius: var(--border-radius-sm);
  background: var(--accent);
  color: var(--bg);
  font-family: 'Manrope', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 36px;
    padding: 8px 12px;
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: var(--glass-surface);
    color: var(--dim);
    font-family: 'Manrope', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      color 0.2s,
      border-color 0.2s,
      background 0.2s;

    &:hover {
      color: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 42%, transparent);
      background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    }
  }
}

.start-section {
  text-align: center;
  padding-bottom: 96px;

  .section-content {
    display: grid;
    justify-items: center;
    width: min(100%, 760px);
  }
  .final-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(3rem, 6vw, 4.5rem);
    margin-bottom: 20px;
  }
  .final-text {
    font-size: 1.2rem;
    color: var(--dim);
    margin-bottom: 40px;
    max-width: 620px;
  }
  .final-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .cta-button.large {
    padding: 22px 50px;
    font-size: 1.2rem;
    margin: 0;
  }
  .final-apk {
    margin: 0;
  }
  .final-hint {
    max-width: 460px;
    margin: 20px auto 0;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.5;
    text-align: center;
  }
  .final-links {
    position: absolute;
    right: 20px;
    bottom: 24px;
    left: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    color: var(--dim);
    font-size: 0.75rem;
  }
}

@media (max-width: 1024px) {
  .fixed-header {
    padding-block: calc(env(safe-area-inset-top, 0px) + 14px) 10px;
    padding-inline: max(20px, env(safe-area-inset-left, 0px))
      max(20px, env(safe-area-inset-right, 0px));
  }

  .logo {
    font-size: 1.6rem;
  }

  .hero-section {
    gap: 32px;
  }

  .section {
    padding-inline: 32px;
  }

  .rule-grid {
    gap: 28px;
  }

}

@media (max-width: 768px) {
  .section {
    padding-inline: 20px;
  }

  .fixed-header {
    padding-block: calc(env(safe-area-inset-top, 0px) + 12px) 8px;
    padding-inline: max(14px, env(safe-area-inset-left, 0px))
      max(14px, env(safe-area-inset-right, 0px));
  }

  .logo {
    font-size: 1.2rem;
  }

  .beta-badge {
    display: none;
  }

  .skip-btn {
    min-height: 44px;
    padding: 7px 12px;
    font-size: 0.82rem;
    border-radius: 14px;
  }

  .board-sphere {
    width: 92vw;
  }

  .board-marker {
    width: 8px;
    height: 8px;
  }

  .section-label {
    margin-bottom: 12px;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
  }

  .section-title {
    font-size: clamp(1.7rem, 8vw, 2.35rem);
    margin-bottom: 16px;
  }

  .section-text {
    font-size: 0.98rem;
    margin-bottom: 26px;
    line-height: 1.6;
  }

  .hero-section {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-content: center;
    align-items: center;
  }

  .hero-visual {
    display: none;
  }

  .hero-title {
    font-size: clamp(1.9rem, 10.5vw, 2.8rem);
    line-height: 1.08;
    margin-bottom: 14px;
  }

  .hero-subtitle {
    font-size: 0.98rem;
    margin-bottom: 20px;
  }

  .hero-cta {
    flex-direction: column;
    align-items: stretch;
  }

  .cta-button,
  .apk-button {
    width: 100%;
    justify-content: center;
    padding: 14px 22px;
    border-radius: 14px;
    font-size: 1rem;
  }

  .hint-text {
    font-size: 0.82rem;
    max-width: none;
    text-align: center;
  }

  .rule-grid {
    gap: 20px;
    justify-content: space-around;
  }

  .rule-item {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;

    .rule-number {
      font-size: 2.8rem;
    }
    .rule-label {
      font-size: 0.8rem;
      margin-top: 2px;
    }
  }

  .visual-features {
    gap: 14px;
    margin: 26px 0;
  }

  .feature-row {
    width: 100%;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 24px;
  }

  .tool-card {
    padding: 22px 18px;
    border-radius: 20px;
  }

  .security-badges {
    gap: 10px;
    margin-top: 24px;
  }

  .badge {
    width: 100%;
    justify-content: center;
  }

  .donation-btn {
    width: 100%;
    justify-content: center;
  }

  .donation-options {
    grid-template-columns: 1fr;
  }

  .cloudtips-link {
    width: 100%;
  }

  .contacts {
    width: 100%;
    gap: 6px;

    a {
      flex: 1 1 auto;
      justify-content: center;
    }
  }

  .start-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 88px;
    text-align: center;

    .section-content {
      width: 100%;
    }

    .final-title {
      font-size: clamp(2rem, 10vw, 2.8rem);
      line-height: 1.08;
      text-align: center;
    }
    .final-text {
      width: min(100%, 34rem);
      font-size: 1rem;
      margin-bottom: 24px;
      text-align: center;
    }
    .final-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
    .cta-button.large {
      width: 100%;
      padding: 16px 20px;
      font-size: 1rem;
      margin: 0;
    }
    .final-apk {
      width: 100%;
      margin: 0;
    }
    .final-hint {
      width: min(100%, 34rem);
      margin-top: 16px;
      font-size: 0.75rem;
      line-height: 1.45;
      text-align: center;
    }

    .final-links {
      right: 12px;
      bottom: 18px;
      left: 12px;
    }
  }
}
</style>
