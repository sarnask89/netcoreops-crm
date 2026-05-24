import { _ as _sfc_main$1 } from './Card-BKW__d3R.mjs';
import { _ as _sfc_main$2 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$3 } from './Input-DVuEqpoa.mjs';
import { u as useToast, N as useRoute$1, _ as _sfc_main$9, G as navigateTo } from './server.mjs';
import { defineComponent, ref, mergeProps, withCtx, isRef, unref, createVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const toast = useToast();
    const route = useRoute$1();
    const username = ref("admin");
    const password = ref("");
    const loading = ref(false);
    async function login() {
      loading.value = true;
      try {
        await $fetch("/api/auth/login", {
          method: "POST",
          body: {
            username: username.value,
            password: password.value
          }
        });
        await navigateTo(typeof route.query.redirect === "string" ? route.query.redirect : "/");
      } catch {
        toast.add({ title: "Nieprawidłowy login lub hasło", color: "error" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-default flex items-center justify-center p-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UCard, { class: "w-full max-w-sm" }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-1"${_scopeId}><h1 class="text-lg font-semibold"${_scopeId}> NetCoreOps </h1><p class="text-sm text-muted"${_scopeId}> Logowanie lokalnego operatora </p></div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-1" }, [
                createVNode("h1", { class: "text-lg font-semibold" }, " NetCoreOps "),
                createVNode("p", { class: "text-sm text-muted" }, " Logowanie lokalnego operatora ")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Login" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(username),
                    "onUpdate:modelValue": ($event) => isRef(username) ? username.value = $event : null,
                    autocomplete: "username",
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(username),
                      "onUpdate:modelValue": ($event) => isRef(username) ? username.value = $event : null,
                      autocomplete: "username",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Hasło" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(password),
                    "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                    type: "password",
                    autocomplete: "current-password",
                    class: "w-full",
                    autofocus: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(password),
                      "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                      type: "password",
                      autocomplete: "current-password",
                      class: "w-full",
                      autofocus: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              type: "submit",
              label: "Zaloguj",
              icon: "i-lucide-log-in",
              block: "",
              loading: unref(loading)
            }, null, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                class: "space-y-4",
                onSubmit: withModifiers(login, ["prevent"])
              }, [
                createVNode(_component_UFormField, { label: "Login" }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: unref(username),
                      "onUpdate:modelValue": ($event) => isRef(username) ? username.value = $event : null,
                      autocomplete: "username",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UFormField, { label: "Hasło" }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: unref(password),
                      "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                      type: "password",
                      autocomplete: "current-password",
                      class: "w-full",
                      autofocus: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  type: "submit",
                  label: "Zaloguj",
                  icon: "i-lucide-log-in",
                  block: "",
                  loading: unref(loading)
                }, null, 8, ["loading"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
