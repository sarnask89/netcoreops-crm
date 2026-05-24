import { useSlots, computed, ref, unref, mergeProps, withCtx, renderSlot, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, createVNode, Fragment, renderList, defineComponent, toRefs, shallowRef, watch, watchPostEffect, withKeys, withModifiers, normalizeStyle, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { e as useAppConfig, f as useComponentUI, g as useForwardPropsEmits, r as reactivePick, t as tv, A as get, j as _sfc_main$e, z as _sfc_main$c, a as useForwardExpose, b as useVModel, P as Primitive, L as useResizeObserver, d as Presence_default, c as createContext } from './server.mjs';
import { u as useDirection, a as useId } from './PopperArrow-CvIo2SqJ.mjs';
import { R as RovingFocusGroup_default } from './RovingFocusGroup-ByIEls-F.mjs';
import { R as RovingFocusItem_default } from './RovingFocusItem-CDE9BQzI.mjs';
import { _ as _sfc_main$1 } from './Badge-CElKKp_G.mjs';

const [injectTabsRootContext, provideTabsRootContext] = /* @__PURE__ */ createContext("TabsRoot");
var TabsRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TabsRoot",
  props: {
    defaultValue: {
      type: null,
      required: false
    },
    orientation: {
      type: String,
      required: false,
      default: "horizontal"
    },
    dir: {
      type: String,
      required: false
    },
    activationMode: {
      type: String,
      required: false,
      default: "automatic"
    },
    modelValue: {
      type: null,
      required: false
    },
    unmountOnHide: {
      type: Boolean,
      required: false,
      default: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { orientation, unmountOnHide, dir: propDir } = toRefs(props);
    const dir = useDirection(propDir);
    useForwardExpose();
    const modelValue = useVModel(props, "modelValue", emits, {
      defaultValue: props.defaultValue,
      passive: props.modelValue === void 0
    });
    const tabsList = ref();
    const contentIds = shallowRef(/* @__PURE__ */ new Set());
    provideTabsRootContext({
      modelValue,
      changeModelValue: (value) => {
        modelValue.value = value;
      },
      orientation,
      dir,
      unmountOnHide,
      activationMode: props.activationMode,
      baseId: useId(void 0, "reka-tabs"),
      tabsList,
      contentIds,
      registerContent: (value) => {
        contentIds.value = /* @__PURE__ */ new Set([...contentIds.value, value]);
      },
      unregisterContent: (value) => {
        const newSet = new Set(contentIds.value);
        newSet.delete(value);
        contentIds.value = newSet;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        dir: unref(dir),
        "data-orientation": unref(orientation),
        "as-child": _ctx.asChild,
        as: _ctx.as
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", { modelValue: unref(modelValue) })]),
        _: 3
      }, 8, [
        "dir",
        "data-orientation",
        "as-child",
        "as"
      ]);
    };
  }
});
var TabsRoot_default = TabsRoot_vue_vue_type_script_setup_true_lang_default;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var TabsContent_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TabsContent",
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    forceMount: {
      type: Boolean,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const { forwardRef } = useForwardExpose();
    const rootContext = injectTabsRootContext();
    const triggerId = computed(() => makeTriggerId(rootContext.baseId, props.value));
    const contentId = computed(() => makeContentId(rootContext.baseId, props.value));
    const isSelected = computed(() => props.value === rootContext.modelValue.value);
    const isMountAnimationPreventedRef = ref(isSelected.value);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Presence_default), {
        present: _ctx.forceMount || isSelected.value,
        "force-mount": ""
      }, {
        default: withCtx(({ present }) => [createVNode(unref(Primitive), {
          id: contentId.value,
          ref: unref(forwardRef),
          "as-child": _ctx.asChild,
          as: _ctx.as,
          role: "tabpanel",
          "data-state": isSelected.value ? "active" : "inactive",
          "data-orientation": unref(rootContext).orientation.value,
          "aria-labelledby": triggerId.value,
          hidden: !present,
          tabindex: "0",
          style: normalizeStyle({ animationDuration: isMountAnimationPreventedRef.value ? "0s" : void 0 })
        }, {
          default: withCtx(() => [(unref(rootContext).unmountOnHide.value ? present : true) ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("v-if", true)]),
          _: 2
        }, 1032, [
          "id",
          "as-child",
          "as",
          "data-state",
          "data-orientation",
          "aria-labelledby",
          "hidden",
          "style"
        ])]),
        _: 3
      }, 8, ["present"]);
    };
  }
});
var TabsContent_default = TabsContent_vue_vue_type_script_setup_true_lang_default;
var TabsIndicator_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TabsIndicator",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const context = injectTabsRootContext();
    __expose({ updateIndicatorStyle });
    useForwardExpose();
    const indicatorStyle = ref({
      size: null,
      position: null
    });
    const tabs = ref([]);
    watch(() => [context.modelValue.value, context?.dir.value], () => {
      updateIndicatorStyle();
    }, {
      immediate: true,
      flush: "post"
    });
    watchPostEffect(() => {
      tabs.value = Array.from(context.tabsList.value?.querySelectorAll('[role="tab"]') || []);
    });
    useResizeObserver(computed(() => [context.tabsList.value, ...tabs.value]), updateIndicatorStyle);
    function updateIndicatorStyle() {
      const activeTab = context.tabsList.value?.querySelector('[role="tab"][data-state="active"]');
      if (!activeTab) return;
      if (context.orientation.value === "horizontal") indicatorStyle.value = {
        size: activeTab.offsetWidth,
        position: activeTab.offsetLeft
      };
      else indicatorStyle.value = {
        size: activeTab.offsetHeight,
        position: activeTab.offsetTop
      };
    }
    return (_ctx, _cache) => {
      return typeof indicatorStyle.value.size === "number" ? (openBlock(), createBlock(unref(Primitive), mergeProps({ key: 0 }, props, { style: {
        "--reka-tabs-indicator-size": `${indicatorStyle.value.size}px`,
        "--reka-tabs-indicator-position": `${indicatorStyle.value.position}px`
      } }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16, ["style"])) : createCommentVNode("v-if", true);
    };
  }
});
var TabsIndicator_default = TabsIndicator_vue_vue_type_script_setup_true_lang_default;
var TabsList_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TabsList",
  props: {
    loop: {
      type: Boolean,
      required: false,
      default: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const { loop } = toRefs(props);
    const { forwardRef, currentElement } = useForwardExpose();
    const context = injectTabsRootContext();
    context.tabsList = currentElement;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(RovingFocusGroup_default), {
        "as-child": "",
        orientation: unref(context).orientation.value,
        dir: unref(context).dir.value,
        loop: unref(loop)
      }, {
        default: withCtx(() => [createVNode(unref(Primitive), {
          ref: unref(forwardRef),
          role: "tablist",
          "as-child": _ctx.asChild,
          as: _ctx.as,
          "aria-orientation": unref(context).orientation.value
        }, {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 8, [
          "as-child",
          "as",
          "aria-orientation"
        ])]),
        _: 3
      }, 8, [
        "orientation",
        "dir",
        "loop"
      ]);
    };
  }
});
var TabsList_default = TabsList_vue_vue_type_script_setup_true_lang_default;
var TabsTrigger_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TabsTrigger",
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    }
  },
  setup(__props) {
    const props = __props;
    const { forwardRef } = useForwardExpose();
    const rootContext = injectTabsRootContext();
    const triggerId = computed(() => makeTriggerId(rootContext.baseId, props.value));
    const contentId = computed(() => rootContext.contentIds.value.has(props.value) ? makeContentId(rootContext.baseId, props.value) : void 0);
    const isSelected = computed(() => props.value === rootContext.modelValue.value);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(RovingFocusItem_default), {
        "as-child": "",
        focusable: !_ctx.disabled,
        active: isSelected.value
      }, {
        default: withCtx(() => [createVNode(unref(Primitive), {
          id: triggerId.value,
          ref: unref(forwardRef),
          role: "tab",
          type: _ctx.as === "button" ? "button" : void 0,
          as: _ctx.as,
          "as-child": _ctx.asChild,
          "aria-selected": isSelected.value ? "true" : "false",
          "aria-controls": contentId.value,
          "data-state": isSelected.value ? "active" : "inactive",
          disabled: _ctx.disabled,
          "data-disabled": _ctx.disabled ? "" : void 0,
          "data-orientation": unref(rootContext).orientation.value,
          onMousedown: _cache[0] || (_cache[0] = withModifiers((event) => {
            if (!_ctx.disabled && event.ctrlKey === false) unref(rootContext).changeModelValue(_ctx.value);
            else event.preventDefault();
          }, ["left"])),
          onKeydown: _cache[1] || (_cache[1] = withKeys(($event) => unref(rootContext).changeModelValue(_ctx.value), ["enter", "space"])),
          onFocus: _cache[2] || (_cache[2] = () => {
            const isAutomaticActivation = unref(rootContext).activationMode !== "manual";
            if (!isSelected.value && !_ctx.disabled && isAutomaticActivation) unref(rootContext).changeModelValue(_ctx.value);
          })
        }, {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 8, [
          "id",
          "type",
          "as",
          "as-child",
          "aria-selected",
          "aria-controls",
          "data-state",
          "disabled",
          "data-disabled",
          "data-orientation"
        ])]),
        _: 3
      }, 8, ["focusable", "active"]);
    };
  }
});
var TabsTrigger_default = TabsTrigger_vue_vue_type_script_setup_true_lang_default;
const theme = {
  "slots": {
    "root": "flex items-center gap-2",
    "list": "relative flex p-1 group",
    "indicator": "absolute transition-[translate,width] duration-200",
    "trigger": [
      "group relative inline-flex items-center min-w-0 data-[state=inactive]:text-muted hover:data-[state=inactive]:not-disabled:text-default font-medium rounded-md disabled:cursor-not-allowed disabled:opacity-75",
      "transition-colors"
    ],
    "leadingIcon": "shrink-0",
    "leadingAvatar": "shrink-0",
    "leadingAvatarSize": "",
    "label": "truncate",
    "trailingBadge": "shrink-0",
    "trailingBadgeSize": "sm",
    "content": "focus:outline-none w-full"
  },
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "pill": {
        "list": "bg-elevated rounded-lg",
        "trigger": "grow",
        "indicator": "rounded-md shadow-xs"
      },
      "link": {
        "list": "border-default",
        "indicator": "rounded-full",
        "trigger": "focus:outline-none"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "flex-col",
        "list": "w-full",
        "indicator": "left-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position)",
        "trigger": "justify-center"
      },
      "vertical": {
        "list": "flex-col",
        "indicator": "top-0 h-(--reka-tabs-indicator-size) translate-y-(--reka-tabs-indicator-position)"
      }
    },
    "size": {
      "xs": {
        "trigger": "px-2 py-1 text-xs gap-1",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs"
      },
      "sm": {
        "trigger": "px-2.5 py-1.5 text-xs gap-1.5",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs"
      },
      "md": {
        "trigger": "px-3 py-1.5 text-sm gap-1.5",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs"
      },
      "lg": {
        "trigger": "px-3 py-2 text-sm gap-2",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs"
      },
      "xl": {
        "trigger": "px-3 py-2 text-base gap-2",
        "leadingIcon": "size-6",
        "leadingAvatarSize": "xs"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "variant": "pill",
      "class": {
        "indicator": "inset-y-1"
      }
    },
    {
      "orientation": "horizontal",
      "variant": "link",
      "class": {
        "list": "border-b -mb-px",
        "indicator": "-bottom-px h-px"
      }
    },
    {
      "orientation": "vertical",
      "variant": "pill",
      "class": {
        "indicator": "inset-x-1",
        "list": "items-center"
      }
    },
    {
      "orientation": "vertical",
      "variant": "link",
      "class": {
        "list": "border-s -ms-px",
        "indicator": "-start-px w-px"
      }
    },
    {
      "color": "primary",
      "variant": "pill",
      "class": {
        "indicator": "bg-primary",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "pill",
      "class": {
        "indicator": "bg-secondary",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      }
    },
    {
      "color": "success",
      "variant": "pill",
      "class": {
        "indicator": "bg-success",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
      }
    },
    {
      "color": "info",
      "variant": "pill",
      "class": {
        "indicator": "bg-info",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      }
    },
    {
      "color": "warning",
      "variant": "pill",
      "class": {
        "indicator": "bg-warning",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
      }
    },
    {
      "color": "error",
      "variant": "pill",
      "class": {
        "indicator": "bg-error",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      }
    },
    {
      "color": "neutral",
      "variant": "pill",
      "class": {
        "indicator": "bg-inverted",
        "trigger": "data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted"
      }
    },
    {
      "color": "primary",
      "variant": "link",
      "class": {
        "indicator": "bg-primary",
        "trigger": "data-[state=active]:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "link",
      "class": {
        "indicator": "bg-secondary",
        "trigger": "data-[state=active]:text-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
      }
    },
    {
      "color": "success",
      "variant": "link",
      "class": {
        "indicator": "bg-success",
        "trigger": "data-[state=active]:text-success focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success"
      }
    },
    {
      "color": "info",
      "variant": "link",
      "class": {
        "indicator": "bg-info",
        "trigger": "data-[state=active]:text-info focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info"
      }
    },
    {
      "color": "warning",
      "variant": "link",
      "class": {
        "indicator": "bg-warning",
        "trigger": "data-[state=active]:text-warning focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning"
      }
    },
    {
      "color": "error",
      "variant": "link",
      "class": {
        "indicator": "bg-error",
        "trigger": "data-[state=active]:text-error focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error"
      }
    },
    {
      "color": "neutral",
      "variant": "link",
      "class": {
        "indicator": "bg-inverted",
        "trigger": "data-[state=active]:text-highlighted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "variant": "pill",
    "size": "md"
  }
};
const _sfc_main = {
  __name: "UTabs",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    items: { type: Array, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    content: { type: Boolean, required: false, default: true },
    valueKey: { type: null, required: false, default: "value" },
    labelKey: { type: null, required: false, default: "label" },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    defaultValue: { type: [String, Number], required: false, default: "0" },
    modelValue: { type: [String, Number], required: false },
    activationMode: { type: String, required: false },
    unmountOnHide: { type: Boolean, required: false, default: true }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("tabs", props);
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "unmountOnHide"), emits);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.tabs || {} })({
      color: props.color,
      variant: props.variant,
      size: props.size,
      orientation: props.orientation
    }));
    const triggersRef = ref([]);
    function setTriggerRef(index, el) {
      triggersRef.value[index] = el;
    }
    __expose({
      triggersRef
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TabsRoot_default), mergeProps(unref(rootProps), {
        "model-value": __props.modelValue,
        "default-value": __props.defaultValue,
        orientation: __props.orientation,
        "activation-mode": __props.activationMode,
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(TabsList_default), {
              "data-slot": "list",
              class: ui.value.list({ class: unref(uiProp)?.list })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TabsIndicator_default), {
                    "data-slot": "indicator",
                    class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                  }, null, _parent3, _scopeId2));
                  ssrRenderSlot(_ctx.$slots, "list-leading", {}, null, _push3, _parent3, _scopeId2);
                  _push3(`<!--[-->`);
                  ssrRenderList(__props.items, (item, index) => {
                    _push3(ssrRenderComponent(unref(TabsTrigger_default), {
                      key: unref(get)(item, props.valueKey) ?? index,
                      ref_for: true,
                      ref: (el) => setTriggerRef(index, el),
                      value: unref(get)(item, props.valueKey) ?? String(index),
                      disabled: item.disabled,
                      "data-slot": "trigger",
                      class: ui.value.trigger({ class: [unref(uiProp)?.trigger, item.ui?.trigger] })
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderSlot(_ctx.$slots, "leading", {
                            item,
                            index,
                            ui: ui.value
                          }, () => {
                            if (item.icon) {
                              _push4(ssrRenderComponent(_sfc_main$e, {
                                name: item.icon,
                                "data-slot": "leadingIcon",
                                class: ui.value.leadingIcon({ class: [unref(uiProp)?.leadingIcon, item.ui?.leadingIcon] })
                              }, null, _parent4, _scopeId3));
                            } else if (item.avatar) {
                              _push4(ssrRenderComponent(_sfc_main$c, mergeProps({
                                size: item.ui?.leadingAvatarSize || unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                              }, { ref_for: true }, item.avatar, {
                                "data-slot": "leadingAvatar",
                                class: ui.value.leadingAvatar({ class: [unref(uiProp)?.leadingAvatar, item.ui?.leadingAvatar] })
                              }), null, _parent4, _scopeId3));
                            } else {
                              _push4(`<!---->`);
                            }
                          }, _push4, _parent4, _scopeId3);
                          if (unref(get)(item, props.labelKey) || !!slots.default) {
                            _push4(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: [unref(uiProp)?.label, item.ui?.label] }))}"${_scopeId3}>`);
                            ssrRenderSlot(_ctx.$slots, "default", {
                              item,
                              index
                            }, () => {
                              _push4(`${ssrInterpolate(unref(get)(item, props.labelKey))}`);
                            }, _push4, _parent4, _scopeId3);
                            _push4(`</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          ssrRenderSlot(_ctx.$slots, "trailing", {
                            item,
                            index,
                            ui: ui.value
                          }, () => {
                            if (item.badge || item.badge === 0) {
                              _push4(ssrRenderComponent(_sfc_main$1, mergeProps({
                                color: "neutral",
                                variant: "outline",
                                size: item.ui?.trailingBadgeSize || unref(uiProp)?.trailingBadgeSize || ui.value.trailingBadgeSize()
                              }, { ref_for: true }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                                "data-slot": "trailingBadge",
                                class: ui.value.trailingBadge({ class: [unref(uiProp)?.trailingBadge, item.ui?.trailingBadge] })
                              }), null, _parent4, _scopeId3));
                            } else {
                              _push4(`<!---->`);
                            }
                          }, _push4, _parent4, _scopeId3);
                        } else {
                          return [
                            renderSlot(_ctx.$slots, "leading", {
                              item,
                              index,
                              ui: ui.value
                            }, () => [
                              item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                                key: 0,
                                name: item.icon,
                                "data-slot": "leadingIcon",
                                class: ui.value.leadingIcon({ class: [unref(uiProp)?.leadingIcon, item.ui?.leadingIcon] })
                              }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                                key: 1,
                                size: item.ui?.leadingAvatarSize || unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                              }, { ref_for: true }, item.avatar, {
                                "data-slot": "leadingAvatar",
                                class: ui.value.leadingAvatar({ class: [unref(uiProp)?.leadingAvatar, item.ui?.leadingAvatar] })
                              }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                            ]),
                            unref(get)(item, props.labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "label",
                              class: ui.value.label({ class: [unref(uiProp)?.label, item.ui?.label] })
                            }, [
                              renderSlot(_ctx.$slots, "default", {
                                item,
                                index
                              }, () => [
                                createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                              ])
                            ], 2)) : createCommentVNode("", true),
                            renderSlot(_ctx.$slots, "trailing", {
                              item,
                              index,
                              ui: ui.value
                            }, () => [
                              item.badge || item.badge === 0 ? (openBlock(), createBlock(_sfc_main$1, mergeProps({
                                key: 0,
                                color: "neutral",
                                variant: "outline",
                                size: item.ui?.trailingBadgeSize || unref(uiProp)?.trailingBadgeSize || ui.value.trailingBadgeSize()
                              }, { ref_for: true }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                                "data-slot": "trailingBadge",
                                class: ui.value.trailingBadge({ class: [unref(uiProp)?.trailingBadge, item.ui?.trailingBadge] })
                              }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]-->`);
                  ssrRenderSlot(_ctx.$slots, "list-trailing", {}, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    createVNode(unref(TabsIndicator_default), {
                      "data-slot": "indicator",
                      class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                    }, null, 8, ["class"]),
                    renderSlot(_ctx.$slots, "list-leading"),
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.items, (item, index) => {
                      return openBlock(), createBlock(unref(TabsTrigger_default), {
                        key: unref(get)(item, props.valueKey) ?? index,
                        ref_for: true,
                        ref: (el) => setTriggerRef(index, el),
                        value: unref(get)(item, props.valueKey) ?? String(index),
                        disabled: item.disabled,
                        "data-slot": "trigger",
                        class: ui.value.trigger({ class: [unref(uiProp)?.trigger, item.ui?.trigger] })
                      }, {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, "leading", {
                            item,
                            index,
                            ui: ui.value
                          }, () => [
                            item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                              key: 0,
                              name: item.icon,
                              "data-slot": "leadingIcon",
                              class: ui.value.leadingIcon({ class: [unref(uiProp)?.leadingIcon, item.ui?.leadingIcon] })
                            }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                              key: 1,
                              size: item.ui?.leadingAvatarSize || unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                            }, { ref_for: true }, item.avatar, {
                              "data-slot": "leadingAvatar",
                              class: ui.value.leadingAvatar({ class: [unref(uiProp)?.leadingAvatar, item.ui?.leadingAvatar] })
                            }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                          ]),
                          unref(get)(item, props.labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                            key: 0,
                            "data-slot": "label",
                            class: ui.value.label({ class: [unref(uiProp)?.label, item.ui?.label] })
                          }, [
                            renderSlot(_ctx.$slots, "default", {
                              item,
                              index
                            }, () => [
                              createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          renderSlot(_ctx.$slots, "trailing", {
                            item,
                            index,
                            ui: ui.value
                          }, () => [
                            item.badge || item.badge === 0 ? (openBlock(), createBlock(_sfc_main$1, mergeProps({
                              key: 0,
                              color: "neutral",
                              variant: "outline",
                              size: item.ui?.trailingBadgeSize || unref(uiProp)?.trailingBadgeSize || ui.value.trailingBadgeSize()
                            }, { ref_for: true }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                              "data-slot": "trailingBadge",
                              class: ui.value.trailingBadge({ class: [unref(uiProp)?.trailingBadge, item.ui?.trailingBadge] })
                            }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                          ])
                        ]),
                        _: 2
                      }, 1032, ["value", "disabled", "class"]);
                    }), 128)),
                    renderSlot(_ctx.$slots, "list-trailing")
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            if (!!__props.content) {
              _push2(`<!--[-->`);
              ssrRenderList(__props.items, (item, index) => {
                _push2(ssrRenderComponent(unref(TabsContent_default), {
                  key: unref(get)(item, props.valueKey) ?? index,
                  value: unref(get)(item, props.valueKey) ?? String(index),
                  "data-slot": "content",
                  class: ui.value.content({ class: [unref(uiProp)?.content, item.ui?.content, item.class] })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, item.slot || "content", {
                        item,
                        index,
                        ui: ui.value
                      }, () => {
                        _push3(`${ssrInterpolate(item.content)}`);
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, item.slot || "content", {
                          item,
                          index,
                          ui: ui.value
                        }, () => [
                          createTextVNode(toDisplayString(item.content), 1)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(unref(TabsList_default), {
                "data-slot": "list",
                class: ui.value.list({ class: unref(uiProp)?.list })
              }, {
                default: withCtx(() => [
                  createVNode(unref(TabsIndicator_default), {
                    "data-slot": "indicator",
                    class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                  }, null, 8, ["class"]),
                  renderSlot(_ctx.$slots, "list-leading"),
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.items, (item, index) => {
                    return openBlock(), createBlock(unref(TabsTrigger_default), {
                      key: unref(get)(item, props.valueKey) ?? index,
                      ref_for: true,
                      ref: (el) => setTriggerRef(index, el),
                      value: unref(get)(item, props.valueKey) ?? String(index),
                      disabled: item.disabled,
                      "data-slot": "trigger",
                      class: ui.value.trigger({ class: [unref(uiProp)?.trigger, item.ui?.trigger] })
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "leading", {
                          item,
                          index,
                          ui: ui.value
                        }, () => [
                          item.icon ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 0,
                            name: item.icon,
                            "data-slot": "leadingIcon",
                            class: ui.value.leadingIcon({ class: [unref(uiProp)?.leadingIcon, item.ui?.leadingIcon] })
                          }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                            key: 1,
                            size: item.ui?.leadingAvatarSize || unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                          }, { ref_for: true }, item.avatar, {
                            "data-slot": "leadingAvatar",
                            class: ui.value.leadingAvatar({ class: [unref(uiProp)?.leadingAvatar, item.ui?.leadingAvatar] })
                          }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                        ]),
                        unref(get)(item, props.labelKey) || !!slots.default ? (openBlock(), createBlock("span", {
                          key: 0,
                          "data-slot": "label",
                          class: ui.value.label({ class: [unref(uiProp)?.label, item.ui?.label] })
                        }, [
                          renderSlot(_ctx.$slots, "default", {
                            item,
                            index
                          }, () => [
                            createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        renderSlot(_ctx.$slots, "trailing", {
                          item,
                          index,
                          ui: ui.value
                        }, () => [
                          item.badge || item.badge === 0 ? (openBlock(), createBlock(_sfc_main$1, mergeProps({
                            key: 0,
                            color: "neutral",
                            variant: "outline",
                            size: item.ui?.trailingBadgeSize || unref(uiProp)?.trailingBadgeSize || ui.value.trailingBadgeSize()
                          }, { ref_for: true }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                            "data-slot": "trailingBadge",
                            class: ui.value.trailingBadge({ class: [unref(uiProp)?.trailingBadge, item.ui?.trailingBadge] })
                          }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                        ])
                      ]),
                      _: 2
                    }, 1032, ["value", "disabled", "class"]);
                  }), 128)),
                  renderSlot(_ctx.$slots, "list-trailing")
                ]),
                _: 3
              }, 8, ["class"]),
              !!__props.content ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(__props.items, (item, index) => {
                return openBlock(), createBlock(unref(TabsContent_default), {
                  key: unref(get)(item, props.valueKey) ?? index,
                  value: unref(get)(item, props.valueKey) ?? String(index),
                  "data-slot": "content",
                  class: ui.value.content({ class: [unref(uiProp)?.content, item.ui?.content, item.class] })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, item.slot || "content", {
                      item,
                      index,
                      ui: ui.value
                    }, () => [
                      createTextVNode(toDisplayString(item.content), 1)
                    ])
                  ]),
                  _: 2
                }, 1032, ["value", "class"]);
              }), 128)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.7.1_@internationalized+date@3.12.1_@internationalized+number@3.6.6_@tiptap+e_f232df4310342c42e02e10fb94bda86b/node_modules/@nuxt/ui/dist/runtime/components/Tabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
