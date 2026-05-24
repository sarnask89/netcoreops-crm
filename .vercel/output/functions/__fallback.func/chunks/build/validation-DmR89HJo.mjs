import { _ as _sfc_main$2, a as _sfc_main$1$1, b as _sfc_main$3 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$1 } from './Alert-C2QsFOV3.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, withCtx, unref, isRef, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-B7i171gV.mjs';
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
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './PopperArrow-CvIo2SqJ.mjs';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';
import './Slideover-DjbGE3Jt.mjs';
import './overlay-CjyBzL1C.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "validation",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pit/validation",
      {
        default: () => ({
          success: false,
          data: { errors: [], warnings: [], summary: { errors: 0, warnings: 0, readyForExport: false } }
        })
      },
      "$GAyi8KLNK5"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => [
      ...data.value.data.errors,
      ...data.value.data.warnings
    ]);
    const columns = [
      { accessorKey: "severity", header: "Poziom" },
      { accessorKey: "entity", header: "Tabela" },
      { accessorKey: "code", header: "Kod" },
      { accessorKey: "message", header: "Komunikat" }
    ];
    const selectedRow = ref(null);
    const detailsOpen = ref(false);
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Szczegóły problemu", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Odśwież walidację", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UAlert = _sfc_main$1;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "pit-validation",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Walidacja PIT/UKE" }, {
              leading: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UDashboardSidebarCollapse, null, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UDashboardSidebarCollapse)
                  ];
                }
              }),
              right: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Sprawdź",
                    icon: "i-lucide-shield-check",
                    onClick: ($event) => unref(refresh)()
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Eksport CSV",
                    icon: "i-lucide-download",
                    to: "/api/pit/export",
                    target: "_blank",
                    variant: "subtle"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      label: "Sprawdź",
                      icon: "i-lucide-shield-check",
                      onClick: ($event) => unref(refresh)()
                    }, null, 8, ["onClick"]),
                    createVNode(_component_UButton, {
                      label: "Eksport CSV",
                      icon: "i-lucide-download",
                      to: "/api/pit/export",
                      target: "_blank",
                      variant: "subtle"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Walidacja PIT/UKE" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UButton, {
                    label: "Sprawdź",
                    icon: "i-lucide-shield-check",
                    onClick: ($event) => unref(refresh)()
                  }, null, 8, ["onClick"]),
                  createVNode(_component_UButton, {
                    label: "Eksport CSV",
                    icon: "i-lucide-download",
                    to: "/api/pit/export",
                    target: "_blank",
                    variant: "subtle"
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-3 p-4 sm:p-6 md:grid-cols-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UAlert, {
              color: unref(data).data.summary.readyForExport ? "success" : "warning",
              variant: "subtle",
              icon: "i-lucide-activity",
              title: unref(data).data.summary.readyForExport ? "Gotowe do eksportu" : "Wymaga sprawdzenia",
              description: "Walidacja opiera się na powiązaniach słownikowych i integralności relacji."
            }, null, _parent2, _scopeId));
            _push2(`<div class="border border-default rounded-lg p-3"${_scopeId}><p class="text-sm text-muted"${_scopeId}> Błędy </p><p class="text-2xl font-semibold text-error"${_scopeId}>${ssrInterpolate(unref(data).data.summary.errors)}</p></div><div class="border border-default rounded-lg p-3"${_scopeId}><p class="text-sm text-muted"${_scopeId}> Ostrzeżenia </p><p class="text-2xl font-semibold text-warning"${_scopeId}>${ssrInterpolate(unref(data).data.summary.warnings)}</p></div></div>`);
            _push2(ssrRenderComponent(_component_AppDataTable, {
              data: unref(rows),
              columns,
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły walidacji",
              subtitle: unref(selectedRow)?.code,
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "grid gap-3 p-4 sm:p-6 md:grid-cols-3" }, [
                createVNode(_component_UAlert, {
                  color: unref(data).data.summary.readyForExport ? "success" : "warning",
                  variant: "subtle",
                  icon: "i-lucide-activity",
                  title: unref(data).data.summary.readyForExport ? "Gotowe do eksportu" : "Wymaga sprawdzenia",
                  description: "Walidacja opiera się na powiązaniach słownikowych i integralności relacji."
                }, null, 8, ["color", "title"]),
                createVNode("div", { class: "border border-default rounded-lg p-3" }, [
                  createVNode("p", { class: "text-sm text-muted" }, " Błędy "),
                  createVNode("p", { class: "text-2xl font-semibold text-error" }, toDisplayString(unref(data).data.summary.errors), 1)
                ]),
                createVNode("div", { class: "border border-default rounded-lg p-3" }, [
                  createVNode("p", { class: "text-sm text-muted" }, " Ostrzeżenia "),
                  createVNode("p", { class: "text-2xl font-semibold text-warning" }, toDisplayString(unref(data).data.summary.warnings), 1)
                ])
              ]),
              createVNode(_component_AppDataTable, {
                data: unref(rows),
                columns,
                loading: unref(status) === "pending",
                "context-items": rowContextItems
              }, null, 8, ["data", "loading"]),
              createVNode(_component_AppRowDetailsSlideover, {
                open: unref(detailsOpen),
                "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
                title: "Szczegóły walidacji",
                subtitle: unref(selectedRow)?.code,
                item: unref(selectedRow)
              }, null, 8, ["open", "onUpdate:open", "subtitle", "item"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pit/validation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
