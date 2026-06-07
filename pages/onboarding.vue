<template>
  <div class="onboarding">
    <!-- Прогресс-бар -->
    <div class="top-progress">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <!-- Фоновый слой (сетка, свет, геометрия, партиклы) -->
    <div class="background-layer">
      <div class="background-grid"></div>
      <div class="light-layer">
        <div
          v-for="light in ambientLights"
          :key="light.id"
          class="ambient-light"
          :style="{
            left: light.left,
            top: light.top,
            width: light.size,
            height: light.size,
            '--light-duration': light.duration,
            '--light-delay': light.delay,
          }"
        />
      </div>
      <div class="geometry-layer">
        <div
          v-for="(geo, i) in geometricShapes"
          :key="geo.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.82, rotate: -8 }"
          :enter="{
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 900, delay: 120 + i * 90 },
          }"
          :class="['geo-shape', geo.type]"
          :style="{
            left: geo.left,
            top: geo.top,
            width: geo.size,
            height: geo.size,
            '--geo-duration': geo.duration,
            '--geo-delay': geo.delay,
          }"
        />
      </div>
      <div class="particle-layer">
        <div
          v-for="(particle, i) in particles"
          :key="particle.id"
          v-motion
          class="particle"
          :initial="{ opacity: 0, scale: 0.6, y: 10 }"
          :enter="{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 650, delay: 120 + i * 70 },
          }"
          :style="{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            '--particle-duration': particle.duration,
            '--particle-delay': particle.delay,
          }"
        />
      </div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Хедер -->
    <div class="fixed-header">
      <div
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      >
        <div class="logo">COF</div>
      </div>
      <div
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 100 } }"
      >
        <div class="beta-badge">beta</div>
      </div>
      <div
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 150 } }"
      >
        <button class="skip-btn" @click="finishOnboarding">
          Пропустить
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- Скролл-контейнер -->
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <!-- Шаг 1 – Вступление -->
      <section id="step-1" class="section hero-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 600, delay: 200 },
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
              transition: { duration: 600, delay: 300 },
            }"
          >
            <div class="hero-cta">
              <button
                class="cta-button cta-button--details"
                type="button"
                aria-label="Подробнее"
                @click="scrollToProductSlide"
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

      <section id="step-product" class="section product-section">
        <div class="section-content product-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Интерфейс</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
            }"
          >
            <h2 class="section-title">Один ритм для всего дня</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 180 },
            }"
          >
            <p class="section-text">
              Доска, задачи, аналитика и фокус живут в одном минималистичном стеклянном интерфейсе:
              без визуального шума, но с ясной структурой для ежедневной работы.
            </p>
          </div>

          <div
            ref="productCarousel"
            class="product-showcase"
            @scroll.passive="handleProductCarouselScroll"
          >
            <article
              v-for="(widget, i) in productWidgets"
              :key="widget.title"
              v-motion
              :initial="{ opacity: 0, y: 24 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 520, delay: 220 + i * 90 },
              }"
              class="screen-card"
            >
              <div class="screen-meta">
                <component :is="widget.icon" :size="20" />
                <div>
                  <strong>{{ widget.title }}</strong>
                  <span>{{ widget.caption }}</span>
                </div>
              </div>
              <div
                class="real-widget-frame"
                :class="`real-widget-frame--${widget.variant}`"
              >
                <div class="widget-placeholder__bar">
                  <span></span>
                  <span></span>
                </div>
                <div class="widget-placeholder__hero"></div>
                <div class="widget-placeholder__grid">
                  <span v-for="cell in 4" :key="cell"></span>
                </div>
              </div>
            </article>
          </div>
          <div class="carousel-dots" aria-label="Слайды интерфейса">
            <button
              v-for="(widget, index) in productWidgets"
              :key="widget.variant"
              type="button"
              :class="{ active: activeProductSlide === index }"
              :aria-label="`Показать слайд ${index + 1}`"
              @click="scrollToProductCard(index)"
            ></button>
          </div>
        </div>
      </section>

      <!-- Шаг 2 – Философия правила трёх -->
      <section id="step-2" class="section rule-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Философия</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 600, delay: 200 },
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
                transition: { duration: 500, delay: 300 + i * 100 },
              }"
              class="rule-item"
            >
              <div class="rule-number">{{ rule.number }}</div>
              <div class="rule-label">{{ rule.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Шаг 3 – Визуализация прогресса -->
      <section id="step-3" class="section visual-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Прогресс</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 600, delay: 200 },
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

      <!-- Шаг 4 – Инструменты -->
      <section id="step-4" class="section tools-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Инструменты</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
                transition: { duration: 500, delay: 200 },
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
                transition: { duration: 500, delay: 300 },
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
                transition: { duration: 500, delay: 400 },
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

      <!-- Шаг 5 – Безопасность -->
      <section id="step-5" class="section security-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Данные</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 600, delay: 200 },
            }"
          >
            <p class="section-text">
              Всё хранится локально на устройстве. Экспорт, импорт, бэкапы —
              ваши данные принадлежат только вам.
            </p>
          </div>
          <div class="security-badges">
            <div class="badge"><Shield :size="20" /> Локальное хранение</div>
            <div class="badge"><Download :size="20" /> Экспорт</div>
            <div class="badge"><Upload :size="20" /> Импорт</div>
          </div>
        </div>
      </section>

      <!-- Шаг 6 – О проекте (с аккордеоном для доната) -->
      <section id="step-6" class="section about-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">О проекте</div>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 600, delay: 200 },
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
              transition: { duration: 600, delay: 300 },
            }"
          >
            <p class="section-text about-text">
              Поддержите разработку — любая сумма помогает быстрее выпускать
              новые возможности.
            </p>
          </div>
          <!-- Аккордеон с адресом -->
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
              <div class="wallet-info">
                <span class="network-badge">TRC-20 (USDT)</span>
                <code class="wallet-code"
                  >TXjoHFudFFQT6hXSqb55xz5W2KQUAAbnF8</code
                >
              </div>
              <p class="donation-hint">Нажмите на адрес, чтобы скопировать</p>
            </div>
          </div>
          <div class="contacts">
            <a href="mailto:sergeyborisov_1@vk.ru"><Mail :size="20" /></a>
          </div>
        </div>
      </section>

      <!-- Шаг 7 – Старт -->
      <section id="step-7" class="section start-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <h2 class="final-title">Начните сегодня</h2>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
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
              transition: { duration: 500, delay: 200 },
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
              transition: { duration: 500, delay: 300 },
            }"
          >
            <p class="final-hint">
              В любой момент вернитесь к гайду через иконку вопроса в хедере.
            </p>
            <div class="final-links">
              <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
              <NuxtLink to="/terms">Условия</NuxtLink>
              <NuxtLink to="/support">Поддержка</NuxtLink>
            </div>
          </div>
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
  BarChart2,
  Timer,
  Target,
  Move,
  Shield,
  Download,
  Upload,
  Heart,
  Mail,
} from 'lucide-vue-next'
import { useOnboardingStore } from '~/stores/onboarding.store'
import { useAuthStore } from '~/stores/auth.store'

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
const productCarousel = ref<HTMLElement | null>(null)
const activeProductSlide = ref(0)
const progress = ref(0)
const showDonation = ref(false)
const apkDownloadUrl = '/downloads/core-of-life.apk'

const productWidgets = [
  {
    title: 'Статистика',
    caption: 'уровень, лига и активность',
    icon: LayoutGrid,
    variant: 'stats',
    alt: 'Виджет статистики Core of Life с уровнем, лигой и активностью',
  },
  {
    title: 'Аналитика',
    caption: 'пульс прогресса',
    icon: BarChart2,
    variant: 'analytics',
    alt: 'Экран аналитики Core of Life с общим прогрессом',
  },
  {
    title: 'Фокус',
    caption: 'таймер глубоких сессий',
    icon: Timer,
    variant: 'focus',
    alt: 'Экран фокуса Core of Life с таймером глубокой работы',
  },
] as const

const particles = [
  {
    id: 'p1',
    left: '12%',
    top: '18%',
    size: '8px',
    duration: '14s',
    delay: '0s',
  },
  {
    id: 'p2',
    left: '24%',
    top: '62%',
    size: '6px',
    duration: '17s',
    delay: '1.5s',
  },
  {
    id: 'p3',
    left: '48%',
    top: '28%',
    size: '10px',
    duration: '18s',
    delay: '0.8s',
  },
  {
    id: 'p4',
    left: '64%',
    top: '72%',
    size: '7px',
    duration: '15s',
    delay: '2.1s',
  },
  {
    id: 'p5',
    left: '82%',
    top: '22%',
    size: '9px',
    duration: '19s',
    delay: '1.1s',
  },
  {
    id: 'p6',
    left: '76%',
    top: '52%',
    size: '6px',
    duration: '16s',
    delay: '2.8s',
  },
]

const ambientLights = [
  {
    id: 'l1',
    left: '-8%',
    top: '8%',
    size: '42vmax',
    duration: '24s',
    delay: '0s',
  },
  {
    id: 'l2',
    left: '58%',
    top: '-12%',
    size: '48vmax',
    duration: '28s',
    delay: '1.6s',
  },
  {
    id: 'l3',
    left: '24%',
    top: '64%',
    size: '40vmax',
    duration: '26s',
    delay: '0.8s',
  },
]

const geometricShapes = [
  {
    id: 'g1',
    type: 'hex',
    left: '8%',
    top: '20%',
    size: '64px',
    duration: '20s',
    delay: '0s',
  },
  {
    id: 'g2',
    type: 'diamond',
    left: '78%',
    top: '18%',
    size: '58px',
    duration: '23s',
    delay: '1.1s',
  },
  {
    id: 'g3',
    type: 'square',
    left: '32%',
    top: '70%',
    size: '48px',
    duration: '18s',
    delay: '0.7s',
  },
  {
    id: 'g4',
    type: 'triangle',
    left: '64%',
    top: '62%',
    size: '56px',
    duration: '24s',
    delay: '1.5s',
  },
  {
    id: 'g5',
    type: 'circle',
    left: '46%',
    top: '14%',
    size: '44px',
    duration: '22s',
    delay: '0.4s',
  },
  {
    id: 'g6',
    type: 'hex',
    left: '14%',
    top: '78%',
    size: '52px',
    duration: '26s',
    delay: '1.9s',
  },
]

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

function scrollToProductSlide() {
  const container = scrollContainer.value
  const target = document.getElementById('step-product')
  if (!container || !target) return

  container.scrollTo({
    top: target.offsetTop,
    behavior: 'smooth',
  })
}

function handleProductCarouselScroll() {
  const carousel = productCarousel.value
  if (!carousel) return
  const firstCard = carousel.firstElementChild as HTMLElement | null
  if (!firstCard) return
  const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0
  activeProductSlide.value = Math.min(
    productWidgets.length - 1,
    Math.max(0, Math.round(carousel.scrollLeft / (firstCard.offsetWidth + gap)))
  )
}

function scrollToProductCard(index: number) {
  const carousel = productCarousel.value
  const card = carousel?.children[index] as HTMLElement | undefined
  if (!carousel || !card) return
  carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' })
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
  --header-height: 88px;
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

.background-grid {
  position: absolute;
  inset: -30% -20%;
  background: color-mix(in srgb, var(--surface) 28%, transparent);
  opacity: 0.3;
  transform: rotate(-4deg);
  animation: gridShift 30s linear infinite;
  z-index: 1;
}

.light-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.ambient-light {
  position: absolute;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  mix-blend-mode: screen;
  opacity: 0.4;
  filter: blur(34px);
  animation: app-glow-breathe var(--light-duration) ease-in-out var(--light-delay)
    infinite alternate;
}

.geometry-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.geo-shape {
  position: absolute;
  border: var(--ui-border);
  background: color-mix(in srgb, #ffffff 8%, transparent);
  opacity: 0.72;
  animation: geoFloat var(--geo-duration) ease-in-out var(--geo-delay) infinite;
  will-change: transform, opacity;
}

.geo-shape.circle {
  border-radius: 999px;
}

.geo-shape.square {
  border-radius: 10px;
}

.geo-shape.diamond {
  border-radius: 10px;
  transform: rotate(45deg);
}

.geo-shape.triangle {
  clip-path: polygon(50% 4%, 96% 92%, 4% 92%);
  border-radius: 0;
}

.geo-shape.hex {
  clip-path: polygon(25% 8%, 75% 8%, 96% 50%, 75% 92%, 25% 92%, 4% 50%);
  border-radius: 0;
}

.particle-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.particle {
  position: absolute;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 72%, transparent);
  opacity: 0.58;
  animation: particleFloat var(--particle-duration) ease-in-out
    var(--particle-delay) infinite;
  will-change: transform;
}

@keyframes particleFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(0.95);
  }
  50% {
    transform: translate3d(0, -16px, 0) scale(1);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(0.95);
  }
}
@keyframes gridShift {
  0% {
    transform: rotate(-4deg) translate3d(0, 0, 0);
  }
  100% {
    transform: rotate(-4deg) translate3d(40px, 28px, 0);
  }
}

@keyframes geoFloat {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(0, -14px, 0) rotate(5deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
  background: color-mix(in srgb, var(--bg) 58%, transparent);
  backdrop-filter: var(--glass-strong-filter);
}

.fixed-header,
.scroll-container {
  position: relative;
  z-index: 10;
}

.fixed-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 40px;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: var(--glass-strong-filter);
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
  padding-top: var(--header-height);
  will-change: transform;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 0;
  }
}

.section {
  min-height: calc(100dvh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 52px 40px 44px;
  position: relative;
  transform: translate3d(0, 0, 0);
  scroll-snap-align: start;
  scroll-snap-stop: always;

  @media (max-width: 768px) {
    padding: 40px 20px 32px;
    min-height: calc(100dvh - var(--header-height));
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  @media (max-width: 768px) {
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
  animation: details-cta-in 760ms cubic-bezier(0.16, 1, 0.3, 1) 420ms both;

  .btn-icon {
    animation: details-icon-drift 1450ms ease-in-out infinite;
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

.product-section {
  align-items: center;
}

.product-content {
  width: min(100%, 1120px);
}

.product-showcase {
  display: flex;
  gap: clamp(16px, 3vw, 28px);
  margin-top: 20px;
  padding: 20px max(4px, calc((100% - min(82vw, 920px)) / 2)) 28px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* Public onboarding stays intentionally short before launch. */
.rule-section,
.visual-section,
.tools-section,
.security-section,
.about-section {
  display: none;
}

.screen-card {
  display: grid;
  flex: 0 0 min(82vw, 920px);
  gap: 14px;
  min-width: 0;
  padding: clamp(14px, 2vw, 22px);
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: var(--glass-filter);
  -webkit-backdrop-filter: var(--glass-filter);
  box-shadow: 0 18px 50px color-mix(in srgb, var(--bg) 46%, transparent);
  scroll-snap-align: center;
}

.screen-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--accent);

  svg {
    flex: 0 0 auto;
  }

  div {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  strong {
    overflow: hidden;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    color: var(--dim);
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.real-widget-frame {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: var(--ui-border);
  min-height: clamp(280px, 42vw, 460px);
  padding: clamp(18px, 3vw, 34px);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 64%, transparent);
}

.widget-placeholder__bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  span {
    display: block;
    inline-size: 30%;
    block-size: 12px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--accent) 16%, transparent);
  }
}

.widget-placeholder__hero {
  block-size: 42%;
  min-block-size: 110px;
  margin-block: clamp(22px, 4vw, 42px);
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--bg) 38%, transparent);
}

.widget-placeholder__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(10px, 2vw, 18px);

  span {
    min-block-size: clamp(48px, 7vw, 76px);
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--surface) 78%, transparent);
  }
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 2px;

  button {
    inline-size: 8px;
    block-size: 8px;
    min-block-size: 8px;
    padding: 0;
    border-radius: var(--border-radius-pill);
    background: var(--dim);
    opacity: 0.42;
  }

  button.active {
    inline-size: 26px;
    background: var(--accent);
    opacity: 1;
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
    border-color 0.22s ease,
    color 0.22s ease,
    background 0.22s ease;
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

/* ===== Обновлённые стили для секции "О проекте" ===== */
.about-section {
  .about-text {
    margin-bottom: 24px; // Уменьшаем отступы между параграфами
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
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
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
  padding-left: 4px;
}

.contacts {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  a {
    color: var(--dim);
    transition: color 0.2s;
    &:hover {
      color: var(--accent);
    }
  }
}

.start-section {
  text-align: center;

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
    gap: 12px;
    flex-wrap: wrap;
  }
  .cta-button.large {
    padding: 22px 50px;
    font-size: 1.2rem;
    margin: 0 0 30px;
  }
  .final-apk {
    margin: 0 0 30px;
  }
  .final-hint {
    color: var(--dim);
  }
  .final-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 16px;
    color: var(--dim);
    font-size: 0.75rem;
  }
}

// Адаптивность (только необходимые правки)
@media (max-width: 1024px) {
  .onboarding {
    --header-height: 76px;
  }

  .fixed-header {
    padding: 16px 20px;
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

  .product-showcase {
    padding-inline: 12px;
  }

  .ambient-light {
    opacity: 0.3;
    filter: blur(28px);
  }

  .geo-shape {
    opacity: 0.56;
  }
}

@media (max-width: 768px) {
  .onboarding {
    --header-height: 68px;
  }

  .section {
    padding-inline: 20px;
  }

  .fixed-header {
    padding: 12px 14px;
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

  .background-grid {
    background-size: 42px 42px;
    opacity: 0.16;
  }

  .particle {
    opacity: 0.32;
  }

  .ambient-light {
    opacity: 0.22;
    filter: blur(22px);
  }

  .geo-shape {
    opacity: 0.44;
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
    min-height: calc(100dvh - var(--header-height));
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

  .product-showcase {
    gap: 14px;
    margin-top: 18px;
    padding-inline: 8px;
  }

  .screen-card {
    flex-basis: min(88vw, 520px);
    padding: 12px;
    border-radius: 20px;
  }

  .real-widget-frame {
    border-radius: 18px;
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

  .contacts {
    gap: 14px;
  }

  .start-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    }
    .cta-button.large {
      width: 100%;
      padding: 16px 20px;
      font-size: 1rem;
      margin-bottom: 12px;
    }
    .final-apk {
      width: 100%;
      margin: 0;
    }
    .final-hint {
      width: min(100%, 34rem);
      text-align: center;
    }
  }
}
</style>
