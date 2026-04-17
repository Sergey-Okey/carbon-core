import { defineComponent, ref, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import { Sparkles, LayoutGrid, CheckSquare, Trophy, User, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { m as useOnboardingStore, u as useRouter, _ as _export_sfc } from "../server.mjs";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/hookable/dist/index.mjs";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/unctx/dist/index.mjs";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/h3/dist/index.mjs";
import "pinia";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/ufo/dist/index.mjs";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/klona/dist/index.mjs";
import "uuid";
const totalSections = 7;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "onboarding",
  __ssrInlineRender: true,
  setup(__props) {
    useOnboardingStore();
    useRouter();
    const currentSection = ref(1);
    const isFinishing = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "onboarding" }, _attrs))} data-v-3e77d897><div class="background-layer" data-v-3e77d897><div class="floating-shape shape1" data-v-3e77d897></div><div class="floating-shape shape2" data-v-3e77d897></div><div class="floating-shape shape3" data-v-3e77d897></div><div class="gradient-overlay" data-v-3e77d897></div></div><div class="onboarding-modal" data-v-3e77d897><div class="progress-track" data-v-3e77d897><div class="progress-fill" style="${ssrRenderStyle({ width: currentSection.value / totalSections * 100 + "%" })}" data-v-3e77d897></div></div><section class="section-content" data-v-3e77d897>`);
      if (currentSection.value === 1) {
        _push(`<div class="welcome-section" data-v-3e77d897><div class="logo-wrapper" data-v-3e77d897><div class="logo-glow" data-v-3e77d897></div><span class="big-logo" data-v-3e77d897>COF</span></div><h1 data-v-3e77d897>Core of Life</h1><p class="tagline" data-v-3e77d897>осознанное развитие • системный подход</p><p class="intro-text" data-v-3e77d897> Добро пожаловать в экосистему персонального роста.<br data-v-3e77d897> COF объединяет планирование, привычки и визуализацию прогресса в едином минималистичном пространстве. </p><div class="hint" data-v-3e77d897><span class="hint-icon" data-v-3e77d897>✨</span> листайте вправо, чтобы узнать больше </div></div>`);
      } else if (currentSection.value === 2) {
        _push(`<div class="content-block" data-v-3e77d897><div class="section-icon" data-v-3e77d897>`);
        _push(ssrRenderComponent(unref(Sparkles), {
          size: 36,
          class: "icon"
        }, null, _parent));
        _push(`</div><h2 data-v-3e77d897>Меньше, но лучше</h2><p class="description" data-v-3e77d897> Мы отказались от бесконечных списков. Правило трёх — ваш компас: <strong data-v-3e77d897>3 задачи на день, неделю, месяц, год</strong>. Это освобождает ум и направляет энергию на действительно важное. </p><div class="quote-block" data-v-3e77d897> «Не количество задач определяет успех, а их значимость.» </div></div>`);
      } else if (currentSection.value === 3) {
        _push(`<div class="content-block" data-v-3e77d897><div class="section-icon" data-v-3e77d897>`);
        _push(ssrRenderComponent(unref(LayoutGrid), {
          size: 36,
          class: "icon"
        }, null, _parent));
        _push(`</div><h2 data-v-3e77d897>Визуализация роста</h2><p class="description" data-v-3e77d897> Четыре столпа вашего развития: <strong data-v-3e77d897>Финансы</strong>, <strong data-v-3e77d897>Тело</strong>, <strong data-v-3e77d897>Интеллект</strong> и <strong data-v-3e77d897>Лидерство</strong>. Каждый имеет собственную шкалу прогресса и контрольные точки (милестоуны). Выполняя задачи, вы продвигаетесь по веткам и видите, как меняется ваша жизнь. </p><div class="mockup-branches" data-v-3e77d897><div class="mockup-item" data-v-3e77d897>FIN</div><div class="mockup-item" data-v-3e77d897>BODY</div><div class="mockup-item" data-v-3e77d897>MIND</div><div class="mockup-item" data-v-3e77d897>LDR</div></div></div>`);
      } else if (currentSection.value === 4) {
        _push(`<div class="content-block" data-v-3e77d897><div class="section-icon" data-v-3e77d897>`);
        _push(ssrRenderComponent(unref(CheckSquare), {
          size: 36,
          class: "icon"
        }, null, _parent));
        _push(`</div><h2 data-v-3e77d897>Гибкая система задач</h2><p class="description" data-v-3e77d897><strong data-v-3e77d897>Привычки</strong> можно выполнять многократно — они формируют базу. <strong data-v-3e77d897>Задачи</strong> ограничены правилом трёх и распределены по горизонтам. Каждая задача связана с тегами, которые автоматически прокачивают соответствующие ветки. </p><div class="example-tags" data-v-3e77d897><span class="tag-example" data-v-3e77d897>#финансы</span><span class="tag-example" data-v-3e77d897>#спорт</span><span class="tag-example" data-v-3e77d897>#учёба</span><span class="tag-example" data-v-3e77d897>#нетворкинг</span></div></div>`);
      } else if (currentSection.value === 5) {
        _push(`<div class="content-block" data-v-3e77d897><div class="section-icon" data-v-3e77d897>`);
        _push(ssrRenderComponent(unref(Trophy), {
          size: 36,
          class: "icon"
        }, null, _parent));
        _push(`</div><h2 data-v-3e77d897>Игровая мотивация</h2><p class="description" data-v-3e77d897> Завершая задачи, вы зарабатываете <strong data-v-3e77d897>опыт (XP)</strong> и <strong data-v-3e77d897>монеты</strong>. Опыт повышает уровень и ранг в лиге: Бронза → Серебро → Золото → Платина. Монеты можно обменять на награды в магазине, но их ещё нужно подтвердить реальным действием. </p><div class="league-progress-example" data-v-3e77d897><span class="league-dot bronze" data-v-3e77d897></span><span class="league-dot silver" data-v-3e77d897></span><span class="league-dot gold" data-v-3e77d897></span><span class="league-dot platinum" data-v-3e77d897></span></div></div>`);
      } else if (currentSection.value === 6) {
        _push(`<div class="content-block" data-v-3e77d897><div class="section-icon" data-v-3e77d897>`);
        _push(ssrRenderComponent(unref(User), {
          size: 36,
          class: "icon"
        }, null, _parent));
        _push(`</div><h2 data-v-3e77d897>Ваше пространство</h2><p class="description" data-v-3e77d897> Настройте тему и акцентный цвет под себя. Управляйте резервными копиями: экспорт, импорт, автоматический бэкап. В профиле можно указать имя и загрузить аватар — COF адаптируется под вас. </p></div>`);
      } else if (currentSection.value === 7) {
        _push(`<div class="welcome-section final" data-v-3e77d897><div class="logo-wrapper" data-v-3e77d897><div class="logo-glow" data-v-3e77d897></div><span class="big-logo" data-v-3e77d897>COF</span></div><h2 data-v-3e77d897>Вы готовы</h2><p class="intro-text" data-v-3e77d897> Теперь система настроена. Создайте первую задачу и наблюдайте, как ваш мир становится структурированнее и осознаннее. </p><button class="cta-button" data-v-3e77d897> Начать использовать Core of Life </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><div class="navigation-controls" data-v-3e77d897><button class="${ssrRenderClass([{ hidden: currentSection.value === 1 }, "nav-arrow"])}" data-v-3e77d897>`);
      _push(ssrRenderComponent(unref(ChevronLeft), { size: 24 }, null, _parent));
      _push(`</button><div class="section-dots" data-v-3e77d897><!--[-->`);
      ssrRenderList(totalSections, (i) => {
        _push(`<span class="${ssrRenderClass([{ active: currentSection.value === i }, "dot"])}" data-v-3e77d897></span>`);
      });
      _push(`<!--]--></div><button class="${ssrRenderClass([{ hidden: currentSection.value === totalSections }, "nav-arrow"])}" data-v-3e77d897>`);
      _push(ssrRenderComponent(unref(ChevronRight), { size: 24 }, null, _parent));
      _push(`</button></div></div>`);
      if (isFinishing.value) {
        _push(`<div class="flash-overlay" data-v-3e77d897></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/onboarding.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const onboarding = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3e77d897"]]);
export {
  onboarding as default
};
//# sourceMappingURL=onboarding-DLEXMx50.js.map
