<template>
  <div class="onboarding">
    <!-- Прогресс-бар сверху -->
    <div class="top-progress">
      <Motion
        as="div"
        class="progress-fill"
        :initial="{ width: '0%' }"
        :animate="{ width: progress + '%' }"
        :transition="{ duration: 0.3 }"
      />
    </div>

    <!-- Фоновый слой с фигурами -->
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

    <!-- Хедер -->
    <div class="fixed-header">
      <Motion
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
      >
        <div class="logo">COF</div>
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.1 }"
      >
        <div class="beta-badge">beta</div>
      </Motion>
      <Motion
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.15 }"
      >
        <button class="skip-btn" @click="finishOnboarding">
          Пропустить
          <ChevronRight :size="16" />
        </button>
      </Motion>
    </div>

    <!-- Скролл-контейнер -->
    <div class="scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <!-- Секция 1: Hero с живыми хештегами -->
      <section id="section-1" class="section hero-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h1 class="hero-title">
              <span class="line">Не усложняй.</span>
              <span class="line">Просто делай.</span>
            </h1>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="hero-subtitle">
              COF — это не очередной список дел. Это твой личный компас в мире
              задач.<br />
              Всё, что нужно — три главных фокуса в день.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section1Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <div class="hero-cta">
              <button class="cta-button" @click="finishOnboarding">
                Попробовать
                <ArrowRight :size="20" class="btn-icon" />
              </button>
              <span class="hint-text"
                >или листай дальше, чтобы узнать больше</span
              >
            </div>
          </Motion>
        </div>
        <div class="hero-visual">
          <div class="hashtag-carousel">
            <div
              class="carousel-track track-fast"
              :style="{ '--speed': '12s' }"
            >
              <span v-for="tag in leftTags" :key="tag" class="hashtag">{{
                tag
              }}</span>
            </div>
            <div
              class="carousel-track track-slow"
              :style="{ '--speed': '20s' }"
            >
              <span v-for="tag in rightTags" :key="tag" class="hashtag">{{
                tag
              }}</span>
            </div>
            <div
              class="carousel-track track-medium"
              :style="{ '--speed': '16s' }"
            >
              <span v-for="tag in leftTags2" :key="tag" class="hashtag">{{
                tag
              }}</span>
            </div>
          </div>
          <!-- Градиентные затухания по краям -->
          <div class="carousel-fade-left"></div>
          <div class="carousel-fade-right"></div>
        </div>
      </section>

      <!-- Секция 2: Философия с анимацией чисел -->
      <section id="section-2" class="section philosophy-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Философия</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Меньше — значит больше.</h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section2Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              Мы привыкли, что чем больше галочек, тем продуктивнее день. Но на
              деле это только распыляет внимание. COF помогает выбрать три
              главные задачи на день, неделю, месяц и год. Всё остальное —
              подождёт.
            </p>
          </Motion>
          <div class="rule-grid">
            <Motion
              v-for="(rule, i) in rules"
              :key="i"
              :initial="{ opacity: 0, scale: 0.8 }"
              :animate="section2Animated ? { opacity: 1, scale: 1 } : {}"
              :transition="{ duration: 0.4, delay: 0.3 + i * 0.1 }"
              class="rule-item"
            >
              <div class="rule-number">
                <span
                  v-if="section2Animated"
                  class="casino-number"
                  :style="{ '--delay': i * 0.05 + 's' }"
                  >{{ rule.number }}</span
                >
                <span v-else>0</span>
              </div>
              <div class="rule-label">{{ rule.label }}</div>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 3: Доска (текст вместо скриншота) -->
      <section id="section-3" class="section board-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Твоя карта развития</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Смотри, куда идёшь.</h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              Представь доску, на которой ты сам строишь свой путь. Добавляй
              этапы, соединяй их, отмечай пройденное. Это не жёсткая система, а
              живой инструмент. Хочешь — рисуй прямые линии к цели. Хочешь —
              петляй. Главное — ты видишь, куда движешься.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section3Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <div class="board-features">
              <div class="board-feature">
                <GitBranch :size="24" />
                <span>Связывай этапы</span>
              </div>
              <div class="board-feature">
                <Target :size="24" />
                <span>Отмечай пройденное</span>
              </div>
              <div class="board-feature">
                <Move :size="24" />
                <span>Меняй траекторию</span>
              </div>
            </div>
          </Motion>
          <!-- Затемнённый placeholder вместо скриншота -->
          <div class="board-placeholder">
            <div class="placeholder-glow"></div>
            <p>Интерактивная доска ждёт тебя внутри</p>
          </div>
        </div>
      </section>

      <!-- Секция 4: Конфиденциальность -->
      <section id="section-4" class="section privacy-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Безопасность</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Твои данные — только твои.</h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              COF хранит всё локально на твоём устройстве. Никаких облаков, если
              ты сам не захочешь. Но помни: делай бэкапы. Экспортируй данные и
              храни их где угодно — они только твои.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section4Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <div class="privacy-cards">
              <div class="privacy-card">
                <Shield :size="28" />
                <h4>Локально</h4>
                <p>Всё на твоём компьютере</p>
              </div>
              <div class="privacy-card">
                <Download :size="28" />
                <h4>Экспорт</h4>
                <p>Сохрани в файл когда угодно</p>
              </div>
              <div class="privacy-card">
                <Upload :size="28" />
                <h4>Импорт</h4>
                <p>Восстанови на новом устройстве</p>
              </div>
            </div>
          </Motion>
        </div>
      </section>

      <!-- Секция 5: Задачи и привычки -->
      <section id="section-5" class="section tasks-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section5Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Инструменты</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section5Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Привычки и задачи — без каши.</h2>
          </Motion>
          <div class="tasks-split">
            <Motion
              :initial="{ opacity: 0, x: -20 }"
              :animate="section5Animated ? { opacity: 1, x: 0 } : {}"
              :transition="{ duration: 0.5, delay: 0.2 }"
              class="task-block"
            >
              <RotateCw :size="32" />
              <h3>Привычки</h3>
              <p>
                Повторяй сколько хочешь. Пить воду, читать, медитировать — без
                ограничений.
              </p>
            </Motion>
            <Motion
              :initial="{ opacity: 0, x: 20 }"
              :animate="section5Animated ? { opacity: 1, x: 0 } : {}"
              :transition="{ duration: 0.5, delay: 0.3 }"
              class="task-block"
            >
              <Calendar :size="32" />
              <h3>Задачи</h3>
              <p>
                Три на день. Три на неделю. Три на месяц. Три на год. Фокус —
                наше всё.
              </p>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 6: Профиль и персонализация -->
      <section id="section-6" class="section profile-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">Твоё пространство</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Настрой всё под себя.</h2>
          </Motion>
          <div class="features-grid">
            <Motion
              :initial="{ opacity: 0, y: 20 }"
              :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
              :transition="{ duration: 0.4, delay: 0.2 }"
              class="feature-card"
            >
              <Palette :size="32" />
              <h3>Тема и цвет</h3>
              <p>Тёмная, светлая или свой акцент — решаешь ты.</p>
            </Motion>
            <Motion
              :initial="{ opacity: 0, y: 20 }"
              :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
              :transition="{ duration: 0.4, delay: 0.3 }"
              class="feature-card"
            >
              <UserCircle :size="32" />
              <h3>Профиль</h3>
              <p>Имя, аватар, био — добавь индивидуальности.</p>
            </Motion>
            <Motion
              :initial="{ opacity: 0, y: 20 }"
              :animate="section6Animated ? { opacity: 1, y: 0 } : {}"
              :transition="{ duration: 0.4, delay: 0.4 }"
              class="feature-card"
            >
              <Bell :size="32" />
              <h3>Уведомления</h3>
              <p>Только важное. Когда хочешь и как хочешь.</p>
            </Motion>
          </div>
        </div>
      </section>

      <!-- Секция 7: О проекте и донаты -->
      <section id="section-7" class="section about-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-label">О проекте</div>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.1 }"
          >
            <h2 class="section-title">Сделано с душой.</h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <p class="section-text">
              COF — это пет-проект одного разработчика. Я делаю его, потому что
              верю: правильные инструменты помогают жить осознаннее. Сейчас
              приложение в бете — возможны шероховатости. Но я активно всё
              допиливаю.
            </p>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.3 }"
          >
            <p class="section-text">
              Если хочешь поддержать разработку, можно задонатить. Любая сумма —
              это топливо для новых фич.
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
            :initial="{ opacity: 0, y: 20 }"
            :animate="section7Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5, delay: 0.5 }"
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

      <!-- Секция 8: Финальный призыв -->
      <section id="section-8" class="section final-section">
        <div class="section-content">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section8Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.5 }"
          >
            <h2 class="final-title">Начни с трёх задач сегодня.</h2>
          </Motion>
          <Motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="section8Animated ? { opacity: 1, scale: 1 } : {}"
            :transition="{ duration: 0.4, delay: 0.2 }"
          >
            <button class="cta-button large" @click="finishOnboarding">
              Открыть COF
              <ArrowRight :size="24" class="btn-icon" />
            </button>
          </Motion>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="section8Animated ? { opacity: 1, y: 0 } : {}"
            :transition="{ duration: 0.4, delay: 0.3 }"
          >
            <p class="final-hint">
              Всегда можно вернуться к этому гайду — иконка вопроса в хедере.
            </p>
          </Motion>
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
  UserCircle,
  Heart,
  Mail,
  Send,
  Instagram,
  Shield,
  Download,
  Upload,
  Bell,
  GitBranch,
  Target,
  Move,
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
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.12), transparent 70%)',
  },
  {
    gradient:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)',
  },
]

const leftTags = ['#фокус', '#осознанность', '#правилотрёх', '#cof']
const rightTags = ['#развитие', '#привычки', '#цели', '#план', '#дисциплина']
const leftTags2 = ['#2026', '#новыйстарт', '#продуктивность', '#меньшедел']

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
  color: #fff;
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
  background: rgba(255, 255, 255, 0.1);
  z-index: 200;
  .progress-fill {
    height: 100%;
    background: #fff;
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
  opacity: 0.6;
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
    rgba(10, 10, 10, 0.7) 0%,
    #0a0a0a 100%
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
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent);
  backdrop-filter: blur(10px);
}
.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
}
.beta-badge {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #aaa;
}
.skip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  color: #ccc;
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #fff;
    color: #fff;
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
  padding: 60px 40px;
  position: relative;
  scroll-snap-align: center;
  scroll-snap-stop: always;
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
  color: #aaa;
  margin-bottom: 20px;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 25px;
  color: #fff;
}
.section-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  line-height: 1.7;
  color: #ccc;
  max-width: 700px;
  margin-bottom: 40px;
}

// Hero
.hero-section {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
}
.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3.5rem, 8vw, 5.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 20px;
  .line {
    display: block;
  }
}
.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 35px;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 20px;
}
.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background: #fff;
  color: #0a0a0a;
  border: none;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
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
  color: #aaa;
}

.hero-visual {
  position: relative;
  height: 400px;
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
}
.hashtag-carousel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 30px 0;
}
.carousel-track {
  display: flex;
  gap: 20px;
  animation: scrollX var(--speed, 15s) linear infinite;
  &.track-left {
    animation-direction: normal;
  }
  &.track-right {
    animation-direction: reverse;
  }
}
.hashtag {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}
.carousel-fade-left,
.carousel-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  pointer-events: none;
  z-index: 2;
}
.carousel-fade-left {
  left: 0;
  background: linear-gradient(to right, #0a0a0a, transparent);
}
.carousel-fade-right {
  right: 0;
  background: linear-gradient(to left, #0a0a0a, transparent);
}
@keyframes scrollX {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

// Rule Grid
.rule-grid {
  display: flex;
  gap: 50px;
  margin-top: 50px;
  flex-wrap: wrap;
}
.rule-item {
  text-align: center;
  .rule-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 5rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    .casino-number {
      display: inline-block;
      animation: casinoRoll 0.6s cubic-bezier(0.2, 0.9, 0.4, 1) forwards;
      animation-delay: var(--delay);
      opacity: 0;
    }
  }
  .rule-label {
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #aaa;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}
@keyframes casinoRoll {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Board Section
.board-features {
  display: flex;
  gap: 40px;
  margin: 30px 0;
}
.board-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  svg {
    opacity: 0.8;
  }
  span {
    font-family: 'Manrope', sans-serif;
    font-weight: 500;
  }
}
.board-placeholder {
  margin-top: 30px;
  padding: 60px 40px;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  .placeholder-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.1),
      transparent 70%
    );
  }
  p {
    font-family: 'Manrope', sans-serif;
    font-size: 1.2rem;
    color: #ccc;
    position: relative;
  }
}

// Privacy Cards
.privacy-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-top: 40px;
}
.privacy-card {
  padding: 30px 20px;
  background: rgba(30, 30, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  svg {
    color: #fff;
    margin-bottom: 15px;
  }
  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    margin-bottom: 8px;
    color: #fff;
  }
  p {
    color: #aaa;
  }
}

// Tasks
.tasks-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 40px 0;
}
.task-block {
  padding: 35px;
  background: rgba(30, 30, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  svg {
    color: #fff;
    margin-bottom: 20px;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6rem;
    margin-bottom: 15px;
    color: #fff;
  }
  p {
    color: #ccc;
    line-height: 1.6;
  }
}

// Features Grid
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-top: 40px;
}
.feature-card {
  padding: 35px 25px;
  background: rgba(30, 30, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  svg {
    color: #fff;
    margin-bottom: 20px;
  }
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.3rem;
    margin-bottom: 12px;
    color: #fff;
  }
  p {
    color: #ccc;
  }
}

// About
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
      color: #fff;
    }
    .network {
      font-size: 0.8rem;
      color: #aaa;
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
    color: #ccc;
    svg {
      color: #fff;
    }
  }
}

// Final
.final-section {
  text-align: center;
  .final-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    margin-bottom: 40px;
    color: #fff;
  }
  .cta-button.large {
    padding: 22px 50px;
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
  .final-hint {
    font-family: 'Manrope', sans-serif;
    color: #aaa;
  }
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
    .hero-visual {
      height: 300px;
    }
  }
  .privacy-cards,
  .tasks-split,
  .features-grid {
    grid-template-columns: 1fr;
  }
  .rule-grid {
    justify-content: center;
  }
  .fixed-header {
    padding: 15px 25px;
  }
  .section {
    padding: 50px 25px;
  }
}
</style>
