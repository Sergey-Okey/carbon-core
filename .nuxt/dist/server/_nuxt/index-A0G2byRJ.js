import { defineComponent, computed, mergeProps, useSSRContext, unref, createVNode, resolveDynamicComponent, ref, withCtx, openBlock, createBlock, withModifiers, toDisplayString, Transition, Fragment, renderList, createCommentVNode, reactive, watch, createTextVNode, withDirectives, vModelCheckbox } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrRenderVNode, ssrRenderClass, ssrRenderSlot, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import { _ as _export_sfc, d as useUserStore, f as useTasksStore, g as useBranchesStore, h as useConfirm, i as useTagsStore, j as useRewardsStore, k as useSettingsStore, A as ACCENT_COLORS, l as useUIStore } from "../server.mjs";
import { Medal, Award, Gem, Crown, Zap, Coins, Code, Camera, Music, Coffee, Globe, BookOpen, Heart, Briefcase, Target, Users, Brain, Dumbbell, TrendingUp, PenSquare, ChevronDown, X, AlertTriangle, Maximize, ZoomIn, ZoomOut, Layout, Plus, Unlink, PlusCircle, Trash2, Calendar, CheckCircle, Circle, Edit, Info, Moon, Sun, Download, FileJson, Upload, RotateCcw } from "lucide-vue-next";
import { Handle, Position, useVueFlow, VueFlow, ConnectionMode, Panel } from "@vue-flow/core";
import { Background, BackgroundVariant } from "@vue-flow/background";
import dagre from "dagre";
import { u as useNotification, T as TaskForm } from "./TaskForm-t6lOjFDN.js";
import { Line, Doughnut } from "vue-chartjs";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from "chart.js";
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
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "ProgressBar",
  __ssrInlineRender: true,
  props: {
    value: {},
    max: {},
    label: {},
    showPercent: { type: Boolean },
    height: { default: "8px" }
  },
  setup(__props) {
    const props = __props;
    const percent = computed(() => {
      if (props.max <= 0) return 0;
      return Math.min(100, props.value / props.max * 100);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "progress-bar-wrapper" }, _attrs))} data-v-4d7eef3a>`);
      if (__props.label) {
        _push(`<div class="label" data-v-4d7eef3a>${ssrInterpolate(__props.label)} `);
        if (__props.showPercent) {
          _push(`<span data-v-4d7eef3a>${ssrInterpolate(percent.value)}%</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="progress-bar" style="${ssrRenderStyle({ height: __props.height })}" data-v-4d7eef3a><div class="progress-fill" style="${ssrRenderStyle({ width: percent.value + "%" })}" data-v-4d7eef3a></div></div></div>`);
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/base/ProgressBar.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const ProgressBar = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-4d7eef3a"]]);
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "StatsOverview",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const tasksStore = useTasksStore();
    const leagueIcon = computed(() => {
      const league = userStore.league;
      if (league === "Бронза") return Medal;
      if (league === "Серебро") return Award;
      if (league === "Золото") return Gem;
      return Crown;
    });
    const leagueClass = computed(() => userStore.league.toLowerCase());
    const nextLeagueProgress = computed(() => {
      const points = userStore.leaguePoints;
      if (points < 1e3) return Math.floor(points / 1e3 * 100);
      if (points < 3e3) return Math.floor((points - 1e3) / 2e3 * 100);
      if (points < 6e3) return Math.floor((points - 3e3) / 3e3 * 100);
      return 100;
    });
    const completedTasks = computed(() => {
      const day = tasksStore.tasks.filter(
        (t) => t.type === "TASK_DAY" && t.done
      ).length;
      const week = tasksStore.tasks.filter(
        (t) => t.type === "TASK_WEEK" && t.done
      ).length;
      const month = tasksStore.tasks.filter(
        (t) => t.type === "TASK_MONTH" && t.done
      ).length;
      const year = tasksStore.tasks.filter(
        (t) => t.type === "TASK_YEAR" && t.done
      ).length;
      return { day, week, month, year };
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "stats-bar" }, _attrs))} data-v-840ae9be><div class="stat-block level-block" data-v-840ae9be><div class="stat-row" data-v-840ae9be>`);
      _push(ssrRenderComponent(unref(Zap), {
        size: 18,
        class: "stat-icon"
      }, null, _parent));
      _push(`<span class="stat-label" data-v-840ae9be>Ур. ${ssrInterpolate(unref(userStore).level)}</span><span class="stat-value" data-v-840ae9be>${ssrInterpolate(unref(userStore).currentXP)}/${ssrInterpolate(unref(userStore).neededXPForNextLevel)}</span></div>`);
      _push(ssrRenderComponent(ProgressBar, {
        value: unref(userStore).currentXP,
        max: unref(userStore).neededXPForNextLevel,
        height: "4px",
        class: "stat-progress"
      }, null, _parent));
      _push(`</div><div class="stat-block league-block" data-v-840ae9be><div class="stat-row" data-v-840ae9be>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(leagueIcon.value), {
        size: 18,
        class: ["stat-icon", leagueClass.value]
      }, null), _parent);
      _push(`<span class="stat-label" data-v-840ae9be>${ssrInterpolate(unref(userStore).league)}</span><span class="stat-value" data-v-840ae9be>${ssrInterpolate(nextLeagueProgress.value)}%</span></div><div class="league-progress" data-v-840ae9be><div class="league-progress-fill" style="${ssrRenderStyle({ width: nextLeagueProgress.value + "%" })}" data-v-840ae9be></div></div></div><div class="stat-block coins-block" data-v-840ae9be><div class="stat-row" data-v-840ae9be>`);
      _push(ssrRenderComponent(unref(Coins), {
        size: 18,
        class: "stat-icon"
      }, null, _parent));
      _push(`<span class="stat-label" data-v-840ae9be>Монеты</span><span class="stat-value" data-v-840ae9be>${ssrInterpolate(unref(userStore).coins)}</span></div></div><div class="stat-block tasks-block" data-v-840ae9be><div class="tasks-indicators" data-v-840ae9be><div class="${ssrRenderClass([{ done: completedTasks.value.day === 3 }, "task-indicator"])}" data-v-840ae9be><span class="task-label" data-v-840ae9be>Д</span><span class="task-count" data-v-840ae9be>${ssrInterpolate(completedTasks.value.day)}/3</span></div><div class="${ssrRenderClass([{ done: completedTasks.value.week === 3 }, "task-indicator"])}" data-v-840ae9be><span class="task-label" data-v-840ae9be>Н</span><span class="task-count" data-v-840ae9be>${ssrInterpolate(completedTasks.value.week)}/3</span></div><div class="${ssrRenderClass([{ done: completedTasks.value.month === 3 }, "task-indicator"])}" data-v-840ae9be><span class="task-label" data-v-840ae9be>М</span><span class="task-count" data-v-840ae9be>${ssrInterpolate(completedTasks.value.month)}/3</span></div><div class="${ssrRenderClass([{ done: completedTasks.value.year === 3 }, "task-indicator"])}" data-v-840ae9be><span class="task-label" data-v-840ae9be>Г</span><span class="task-count" data-v-840ae9be>${ssrInterpolate(completedTasks.value.year)}/3</span></div></div></div></div>`);
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/StatsOverview.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const StatsOverview = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-840ae9be"]]);
function useAutoLayout() {
  function applyLayout(nodes, edges, direction = "LR") {
    if (nodes.length === 0) return [];
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: direction,
      nodesep: 80,
      ranksep: 150,
      marginx: 50,
      marginy: 50
    });
    g.setDefaultEdgeLabel(() => ({}));
    nodes.forEach((node) => {
      g.setNode(node.id, { width: 220, height: 120 });
    });
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });
    dagre.layout(g);
    return nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - 110,
          y: pos.y - 60
        }
      };
    });
  }
  return { applyLayout };
}
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "GlassCard",
  __ssrInlineRender: true,
  props: {
    noPadding: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["glass-card", { "no-padding": __props.noPadding }]
      }, _attrs))} data-v-cda00343>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/base/GlassCard.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const GlassCard = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-cda00343"]]);
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "BranchNode",
  __ssrInlineRender: true,
  props: {
    data: {},
    selected: { type: Boolean }
  },
  emits: ["edit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const milestone = props.data.milestone;
    const tasksStore = useTasksStore();
    const isExpanded = ref(false);
    const isPinned = ref(false);
    const hovered = ref(false);
    const iconComponent = computed(() => {
      const iconName = milestone.icon || props.data.branchIcon || "target";
      const map = {
        "trending-up": TrendingUp,
        dumbbell: Dumbbell,
        brain: Brain,
        users: Users,
        target: Target,
        briefcase: Briefcase,
        heart: Heart,
        "book-open": BookOpen,
        globe: Globe,
        award: Award,
        coffee: Coffee,
        music: Music,
        camera: Camera,
        code: Code
      };
      return map[iconName] || Target;
    });
    const linkedTasks = computed(() => {
      return tasksStore.tasks.filter((t) => milestone.taskIds.includes(t.id));
    });
    function togglePinned() {
      isPinned.value = !isPinned.value;
      updateExpanded();
    }
    function handleMouseEnter() {
      hovered.value = true;
      updateExpanded();
    }
    function handleMouseLeave() {
      hovered.value = false;
      updateExpanded();
    }
    function updateExpanded() {
      isExpanded.value = hovered.value || isPinned.value;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(GlassCard, mergeProps({
        id: `node-${unref(milestone).id}`,
        class: ["branch-node", {
          completed: unref(milestone).status === "completed",
          expanded: isExpanded.value,
          "is-branch": __props.data.type === "branch"
        }],
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="node-main" data-v-6392c9d8${_scopeId}><div class="node-header" data-v-6392c9d8${_scopeId}>`);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent.value), { size: 20 }, null), _parent2, _scopeId);
            _push2(`<div class="header-actions" data-v-6392c9d8${_scopeId}><button class="edit-btn" data-v-6392c9d8${_scopeId}>`);
            _push2(ssrRenderComponent(unref(PenSquare), { size: 14 }, null, _parent2, _scopeId));
            _push2(`</button><span class="${ssrRenderClass([unref(milestone).status, "status-dot"])}" data-v-6392c9d8${_scopeId}></span></div></div><h4 data-v-6392c9d8${_scopeId}>${ssrInterpolate(unref(milestone).name)}</h4>`);
            _push2(ssrRenderComponent(ProgressBar, {
              value: unref(milestone).currentXP,
              max: unref(milestone).requiredXP,
              height: "4px",
              class: "progress"
            }, null, _parent2, _scopeId));
            _push2(`<div class="xp-info" data-v-6392c9d8${_scopeId}>${ssrInterpolate(unref(milestone).currentXP)} / ${ssrInterpolate(unref(milestone).requiredXP)} XP </div><button class="expand-btn" data-v-6392c9d8${_scopeId}>`);
            _push2(ssrRenderComponent(unref(ChevronDown), {
              size: 16,
              class: { rotated: isExpanded.value }
            }, null, _parent2, _scopeId));
            _push2(`</button></div>`);
            if (isExpanded.value) {
              _push2(`<div class="node-details" data-v-6392c9d8${_scopeId}>`);
              if (unref(milestone).description) {
                _push2(`<p data-v-6392c9d8${_scopeId}>${ssrInterpolate(unref(milestone).description)}</p>`);
              } else {
                _push2(`<p class="placeholder" data-v-6392c9d8${_scopeId}>Нет описания</p>`);
              }
              _push2(`<div class="linked-tasks" data-v-6392c9d8${_scopeId}><span class="label" data-v-6392c9d8${_scopeId}>Привязанные задачи:</span>`);
              if (linkedTasks.value.length) {
                _push2(`<ul data-v-6392c9d8${_scopeId}><!--[-->`);
                ssrRenderList(linkedTasks.value, (task) => {
                  _push2(`<li data-v-6392c9d8${_scopeId}>${ssrInterpolate(task.title)}</li>`);
                });
                _push2(`<!--]--></ul>`);
              } else {
                _push2(`<span class="empty" data-v-6392c9d8${_scopeId}>Нет задач</span>`);
              }
              _push2(`</div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(Handle), {
              type: "source",
              position: unref(Position).Right,
              class: "handle-right"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Handle), {
              type: "target",
              position: unref(Position).Left,
              class: "handle-left"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "node-main" }, [
                createVNode("div", { class: "node-header" }, [
                  (openBlock(), createBlock(resolveDynamicComponent(iconComponent.value), { size: 20 })),
                  createVNode("div", { class: "header-actions" }, [
                    createVNode("button", {
                      class: "edit-btn",
                      onClick: withModifiers(($event) => emit("edit", unref(milestone)), ["stop"])
                    }, [
                      createVNode(unref(PenSquare), { size: 14 })
                    ], 8, ["onClick"]),
                    createVNode("span", {
                      class: ["status-dot", unref(milestone).status]
                    }, null, 2)
                  ])
                ]),
                createVNode("h4", null, toDisplayString(unref(milestone).name), 1),
                createVNode(ProgressBar, {
                  value: unref(milestone).currentXP,
                  max: unref(milestone).requiredXP,
                  height: "4px",
                  class: "progress"
                }, null, 8, ["value", "max"]),
                createVNode("div", { class: "xp-info" }, toDisplayString(unref(milestone).currentXP) + " / " + toDisplayString(unref(milestone).requiredXP) + " XP ", 1),
                createVNode("button", {
                  class: "expand-btn",
                  onClick: withModifiers(togglePinned, ["stop"])
                }, [
                  createVNode(unref(ChevronDown), {
                    size: 16,
                    class: { rotated: isExpanded.value }
                  }, null, 8, ["class"])
                ])
              ]),
              createVNode(Transition, { name: "expand" }, {
                default: withCtx(() => [
                  isExpanded.value ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "node-details"
                  }, [
                    unref(milestone).description ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(unref(milestone).description), 1)) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "placeholder"
                    }, "Нет описания")),
                    createVNode("div", { class: "linked-tasks" }, [
                      createVNode("span", { class: "label" }, "Привязанные задачи:"),
                      linkedTasks.value.length ? (openBlock(), createBlock("ul", { key: 0 }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(linkedTasks.value, (task) => {
                          return openBlock(), createBlock("li", {
                            key: task.id
                          }, toDisplayString(task.title), 1);
                        }), 128))
                      ])) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: "empty"
                      }, "Нет задач"))
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(unref(Handle), {
                type: "source",
                position: unref(Position).Right,
                class: "handle-right"
              }, null, 8, ["position"]),
              createVNode(unref(Handle), {
                type: "target",
                position: unref(Position).Left,
                class: "handle-left"
              }, null, 8, ["position"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/branch/BranchNode.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const BranchNode = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-6392c9d8"]]);
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "NodeEditorModal",
  __ssrInlineRender: true,
  props: {
    milestone: {}
  },
  emits: ["close", "save", "delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const tasksStore = useTasksStore();
    const iconsExpanded = ref(false);
    const tasksExpanded = ref(false);
    const iconOptions = [
      "trending-up",
      "dumbbell",
      "brain",
      "users",
      "target",
      "briefcase",
      "heart",
      "book-open",
      "globe",
      "award",
      "coffee",
      "music",
      "camera",
      "code"
    ];
    const iconComponent = (name) => {
      const map = {
        "trending-up": TrendingUp,
        dumbbell: Dumbbell,
        brain: Brain,
        users: Users,
        target: Target,
        briefcase: Briefcase,
        heart: Heart,
        "book-open": BookOpen,
        globe: Globe,
        award: Award,
        coffee: Coffee,
        music: Music,
        camera: Camera,
        code: Code
      };
      return map[name] || Target;
    };
    const activeTasks = computed(() => {
      return tasksStore.tasks.filter((t) => !t.done || t.type === "HABIT");
    });
    const form = reactive({
      name: "",
      description: "",
      icon: "target",
      taskIds: []
    });
    watch(
      () => props.milestone,
      (newVal) => {
        if (newVal) {
          form.name = newVal.name;
          form.description = newVal.description || "";
          form.icon = newVal.icon || "target";
          form.taskIds = [...newVal.taskIds || []];
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="modal-overlay" data-v-05eea574><div class="modal" data-v-05eea574><div class="modal-header" data-v-05eea574><h3 data-v-05eea574>Редактировать этап</h3><button class="close-btn" data-v-05eea574>`);
        _push2(ssrRenderComponent(unref(X), { size: 20 }, null, _parent));
        _push2(`</button></div><form data-v-05eea574><div class="form-group" data-v-05eea574><label data-v-05eea574>Название</label><input${ssrRenderAttr("value", form.name)} type="text" required data-v-05eea574></div><div class="form-group" data-v-05eea574><label data-v-05eea574>Описание</label><textarea placeholder="Краткое описание этапа..." rows="2" data-v-05eea574>${ssrInterpolate(form.description)}</textarea></div><div class="form-group" data-v-05eea574><label data-v-05eea574>Иконка</label><div class="icon-section" data-v-05eea574><button type="button" class="toggle-icons-btn" data-v-05eea574><div class="selected-icon" data-v-05eea574>`);
        ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent(form.icon)), { size: 20 }, null), _parent);
        _push2(`<span data-v-05eea574>${ssrInterpolate(form.icon)}</span></div>`);
        _push2(ssrRenderComponent(unref(ChevronDown), {
          size: 16,
          class: { rotated: iconsExpanded.value }
        }, null, _parent));
        _push2(`</button>`);
        if (iconsExpanded.value) {
          _push2(`<div class="icons-grid" data-v-05eea574><!--[-->`);
          ssrRenderList(iconOptions, (icon) => {
            _push2(`<button type="button" class="${ssrRenderClass([{ active: form.icon === icon }, "icon-option"])}" data-v-05eea574>`);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent(icon)), { size: 20 }, null), _parent);
            _push2(`</button>`);
          });
          _push2(`<!--]--></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></div><div class="form-group" data-v-05eea574><label data-v-05eea574>Привязанные задачи</label><div class="tasks-section" data-v-05eea574><button type="button" class="toggle-tasks-btn" data-v-05eea574><span data-v-05eea574>Выбрать задачи (${ssrInterpolate(form.taskIds.length)})</span>`);
        _push2(ssrRenderComponent(unref(ChevronDown), {
          size: 16,
          class: { rotated: tasksExpanded.value }
        }, null, _parent));
        _push2(`</button>`);
        if (tasksExpanded.value) {
          _push2(`<div class="tasks-list" data-v-05eea574><!--[-->`);
          ssrRenderList(activeTasks.value, (task) => {
            _push2(`<label class="task-checkbox" data-v-05eea574><span class="custom-checkbox" data-v-05eea574><input type="checkbox"${ssrRenderAttr("value", task.id)}${ssrIncludeBooleanAttr(Array.isArray(form.taskIds) ? ssrLooseContain(form.taskIds, task.id) : form.taskIds) ? " checked" : ""} data-v-05eea574><span class="checkmark" data-v-05eea574></span></span><span class="task-title" data-v-05eea574>${ssrInterpolate(task.title)}</span><span class="task-xp" data-v-05eea574>+${ssrInterpolate(task.xpReward || 50)} XP</span></label>`);
          });
          _push2(`<!--]--></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></div><div class="form-actions" data-v-05eea574><button type="button" class="btn-secondary" data-v-05eea574> Отмена </button><button type="button" class="btn-danger" data-v-05eea574> Удалить </button><button type="submit" class="btn-primary" data-v-05eea574>Сохранить</button></div></form></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/branch/NodeEditorModal.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const NodeEditorModal = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-05eea574"]]);
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "BranchModal",
  __ssrInlineRender: true,
  props: {
    branch: {}
  },
  emits: ["close", "save"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const tasksStore = useTasksStore();
    useBranchesStore();
    const { confirm: confirm2 } = useConfirm();
    const iconsExpanded = ref(false);
    const tasksExpanded = ref(false);
    const iconOptions = [
      "trending-up",
      "dumbbell",
      "brain",
      "users",
      "target",
      "briefcase",
      "heart",
      "book-open",
      "globe",
      "award",
      "coffee",
      "music",
      "camera",
      "code"
    ];
    const iconComponent = (name) => {
      const map = {
        "trending-up": TrendingUp,
        dumbbell: Dumbbell,
        brain: Brain,
        users: Users,
        target: Target,
        briefcase: Briefcase,
        heart: Heart,
        "book-open": BookOpen,
        globe: Globe,
        award: Award,
        coffee: Coffee,
        music: Music,
        camera: Camera,
        code: Code
      };
      return map[name] || Target;
    };
    const activeTasks = computed(() => {
      return tasksStore.tasks.filter((t) => !t.done || t.type === "HABIT");
    });
    const form = reactive({
      name: "",
      icon: "target",
      description: "",
      taskIds: []
    });
    watch(
      () => props.branch,
      (newBranch) => {
        if (newBranch) {
          form.name = newBranch.displayName;
          form.icon = newBranch.icon;
          form.description = newBranch.description || "";
          form.taskIds = [...newBranch.taskIds || []];
        } else {
          form.name = "";
          form.icon = "target";
          form.description = "";
          form.taskIds = [];
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="modal-overlay" data-v-c9ea1e5d><div class="modal" data-v-c9ea1e5d><div class="modal-header" data-v-c9ea1e5d><h3 data-v-c9ea1e5d>${ssrInterpolate(__props.branch ? "Редактировать ветку" : "Новая ветка")}</h3><button class="close-btn" data-v-c9ea1e5d>`);
        _push2(ssrRenderComponent(unref(X), { size: 20 }, null, _parent));
        _push2(`</button></div><form data-v-c9ea1e5d><div class="form-group" data-v-c9ea1e5d><label data-v-c9ea1e5d>Название</label><input${ssrRenderAttr("value", form.name)} type="text" required data-v-c9ea1e5d></div><div class="form-group" data-v-c9ea1e5d><label data-v-c9ea1e5d>Описание</label><textarea placeholder="Опишите направление..." rows="2" data-v-c9ea1e5d>${ssrInterpolate(form.description)}</textarea></div><div class="form-group" data-v-c9ea1e5d><label data-v-c9ea1e5d>Иконка</label><div class="icon-section" data-v-c9ea1e5d><button type="button" class="toggle-icons-btn" data-v-c9ea1e5d><div class="selected-icon" data-v-c9ea1e5d>`);
        ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent(form.icon)), { size: 20 }, null), _parent);
        _push2(`<span data-v-c9ea1e5d>${ssrInterpolate(form.icon)}</span></div>`);
        _push2(ssrRenderComponent(unref(ChevronDown), {
          size: 16,
          class: { rotated: iconsExpanded.value }
        }, null, _parent));
        _push2(`</button>`);
        if (iconsExpanded.value) {
          _push2(`<div class="icons-grid" data-v-c9ea1e5d><!--[-->`);
          ssrRenderList(iconOptions, (icon) => {
            _push2(`<button type="button" class="${ssrRenderClass([{ active: form.icon === icon }, "icon-option"])}" data-v-c9ea1e5d>`);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent(icon)), { size: 20 }, null), _parent);
            _push2(`</button>`);
          });
          _push2(`<!--]--></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></div><div class="form-group" data-v-c9ea1e5d><label data-v-c9ea1e5d>Привязанные задачи (опционально)</label><div class="tasks-section" data-v-c9ea1e5d><button type="button" class="toggle-tasks-btn" data-v-c9ea1e5d><span data-v-c9ea1e5d>Выбрать задачи (${ssrInterpolate(form.taskIds.length)})</span>`);
        _push2(ssrRenderComponent(unref(ChevronDown), {
          size: 16,
          class: { rotated: tasksExpanded.value }
        }, null, _parent));
        _push2(`</button>`);
        if (tasksExpanded.value) {
          _push2(`<div class="tasks-list" data-v-c9ea1e5d><!--[-->`);
          ssrRenderList(activeTasks.value, (task) => {
            _push2(`<label class="task-checkbox" data-v-c9ea1e5d><span class="custom-checkbox" data-v-c9ea1e5d><input type="checkbox"${ssrRenderAttr("value", task.id)}${ssrIncludeBooleanAttr(Array.isArray(form.taskIds) ? ssrLooseContain(form.taskIds, task.id) : form.taskIds) ? " checked" : ""} data-v-c9ea1e5d><span class="checkmark" data-v-c9ea1e5d></span></span><span class="task-title" data-v-c9ea1e5d>${ssrInterpolate(task.title)}</span><span class="task-xp" data-v-c9ea1e5d>+${ssrInterpolate(task.xpReward || 50)} XP</span></label>`);
          });
          _push2(`<!--]--></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></div><div class="form-actions" data-v-c9ea1e5d><button type="button" class="btn-secondary" data-v-c9ea1e5d> Отмена </button>`);
        if (__props.branch) {
          _push2(`<button type="button" class="btn-danger" data-v-c9ea1e5d> Удалить </button>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<button type="submit" class="btn-primary" data-v-c9ea1e5d>${ssrInterpolate(__props.branch ? "Сохранить" : "Создать")}</button></div></form></div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/branch/BranchModal.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const BranchModal = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-c9ea1e5d"]]);
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "BranchFlow",
  __ssrInlineRender: true,
  setup(__props) {
    const branchesStore = useBranchesStore();
    const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow();
    const { applyLayout } = useAutoLayout();
    const { confirm: confirm2 } = useConfirm();
    const nodeTypes = { branch: BranchNode };
    const nodes = ref([]);
    const edges = ref([]);
    const isMobile = ref(false);
    const selectedNodeId = ref(null);
    const selectedEdgeId = ref(null);
    function onNodeClick({ node }) {
      selectedNodeId.value = node.id;
      selectedEdgeId.value = null;
    }
    function onEdgeClick({ edge }) {
      selectedEdgeId.value = edge.id;
      selectedNodeId.value = null;
    }
    function onPaneClick() {
      selectedNodeId.value = null;
      selectedEdgeId.value = null;
    }
    function isBranchNode(nodeId) {
      const node = nodes.value.find((n) => n.id === nodeId);
      if (!node) return false;
      const branch = branchesStore.branches.find(
        (b) => b.milestones.some((m) => m.id === nodeId)
      );
      return branch?.milestones.length === 1 && branch.milestones[0].id === nodeId;
    }
    const editingMilestone = ref(null);
    function openEditor(milestone) {
      editingMilestone.value = milestone;
    }
    function handleSaveMilestone(updates) {
      if (editingMilestone.value) {
        branchesStore.updateMilestone(editingMilestone.value.id, updates);
        editingMilestone.value = null;
      }
    }
    async function handleDeleteMilestone() {
      const milestone = editingMilestone.value;
      if (!milestone) return;
      const ok = await confirm2(`Удалить этап «${milestone.name}»?`);
      if (ok) {
        branchesStore.deleteMilestone(milestone.id);
        editingMilestone.value = null;
      }
    }
    const branchModal = ref({
      visible: false,
      branch: null
    });
    function openAddBranchModal() {
      branchModal.value = { visible: true, branch: null };
    }
    function handleSaveBranch(data) {
      if (branchModal.value.branch) {
        branchesStore.updateBranch(branchModal.value.branch.id, {
          ...data,
          displayName: data.name
        });
      } else {
        branchesStore.addBranch(
          data.name,
          data.icon,
          data.description,
          data.taskIds
        );
      }
      branchModal.value.visible = false;
    }
    async function handleDeleteBranch() {
      const branch = branchModal.value.branch;
      if (!branch) return;
      const ok = await confirm2(`Удалить ветку «${branch.displayName}»?`);
      if (ok) {
        branchesStore.deleteBranch(branch.id);
        branchModal.value.visible = false;
      }
    }
    async function deleteSelectedEdge() {
      if (selectedEdgeId.value) {
        const ok = await confirm2("Удалить связь?");
        if (ok) {
          branchesStore.removeEdge(selectedEdgeId.value);
          selectedEdgeId.value = null;
        }
      }
    }
    async function deleteSelectedBranch() {
      if (!selectedNodeId.value) return;
      const branch = branchesStore.branches.find(
        (b) => b.milestones.some((m) => m.id === selectedNodeId.value)
      );
      if (!branch) return;
      const ok = await confirm2(`Удалить ветку «${branch.displayName}»?`);
      if (ok) {
        branchesStore.deleteBranch(branch.id);
        selectedNodeId.value = null;
      }
    }
    function syncNodesAndEdges() {
      const newNodes = [];
      branchesStore.branches.forEach((branch) => {
        branch.milestones.forEach((milestone) => {
          newNodes.push({
            id: milestone.id,
            type: "branch",
            position: milestone.position,
            data: {
              type: "milestone",
              branchId: branch.id,
              milestone,
              branchIcon: branch.icon
            }
          });
        });
      });
      nodes.value = newNodes;
      const existingNodeIds = new Set(newNodes.map((n) => n.id));
      edges.value = branchesStore.edges.filter(
        (e) => existingNodeIds.has(e.source) && existingNodeIds.has(e.target)
      );
    }
    watch(
      () => [branchesStore.branches, branchesStore.edges],
      () => {
        syncNodesAndEdges();
      },
      { immediate: true, deep: true }
    );
    function onNodesChange(changes) {
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          const milestoneId = change.id;
          branchesStore.updateMilestone(milestoneId, { position: change.position });
        }
      }
    }
    function onEdgesChange() {
    }
    function onConnect(connection) {
      const newEdge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: "smoothstep",
        animated: false,
        style: { stroke: "var(--accent)", strokeWidth: 1 }
      };
      branchesStore.addEdge(newEdge);
    }
    function onEdgeUpdate({ edge, connection }) {
      const updatedEdge = {
        ...edge,
        source: connection.source,
        target: connection.target
      };
      branchesStore.updateEdge(updatedEdge);
    }
    function zoomIn() {
      vfZoomIn();
    }
    function zoomOut() {
      vfZoomOut();
    }
    function autoLayout() {
      const allMilestones = branchesStore.branches.flatMap((b) => b.milestones);
      const currentNodes = allMilestones.map((m) => ({
        id: m.id,
        type: "branch",
        position: m.position,
        data: { milestone: m }
      }));
      const currentEdges = branchesStore.edges;
      const layoutedNodes = applyLayout(currentNodes, currentEdges);
      layoutedNodes.forEach((node) => {
        branchesStore.updateMilestone(node.id, { position: node.position });
      });
    }
    function addMilestoneToSelectedBranch() {
      let targetBranch;
      if (selectedNodeId.value) {
        targetBranch = branchesStore.branches.find(
          (b) => b.milestones.some((m) => m.id === selectedNodeId.value)
        );
      }
      if (!targetBranch) {
        targetBranch = branchesStore.branches[0];
      }
      if (targetBranch) {
        branchesStore.addMilestone(targetBranch.id, "Новый этап", "");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "branch-flow-wrapper" }, _attrs))} data-v-572aefa7>`);
      if (isMobile.value) {
        _push(`<div class="mobile-warning" data-v-572aefa7>`);
        _push(ssrRenderComponent(unref(AlertTriangle), { size: 32 }, null, _parent));
        _push(`<h3 data-v-572aefa7>Доступно только на десктопе</h3><p data-v-572aefa7> Для работы с доской развития используйте компьютер или планшет в горизонтальной ориентации. </p></div>`);
      } else {
        _push(ssrRenderComponent(unref(VueFlow), {
          nodes: nodes.value,
          "onUpdate:nodes": ($event) => nodes.value = $event,
          edges: edges.value,
          "onUpdate:edges": ($event) => edges.value = $event,
          "node-types": nodeTypes,
          "default-viewport": { zoom: 1, x: 0, y: 0 },
          "snap-to-grid": true,
          "snap-grid": [20, 20],
          "connection-mode": unref(ConnectionMode).Loose,
          "pan-on-drag": true,
          "zoom-on-scroll": true,
          "fit-view-on-init": true,
          "nodes-draggable": true,
          "edges-updatable": false,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onEdgeUpdate,
          onNodeClick,
          onEdgeClick,
          onPaneClick
        }, {
          "node-branch": withCtx((nodeProps, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(BranchNode, {
                data: nodeProps.data,
                selected: selectedNodeId.value === nodeProps.id,
                onEdit: ($event) => openEditor(nodeProps.data.milestone)
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(BranchNode, {
                  data: nodeProps.data,
                  selected: selectedNodeId.value === nodeProps.id,
                  onEdit: ($event) => openEditor(nodeProps.data.milestone)
                }, null, 8, ["data", "selected", "onEdit"])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(Background), {
                variant: unref(BackgroundVariant).Dots,
                gap: 20,
                size: 1.5
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(Panel), {
                position: "top-left",
                class: "custom-controls"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<button title="Сбросить вид" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(Maximize), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button><button title="Приблизить" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(ZoomIn), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button><button title="Отдалить" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(ZoomOut), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button><div class="divider" data-v-572aefa7${_scopeId2}></div><button title="Авто-расположение" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(Layout), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button><button title="Добавить ветку" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(Plus), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button>`);
                    if (selectedEdgeId.value) {
                      _push3(`<button title="Удалить связь" data-v-572aefa7${_scopeId2}>`);
                      _push3(ssrRenderComponent(unref(Unlink), { size: 18 }, null, _parent3, _scopeId2));
                      _push3(`</button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<button title="Добавить этап" data-v-572aefa7${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(PlusCircle), { size: 18 }, null, _parent3, _scopeId2));
                    _push3(`</button>`);
                    if (selectedNodeId.value && isBranchNode(selectedNodeId.value)) {
                      _push3(`<button title="Удалить ветку" data-v-572aefa7${_scopeId2}>`);
                      _push3(ssrRenderComponent(unref(Trash2), { size: 18 }, null, _parent3, _scopeId2));
                      _push3(`</button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createVNode("button", {
                        onClick: unref(fitView),
                        title: "Сбросить вид"
                      }, [
                        createVNode(unref(Maximize), { size: 18 })
                      ], 8, ["onClick"]),
                      createVNode("button", {
                        onClick: zoomIn,
                        title: "Приблизить"
                      }, [
                        createVNode(unref(ZoomIn), { size: 18 })
                      ]),
                      createVNode("button", {
                        onClick: zoomOut,
                        title: "Отдалить"
                      }, [
                        createVNode(unref(ZoomOut), { size: 18 })
                      ]),
                      createVNode("div", { class: "divider" }),
                      createVNode("button", {
                        onClick: autoLayout,
                        title: "Авто-расположение"
                      }, [
                        createVNode(unref(Layout), { size: 18 })
                      ]),
                      createVNode("button", {
                        onClick: openAddBranchModal,
                        title: "Добавить ветку"
                      }, [
                        createVNode(unref(Plus), { size: 18 })
                      ]),
                      selectedEdgeId.value ? (openBlock(), createBlock("button", {
                        key: 0,
                        onClick: deleteSelectedEdge,
                        title: "Удалить связь"
                      }, [
                        createVNode(unref(Unlink), { size: 18 })
                      ])) : createCommentVNode("", true),
                      createVNode("button", {
                        onClick: addMilestoneToSelectedBranch,
                        title: "Добавить этап"
                      }, [
                        createVNode(unref(PlusCircle), { size: 18 })
                      ]),
                      selectedNodeId.value && isBranchNode(selectedNodeId.value) ? (openBlock(), createBlock("button", {
                        key: 1,
                        onClick: deleteSelectedBranch,
                        title: "Удалить ветку"
                      }, [
                        createVNode(unref(Trash2), { size: 18 })
                      ])) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(Background), {
                  variant: unref(BackgroundVariant).Dots,
                  gap: 20,
                  size: 1.5
                }, null, 8, ["variant"]),
                createVNode(unref(Panel), {
                  position: "top-left",
                  class: "custom-controls"
                }, {
                  default: withCtx(() => [
                    createVNode("button", {
                      onClick: unref(fitView),
                      title: "Сбросить вид"
                    }, [
                      createVNode(unref(Maximize), { size: 18 })
                    ], 8, ["onClick"]),
                    createVNode("button", {
                      onClick: zoomIn,
                      title: "Приблизить"
                    }, [
                      createVNode(unref(ZoomIn), { size: 18 })
                    ]),
                    createVNode("button", {
                      onClick: zoomOut,
                      title: "Отдалить"
                    }, [
                      createVNode(unref(ZoomOut), { size: 18 })
                    ]),
                    createVNode("div", { class: "divider" }),
                    createVNode("button", {
                      onClick: autoLayout,
                      title: "Авто-расположение"
                    }, [
                      createVNode(unref(Layout), { size: 18 })
                    ]),
                    createVNode("button", {
                      onClick: openAddBranchModal,
                      title: "Добавить ветку"
                    }, [
                      createVNode(unref(Plus), { size: 18 })
                    ]),
                    selectedEdgeId.value ? (openBlock(), createBlock("button", {
                      key: 0,
                      onClick: deleteSelectedEdge,
                      title: "Удалить связь"
                    }, [
                      createVNode(unref(Unlink), { size: 18 })
                    ])) : createCommentVNode("", true),
                    createVNode("button", {
                      onClick: addMilestoneToSelectedBranch,
                      title: "Добавить этап"
                    }, [
                      createVNode(unref(PlusCircle), { size: 18 })
                    ]),
                    selectedNodeId.value && isBranchNode(selectedNodeId.value) ? (openBlock(), createBlock("button", {
                      key: 1,
                      onClick: deleteSelectedBranch,
                      title: "Удалить ветку"
                    }, [
                      createVNode(unref(Trash2), { size: 18 })
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (editingMilestone.value) {
        _push(ssrRenderComponent(NodeEditorModal, {
          milestone: editingMilestone.value,
          onClose: ($event) => editingMilestone.value = null,
          onSave: handleSaveMilestone,
          onDelete: handleDeleteMilestone
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (branchModal.value.visible) {
        _push(ssrRenderComponent(BranchModal, {
          branch: branchModal.value.branch,
          onClose: ($event) => branchModal.value.visible = false,
          onSave: handleSaveBranch,
          onDelete: handleDeleteBranch
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/branch/BranchFlow.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const BranchFlow = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-572aefa7"]]);
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "TaskCard",
  __ssrInlineRender: true,
  props: {
    task: {}
  },
  emits: ["toggle", "delete", "edit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const tagsStore = useTagsStore();
    const tasksStore = useTasksStore();
    const { addNotification } = useNotification();
    const { confirm: confirm2 } = useConfirm();
    const taskTags = computed(() => tagsStore.getTagsByIds(props.task.tagIds));
    const typeLabel = computed(() => {
      const map = {
        HABIT: "Привычка",
        TASK_DAY: "День",
        TASK_WEEK: "Неделя",
        TASK_MONTH: "Месяц",
        TASK_YEAR: "Год",
        PURCHASE: "Покупка"
      };
      return map[props.task.type] || props.task.type;
    });
    const formattedDate = computed(() => {
      if (!props.task.targetDate) return "";
      const d = new Date(props.task.targetDate);
      return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
    });
    const isOverdue = computed(() => {
      if (props.task.done) return false;
      if (!props.task.targetDate) return false;
      return props.task.targetDate < (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    });
    function handleToggle() {
      tasksStore.completeTask(props.task.id);
      addNotification({
        type: "success",
        message: props.task.type === "HABIT" ? `Привычка «${props.task.title}» выполнена` : `Задача «${props.task.title}» выполнена`
      });
      emit("toggle", props.task.id);
    }
    async function handleDelete() {
      const ok = await confirm2(`Удалить задачу «${props.task.title}»?`);
      if (!ok) return;
      tasksStore.deleteTask(props.task.id);
      addNotification({
        type: "info",
        message: `«${props.task.title}» удалено`
      });
      emit("delete", props.task.id);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(GlassCard, mergeProps({
        class: ["task-card", { completed: __props.task.done, overdue: isOverdue.value }]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="task-header" data-v-0a309279${_scopeId}><div class="tags" data-v-0a309279${_scopeId}><!--[-->`);
            ssrRenderList(taskTags.value, (tag) => {
              _push2(`<span class="tag"${ssrRenderAttr("title", tag.name)} data-v-0a309279${_scopeId}>${ssrInterpolate(tag.name)}</span>`);
            });
            _push2(`<!--]--></div><span class="${ssrRenderClass([__props.task.type, "task-type"])}" data-v-0a309279${_scopeId}>${ssrInterpolate(typeLabel.value)}</span></div><h4 data-v-0a309279${_scopeId}>${ssrInterpolate(__props.task.title)}</h4>`);
            if (__props.task.description) {
              _push2(`<p data-v-0a309279${_scopeId}>${ssrInterpolate(__props.task.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="task-footer" data-v-0a309279${_scopeId}>`);
            if (__props.task.type !== "HABIT" && __props.task.targetDate) {
              _push2(`<div class="due-date" data-v-0a309279${_scopeId}>`);
              _push2(ssrRenderComponent(unref(Calendar), { size: 14 }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(formattedDate.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="actions" data-v-0a309279${_scopeId}><button class="${ssrRenderClass([{ done: __props.task.done }, "complete-btn"])}"${ssrIncludeBooleanAttr(__props.task.type !== "HABIT" && __props.task.done) ? " disabled" : ""} data-v-0a309279${_scopeId}>`);
            if (__props.task.done) {
              _push2(ssrRenderComponent(unref(CheckCircle), { size: 22 }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(unref(Circle), { size: 22 }, null, _parent2, _scopeId));
            }
            _push2(`</button><button class="delete-btn" data-v-0a309279${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Trash2), { size: 18 }, null, _parent2, _scopeId));
            _push2(`</button><button class="edit-btn" data-v-0a309279${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Edit), { size: 18 }, null, _parent2, _scopeId));
            _push2(`</button></div></div>`);
          } else {
            return [
              createVNode("div", { class: "task-header" }, [
                createVNode("div", { class: "tags" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(taskTags.value, (tag) => {
                    return openBlock(), createBlock("span", {
                      key: tag.id,
                      class: "tag",
                      title: tag.name
                    }, toDisplayString(tag.name), 9, ["title"]);
                  }), 128))
                ]),
                createVNode("span", {
                  class: ["task-type", __props.task.type]
                }, toDisplayString(typeLabel.value), 3)
              ]),
              createVNode("h4", null, toDisplayString(__props.task.title), 1),
              __props.task.description ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(__props.task.description), 1)) : createCommentVNode("", true),
              createVNode("div", { class: "task-footer" }, [
                __props.task.type !== "HABIT" && __props.task.targetDate ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "due-date"
                }, [
                  createVNode(unref(Calendar), { size: 14 }),
                  createTextVNode(" " + toDisplayString(formattedDate.value), 1)
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "actions" }, [
                  createVNode("button", {
                    class: ["complete-btn", { done: __props.task.done }],
                    onClick: handleToggle,
                    disabled: __props.task.type !== "HABIT" && __props.task.done
                  }, [
                    __props.task.done ? (openBlock(), createBlock(unref(CheckCircle), {
                      key: 0,
                      size: 22
                    })) : (openBlock(), createBlock(unref(Circle), {
                      key: 1,
                      size: 22
                    }))
                  ], 10, ["disabled"]),
                  createVNode("button", {
                    class: "delete-btn",
                    onClick: withModifiers(handleDelete, ["stop"])
                  }, [
                    createVNode(unref(Trash2), { size: 18 })
                  ]),
                  createVNode("button", {
                    class: "edit-btn",
                    onClick: withModifiers(($event) => emit("edit", __props.task), ["stop"])
                  }, [
                    createVNode(unref(Edit), { size: 18 })
                  ], 8, ["onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/task/TaskCard.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const TaskCard = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-0a309279"]]);
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "TaskList",
  __ssrInlineRender: true,
  props: {
    taskType: {},
    title: {},
    defaultType: {}
  },
  setup(__props) {
    const props = __props;
    const tasksStore = useTasksStore();
    const { addNotification } = useNotification();
    const showForm = ref(false);
    const editingTask = ref(void 0);
    const tasks = computed(() => {
      if (props.taskType === "HABITS") {
        return tasksStore.getHabits();
      }
      return tasksStore.getTasksByType(props.taskType);
    });
    const ruleHint = computed(() => {
      const map = {
        TASK_DAY: "Не более 3 активных задач на день. Выполненные — можно добавлять новые.",
        TASK_WEEK: "Не более 3 активных задач на неделю.",
        TASK_MONTH: "Не более 3 активных задач на месяц.",
        TASK_YEAR: "Не более 3 активных задач на год."
      };
      return map[props.taskType] || "";
    });
    const emptyMessage = computed(() => {
      if (props.taskType === "HABITS") return "Нет привычек. Добавьте первую.";
      return "Нет активных задач. Можно добавить до 3.";
    });
    function handleEdit(task) {
      editingTask.value = task;
      showForm.value = true;
    }
    function closeForm() {
      showForm.value = false;
      editingTask.value = void 0;
    }
    function handleSave(taskData) {
      if (editingTask.value) {
        tasksStore.updateTask(editingTask.value.id, taskData);
        addNotification({
          type: "success",
          message: "Задача обновлена"
        });
        closeForm();
      } else {
        const result = tasksStore.addTask({
          ...taskData,
          type: props.defaultType || props.taskType
        });
        if (result) {
          addNotification({
            type: "success",
            message: `«${result.title}» добавлено`
          });
          closeForm();
        } else {
          addNotification({
            type: "error",
            message: "Не удалось добавить задачу"
          });
        }
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "task-list" }, _attrs))} data-v-fbdfb179><div class="list-header" data-v-fbdfb179><div class="title-wrapper" data-v-fbdfb179><h3 data-v-fbdfb179>${ssrInterpolate(__props.title)}</h3>`);
      if (__props.taskType !== "HABITS") {
        _push(`<div class="info-badge"${ssrRenderAttr("title", ruleHint.value)} data-v-fbdfb179>`);
        _push(ssrRenderComponent(unref(Info), { size: 14 }, null, _parent));
        _push(`<span class="tooltip" data-v-fbdfb179>${ssrInterpolate(ruleHint.value)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><button class="add-btn" data-v-fbdfb179>`);
      _push(ssrRenderComponent(unref(Plus), { size: 20 }, null, _parent));
      _push(`</button></div><div class="tasks" data-v-fbdfb179><!--[-->`);
      ssrRenderList(tasks.value, (task) => {
        _push(ssrRenderComponent(TaskCard, {
          key: task.id,
          task,
          onToggle: unref(tasksStore).completeTask,
          onDelete: unref(tasksStore).deleteTask,
          onEdit: handleEdit
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (tasks.value.length === 0) {
        _push(`<p class="empty" data-v-fbdfb179>${ssrInterpolate(emptyMessage.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (showForm.value) {
          _push2(ssrRenderComponent(TaskForm, {
            task: editingTask.value,
            "default-type": __props.defaultType,
            onClose: closeForm,
            onSave: handleSave
          }, null, _parent));
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/task/TaskList.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const TaskList = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-fbdfb179"]]);
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "RewardCard",
  __ssrInlineRender: true,
  props: {
    reward: {}
  },
  setup(__props) {
    const props = __props;
    const rewardsStore = useRewardsStore();
    const userStore = useUserStore();
    function purchase() {
      rewardsStore.purchaseReward(props.reward.id);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(GlassCard, mergeProps({
        class: ["reward-card", { purchased: __props.reward.purchased }]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h4 data-v-22d5ceca${_scopeId}>${ssrInterpolate(__props.reward.title)}</h4>`);
            if (__props.reward.description) {
              _push2(`<p data-v-22d5ceca${_scopeId}>${ssrInterpolate(__props.reward.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="price" data-v-22d5ceca${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Coins), { size: 16 }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(__props.reward.price)}</div><button class="buy-btn"${ssrIncludeBooleanAttr(__props.reward.purchased || unref(userStore).coins < __props.reward.price) ? " disabled" : ""} data-v-22d5ceca${_scopeId}>${ssrInterpolate(__props.reward.purchased ? "Куплено" : "Купить")}</button>`);
          } else {
            return [
              createVNode("h4", null, toDisplayString(__props.reward.title), 1),
              __props.reward.description ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(__props.reward.description), 1)) : createCommentVNode("", true),
              createVNode("div", { class: "price" }, [
                createVNode(unref(Coins), { size: 16 }),
                createTextVNode(" " + toDisplayString(__props.reward.price), 1)
              ]),
              createVNode("button", {
                class: "buy-btn",
                disabled: __props.reward.purchased || unref(userStore).coins < __props.reward.price,
                onClick: purchase
              }, toDisplayString(__props.reward.purchased ? "Куплено" : "Купить"), 9, ["disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shop/RewardCard.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const RewardCard = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-22d5ceca"]]);
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "RewardList",
  __ssrInlineRender: true,
  setup(__props) {
    const rewardsStore = useRewardsStore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "reward-list" }, _attrs))} data-v-5fee9868><div class="list-header" data-v-5fee9868><h3 data-v-5fee9868>Магазин наград</h3></div><div class="rewards-grid" data-v-5fee9868><!--[-->`);
      ssrRenderList(unref(rewardsStore).rewards, (reward) => {
        _push(ssrRenderComponent(RewardCard, {
          key: reward.id,
          reward
        }, null, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shop/RewardList.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const RewardList = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-5fee9868"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "OverallProgress",
  __ssrInlineRender: true,
  setup(__props) {
    Chart.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      Filler
    );
    const userStore = useUserStore();
    const chartData = computed(() => {
      const labels = [];
      const data = [];
      const today = /* @__PURE__ */ new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        labels.push(d.toLocaleDateString("ru", { day: "numeric", month: "short" }));
        const progress = Math.min(
          1,
          (d.getTime() - startDate.getTime()) / (today.getTime() - startDate.getTime())
        );
        data.push(Math.floor(userStore.totalXP * progress));
      }
      return {
        labels,
        datasets: [
          {
            label: "XP",
            data,
            borderColor: "#FFFFFF",
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return "#FFFFFF";
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top
              );
              gradient.addColorStop(0, "#222222");
              gradient.addColorStop(1, "#FFFFFF");
              return gradient;
            },
            fill: true,
            tension: 0.4
          }
        ]
      };
    });
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "#222222" }, ticks: { color: "#AAAAAA" } },
        y: { grid: { color: "#222222" }, ticks: { color: "#AAAAAA" } }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "overall-progress" }, _attrs))} data-v-3e0a7072><h4 data-v-3e0a7072>Общий прогресс XP</h4>`);
      _push(ssrRenderComponent(unref(Line), {
        data: chartData.value,
        options: chartOptions
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/analytics/OverallProgress.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const OverallProgress = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-3e0a7072"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "HealthIndicator",
  __ssrInlineRender: true,
  setup(__props) {
    Chart.register(ArcElement, Tooltip, Legend);
    const userStore = useUserStore();
    const chartData = computed(() => ({
      labels: ["HP", "Потеряно"],
      datasets: [
        {
          data: [userStore.hp, 100 - userStore.hp],
          backgroundColor: ["#FFFFFF", "#222222"],
          borderWidth: 0
        }
      ]
    }));
    const chartOptions = {
      cutout: "70%",
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "health-indicator" }, _attrs))} data-v-deb9f550><h4 data-v-deb9f550>Здоровье</h4>`);
      _push(ssrRenderComponent(unref(Doughnut), {
        data: chartData.value,
        options: chartOptions
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/analytics/HealthIndicator.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const HealthIndicator = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-deb9f550"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AnalyticsPanel",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(GlassCard, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3${_scopeId}>Аналитика</h3>`);
            _push2(ssrRenderComponent(OverallProgress, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(HealthIndicator, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("h3", null, "Аналитика"),
              createVNode(OverallProgress),
              createVNode(HealthIndicator)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/analytics/AnalyticsPanel.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SettingsPanel",
  __ssrInlineRender: true,
  setup(__props) {
    const settingsStore = useSettingsStore();
    const { addNotification } = useNotification();
    function createBackup() {
      const data = {
        user: JSON.parse(localStorage.getItem("carbon-user") || "{}"),
        tasks: JSON.parse(localStorage.getItem("carbon-tasks") || "[]"),
        branches: JSON.parse(localStorage.getItem("carbon-branches") || "[]"),
        rewards: JSON.parse(localStorage.getItem("carbon-rewards") || "[]"),
        tags: JSON.parse(localStorage.getItem("carbon-tags") || "[]"),
        ui: JSON.parse(localStorage.getItem("carbon-ui") || "{}"),
        settings: JSON.parse(localStorage.getItem("carbon-settings") || "{}")
      };
      localStorage.setItem("carbon-autobackup-latest", JSON.stringify(data));
      settingsStore.recordBackup();
      addNotification({ type: "success", message: "Резервная копия создана" });
    }
    function exportData() {
      const data = {
        user: JSON.parse(localStorage.getItem("carbon-user") || "{}"),
        tasks: JSON.parse(localStorage.getItem("carbon-tasks") || "[]"),
        branches: JSON.parse(localStorage.getItem("carbon-branches") || "[]"),
        rewards: JSON.parse(localStorage.getItem("carbon-rewards") || "[]"),
        tags: JSON.parse(localStorage.getItem("carbon-tags") || "[]"),
        ui: JSON.parse(localStorage.getItem("carbon-ui") || "{}"),
        settings: JSON.parse(localStorage.getItem("carbon-settings") || "{}")
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `carbon-backup-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification({ type: "success", message: "Данные экспортированы" });
    }
    function importData() {
      const input = (void 0).createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (data.user)
            localStorage.setItem("carbon-user", JSON.stringify(data.user));
          if (data.tasks)
            localStorage.setItem("carbon-tasks", JSON.stringify(data.tasks));
          if (data.branches)
            localStorage.setItem("carbon-branches", JSON.stringify(data.branches));
          if (data.rewards)
            localStorage.setItem("carbon-rewards", JSON.stringify(data.rewards));
          if (data.tags)
            localStorage.setItem("carbon-tags", JSON.stringify(data.tags));
          if (data.ui) localStorage.setItem("carbon-ui", JSON.stringify(data.ui));
          if (data.settings)
            localStorage.setItem("carbon-settings", JSON.stringify(data.settings));
          addNotification({
            type: "success",
            message: "Данные импортированы. Перезагрузка..."
          });
          setTimeout(() => (void 0).location.reload(), 1500);
        } catch {
          addNotification({ type: "error", message: "Ошибка импорта" });
        }
      };
      input.click();
    }
    function restoreAutoBackup() {
      const backup = localStorage.getItem("carbon-autobackup-latest");
      if (!backup) {
        addNotification({ type: "warning", message: "Нет сохранённой копии" });
        return;
      }
      try {
        const data = JSON.parse(backup);
        if (data.user)
          localStorage.setItem("carbon-user", JSON.stringify(data.user));
        if (data.tasks)
          localStorage.setItem("carbon-tasks", JSON.stringify(data.tasks));
        if (data.branches)
          localStorage.setItem("carbon-branches", JSON.stringify(data.branches));
        if (data.rewards)
          localStorage.setItem("carbon-rewards", JSON.stringify(data.rewards));
        if (data.tags)
          localStorage.setItem("carbon-tags", JSON.stringify(data.tags));
        if (data.ui) localStorage.setItem("carbon-ui", JSON.stringify(data.ui));
        if (data.settings)
          localStorage.setItem("carbon-settings", JSON.stringify(data.settings));
        addNotification({
          type: "success",
          message: "Данные восстановлены. Перезагрузка..."
        });
        setTimeout(() => (void 0).location.reload(), 1e3);
      } catch {
        addNotification({ type: "error", message: "Ошибка восстановления" });
      }
    }
    function resetAllData() {
      if (confirm("Удалить все данные? Это действие необратимо.")) {
        localStorage.clear();
        addNotification({
          type: "success",
          message: "Данные сброшены. Перезагрузка..."
        });
        setTimeout(() => (void 0).location.reload(), 1e3);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "settings-page" }, _attrs))} data-v-d7582c8a><div class="settings-grid" data-v-d7582c8a>`);
      _push(ssrRenderComponent(GlassCard, { class: "settings-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 data-v-d7582c8a${_scopeId}>Внешний вид</h3><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Тема</span><span class="desc" data-v-d7582c8a${_scopeId}>Светлая или тёмная</span></div><div class="theme-toggle" data-v-d7582c8a${_scopeId}><button class="${ssrRenderClass([{ active: unref(settingsStore).theme === "dark" }, "theme-option"])}" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Moon), { size: 18 }, null, _parent2, _scopeId));
            _push2(`</button><button class="${ssrRenderClass([{ active: unref(settingsStore).theme === "light" }, "theme-option"])}" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Sun), { size: 18 }, null, _parent2, _scopeId));
            _push2(`</button></div></div><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Акцентный цвет</span><span class="desc" data-v-d7582c8a${_scopeId}>Выберите оттенок</span></div><div class="color-options" data-v-d7582c8a${_scopeId}><!--[-->`);
            ssrRenderList(unref(ACCENT_COLORS), (color) => {
              _push2(`<button style="${ssrRenderStyle({ backgroundColor: color.value })}" class="${ssrRenderClass([{ active: unref(settingsStore).accentColor === color.value }, "color-dot"])}"${ssrRenderAttr("title", color.name)} data-v-d7582c8a${_scopeId}></button>`);
            });
            _push2(`<!--]--></div></div><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Анимации</span><span class="desc" data-v-d7582c8a${_scopeId}>Плавные переходы</span></div><label class="switch" data-v-d7582c8a${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settingsStore).animationsEnabled) ? ssrLooseContain(unref(settingsStore).animationsEnabled, null) : unref(settingsStore).animationsEnabled) ? " checked" : ""} data-v-d7582c8a${_scopeId}><span class="slider" data-v-d7582c8a${_scopeId}></span></label></div>`);
          } else {
            return [
              createVNode("h3", null, "Внешний вид"),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Тема"),
                  createVNode("span", { class: "desc" }, "Светлая или тёмная")
                ]),
                createVNode("div", { class: "theme-toggle" }, [
                  createVNode("button", {
                    class: ["theme-option", { active: unref(settingsStore).theme === "dark" }],
                    onClick: ($event) => unref(settingsStore).setTheme("dark")
                  }, [
                    createVNode(unref(Moon), { size: 18 })
                  ], 10, ["onClick"]),
                  createVNode("button", {
                    class: ["theme-option", { active: unref(settingsStore).theme === "light" }],
                    onClick: ($event) => unref(settingsStore).setTheme("light")
                  }, [
                    createVNode(unref(Sun), { size: 18 })
                  ], 10, ["onClick"])
                ])
              ]),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Акцентный цвет"),
                  createVNode("span", { class: "desc" }, "Выберите оттенок")
                ]),
                createVNode("div", { class: "color-options" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(ACCENT_COLORS), (color) => {
                    return openBlock(), createBlock("button", {
                      key: color.value,
                      class: ["color-dot", { active: unref(settingsStore).accentColor === color.value }],
                      style: { backgroundColor: color.value },
                      onClick: ($event) => unref(settingsStore).setAccentColor(color.value),
                      title: color.name
                    }, null, 14, ["onClick", "title"]);
                  }), 128))
                ])
              ]),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Анимации"),
                  createVNode("span", { class: "desc" }, "Плавные переходы")
                ]),
                createVNode("label", { class: "switch" }, [
                  withDirectives(createVNode("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": ($event) => unref(settingsStore).animationsEnabled = $event
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(settingsStore).animationsEnabled]
                  ]),
                  createVNode("span", { class: "slider" })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(GlassCard, { class: "settings-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 data-v-d7582c8a${_scopeId}>Уведомления</h3><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Звук</span><span class="desc" data-v-d7582c8a${_scopeId}>Короткий сигнал</span></div><label class="switch" data-v-d7582c8a${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settingsStore).soundEnabled) ? ssrLooseContain(unref(settingsStore).soundEnabled, null) : unref(settingsStore).soundEnabled) ? " checked" : ""} data-v-d7582c8a${_scopeId}><span class="slider" data-v-d7582c8a${_scopeId}></span></label></div><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Всплывающие сообщения</span><span class="desc" data-v-d7582c8a${_scopeId}>Показывать тосты</span></div><label class="switch" data-v-d7582c8a${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settingsStore).notificationsEnabled) ? ssrLooseContain(unref(settingsStore).notificationsEnabled, null) : unref(settingsStore).notificationsEnabled) ? " checked" : ""} data-v-d7582c8a${_scopeId}><span class="slider" data-v-d7582c8a${_scopeId}></span></label></div>`);
          } else {
            return [
              createVNode("h3", null, "Уведомления"),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Звук"),
                  createVNode("span", { class: "desc" }, "Короткий сигнал")
                ]),
                createVNode("label", { class: "switch" }, [
                  withDirectives(createVNode("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": ($event) => unref(settingsStore).soundEnabled = $event
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(settingsStore).soundEnabled]
                  ]),
                  createVNode("span", { class: "slider" })
                ])
              ]),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Всплывающие сообщения"),
                  createVNode("span", { class: "desc" }, "Показывать тосты")
                ]),
                createVNode("label", { class: "switch" }, [
                  withDirectives(createVNode("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": ($event) => unref(settingsStore).notificationsEnabled = $event
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(settingsStore).notificationsEnabled]
                  ]),
                  createVNode("span", { class: "slider" })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(GlassCard, { class: "settings-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 data-v-d7582c8a${_scopeId}>Данные</h3><div class="setting-item" data-v-d7582c8a${_scopeId}><div class="setting-info" data-v-d7582c8a${_scopeId}><span class="label" data-v-d7582c8a${_scopeId}>Авто-бэкап при выходе</span><span class="desc" data-v-d7582c8a${_scopeId}>Сохранять копию</span></div><label class="switch" data-v-d7582c8a${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settingsStore).autoBackup) ? ssrLooseContain(unref(settingsStore).autoBackup, null) : unref(settingsStore).autoBackup) ? " checked" : ""} data-v-d7582c8a${_scopeId}><span class="slider" data-v-d7582c8a${_scopeId}></span></label></div>`);
            if (unref(settingsStore).lastBackupDate) {
              _push2(`<div class="backup-info" data-v-d7582c8a${_scopeId}> Последний: ${ssrInterpolate(new Date(unref(settingsStore).lastBackupDate).toLocaleString())}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="action-group" data-v-d7582c8a${_scopeId}><button class="action-btn" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Download), { size: 16 }, null, _parent2, _scopeId));
            _push2(` Бэкап </button><button class="action-btn" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(FileJson), { size: 16 }, null, _parent2, _scopeId));
            _push2(` Экспорт </button><button class="action-btn" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Upload), { size: 16 }, null, _parent2, _scopeId));
            _push2(` Импорт </button><button class="action-btn" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(RotateCcw), { size: 16 }, null, _parent2, _scopeId));
            _push2(` Восстановить </button><button class="action-btn danger" data-v-d7582c8a${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Trash2), { size: 16 }, null, _parent2, _scopeId));
            _push2(` Сброс </button></div>`);
          } else {
            return [
              createVNode("h3", null, "Данные"),
              createVNode("div", { class: "setting-item" }, [
                createVNode("div", { class: "setting-info" }, [
                  createVNode("span", { class: "label" }, "Авто-бэкап при выходе"),
                  createVNode("span", { class: "desc" }, "Сохранять копию")
                ]),
                createVNode("label", { class: "switch" }, [
                  withDirectives(createVNode("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": ($event) => unref(settingsStore).autoBackup = $event
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(settingsStore).autoBackup]
                  ]),
                  createVNode("span", { class: "slider" })
                ])
              ]),
              unref(settingsStore).lastBackupDate ? (openBlock(), createBlock("div", {
                key: 0,
                class: "backup-info"
              }, " Последний: " + toDisplayString(new Date(unref(settingsStore).lastBackupDate).toLocaleString()), 1)) : createCommentVNode("", true),
              createVNode("div", { class: "action-group" }, [
                createVNode("button", {
                  class: "action-btn",
                  onClick: createBackup
                }, [
                  createVNode(unref(Download), { size: 16 }),
                  createTextVNode(" Бэкап ")
                ]),
                createVNode("button", {
                  class: "action-btn",
                  onClick: exportData
                }, [
                  createVNode(unref(FileJson), { size: 16 }),
                  createTextVNode(" Экспорт ")
                ]),
                createVNode("button", {
                  class: "action-btn",
                  onClick: importData
                }, [
                  createVNode(unref(Upload), { size: 16 }),
                  createTextVNode(" Импорт ")
                ]),
                createVNode("button", {
                  class: "action-btn",
                  onClick: restoreAutoBackup
                }, [
                  createVNode(unref(RotateCcw), { size: 16 }),
                  createTextVNode(" Восстановить ")
                ]),
                createVNode("button", {
                  class: "action-btn danger",
                  onClick: resetAllData
                }, [
                  createVNode(unref(Trash2), { size: 16 }),
                  createTextVNode(" Сброс ")
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/SettingsPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SettingsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-d7582c8a"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const uiStore = useUIStore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard" }, _attrs))} data-v-3e43d4b3>`);
      if (unref(uiStore).activeNav !== "board") {
        _push(`<section class="dashboard-section stats" data-v-3e43d4b3>`);
        _push(ssrRenderComponent(StatsOverview, null, null, _parent));
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="dashboard-section content-section" data-v-3e43d4b3>`);
      if (unref(uiStore).activeNav === "board") {
        _push(ssrRenderComponent(BranchFlow, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(uiStore).activeNav === "tasks") {
        _push(`<div class="tasks-dashboard" data-v-3e43d4b3>`);
        _push(ssrRenderComponent(TaskList, {
          "task-type": "HABITS",
          title: "Привычки",
          "default-type": "HABIT"
        }, null, _parent));
        _push(`<div class="horizons-grid" data-v-3e43d4b3>`);
        _push(ssrRenderComponent(TaskList, {
          "task-type": "TASK_DAY",
          title: "Сегодня (макс. 3)",
          "default-type": "TASK_DAY"
        }, null, _parent));
        _push(ssrRenderComponent(TaskList, {
          "task-type": "TASK_WEEK",
          title: "Неделя (макс. 3)",
          "default-type": "TASK_WEEK"
        }, null, _parent));
        _push(ssrRenderComponent(TaskList, {
          "task-type": "TASK_MONTH",
          title: "Месяц (макс. 3)",
          "default-type": "TASK_MONTH"
        }, null, _parent));
        _push(ssrRenderComponent(TaskList, {
          "task-type": "TASK_YEAR",
          title: "Год (макс. 3)",
          "default-type": "TASK_YEAR"
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(uiStore).activeNav === "shop") {
        _push(ssrRenderComponent(RewardList, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(uiStore).activeNav === "analytics") {
        _push(ssrRenderComponent(_sfc_main$2, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(uiStore).activeNav === "settings") {
        _push(ssrRenderComponent(SettingsPanel, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3e43d4b3"]]);
export {
  index as default
};
//# sourceMappingURL=index-A0G2byRJ.js.map
