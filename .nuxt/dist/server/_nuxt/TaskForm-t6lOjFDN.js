import { ref, defineComponent, computed, reactive, watch, unref, useSSRContext } from "vue";
import { ssrRenderTeleport, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { X, ChevronDown, Calendar, Plus } from "lucide-vue-next";
import { i as useTagsStore, f as useTasksStore, _ as _export_sfc } from "../server.mjs";
const notifications = ref([]);
function useNotification() {
  function addNotification(notification) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 4e3
    };
    notifications.value.push(newNotification);
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }
  function removeNotification(id) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) notifications.value.splice(index, 1);
  }
  return {
    notifications,
    addNotification,
    removeNotification
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "TaskForm",
  __ssrInlineRender: true,
  props: {
    task: {},
    defaultType: {},
    hideType: { type: Boolean }
  },
  emits: ["close", "save"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const tagsStore = useTagsStore();
    useTasksStore();
    const editing = computed(() => !!props.task);
    const form = reactive({
      title: "",
      description: "",
      type: props.defaultType || "HABIT",
      targetDate: "",
      tagIds: []
    });
    const modalTitle = computed(() => {
      if (editing.value) return "Редактирование";
      return form.type === "HABIT" ? "Новая привычка" : "Новая задача";
    });
    const submitButtonText = computed(() => {
      return form.type === "HABIT" ? "Добавить привычку" : "Создать задачу";
    });
    const titlePlaceholder = computed(() => {
      return form.type === "HABIT" ? "Например: Пить воду" : "Например: Прочитать 20 страниц";
    });
    watch(
      () => props.task,
      (newTask) => {
        if (newTask) {
          form.title = newTask.title;
          form.description = newTask.description || "";
          form.type = newTask.type;
          form.targetDate = newTask.targetDate || "";
          form.tagIds = [...newTask.tagIds];
        }
      },
      { immediate: true }
    );
    watch(
      () => props.defaultType,
      (newType) => {
        if (!editing.value && newType) {
          form.type = newType;
        }
      },
      { immediate: true }
    );
    const showAddTagModal = ref(false);
    const newTagName = ref("");
    const newTagBranchId = ref("FIN");
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="modal-overlay" data-v-0308534e><div class="modal" data-v-0308534e><div class="modal-header" data-v-0308534e><h3 data-v-0308534e>${ssrInterpolate(modalTitle.value)}</h3><button class="close-btn" data-v-0308534e>`);
        _push2(ssrRenderComponent(unref(X), { size: 20 }, null, _parent));
        _push2(`</button></div><form data-v-0308534e><div class="form-group" data-v-0308534e><label data-v-0308534e>Название</label><input${ssrRenderAttr("value", form.title)} type="text"${ssrRenderAttr("placeholder", titlePlaceholder.value)} required data-v-0308534e></div><div class="form-group" data-v-0308534e><label data-v-0308534e>Описание</label><input${ssrRenderAttr("value", form.description)} type="text" placeholder="Дополнительные детали (необязательно)" data-v-0308534e></div>`);
        if (!__props.hideType) {
          _push2(`<div class="form-row" data-v-0308534e><div class="form-group" data-v-0308534e><label data-v-0308534e>Тип</label><div class="select-wrapper" data-v-0308534e><select data-v-0308534e><option value="HABIT" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, "HABIT") : ssrLooseEqual(form.type, "HABIT")) ? " selected" : ""}>Привычка</option><option value="TASK_DAY" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, "TASK_DAY") : ssrLooseEqual(form.type, "TASK_DAY")) ? " selected" : ""}>На день</option><option value="TASK_WEEK" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, "TASK_WEEK") : ssrLooseEqual(form.type, "TASK_WEEK")) ? " selected" : ""}>На неделю</option><option value="TASK_MONTH" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, "TASK_MONTH") : ssrLooseEqual(form.type, "TASK_MONTH")) ? " selected" : ""}>На месяц</option><option value="TASK_YEAR" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(form.type) ? ssrLooseContain(form.type, "TASK_YEAR") : ssrLooseEqual(form.type, "TASK_YEAR")) ? " selected" : ""}>На год</option></select>`);
          _push2(ssrRenderComponent(unref(ChevronDown), {
            size: 16,
            class: "select-icon"
          }, null, _parent));
          _push2(`</div></div>`);
          if (form.type !== "HABIT") {
            _push2(`<div class="form-group" data-v-0308534e><label data-v-0308534e>Срок</label><div class="date-wrapper" data-v-0308534e><input type="date"${ssrRenderAttr("value", form.targetDate)} data-v-0308534e>`);
            _push2(ssrRenderComponent(unref(Calendar), {
              size: 16,
              class: "date-icon"
            }, null, _parent));
            _push2(`</div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<div class="form-group" data-v-0308534e><label data-v-0308534e>Теги</label><div class="tags-cloud" data-v-0308534e><!--[-->`);
        ssrRenderList(unref(tagsStore).tags, (tag) => {
          _push2(`<div class="tag-wrapper" data-v-0308534e><button type="button" class="${ssrRenderClass([{ active: form.tagIds.includes(tag.id) }, "tag-btn"])}" data-v-0308534e>${ssrInterpolate(tag.name)}</button>`);
          if (!tag.isSystem) {
            _push2(`<button class="tag-delete" title="Удалить тег" data-v-0308534e>`);
            _push2(ssrRenderComponent(unref(X), { size: 14 }, null, _parent));
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        });
        _push2(`<!--]--><button type="button" class="tag-btn add-tag-btn" title="Добавить тег" data-v-0308534e>`);
        _push2(ssrRenderComponent(unref(Plus), { size: 16 }, null, _parent));
        _push2(` Добавить </button></div></div><div class="form-actions" data-v-0308534e><button type="button" class="btn-secondary" data-v-0308534e> Отмена </button><button type="submit" class="btn-primary" data-v-0308534e>${ssrInterpolate(editing.value ? "Сохранить" : submitButtonText.value)}</button></div></form></div></div>`);
        ssrRenderTeleport(_push2, (_push3) => {
          if (showAddTagModal.value) {
            _push3(`<div class="modal-overlay" data-v-0308534e><div class="modal tag-modal" data-v-0308534e><div class="modal-header" data-v-0308534e><h4 data-v-0308534e>Новый тег</h4><button class="close-btn" data-v-0308534e>`);
            _push3(ssrRenderComponent(unref(X), { size: 18 }, null, _parent));
            _push3(`</button></div><form data-v-0308534e><div class="form-group" data-v-0308534e><label data-v-0308534e>Название</label><input${ssrRenderAttr("value", newTagName.value)} type="text" placeholder="#важно" required data-v-0308534e></div><div class="form-group" data-v-0308534e><label data-v-0308534e>Ветка</label><div class="select-wrapper" data-v-0308534e><select required data-v-0308534e><option value="FIN" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(newTagBranchId.value) ? ssrLooseContain(newTagBranchId.value, "FIN") : ssrLooseEqual(newTagBranchId.value, "FIN")) ? " selected" : ""}>Финансы</option><option value="BODY" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(newTagBranchId.value) ? ssrLooseContain(newTagBranchId.value, "BODY") : ssrLooseEqual(newTagBranchId.value, "BODY")) ? " selected" : ""}>Тело</option><option value="MIND" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(newTagBranchId.value) ? ssrLooseContain(newTagBranchId.value, "MIND") : ssrLooseEqual(newTagBranchId.value, "MIND")) ? " selected" : ""}>Интеллект</option><option value="LDR" data-v-0308534e${ssrIncludeBooleanAttr(Array.isArray(newTagBranchId.value) ? ssrLooseContain(newTagBranchId.value, "LDR") : ssrLooseEqual(newTagBranchId.value, "LDR")) ? " selected" : ""}>Лидерство</option></select>`);
            _push3(ssrRenderComponent(unref(ChevronDown), {
              size: 16,
              class: "select-icon"
            }, null, _parent));
            _push3(`</div></div><div class="form-actions" data-v-0308534e><button type="button" class="btn-secondary" data-v-0308534e> Отмена </button><button type="submit" class="btn-primary" data-v-0308534e>Создать</button></div></form></div></div>`);
          } else {
            _push3(`<!---->`);
          }
        }, "body", false, _parent);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/task/TaskForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const TaskForm = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0308534e"]]);
export {
  TaskForm as T,
  useNotification as u
};
//# sourceMappingURL=TaskForm-t6lOjFDN.js.map
