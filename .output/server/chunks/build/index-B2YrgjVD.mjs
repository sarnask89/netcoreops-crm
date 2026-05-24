import { _ as _sfc_main$2 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$3 } from './PageCard-Cd0S5FXf.mjs';
import { u as useToast, _ as _sfc_main$9, z as _sfc_main$c, e as useAppConfig, f as useComponentUI, Q as useForwardProps, r as reactivePick, t as tv, j as _sfc_main$e, P as Primitive } from './server.mjs';
import { _ as _sfc_main$4 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$5 } from './Input-DVuEqpoa.mjs';
import { defineComponent, ref, reactive, withAsyncContext, watchEffect, mergeProps, unref, withCtx, createVNode, useSlots, computed, openBlock, createBlock, Fragment, renderSlot, toDisplayString, createCommentVNode, normalizeProps, guardReactiveProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { _ as _sfc_main$6 } from './Textarea-C69jS_Io.mjs';
import * as z from 'zod';
import { u as useFetch } from './fetch-B7i171gV.mjs';
import '../nitro/nitro.mjs';
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
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './ssr-BO1H6xpe.mjs';

var BaseSeparator_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "BaseSeparator",
  props: {
    orientation: {
      type: String,
      required: false,
      default: "horizontal"
    },
    decorative: {
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
    const ORIENTATIONS = ["horizontal", "vertical"];
    function isValidOrientation(orientation) {
      return ORIENTATIONS.includes(orientation);
    }
    const computedOrientation = computed(() => isValidOrientation(props.orientation) ? props.orientation : "horizontal");
    const ariaOrientation = computed(() => computedOrientation.value === "vertical" ? props.orientation : void 0);
    const semanticProps = computed(() => props.decorative ? { role: "none" } : {
      "aria-orientation": ariaOrientation.value,
      "role": "separator"
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), mergeProps({
        as: _ctx.as,
        "as-child": _ctx.asChild,
        "data-orientation": computedOrientation.value
      }, semanticProps.value), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16, [
        "as",
        "as-child",
        "data-orientation"
      ]);
    };
  }
});
var BaseSeparator_default = BaseSeparator_vue_vue_type_script_setup_true_lang_default;
var Separator_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "Separator",
  props: {
    orientation: {
      type: String,
      required: false,
      default: "horizontal"
    },
    decorative: {
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
    return (_ctx, _cache) => {
      return openBlock(), createBlock(BaseSeparator_default, normalizeProps(guardReactiveProps(props)), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var Separator_default = Separator_vue_vue_type_script_setup_true_lang_default;
const theme = {
  "slots": {
    "root": "flex items-center align-center text-center",
    "border": "",
    "container": "font-medium text-default flex",
    "icon": "shrink-0 size-5",
    "avatar": "shrink-0",
    "avatarSize": "2xs",
    "label": "text-sm"
  },
  "variants": {
    "color": {
      "primary": {
        "border": "border-primary"
      },
      "secondary": {
        "border": "border-secondary"
      },
      "success": {
        "border": "border-success"
      },
      "info": {
        "border": "border-info"
      },
      "warning": {
        "border": "border-warning"
      },
      "error": {
        "border": "border-error"
      },
      "neutral": {
        "border": "border-default"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full flex-row",
        "border": "w-full",
        "container": "mx-3 whitespace-nowrap"
      },
      "vertical": {
        "root": "h-full flex-col",
        "border": "h-full",
        "container": "my-2"
      }
    },
    "size": {
      "xs": "",
      "sm": "",
      "md": "",
      "lg": "",
      "xl": ""
    },
    "type": {
      "solid": {
        "border": "border-solid"
      },
      "dashed": {
        "border": "border-dashed"
      },
      "dotted": {
        "border": "border-dotted"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "border": "border-t"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "border": "border-t-[2px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "border": "border-t-[3px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "border": "border-t-[4px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "border": "border-t-[5px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "border": "border-s"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "border": "border-s-[2px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "border": "border-s-[3px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "border": "border-s-[4px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "border": "border-s-[5px]"
      }
    }
  ],
  "defaultVariants": {
    "color": "neutral",
    "size": "xs",
    "type": "solid"
  }
};
const _sfc_main$1 = {
  __name: "USeparator",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    label: { type: String, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    type: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    decorative: { type: Boolean, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("separator", props);
    const rootProps = useForwardProps(reactivePick(props, "as", "decorative", "orientation"));
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.separator || {} })({
      color: props.color,
      orientation: props.orientation,
      size: props.size,
      type: props.type
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Separator_default), mergeProps(unref(rootProps), {
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: unref(uiProp)?.border }))}"${_scopeId}></div>`);
            if (__props.label || __props.icon || __props.avatar || !!slots.default) {
              _push2(`<!--[--><div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: unref(uiProp)?.container }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, () => {
                if (__props.label) {
                  _push2(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: unref(uiProp)?.label }))}"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
                } else if (__props.icon) {
                  _push2(ssrRenderComponent(_sfc_main$e, {
                    name: __props.icon,
                    "data-slot": "icon",
                    class: ui.value.icon({ class: unref(uiProp)?.icon })
                  }, null, _parent2, _scopeId));
                } else if (__props.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$c, mergeProps({
                    size: unref(uiProp)?.avatarSize || ui.value.avatarSize()
                  }, __props.avatar, {
                    "data-slot": "avatar",
                    class: ui.value.avatar({ class: unref(uiProp)?.avatar })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div><div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: unref(uiProp)?.border }))}"${_scopeId}></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "border",
                class: ui.value.border({ class: unref(uiProp)?.border })
              }, null, 2),
              __props.label || __props.icon || __props.avatar || !!slots.default ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode("div", {
                  "data-slot": "container",
                  class: ui.value.container({ class: unref(uiProp)?.container })
                }, [
                  renderSlot(_ctx.$slots, "default", { ui: ui.value }, () => [
                    __props.label ? (openBlock(), createBlock("span", {
                      key: 0,
                      "data-slot": "label",
                      class: ui.value.label({ class: unref(uiProp)?.label })
                    }, toDisplayString(__props.label), 3)) : __props.icon ? (openBlock(), createBlock(_sfc_main$e, {
                      key: 1,
                      name: __props.icon,
                      "data-slot": "icon",
                      class: ui.value.icon({ class: unref(uiProp)?.icon })
                    }, null, 8, ["name", "class"])) : __props.avatar ? (openBlock(), createBlock(_sfc_main$c, mergeProps({
                      key: 2,
                      size: unref(uiProp)?.avatarSize || ui.value.avatarSize()
                    }, __props.avatar, {
                      "data-slot": "avatar",
                      class: ui.value.avatar({ class: unref(uiProp)?.avatar })
                    }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                  ])
                ], 2),
                createVNode("div", {
                  "data-slot": "border",
                  class: ui.value.border({ class: unref(uiProp)?.border })
                }, null, 2)
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.7.1_@internationalized+date@3.12.1_@internationalized+number@3.6.6_@tiptap+e_f232df4310342c42e02e10fb94bda86b/node_modules/@nuxt/ui/dist/runtime/components/Separator.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const fileRef = ref();
    const profileSchema = z.object({
      name: z.string().min(2, "Za krótka nazwa"),
      email: z.string().email("Nieprawidłowy email"),
      username: z.string().min(2, "Za krótki login"),
      avatar: z.string().optional(),
      bio: z.string().optional()
    });
    const profile = reactive({
      name: "Administrator",
      email: "admin@local.netcoreops",
      username: "admin",
      avatar: void 0,
      bio: "Lokalne konto operatora NetCoreOps"
    });
    const toast = useToast();
    const { data: account } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/account/me",
      "$7yE1j8_G4K"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watchEffect(() => {
      if (!account.value?.data) return;
      profile.name = account.value.data.name;
      profile.email = account.value.data.email;
      profile.username = account.value.data.username;
      profile.bio = account.value.data.role;
    });
    async function onSubmit(event) {
      toast.add({
        title: "Zapisano ustawienia",
        description: "Profil lokalny został zaktualizowany w bieżącej sesji.",
        icon: "i-lucide-check",
        color: "success"
      });
      console.log(event.data);
    }
    function onFileChange(e) {
      const input = e.target;
      if (!input.files?.length) {
        return;
      }
      profile.avatar = URL.createObjectURL(input.files[0]);
    }
    function onFileClick() {
      fileRef.value?.click();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UForm = _sfc_main$2;
      const _component_UPageCard = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UFormField = _sfc_main$4;
      const _component_UInput = _sfc_main$5;
      const _component_USeparator = _sfc_main$1;
      const _component_UAvatar = _sfc_main$c;
      const _component_UTextarea = _sfc_main$6;
      _push(ssrRenderComponent(_component_UForm, mergeProps({
        id: "settings",
        schema: unref(profileSchema),
        state: unref(profile),
        onSubmit
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UPageCard, {
              title: "Konto lokalne",
              description: "Informacje pokazywane w dolnym menu użytkownika i ustawieniach operatora.",
              variant: "naked",
              orientation: "horizontal",
              class: "mb-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    form: "settings",
                    label: "Zapisz zmiany",
                    color: "neutral",
                    type: "submit",
                    class: "w-fit lg:ms-auto"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      form: "settings",
                      label: "Zapisz zmiany",
                      color: "neutral",
                      type: "submit",
                      class: "w-fit lg:ms-auto"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UPageCard, { variant: "subtle" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "name",
                    label: "Nazwa",
                    description: "Widoczna w menu użytkownika i logach operatora.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(profile).name,
                          "onUpdate:modelValue": ($event) => unref(profile).name = $event,
                          autocomplete: "off"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(profile).name,
                            "onUpdate:modelValue": ($event) => unref(profile).name = $event,
                            autocomplete: "off"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USeparator, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "email",
                    label: "Email",
                    description: "Lokalny adres kontaktowy operatora.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(profile).email,
                          "onUpdate:modelValue": ($event) => unref(profile).email = $event,
                          type: "email",
                          autocomplete: "off"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(profile).email,
                            "onUpdate:modelValue": ($event) => unref(profile).email = $event,
                            type: "email",
                            autocomplete: "off"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USeparator, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "username",
                    label: "Login",
                    description: "Nazwa lokalnego użytkownika systemowego albo operatora aplikacji.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(profile).username,
                          "onUpdate:modelValue": ($event) => unref(profile).username = $event,
                          type: "username",
                          autocomplete: "off"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(profile).username,
                            "onUpdate:modelValue": ($event) => unref(profile).username = $event,
                            type: "username",
                            autocomplete: "off"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USeparator, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "avatar",
                    label: "Avatar",
                    description: "Lokalny plik JPG lub PNG.",
                    class: "flex max-sm:flex-col justify-between sm:items-center gap-4"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex flex-wrap items-center gap-3"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_UAvatar, {
                          src: unref(profile).avatar,
                          alt: unref(profile).name,
                          size: "lg"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UButton, {
                          label: "Wybierz",
                          color: "neutral",
                          onClick: onFileClick
                        }, null, _parent4, _scopeId3));
                        _push4(`<input type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif"${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                            createVNode(_component_UAvatar, {
                              src: unref(profile).avatar,
                              alt: unref(profile).name,
                              size: "lg"
                            }, null, 8, ["src", "alt"]),
                            createVNode(_component_UButton, {
                              label: "Wybierz",
                              color: "neutral",
                              onClick: onFileClick
                            }),
                            createVNode("input", {
                              ref_key: "fileRef",
                              ref: fileRef,
                              type: "file",
                              class: "hidden",
                              accept: ".jpg, .jpeg, .png, .gif",
                              onChange: onFileChange
                            }, null, 544)
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USeparator, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "bio",
                    label: "Rola",
                    description: "Opis roli lokalnego operatora.",
                    class: "flex max-sm:flex-col justify-between items-start gap-4",
                    ui: { container: "w-full" }
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(profile).bio,
                          "onUpdate:modelValue": ($event) => unref(profile).bio = $event,
                          rows: 5,
                          autoresize: "",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(profile).bio,
                            "onUpdate:modelValue": ($event) => unref(profile).bio = $event,
                            rows: 5,
                            autoresize: "",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UFormField, {
                      name: "name",
                      label: "Nazwa",
                      description: "Widoczna w menu użytkownika i logach operatora.",
                      required: "",
                      class: "flex max-sm:flex-col justify-between items-start gap-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(profile).name,
                          "onUpdate:modelValue": ($event) => unref(profile).name = $event,
                          autocomplete: "off"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_USeparator),
                    createVNode(_component_UFormField, {
                      name: "email",
                      label: "Email",
                      description: "Lokalny adres kontaktowy operatora.",
                      required: "",
                      class: "flex max-sm:flex-col justify-between items-start gap-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(profile).email,
                          "onUpdate:modelValue": ($event) => unref(profile).email = $event,
                          type: "email",
                          autocomplete: "off"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_USeparator),
                    createVNode(_component_UFormField, {
                      name: "username",
                      label: "Login",
                      description: "Nazwa lokalnego użytkownika systemowego albo operatora aplikacji.",
                      required: "",
                      class: "flex max-sm:flex-col justify-between items-start gap-4"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(profile).username,
                          "onUpdate:modelValue": ($event) => unref(profile).username = $event,
                          type: "username",
                          autocomplete: "off"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_USeparator),
                    createVNode(_component_UFormField, {
                      name: "avatar",
                      label: "Avatar",
                      description: "Lokalny plik JPG lub PNG.",
                      class: "flex max-sm:flex-col justify-between sm:items-center gap-4"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                          createVNode(_component_UAvatar, {
                            src: unref(profile).avatar,
                            alt: unref(profile).name,
                            size: "lg"
                          }, null, 8, ["src", "alt"]),
                          createVNode(_component_UButton, {
                            label: "Wybierz",
                            color: "neutral",
                            onClick: onFileClick
                          }),
                          createVNode("input", {
                            ref_key: "fileRef",
                            ref: fileRef,
                            type: "file",
                            class: "hidden",
                            accept: ".jpg, .jpeg, .png, .gif",
                            onChange: onFileChange
                          }, null, 544)
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_USeparator),
                    createVNode(_component_UFormField, {
                      name: "bio",
                      label: "Rola",
                      description: "Opis roli lokalnego operatora.",
                      class: "flex max-sm:flex-col justify-between items-start gap-4",
                      ui: { container: "w-full" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UTextarea, {
                          modelValue: unref(profile).bio,
                          "onUpdate:modelValue": ($event) => unref(profile).bio = $event,
                          rows: 5,
                          autoresize: "",
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UPageCard, {
                title: "Konto lokalne",
                description: "Informacje pokazywane w dolnym menu użytkownika i ustawieniach operatora.",
                variant: "naked",
                orientation: "horizontal",
                class: "mb-4"
              }, {
                default: withCtx(() => [
                  createVNode(_component_UButton, {
                    form: "settings",
                    label: "Zapisz zmiany",
                    color: "neutral",
                    type: "submit",
                    class: "w-fit lg:ms-auto"
                  })
                ]),
                _: 1
              }),
              createVNode(_component_UPageCard, { variant: "subtle" }, {
                default: withCtx(() => [
                  createVNode(_component_UFormField, {
                    name: "name",
                    label: "Nazwa",
                    description: "Widoczna w menu użytkownika i logach operatora.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: unref(profile).name,
                        "onUpdate:modelValue": ($event) => unref(profile).name = $event,
                        autocomplete: "off"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_USeparator),
                  createVNode(_component_UFormField, {
                    name: "email",
                    label: "Email",
                    description: "Lokalny adres kontaktowy operatora.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: unref(profile).email,
                        "onUpdate:modelValue": ($event) => unref(profile).email = $event,
                        type: "email",
                        autocomplete: "off"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_USeparator),
                  createVNode(_component_UFormField, {
                    name: "username",
                    label: "Login",
                    description: "Nazwa lokalnego użytkownika systemowego albo operatora aplikacji.",
                    required: "",
                    class: "flex max-sm:flex-col justify-between items-start gap-4"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: unref(profile).username,
                        "onUpdate:modelValue": ($event) => unref(profile).username = $event,
                        type: "username",
                        autocomplete: "off"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_USeparator),
                  createVNode(_component_UFormField, {
                    name: "avatar",
                    label: "Avatar",
                    description: "Lokalny plik JPG lub PNG.",
                    class: "flex max-sm:flex-col justify-between sm:items-center gap-4"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                        createVNode(_component_UAvatar, {
                          src: unref(profile).avatar,
                          alt: unref(profile).name,
                          size: "lg"
                        }, null, 8, ["src", "alt"]),
                        createVNode(_component_UButton, {
                          label: "Wybierz",
                          color: "neutral",
                          onClick: onFileClick
                        }),
                        createVNode("input", {
                          ref_key: "fileRef",
                          ref: fileRef,
                          type: "file",
                          class: "hidden",
                          accept: ".jpg, .jpeg, .png, .gif",
                          onChange: onFileChange
                        }, null, 544)
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_USeparator),
                  createVNode(_component_UFormField, {
                    name: "bio",
                    label: "Rola",
                    description: "Opis roli lokalnego operatora.",
                    class: "flex max-sm:flex-col justify-between items-start gap-4",
                    ui: { container: "w-full" }
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UTextarea, {
                        modelValue: unref(profile).bio,
                        "onUpdate:modelValue": ($event) => unref(profile).bio = $event,
                        rows: 5,
                        autoresize: "",
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
