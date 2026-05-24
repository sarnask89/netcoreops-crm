import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$3 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$4 } from './DashboardToolbar-D0tdyEuQ.mjs';
import { _ as _sfc_main$5 } from './NavigationMenu-C-dWmEMF.mjs';
import { O as __nuxt_component_5 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import './DashboardSidebarToggle-C_vEEhTE.mjs';
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
import '@iconify/utils';
import 'consola';
import './ssr-BO1H6xpe.mjs';
import './PopperArrow-CvIo2SqJ.mjs';
import './isValueEqualOrExist-DZWcPJh8.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Badge-CElKKp_G.mjs';
import './Popover-C51GwAWe.mjs';
import './overlay-CjyBzL1C.mjs';
import './Tooltip-Cmw1Q6xY.mjs';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const links = [[{
      label: "Konto",
      icon: "i-lucide-user",
      to: "/settings",
      exact: true
    }, {
      label: "Użytkownicy",
      icon: "i-lucide-users",
      to: "/settings/members"
    }, {
      label: "Powiadomienia",
      icon: "i-lucide-bell",
      to: "/settings/notifications"
    }, {
      label: "Bezpieczeństwo",
      icon: "i-lucide-shield",
      to: "/settings/security"
    }]];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$3;
      const _component_UDashboardToolbar = _sfc_main$4;
      const _component_UNavigationMenu = _sfc_main$5;
      const _component_NuxtPage = __nuxt_component_5;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "settings",
        ui: { body: "lg:py-12" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Ustawienia" }, {
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
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UNavigationMenu, {
                    items: links,
                    highlight: "",
                    class: "-mx-1 flex-1"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UNavigationMenu, {
                      items: links,
                      highlight: "",
                      class: "-mx-1 flex-1"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Ustawienia" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                _: 1
              }),
              createVNode(_component_UDashboardToolbar, null, {
                default: withCtx(() => [
                  createVNode(_component_UNavigationMenu, {
                    items: links,
                    highlight: "",
                    class: "-mx-1 flex-1"
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto" }, [
                createVNode(_component_NuxtPage)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
