<template>
  <div class="onboarding">
    <!-- Прогресс-бар -->
    <div class="top-progress">
      <div
        v-motion
        class="progress-fill"
        :initial="{ width: '0%' }"
        :animate="{ width: progress + '%' }"
        :transition="{ duration: 300 }"
      />
    </div>

    <!-- Фон -->
    <div class="background-layer">
      <div
        v-for="(shape, i) in shapes"
        :key="i"
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { duration: 800, delay: i * 100 },
        }"
        :class="['floating-shape', `shape${i + 1}`]"
        :style="{ background: shape.gradient }"
      />
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
        <v-wave>
          <button class="skip-btn" @click="finishOnboarding">
            Пропустить
            <ChevronRight :size="16" />
          </button>
        </v-wave>
      </div>
    </div>

    <!-- Скролл-контейнер -->
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <!-- Шаг 1: Встреча -->
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
              <span class="line">Делайте меньше,</span>
              <span class="line">достигайте большего</span>
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
              COF помогает сфокусироваться на главном и видеть свой прогресс.
              Никакой магии — только осознанный подход.
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
              <v-wave>
                <button class="cta-button" @click="finishOnboarding">
                  Начать
                  <ArrowRight :size="20" class="btn-icon" />
                </button>
              </v-wave>
              <span class="hint-text"
                >или листайте дальше, чтобы узнать детали</span
              >
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hashtag-cloud">
            <span v-for="tag in allTags" :key="tag" class="hashtag">{{
              tag
            }}</span>
          </div>
        </div>
      </section>

      <!-- Шаг 2: Правило трёх -->
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
            <h2 class="section-title">Три — магическое число</h2>
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
              Наш мозг не умеет работать с длинными списками. Правило трёх
              освобождает ум и помогает сосредоточиться на действительно важных
              задачах.
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

      <!-- Шаг 3: Визуализация -->
      <section id="step-3" class="section visual-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <div class="section-label">Ваш путь</div>
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
            <h2 class="section-title">Видеть прогресс</h2>
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
              Интерактивная доска позволяет строить свой путь развития:
              добавляйте этапы, связывайте их и отмечайте пройденное. Вы всегда
              видите, куда движетесь и что уже сделано.
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
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :visible-once="{
              opacity: 1,
              scale: 1,
              transition: { duration: 600, delay: 400 },
            }"
            class="placeholder-card"
          >
            <p>Интерактивная доска ждёт вас внутри</p>
          </div>
        </div>
      </section>

      <!-- Шаг 4: Инструменты -->
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
            <h2 class="section-title">Всё под рукой</h2>
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
              <p>Повторяйте без ограничений — формируйте полезные ритуалы</p>
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
              <p>Тема, акценты, аватар — настройте всё под себя</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Шаг 5: Безопасность -->
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
              Всё хранится локально на вашем устройстве. Экспортируйте,
              импортируйте, делайте бэкапы — ваши данные принадлежат только вам.
            </p>
          </div>
          <div class="security-badges">
            <div class="badge"><Shield :size="20" /> Локальное хранение</div>
            <div class="badge"><Download :size="20" /> Экспорт</div>
            <div class="badge"><Upload :size="20" /> Импорт</div>
          </div>
        </div>
      </section>

      <!-- Шаг 6: Старт -->
      <section id="step-6" class="section start-section">
        <div class="section-content">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <h2 class="final-title">Пора начинать</h2>
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
              Создайте три задачи на сегодня и почувствуйте, как фокус меняет
              всё.
            </p>
          </div>
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible-once="{
              opacity: 1,
              scale: 1,
              transition: { duration: 500, delay: 200 },
            }"
          >
            <v-wave>
              <button class="cta-button large" @click="finishOnboarding">
                Открыть COF
                <ArrowRight :size="24" class="btn-icon" />
              </button>
            </v-wave>
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
          </div>
          <!-- Контакты и донат (компактно) -->
          <div class="footer-info">
            <div class="contacts">
              <a href="mailto:sergeyborisov_1@vk.ru"><Mail :size="16" /></a>
              <a href="#"><Send :size="16" /></a>
              <a href="#"><Instagram :size="16" /></a>
            </div>
            <div class="donation">
              <Heart :size="14" />
              <code>TXjoHFudFFQT6hXSqb55xz5W2KQUAAbnF8</code>
              <span>TRC-20 USDT</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ChevronRight,
  ArrowRight,
  RotateCw,
  Calendar,
  Palette,
  GitBranch,
  Target,
  Move,
  Shield,
  Download,
  Upload,
  Heart,
  Mail,
  Send,
  Instagram,
} from 'lucide-vue-next'
import { useOnboardingStore } from '~/stores/onboarding.store'

const onboardingStore = useOnboardingStore()
const router = useRouter()

const scrollContainer = ref<HTMLElement | null>(null)
const progress = ref(0)

const shapes = [
  {
    gradient:
      'radial-gradient(circle at 30% 30%, rgba(var(--accent-rgb), 0.12), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 70% 70%, rgba(var(--accent-rgb), 0.10), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.08), transparent 70%)',
  },
]

const allTags = [
  '#фокус',
  '#осознанность',
  '#правилотрёх',
  '#cof',
  '#развитие',
  '#привычки',
  '#цели',
  '#2026',
]

const rules = [
  { number: 3, label: 'задачи на день' },
  { number: 3, label: 'на неделю' },
  { number: 3, label: 'на месяц' },
  { number: 3, label: 'на год' },
]

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
.onboarding {
  position: fixed;
  inset: 0;
  background: var(--bg);
  color: var(--accent);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--border);
  z-index: 200;
  .progress-fill {
    height: 100%;
    background: var(--accent);
    width: 0%;
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
  width: 80vmax;
  height: 80vmax;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation: float 22s infinite alternate ease-in-out;
  filter: blur(80px);
  opacity: 0.5;
  &.shape1 {
    top: -30vh;
    left: -20vw;
  }
  &.shape2 {
    bottom: -20vh;
    right: -15vw;
    animation-duration: 28s;
    animation-direction: alternate-reverse;
  }
  &.shape3 {
    top: 40vh;
    left: 50vw;
    width: 60vmax;
    height: 60vmax;
    animation-duration: 20s;
  }
}
@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(10%, 15%) rotate(8deg);
  }
}
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--bg) 80%, transparent) 0%,
    var(--bg) 100%
  );
  backdrop-filter: blur(40px);
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
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--bg) 95%, transparent),
    transparent
  );
  backdrop-filter: blur(10px);
}
.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--accent);
}
.beta-badge {
  padding: 5px 12px;
  background: color-mix(in srgb, var(--accent) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
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
  border: 1px solid var(--border);
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
  padding-top: 80px;
}

.section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  scroll-snap-align: start;
  @media (max-width: 768px) {
    padding: 40px 20px;
    min-height: calc(100vh - 80px);
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
  }
}
.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3rem, 8vw, 5rem);
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
  margin-bottom: 35px;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 20px;
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
  transition: all 0.3s;
  &:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 40px;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  color: var(--accent);
}

.rule-grid {
  display: flex;
  gap: 40px;
  margin-top: 50px;
  flex-wrap: wrap;
  justify-content: center;
}
.rule-item {
  text-align: center;
  .rule-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 5rem;
    font-weight: 700;
    color: var(--accent);
  }
  .rule-label {
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--dim);
    margin-top: 10px;
    text-transform: uppercase;
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
.placeholder-card {
  margin-top: 30px;
  padding: 60px 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 30px;
  text-align: center;
  p {
    color: var(--dim);
  }
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
  background: var(--surface);
  border: 1px solid var(--border);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 40px;
  font-family: 'Manrope', sans-serif;
  color: var(--accent);
}

.start-section {
  text-align: center;
  .final-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(3rem, 6vw, 4.5rem);
    margin-bottom: 20px;
  }
  .final-text {
    font-size: 1.2rem;
    color: var(--dim);
    margin-bottom: 40px;
  }
  .cta-button.large {
    padding: 22px 50px;
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
  .final-hint {
    color: var(--dim);
    margin-bottom: 40px;
  }
}
.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  .contacts {
    display: flex;
    gap: 16px;
    a {
      color: var(--dim);
      transition: color 0.2s;
      &:hover {
        color: var(--accent);
      }
    }
  }
  .donation {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: var(--dim);
    code {
      background: var(--surface);
      padding: 4px 8px;
      border-radius: 20px;
    }
  }
}
</style>
