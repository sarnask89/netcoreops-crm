import { _ as _sfc_main$1 } from './PageCard-Cd0S5FXf.mjs';
import { _ as _sfc_main$2 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$3 } from './Switch-BjjnqNfE.mjs';
import { defineComponent, reactive, withCtx, unref, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import './server.mjs';
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
import './useFormControl-IzN_Be5X.mjs';
import './VisuallyHiddenInput-Cbbw7kMc.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "notifications",
  __ssrInlineRender: true,
  setup(__props) {
    const state = reactive({
      gponRxAlerts: true,
      diagnostics: true,
      imports: true,
      browser: false
    });
    const sections = [{
      title: "Kanały powiadomień",
      description: "Sposób prezentowania zdarzeń operatorowi.",
      fields: [{
        name: "gponRxAlerts",
        label: "Alerty GPON RX",
        description: "Pokazuj alerty ONU poza zakresem mocy w panelu i powiadomieniach."
      }, {
        name: "diagnostics",
        label: "Diagnostyka urządzeń",
        description: "Pokazuj wyniki diagnostyki MikroTik/Dasan jako zdarzenia operacyjne."
      }, {
        name: "imports",
        label: "Importy",
        description: "Pokazuj zakończone importy DHCP, FTTH i słowników."
      }, {
        name: "browser",
        label: "Powiadomienia systemowe",
        description: "Rezerwacja pod lokalne powiadomienia przeglądarki."
      }]
    }];
    function onChange() {
      localStorage.setItem("netcoreops-notification-settings", JSON.stringify(state));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPageCard = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      const _component_USwitch = _sfc_main$3;
      _push(`<!--[-->`);
      ssrRenderList(sections, (section) => {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_UPageCard, {
          title: section.title,
          description: section.description,
          variant: "naked",
          class: "mb-4"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UPageCard, {
          variant: "subtle",
          ui: { container: "divide-y divide-default" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(section.fields, (field) => {
                _push2(ssrRenderComponent(_component_UFormField, {
                  key: field.name,
                  name: field.name,
                  label: field.label,
                  description: field.description,
                  class: "flex items-center justify-between not-last:pb-4 gap-2"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_USwitch, {
                        modelValue: unref(state)[field.name],
                        "onUpdate:modelValue": [($event) => unref(state)[field.name] = $event, onChange]
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_USwitch, {
                          modelValue: unref(state)[field.name],
                          "onUpdate:modelValue": [($event) => unref(state)[field.name] = $event, onChange]
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(section.fields, (field) => {
                  return openBlock(), createBlock(_component_UFormField, {
                    key: field.name,
                    name: field.name,
                    label: field.label,
                    description: field.description,
                    class: "flex items-center justify-between not-last:pb-4 gap-2"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_USwitch, {
                        modelValue: unref(state)[field.name],
                        "onUpdate:modelValue": [($event) => unref(state)[field.name] = $event, onChange]
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 2
                  }, 1032, ["name", "label", "description"]);
                }), 128))
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div>`);
      });
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/notifications.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
