import { _ as _sfc_main$2, a as _sfc_main$1$1, b as _sfc_main$6 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$7 } from './DashboardToolbar-D0tdyEuQ.mjs';
import { _ as _sfc_main$a, u as useResolvedVariants } from './Select-N__9sMNx.mjs';
import { defineComponent, ref, withAsyncContext, computed, watch, mergeProps, withCtx, isRef, unref, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSlots, useId, useAttrs, resolveDynamicComponent, renderSlot, withKeys, withModifiers, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderVNode, ssrRenderSlot } from 'vue/server-renderer';
import { u as useToast, _ as _sfc_main$9, k as _sfc_main$8, e as useAppConfig, f as useComponentUI, g as useForwardPropsEmits, r as reactivePick, h as useFormField, t as tv, P as Primitive, j as _sfc_main$e, a as useForwardExpose, b as useVModel, i as isNullish, d as Presence_default, c as createContext } from './server.mjs';
import { i as isValueEqualOrExist } from './isValueEqualOrExist-DZWcPJh8.mjs';
import { u as useFormControl } from './useFormControl-IzN_Be5X.mjs';
import { V as VisuallyHiddenInput_default } from './VisuallyHiddenInput-Cbbw7kMc.mjs';
import { R as RovingFocusItem_default } from './RovingFocusItem-CDE9BQzI.mjs';
import { _ as _sfc_main$3, L as Label_default } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$4 } from './InputNumber-C_3Tnd-3.mjs';
import { _ as _sfc_main$5 } from './Badge-CElKKp_G.mjs';
import { _ as __nuxt_component_10 } from './AppDiagnosticResult-CoGySpM6.mjs';
import { u as useFetch } from './fetch-B7i171gV.mjs';
import { aw as isEqual } from '../nitro/nitro.mjs';
import './DashboardSidebarToggle-C_vEEhTE.mjs';
import './ssr-BO1H6xpe.mjs';
import './PopperArrow-CvIo2SqJ.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Alert-C2QsFOV3.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';
import 'zod';
import 'drizzle-orm';
import 'node:child_process';
import 'node:fs/promises';
import 'node:path';
import 'ssh2';
import 'node:net';
import 'drizzle-orm/pg-core';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'ioredis';
import 'node:fs';
import '@iconify/utils';
import 'consola';

const [injectCheckboxGroupRootContext] = /* @__PURE__ */ createContext("CheckboxGroupRoot");
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const [injectCheckboxRootContext, provideCheckboxRootContext] = /* @__PURE__ */ createContext("CheckboxRoot");
var CheckboxRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  inheritAttrs: false,
  __name: "CheckboxRoot",
  props: {
    defaultValue: {
      type: null,
      required: false
    },
    modelValue: {
      type: null,
      required: false,
      default: void 0
    },
    disabled: {
      type: Boolean,
      required: false
    },
    value: {
      type: null,
      required: false,
      default: "on"
    },
    id: {
      type: String,
      required: false
    },
    trueValue: {
      type: null,
      required: false,
      default: () => true
    },
    falseValue: {
      type: null,
      required: false,
      default: () => false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    },
    name: {
      type: String,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { forwardRef, currentElement } = useForwardExpose();
    const checkboxGroupContext = injectCheckboxGroupRootContext(null);
    const modelValue = useVModel(props, "modelValue", emits, {
      defaultValue: props.defaultValue ?? props.falseValue,
      passive: props.modelValue === void 0
    });
    const disabled = computed(() => checkboxGroupContext?.disabled.value || props.disabled);
    const isChecked = computed(() => isEqual(modelValue.value, props.trueValue));
    const checkboxState = computed(() => {
      if (!isNullish(checkboxGroupContext?.modelValue.value)) return isValueEqualOrExist(checkboxGroupContext.modelValue.value, props.value);
      else {
        if (modelValue.value === "indeterminate") return "indeterminate";
        return isChecked.value;
      }
    });
    function handleClick() {
      if (!isNullish(checkboxGroupContext?.modelValue.value)) {
        const modelValueArray = [...checkboxGroupContext.modelValue.value || []];
        if (isValueEqualOrExist(modelValueArray, props.value)) {
          const index = modelValueArray.findIndex((i) => isEqual(i, props.value));
          modelValueArray.splice(index, 1);
        } else modelValueArray.push(props.value);
        checkboxGroupContext.modelValue.value = modelValueArray;
      } else if (modelValue.value === "indeterminate") modelValue.value = props.trueValue;
      else modelValue.value = isChecked.value ? props.falseValue : props.trueValue;
    }
    const isFormControl = useFormControl(currentElement);
    const ariaLabel = computed(() => props.id && currentElement.value ? (void 0).querySelector(`[for="${props.id}"]`)?.innerText : void 0);
    provideCheckboxRootContext({
      disabled,
      state: checkboxState
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(unref(checkboxGroupContext)?.rovingFocus.value ? unref(RovingFocusItem_default) : unref(Primitive)), mergeProps(_ctx.$attrs, {
        id: _ctx.id,
        ref: unref(forwardRef),
        role: "checkbox",
        "as-child": _ctx.asChild,
        as: _ctx.as,
        type: _ctx.as === "button" ? "button" : void 0,
        "aria-checked": unref(isIndeterminate)(checkboxState.value) ? "mixed" : checkboxState.value,
        "aria-required": _ctx.required,
        "aria-label": _ctx.$attrs["aria-label"] || ariaLabel.value,
        "data-state": unref(getState)(checkboxState.value),
        "data-disabled": disabled.value ? "" : void 0,
        disabled: disabled.value,
        focusable: unref(checkboxGroupContext)?.rovingFocus.value ? !disabled.value : void 0,
        onKeydown: withKeys(withModifiers(() => {
        }, ["prevent"]), ["enter"]),
        onClick: handleClick
      }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", {
          modelValue: unref(modelValue),
          state: checkboxState.value
        }), unref(isFormControl) && _ctx.name && !unref(checkboxGroupContext) ? (openBlock(), createBlock(unref(VisuallyHiddenInput_default), {
          key: 0,
          type: "checkbox",
          checked: !!checkboxState.value,
          name: _ctx.name,
          value: _ctx.value,
          disabled: disabled.value,
          required: _ctx.required
        }, null, 8, [
          "checked",
          "name",
          "value",
          "disabled",
          "required"
        ])) : createCommentVNode("v-if", true)]),
        _: 3
      }, 16, [
        "id",
        "as-child",
        "as",
        "type",
        "aria-checked",
        "aria-required",
        "aria-label",
        "data-state",
        "data-disabled",
        "disabled",
        "focusable",
        "onKeydown"
      ]);
    };
  }
});
var CheckboxRoot_default = CheckboxRoot_vue_vue_type_script_setup_true_lang_default;
var CheckboxIndicator_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "CheckboxIndicator",
  props: {
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
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    const { forwardRef } = useForwardExpose();
    const rootContext = injectCheckboxRootContext();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Presence_default), { present: _ctx.forceMount || unref(isIndeterminate)(unref(rootContext).state.value) || unref(rootContext).state.value === true }, {
        default: withCtx(() => [createVNode(unref(Primitive), mergeProps({
          ref: unref(forwardRef),
          "data-state": unref(getState)(unref(rootContext).state.value),
          "data-disabled": unref(rootContext).disabled.value ? "" : void 0,
          style: { pointerEvents: "none" },
          "as-child": _ctx.asChild,
          as: _ctx.as
        }, _ctx.$attrs), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, [
          "data-state",
          "data-disabled",
          "as-child",
          "as"
        ])]),
        _: 3
      }, 8, ["present"]);
    };
  }
});
var CheckboxIndicator_default = CheckboxIndicator_vue_vue_type_script_setup_true_lang_default;
const theme = {
  "slots": {
    "root": "relative flex items-start",
    "container": "flex items-center",
    "base": "rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2",
    "indicator": "flex items-center justify-center size-full text-inverted",
    "icon": "shrink-0 size-full",
    "wrapper": "w-full",
    "label": "block font-medium text-default",
    "description": "text-muted"
  },
  "variants": {
    "color": {
      "primary": {
        "base": "focus-visible:outline-primary",
        "indicator": "bg-primary"
      },
      "secondary": {
        "base": "focus-visible:outline-secondary",
        "indicator": "bg-secondary"
      },
      "success": {
        "base": "focus-visible:outline-success",
        "indicator": "bg-success"
      },
      "info": {
        "base": "focus-visible:outline-info",
        "indicator": "bg-info"
      },
      "warning": {
        "base": "focus-visible:outline-warning",
        "indicator": "bg-warning"
      },
      "error": {
        "base": "focus-visible:outline-error",
        "indicator": "bg-error"
      },
      "neutral": {
        "base": "focus-visible:outline-inverted",
        "indicator": "bg-inverted"
      }
    },
    "variant": {
      "list": {
        "root": ""
      },
      "card": {
        "root": "border border-muted rounded-lg"
      }
    },
    "indicator": {
      "start": {
        "root": "flex-row",
        "wrapper": "ms-2"
      },
      "end": {
        "root": "flex-row-reverse",
        "wrapper": "me-2"
      },
      "hidden": {
        "base": "sr-only",
        "wrapper": "text-center"
      }
    },
    "size": {
      "xs": {
        "base": "size-3",
        "container": "h-4",
        "wrapper": "text-xs"
      },
      "sm": {
        "base": "size-3.5",
        "container": "h-4",
        "wrapper": "text-xs"
      },
      "md": {
        "base": "size-4",
        "container": "h-5",
        "wrapper": "text-sm"
      },
      "lg": {
        "base": "size-4.5",
        "container": "h-5",
        "wrapper": "text-sm"
      },
      "xl": {
        "base": "size-5",
        "container": "h-6",
        "wrapper": "text-base"
      }
    },
    "required": {
      "true": {
        "label": "after:content-['*'] after:ms-0.5 after:text-error"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75",
        "base": "cursor-not-allowed",
        "label": "cursor-not-allowed",
        "description": "cursor-not-allowed"
      }
    },
    "checked": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "size": "xs",
      "variant": "card",
      "class": {
        "root": "p-2.5"
      }
    },
    {
      "size": "sm",
      "variant": "card",
      "class": {
        "root": "p-3"
      }
    },
    {
      "size": "md",
      "variant": "card",
      "class": {
        "root": "p-3.5"
      }
    },
    {
      "size": "lg",
      "variant": "card",
      "class": {
        "root": "p-4"
      }
    },
    {
      "size": "xl",
      "variant": "card",
      "class": {
        "root": "p-4.5"
      }
    },
    {
      "color": "primary",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-secondary"
      }
    },
    {
      "color": "success",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-success"
      }
    },
    {
      "color": "info",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-info"
      }
    },
    {
      "color": "warning",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-warning"
      }
    },
    {
      "color": "error",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-error"
      }
    },
    {
      "color": "neutral",
      "variant": "card",
      "class": {
        "root": "has-data-[state=checked]:border-inverted"
      }
    },
    {
      "variant": "card",
      "disabled": true,
      "class": {
        "root": "cursor-not-allowed"
      }
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary",
    "variant": "list",
    "indicator": "start"
  }
};
const _sfc_main$1 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UCheckbox",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    label: { type: String, required: false },
    description: { type: String, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    indicator: { type: null, required: false },
    icon: { type: null, required: false },
    indeterminateIcon: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    disabled: { type: Boolean, required: false },
    required: { type: Boolean, required: false },
    name: { type: String, required: false },
    value: { type: null, required: false },
    id: { type: String, required: false },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    trueValue: { type: null, required: false },
    falseValue: { type: null, required: false }
  },
  emits: ["change", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const slots = useSlots();
    const emits = __emit;
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("checkbox", props);
    const rootProps = useForwardPropsEmits(reactivePick(props, "required", "value", "defaultValue", "modelValue", "trueValue", "falseValue"), emits);
    const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(props);
    const id = _id.value ?? useId();
    const { variant } = useResolvedVariants("checkbox", props, theme, ["variant"]);
    const attrs = useAttrs();
    const forwardedAttrs = computed(() => {
      const { "data-state": _, ...rest } = attrs;
      return rest;
    });
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.checkbox || {} })({
      size: size.value,
      color: color.value,
      variant: variant.value,
      indicator: props.indicator,
      required: props.required,
      disabled: disabled.value
    }));
    function onUpdate(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
      emitFormInput();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: unref(variant) === "list" ? __props.as : unref(Label_default),
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: unref(uiProp)?.container }))}"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(CheckboxRoot_default), mergeProps({ id: unref(id) }, { ...unref(rootProps), ...forwardedAttrs.value, ...unref(ariaAttrs) }, {
              name: unref(name),
              disabled: unref(disabled),
              "data-slot": "base",
              class: ui.value.base({ class: unref(uiProp)?.base }),
              "onUpdate:modelValue": onUpdate
            }), {
              default: withCtx(({ state }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(CheckboxIndicator_default), {
                    "data-slot": "indicator",
                    class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                  }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (state === "indeterminate") {
                          _push4(ssrRenderComponent(_sfc_main$e, {
                            name: __props.indeterminateIcon || unref(appConfig).ui.icons.minus,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(uiProp)?.icon })
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(ssrRenderComponent(_sfc_main$e, {
                            name: __props.icon || unref(appConfig).ui.icons.check,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(uiProp)?.icon })
                          }, null, _parent4, _scopeId3));
                        }
                      } else {
                        return [
                          state === "indeterminate" ? (openBlock(), createBlock(_sfc_main$e, {
                            key: 0,
                            name: __props.indeterminateIcon || unref(appConfig).ui.icons.minus,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(uiProp)?.icon })
                          }, null, 8, ["name", "class"])) : (openBlock(), createBlock(_sfc_main$e, {
                            key: 1,
                            name: __props.icon || unref(appConfig).ui.icons.check,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(uiProp)?.icon })
                          }, null, 8, ["name", "class"]))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(CheckboxIndicator_default), {
                      "data-slot": "indicator",
                      class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                    }, {
                      default: withCtx(() => [
                        state === "indeterminate" ? (openBlock(), createBlock(_sfc_main$e, {
                          key: 0,
                          name: __props.indeterminateIcon || unref(appConfig).ui.icons.minus,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(uiProp)?.icon })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(_sfc_main$e, {
                          key: 1,
                          name: __props.icon || unref(appConfig).ui.icons.check,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(uiProp)?.icon })
                        }, null, 8, ["name", "class"]))
                      ]),
                      _: 2
                    }, 1032, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (__props.label || !!slots.label || (__props.description || !!slots.description)) {
              _push2(`<div data-slot="wrapper" class="${ssrRenderClass(ui.value.wrapper({ class: unref(uiProp)?.wrapper }))}"${_scopeId}>`);
              if (__props.label || !!slots.label) {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(unref(variant) === "list" ? unref(Label_default) : "p"), {
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: unref(uiProp)?.label })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, "label", { label: __props.label }, () => {
                        _push3(`${ssrInterpolate(__props.label)}`);
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                          createTextVNode(toDisplayString(__props.label), 1)
                        ])
                      ];
                    }
                  }),
                  _: 3
                }), _parent2, _scopeId);
              } else {
                _push2(`<!---->`);
              }
              if (__props.description || !!slots.description) {
                _push2(`<p data-slot="description" class="${ssrRenderClass(ui.value.description({ class: unref(uiProp)?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", { description: __props.description }, () => {
                  _push2(`${ssrInterpolate(__props.description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "container",
                class: ui.value.container({ class: unref(uiProp)?.container })
              }, [
                createVNode(unref(CheckboxRoot_default), mergeProps({ id: unref(id) }, { ...unref(rootProps), ...forwardedAttrs.value, ...unref(ariaAttrs) }, {
                  name: unref(name),
                  disabled: unref(disabled),
                  "data-slot": "base",
                  class: ui.value.base({ class: unref(uiProp)?.base }),
                  "onUpdate:modelValue": onUpdate
                }), {
                  default: withCtx(({ state }) => [
                    createVNode(unref(CheckboxIndicator_default), {
                      "data-slot": "indicator",
                      class: ui.value.indicator({ class: unref(uiProp)?.indicator })
                    }, {
                      default: withCtx(() => [
                        state === "indeterminate" ? (openBlock(), createBlock(_sfc_main$e, {
                          key: 0,
                          name: __props.indeterminateIcon || unref(appConfig).ui.icons.minus,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(uiProp)?.icon })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(_sfc_main$e, {
                          key: 1,
                          name: __props.icon || unref(appConfig).ui.icons.check,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(uiProp)?.icon })
                        }, null, 8, ["name", "class"]))
                      ]),
                      _: 2
                    }, 1032, ["class"])
                  ]),
                  _: 1
                }, 16, ["id", "name", "disabled", "class"])
              ], 2),
              __props.label || !!slots.label || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "wrapper",
                class: ui.value.wrapper({ class: unref(uiProp)?.wrapper })
              }, [
                __props.label || !!slots.label ? (openBlock(), createBlock(resolveDynamicComponent(unref(variant) === "list" ? unref(Label_default) : "p"), {
                  key: 0,
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: unref(uiProp)?.label })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "label", { label: __props.label }, () => [
                      createTextVNode(toDisplayString(__props.label), 1)
                    ])
                  ]),
                  _: 3
                }, 8, ["for", "class"])) : createCommentVNode("", true),
                __props.description || !!slots.description ? (openBlock(), createBlock("p", {
                  key: 1,
                  "data-slot": "description",
                  class: ui.value.description({ class: unref(uiProp)?.description })
                }, [
                  renderSlot(_ctx.$slots, "description", { description: __props.description }, () => [
                    createTextVNode(toDisplayString(__props.description), 1)
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.7.1_@internationalized+date@3.12.1_@internationalized+number@3.6.6_@tiptap+e_f232df4310342c42e02e10fb94bda86b/node_modules/@nuxt/ui/dist/runtime/components/Checkbox.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = (() => {
  console.error(intervalError);
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "imports",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const equipmentId = ref();
    const mode = ref("apply");
    const activeOnly = ref(true);
    const rangeFrom = ref(1);
    const rangeTo = ref(50);
    const loading = ref("");
    const result = ref(null);
    const plannedProgress = ref(null);
    const job = ref(null);
    let progressTimer = null;
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/network/import-options",
      {
        default: () => ({ success: false, data: { equipment: [] } })
      },
      "$QtX-cN_Uap"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: onus, refresh: refreshOnus } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/imports/options",
      {
        default: () => ({ success: false, data: [] })
      },
      "$tWG9wiSoCb"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const dasanEquipment = computed(() => options.value.data.equipment.filter((item) => item.managementDriver?.code === "dasan_nos"));
    const equipmentItems = computed(() => dasanEquipment.value.map((item) => ({
      label: [item.inventoryId, item.hostname, item.managementIp].filter(Boolean).join(" - "),
      value: item.id
    })));
    const selectedEquipment = computed(() => dasanEquipment.value.find((item) => item.id === equipmentId.value));
    function numericPart(value) {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
    }
    const selectedOltOnus = computed(() => selectedEquipment.value ? [...onus.value.data.filter((onu) => onu.oltInventoryId === selectedEquipment.value?.inventoryId)].sort((left, right) => {
      const portDiff = numericPart(left.ponPortCode) - numericPart(right.ponPortCode);
      if (portDiff) return portDiff;
      const onuDiff = numericPart(left.onuIdentifier) - numericPart(right.onuIdentifier);
      if (onuDiff) return onuDiff;
      return `${left.ponPortCode}:${left.onuIdentifier}`.localeCompare(`${right.ponPortCode}:${right.onuIdentifier}`);
    }) : []);
    const scopedOnus = computed(() => activeOnly.value ? selectedOltOnus.value.filter((onu) => onu.status?.toLowerCase() === "active") : selectedOltOnus.value);
    const totalOnuCount = computed(() => selectedOltOnus.value.length);
    const rangeStartIndex = computed(() => Math.max(rangeFrom.value - 1, 0));
    const rangeEndIndex = computed(() => Math.max(rangeTo.value, rangeStartIndex.value));
    const selectedCount = computed(() => scopedOnus.value.slice(rangeStartIndex.value, rangeEndIndex.value).length);
    const currentProgress = computed(() => result.value?.data.progress || job.value?.progress || plannedProgress.value);
    const progressValue = computed(() => {
      const progress = currentProgress.value;
      if (progress?.completed) return 100;
      if (!progress?.selectedOnus) return 0;
      return Math.round((progress.processedOnus || 0) / progress.selectedOnus * 100);
    });
    watch(equipmentId, () => {
      stopProgressPolling();
      result.value = null;
      plannedProgress.value = null;
      job.value = null;
    });
    watch(rangeFrom, (value) => {
      if (rangeTo.value < value) rangeTo.value = value;
    });
    function stopProgressPolling() {
      if (!progressTimer) return;
      clearInterval(progressTimer);
      progressTimer = null;
    }
    async function pollImportJob(jobId) {
      const response = await $fetch(`/api/ftth/imports/jobs/${jobId}`);
      job.value = response.data;
      if (response.data.status === "completed" && response.data.result) {
        stopProgressPolling();
        result.value = { success: true, data: response.data.result };
        plannedProgress.value = response.data.progress;
        loading.value = "";
        await refreshOnus();
        return;
      }
      if (response.data.status === "failed") {
        stopProgressPolling();
        loading.value = "";
        toast.add({ title: "Import FTTH nie powiódł się", description: response.data.error || "Nieznany błąd importu", color: "error" });
      }
    }
    async function runImportJob(kind) {
      const response = await $fetch(`/api/ftth/imports/dasan/${equipmentId.value}/jobs`, {
        method: "POST",
        body: {
          kind,
          mode: mode.value,
          activeOnly: activeOnly.value,
          rangeFrom: rangeFrom.value,
          rangeTo: rangeTo.value
        }
      });
      job.value = response.data;
      await pollImportJob(response.data.id);
      if (!["completed", "failed"].includes(job.value?.status || "")) {
        progressTimer = setInterval();
      }
    }
    async function runImport(kind) {
      if (!equipmentId.value) return;
      stopProgressPolling();
      loading.value = kind;
      result.value = null;
      job.value = null;
      plannedProgress.value = {
        activeOnly: activeOnly.value,
        totalKnownOnus: totalOnuCount.value,
        selectedOnus: kind === "onus" ? void 0 : selectedCount.value,
        processedOnus: 0,
        rangeFrom: rangeFrom.value,
        rangeTo: rangeTo.value,
        completed: false
      };
      let asyncJobStarted = false;
      try {
        if (kind === "ip-hosts" || kind === "mac-map") {
          asyncJobStarted = true;
          await runImportJob(kind);
          return;
        }
        result.value = await $fetch(`/api/ftth/imports/dasan/${equipmentId.value}/${kind}`, {
          method: "POST",
          body: {
            mode: mode.value,
            activeOnly: activeOnly.value,
            rangeFrom: rangeFrom.value,
            rangeTo: rangeTo.value
          }
        });
        plannedProgress.value = result.value.data.progress || null;
        await refreshOnus();
      } catch (error) {
        toast.add({ title: "Import FTTH nie powiódł się", description: error instanceof Error ? error.message : String(error), color: "error" });
      } finally {
        if (!asyncJobStarted) loading.value = "";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$6;
      const _component_UDashboardToolbar = _sfc_main$7;
      const _component_USelect = _sfc_main$a;
      const _component_UCheckbox = _sfc_main$1;
      const _component_UFormField = _sfc_main$3;
      const _component_UInputNumber = _sfc_main$4;
      const _component_UButton = _sfc_main$9;
      const _component_UBadge = _sfc_main$5;
      const _component_UProgress = _sfc_main$8;
      const _component_AppDiagnosticResult = __nuxt_component_10;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-ftth-imports",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "FTTH importy" }, {
              leading: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UDashboardSidebarCollapse, null, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UDashboardSidebarCollapse)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UDashboardToolbar, null, {
              left: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex min-w-0 flex-1 flex-wrap items-center gap-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(equipmentId),
                    "onUpdate:modelValue": ($event) => isRef(equipmentId) ? equipmentId.value = $event : null,
                    items: unref(equipmentItems),
                    placeholder: "Wybierz Dasan OLT",
                    class: "w-full min-w-0 sm:w-96"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(mode),
                    "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                    items: ["preview", "apply"],
                    class: "w-32"
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex min-w-0 flex-1 flex-wrap items-center gap-2" }, [
                      createVNode(_component_USelect, {
                        modelValue: unref(equipmentId),
                        "onUpdate:modelValue": ($event) => isRef(equipmentId) ? equipmentId.value = $event : null,
                        items: unref(equipmentItems),
                        placeholder: "Wybierz Dasan OLT",
                        class: "w-full min-w-0 sm:w-96"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                      createVNode(_component_USelect, {
                        modelValue: unref(mode),
                        "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                        items: ["preview", "apply"],
                        class: "w-32"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "FTTH importy" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                _: 1
              }),
              createVNode(_component_UDashboardToolbar, null, {
                left: withCtx(() => [
                  createVNode("div", { class: "flex min-w-0 flex-1 flex-wrap items-center gap-2" }, [
                    createVNode(_component_USelect, {
                      modelValue: unref(equipmentId),
                      "onUpdate:modelValue": ($event) => isRef(equipmentId) ? equipmentId.value = $event : null,
                      items: unref(equipmentItems),
                      placeholder: "Wybierz Dasan OLT",
                      class: "w-full min-w-0 sm:w-96"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                    createVNode(_component_USelect, {
                      modelValue: unref(mode),
                      "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null,
                      items: ["preview", "apply"],
                      class: "w-32"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid min-h-0 flex-1 gap-0 xl:grid-cols-[360px_1fr]"${_scopeId}><div class="space-y-4 border-r border-default p-4 sm:p-6"${_scopeId}><div class="space-y-3 border border-default p-4"${_scopeId}><div class="text-sm font-semibold text-highlighted"${_scopeId}> Zakres mapowania </div>`);
            _push2(ssrRenderComponent(_component_UCheckbox, {
              modelValue: unref(activeOnly),
              "onUpdate:modelValue": ($event) => isRef(activeOnly) ? activeOnly.value = $event : null,
              label: "Tylko aktywne ONU"
            }, null, _parent2, _scopeId));
            _push2(`<div class="grid grid-cols-2 gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Od pozycji" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInputNumber, {
                    modelValue: unref(rangeFrom),
                    "onUpdate:modelValue": ($event) => isRef(rangeFrom) ? rangeFrom.value = $event : null,
                    min: 1,
                    max: 1e4,
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInputNumber, {
                      modelValue: unref(rangeFrom),
                      "onUpdate:modelValue": ($event) => isRef(rangeFrom) ? rangeFrom.value = $event : null,
                      min: 1,
                      max: 1e4,
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Do pozycji" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInputNumber, {
                    modelValue: unref(rangeTo),
                    "onUpdate:modelValue": ($event) => isRef(rangeTo) ? rangeTo.value = $event : null,
                    min: unref(rangeFrom),
                    max: 1e4,
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInputNumber, {
                      modelValue: unref(rangeTo),
                      "onUpdate:modelValue": ($event) => isRef(rangeTo) ? rangeTo.value = $event : null,
                      min: unref(rangeFrom),
                      max: 1e4,
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "min"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="text-xs text-muted"${_scopeId}> Wybrane do mapowania: ${ssrInterpolate(unref(selectedCount))} / ${ssrInterpolate(unref(scopedOnus).length)} ONU </div></div><div class="space-y-3 border border-default p-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              block: "",
              label: "Importuj listę ONU",
              icon: "i-lucide-git-branch",
              loading: unref(loading) === "onus",
              onClick: ($event) => runImport("onus")
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              block: "",
              label: unref(activeOnly) ? "Importuj IP-host aktywnych ONU" : "Importuj IP-host ONU",
              icon: "i-lucide-router",
              variant: "subtle",
              loading: unref(loading) === "ip-hosts",
              onClick: ($event) => runImport("ip-hosts")
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              block: "",
              label: unref(activeOnly) ? "Mapuj MAC aktywnych ONU" : "Mapuj MAC ONU",
              icon: "i-lucide-list-tree",
              variant: "subtle",
              loading: unref(loading) === "mac-map",
              onClick: ($event) => runImport("mac-map")
            }, null, _parent2, _scopeId));
            _push2(`</div></div><div class="min-w-0 space-y-4 p-4 sm:p-6"${_scopeId}>`);
            if (unref(loading) || unref(currentProgress)) {
              _push2(`<div class="space-y-3 border border-default p-4"${_scopeId}><div class="flex items-center justify-between gap-3"${_scopeId}><div class="text-sm font-semibold text-highlighted"${_scopeId}> Postęp importu </div><div class="flex items-center gap-2"${_scopeId}>`);
              if (unref(job)?.status) {
                _push2(ssrRenderComponent(_component_UBadge, {
                  color: "neutral",
                  variant: "subtle"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(job).status)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(job).status), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UBadge, {
                color: "neutral",
                variant: "subtle"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(progressValue))}% `);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(progressValue)) + "% ", 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
              _push2(ssrRenderComponent(_component_UProgress, { "model-value": unref(progressValue) }, null, _parent2, _scopeId));
              _push2(`<div class="grid gap-2 text-sm text-muted md:grid-cols-2"${_scopeId}><div${_scopeId}>ONU razem: ${ssrInterpolate(unref(currentProgress)?.totalKnownOnus ?? unref(totalOnuCount))}</div><div${_scopeId}>ONU w zakresie: ${ssrInterpolate(unref(currentProgress)?.selectedOnus ?? unref(selectedCount))}</div><div${_scopeId}>Zakres: ${ssrInterpolate(unref(currentProgress)?.rangeFrom ?? unref(rangeFrom))}-${ssrInterpolate(unref(currentProgress)?.rangeTo ?? unref(rangeTo))}</div><div${_scopeId}>Przetworzone ONU: ${ssrInterpolate(unref(currentProgress)?.processedOnus ?? 0)}</div><div${_scopeId}>Aktywne tylko: ${ssrInterpolate(unref(currentProgress)?.activeOnly ? "tak" : "nie")}</div>`);
              if (unref(currentProgress)?.currentOnu) {
                _push2(`<div${_scopeId}> Aktualne ONU: ${ssrInterpolate(unref(currentProgress).currentOnu)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(currentProgress)?.ipHosts !== void 0) {
                _push2(`<div${_scopeId}> IP-host: ${ssrInterpolate(unref(currentProgress).ipHosts)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(currentProgress)?.macRows !== void 0) {
                _push2(`<div${_scopeId}> MAC rows: ${ssrInterpolate(unref(currentProgress).macRows)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_AppDiagnosticResult, { result: unref(result) }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "grid min-h-0 flex-1 gap-0 xl:grid-cols-[360px_1fr]" }, [
                createVNode("div", { class: "space-y-4 border-r border-default p-4 sm:p-6" }, [
                  createVNode("div", { class: "space-y-3 border border-default p-4" }, [
                    createVNode("div", { class: "text-sm font-semibold text-highlighted" }, " Zakres mapowania "),
                    createVNode(_component_UCheckbox, {
                      modelValue: unref(activeOnly),
                      "onUpdate:modelValue": ($event) => isRef(activeOnly) ? activeOnly.value = $event : null,
                      label: "Tylko aktywne ONU"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                      createVNode(_component_UFormField, { label: "Od pozycji" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInputNumber, {
                            modelValue: unref(rangeFrom),
                            "onUpdate:modelValue": ($event) => isRef(rangeFrom) ? rangeFrom.value = $event : null,
                            min: 1,
                            max: 1e4,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Do pozycji" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInputNumber, {
                            modelValue: unref(rangeTo),
                            "onUpdate:modelValue": ($event) => isRef(rangeTo) ? rangeTo.value = $event : null,
                            min: unref(rangeFrom),
                            max: 1e4,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "min"])
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", { class: "text-xs text-muted" }, " Wybrane do mapowania: " + toDisplayString(unref(selectedCount)) + " / " + toDisplayString(unref(scopedOnus).length) + " ONU ", 1)
                  ]),
                  createVNode("div", { class: "space-y-3 border border-default p-4" }, [
                    createVNode(_component_UButton, {
                      block: "",
                      label: "Importuj listę ONU",
                      icon: "i-lucide-git-branch",
                      loading: unref(loading) === "onus",
                      onClick: ($event) => runImport("onus")
                    }, null, 8, ["loading", "onClick"]),
                    createVNode(_component_UButton, {
                      block: "",
                      label: unref(activeOnly) ? "Importuj IP-host aktywnych ONU" : "Importuj IP-host ONU",
                      icon: "i-lucide-router",
                      variant: "subtle",
                      loading: unref(loading) === "ip-hosts",
                      onClick: ($event) => runImport("ip-hosts")
                    }, null, 8, ["label", "loading", "onClick"]),
                    createVNode(_component_UButton, {
                      block: "",
                      label: unref(activeOnly) ? "Mapuj MAC aktywnych ONU" : "Mapuj MAC ONU",
                      icon: "i-lucide-list-tree",
                      variant: "subtle",
                      loading: unref(loading) === "mac-map",
                      onClick: ($event) => runImport("mac-map")
                    }, null, 8, ["label", "loading", "onClick"])
                  ])
                ]),
                createVNode("div", { class: "min-w-0 space-y-4 p-4 sm:p-6" }, [
                  unref(loading) || unref(currentProgress) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3 border border-default p-4"
                  }, [
                    createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                      createVNode("div", { class: "text-sm font-semibold text-highlighted" }, " Postęp importu "),
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        unref(job)?.status ? (openBlock(), createBlock(_component_UBadge, {
                          key: 0,
                          color: "neutral",
                          variant: "subtle"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(job).status), 1)
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(_component_UBadge, {
                          color: "neutral",
                          variant: "subtle"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(progressValue)) + "% ", 1)
                          ]),
                          _: 1
                        })
                      ])
                    ]),
                    createVNode(_component_UProgress, { "model-value": unref(progressValue) }, null, 8, ["model-value"]),
                    createVNode("div", { class: "grid gap-2 text-sm text-muted md:grid-cols-2" }, [
                      createVNode("div", null, "ONU razem: " + toDisplayString(unref(currentProgress)?.totalKnownOnus ?? unref(totalOnuCount)), 1),
                      createVNode("div", null, "ONU w zakresie: " + toDisplayString(unref(currentProgress)?.selectedOnus ?? unref(selectedCount)), 1),
                      createVNode("div", null, "Zakres: " + toDisplayString(unref(currentProgress)?.rangeFrom ?? unref(rangeFrom)) + "-" + toDisplayString(unref(currentProgress)?.rangeTo ?? unref(rangeTo)), 1),
                      createVNode("div", null, "Przetworzone ONU: " + toDisplayString(unref(currentProgress)?.processedOnus ?? 0), 1),
                      createVNode("div", null, "Aktywne tylko: " + toDisplayString(unref(currentProgress)?.activeOnly ? "tak" : "nie"), 1),
                      unref(currentProgress)?.currentOnu ? (openBlock(), createBlock("div", { key: 0 }, " Aktualne ONU: " + toDisplayString(unref(currentProgress).currentOnu), 1)) : createCommentVNode("", true),
                      unref(currentProgress)?.ipHosts !== void 0 ? (openBlock(), createBlock("div", { key: 1 }, " IP-host: " + toDisplayString(unref(currentProgress).ipHosts), 1)) : createCommentVNode("", true),
                      unref(currentProgress)?.macRows !== void 0 ? (openBlock(), createBlock("div", { key: 2 }, " MAC rows: " + toDisplayString(unref(currentProgress).macRows), 1)) : createCommentVNode("", true)
                    ])
                  ])) : createCommentVNode("", true),
                  createVNode(_component_AppDiagnosticResult, { result: unref(result) }, null, 8, ["result"])
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
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/ftth/imports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
