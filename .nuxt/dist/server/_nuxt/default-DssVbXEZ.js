import { defineComponent, ref, reactive, computed, unref, createVNode, resolveDynamicComponent, useSSRContext, mergeProps } from "vue";
import { ssrRenderTeleport, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderVNode, ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderSlot } from "vue/server-renderer";
import { Medal, Award, Gem, Crown, X, UserCircle, Camera, Zap, Coins, HelpCircle, Plus, LayoutGrid, CheckSquare, ShoppingBag, BarChart2, Settings } from "lucide-vue-next";
import { d as useUserStore, _ as _export_sfc, f as useTasksStore, l as useUIStore } from "../server.mjs";
import { T as TaskForm, u as useNotification } from "./TaskForm-t6lOjFDN.js";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/hookable/dist/index.mjs";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/unctx/dist/index.mjs";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/h3/dist/index.mjs";
import "pinia";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/ufo/dist/index.mjs";
import "C:/Users/Сергей/Documents/carbon-core/node_modules/klona/dist/index.mjs";
import "uuid";
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ProfileModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const userStore = useUserStore();
    ref();
    const form = reactive({
      name: userStore.profile.name,
      bio: userStore.profile.bio,
      email: userStore.profile.email,
      avatar: userStore.profile.avatar
    });
    const leagueIcon = computed(() => {
      const league = userStore.league;
      if (league === "Бронза") return Medal;
      if (league === "Серебро") return Award;
      if (league === "Золото") return Gem;
      return Crown;
    });
    const leagueClass = computed(() => userStore.league.toLowerCase());
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="modal-overlay" data-v-9a7970e3><div class="modal" data-v-9a7970e3><div class="modal-header" data-v-9a7970e3><h3 data-v-9a7970e3>Профиль</h3><button class="close-btn" data-v-9a7970e3>`);
        _push2(ssrRenderComponent(unref(X), { size: 20 }, null, _parent));
        _push2(`</button></div><form data-v-9a7970e3><div class="avatar-section" data-v-9a7970e3><div class="avatar" data-v-9a7970e3>`);
        if (unref(userStore).profile.avatar) {
          _push2(`<img${ssrRenderAttr("src", unref(userStore).profile.avatar)} alt="avatar" data-v-9a7970e3>`);
        } else {
          _push2(ssrRenderComponent(unref(UserCircle), { size: 48 }, null, _parent));
        }
        _push2(`<div class="avatar-overlay" data-v-9a7970e3>`);
        _push2(ssrRenderComponent(unref(Camera), { size: 20 }, null, _parent));
        _push2(`</div></div><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-9a7970e3><button type="button" class="change-avatar-btn" data-v-9a7970e3>${ssrInterpolate(unref(userStore).profile.avatar ? "Сменить фото" : "Добавить фото")}</button>`);
        if (unref(userStore).profile.avatar) {
          _push2(`<button type="button" class="remove-avatar-btn" data-v-9a7970e3> Удалить </button>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><div class="form-group" data-v-9a7970e3><label data-v-9a7970e3>Имя</label><input${ssrRenderAttr("value", form.name)} type="text" placeholder="Ваше имя" maxlength="30" data-v-9a7970e3></div><div class="form-group" data-v-9a7970e3><label data-v-9a7970e3>О себе</label><textarea placeholder="Расскажите о себе или своих целях" rows="3" maxlength="150" data-v-9a7970e3>${ssrInterpolate(form.bio)}</textarea></div><div class="form-group" data-v-9a7970e3><label data-v-9a7970e3>Email (опционально)</label><input${ssrRenderAttr("value", form.email)} type="email" placeholder="email@example.com" data-v-9a7970e3></div><div class="stats-info" data-v-9a7970e3><div class="stat-item" data-v-9a7970e3>`);
        _push2(ssrRenderComponent(unref(Zap), { size: 18 }, null, _parent));
        _push2(`<span data-v-9a7970e3>Уровень ${ssrInterpolate(unref(userStore).level)} (${ssrInterpolate(unref(userStore).totalXP)} XP)</span></div><div class="stat-item" data-v-9a7970e3>`);
        ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(leagueIcon.value), {
          size: 18,
          class: leagueClass.value
        }, null), _parent);
        _push2(`<span data-v-9a7970e3>${ssrInterpolate(unref(userStore).league)}</span></div><div class="stat-item" data-v-9a7970e3>`);
        _push2(ssrRenderComponent(unref(Coins), { size: 18 }, null, _parent));
        _push2(`<span data-v-9a7970e3>${ssrInterpolate(unref(userStore).gold)} золота</span></div></div><div class="form-actions" data-v-9a7970e3><button type="button" class="btn-secondary" data-v-9a7970e3> Отмена </button><button type="submit" class="btn-primary" data-v-9a7970e3>Сохранить</button></div></form></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/profile/ProfileModal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const ProfileModal = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-9a7970e3"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "TheHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const tasksStore = useTasksStore();
    const { addNotification } = useNotification();
    const showTaskForm = ref(false);
    const showProfileModal = ref(false);
    function handleTaskSave(taskData) {
      const result = tasksStore.addTask(taskData);
      if (result) {
        addNotification({ type: "success", message: `«${result.title}» добавлено` });
        showTaskForm.value = false;
      } else {
        addNotification({
          type: "warning",
          message: "Лимит задач на этот период исчерпан"
        });
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "header" }, _attrs))} data-v-a12b4921><div class="logo" data-v-a12b4921><span class="logo-text" data-v-a12b4921>CORE OF LIFE</span><span class="logo-icon" data-v-a12b4921>COF</span></div><div class="actions" data-v-a12b4921><button class="action-btn" title="Обучение" data-v-a12b4921>`);
      _push(ssrRenderComponent(unref(HelpCircle), { size: 20 }, null, _parent));
      _push(`</button><button class="action-btn" title="Добавить задачу" data-v-a12b4921>`);
      _push(ssrRenderComponent(unref(Plus), { size: 20 }, null, _parent));
      _push(`</button><button class="profile-btn" title="Профиль" data-v-a12b4921>`);
      if (unref(userStore).profile.avatar) {
        _push(`<div class="avatar-small" data-v-a12b4921><img${ssrRenderAttr("src", unref(userStore).profile.avatar)} alt="avatar" data-v-a12b4921></div>`);
      } else {
        _push(ssrRenderComponent(unref(UserCircle), { size: 20 }, null, _parent));
      }
      _push(`</button></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (showTaskForm.value) {
          _push2(ssrRenderComponent(TaskForm, {
            onClose: ($event) => showTaskForm.value = false,
            onSave: handleTaskSave
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (showProfileModal.value) {
          _push2(ssrRenderComponent(ProfileModal, {
            onClose: ($event) => showProfileModal.value = false
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</header>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/base/TheHeader.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const TheHeader = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-a12b4921"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TheNavbar",
  __ssrInlineRender: true,
  setup(__props) {
    const uiStore = useUIStore();
    const navItems = [
      { id: "board", label: "Доска", icon: LayoutGrid },
      { id: "tasks", label: "Задачи", icon: CheckSquare },
      { id: "shop", label: "Магазин", icon: ShoppingBag },
      { id: "analytics", label: "Аналитика", icon: BarChart2 },
      { id: "settings", label: "Настройки", icon: Settings }
    ];
    const isMobile = ref(false);
    const showLabels = computed(() => {
      return !isMobile.value && uiStore.showLabels;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: ["navbar", {
          "is-expanded": showLabels.value,
          "is-mobile": isMobile.value
        }]
      }, _attrs))} data-v-97ad538b><div class="nav-items" data-v-97ad538b><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(`<button class="${ssrRenderClass([{ active: unref(uiStore).activeNav === item.id }, "nav-item"])}"${ssrRenderAttr("title", !showLabels.value ? item.label : "")} data-v-97ad538b>`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.icon), { size: 20 }, null), _parent);
        if (showLabels.value) {
          _push(`<span class="label" data-v-97ad538b>${ssrInterpolate(item.label)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div></nav>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/base/TheNavbar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const TheNavbar = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-97ad538b"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ToastContainer",
  __ssrInlineRender: true,
  setup(__props) {
    const { notifications } = useNotification();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "toast-container" }, _attrs))} data-v-0fa8d1da><!--[-->`);
      ssrRenderList(unref(notifications), (notif) => {
        _push(`<div class="${ssrRenderClass([notif.type, "toast"])}" data-v-0fa8d1da><span class="indicator" data-v-0fa8d1da></span><span class="message" data-v-0fa8d1da>${ssrInterpolate(notif.message)}</span>`);
        if (notif.action) {
          _push(`<button class="toast-action" data-v-0fa8d1da>${ssrInterpolate(notif.action.label)}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/base/ToastContainer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ToastContainer = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0fa8d1da"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout" }, _attrs))} data-v-fd48f215>`);
      _push(ssrRenderComponent(TheHeader, null, null, _parent));
      _push(`<div class="layout-content" data-v-fd48f215>`);
      _push(ssrRenderComponent(TheNavbar, { class: "navbar" }, null, _parent));
      _push(`<main class="main" data-v-fd48f215>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
      _push(ssrRenderComponent(ToastContainer, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fd48f215"]]);
export {
  _default as default
};
//# sourceMappingURL=default-DssVbXEZ.js.map
