import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$4 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$9 } from './server.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, unref, isRef, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "pons",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const query = ref("");
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/pons",
      {
        default: () => ({ success: false, data: [] })
      },
      "$vN1OJWIf1V"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.oltInventoryId, row.portCode, row.label, row.status, row.nodeName, row.oltManagementIp].filter(Boolean).join(" ").toLowerCase();
      return !query.value || text.includes(query.value.toLowerCase());
    }));
    const columns = [
      { accessorKey: "oltInventoryId", header: "OLT" },
      { accessorKey: "portCode", header: "PON" },
      { accessorKey: "label", header: "Opis" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "onuCount", header: "ONU" },
      { accessorKey: "activeOnuCount", header: "Aktywne" },
      { accessorKey: "transparentCandidateCount", header: "Transparent" },
      { accessorKey: "nodeName", header: "Węzeł" }
    ];
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Szczegóły PON", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$4;
      const _component_UInput = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-ftth-pons",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "FTTH PON" }, {
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
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(query),
                    "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                    icon: "i-lucide-search",
                    placeholder: "Szukaj PON",
                    class: "w-32 sm:w-56"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-refresh-cw",
                    variant: "outline",
                    color: "neutral",
                    onClick: () => unref(refresh)()
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(query),
                      "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                      icon: "i-lucide-search",
                      placeholder: "Szukaj PON",
                      class: "w-32 sm:w-56"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_UButton, {
                      icon: "i-lucide-refresh-cw",
                      variant: "outline",
                      color: "neutral",
                      onClick: () => unref(refresh)()
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "FTTH PON" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: unref(query),
                    "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                    icon: "i-lucide-search",
                    placeholder: "Szukaj PON",
                    class: "w-32 sm:w-56"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-refresh-cw",
                    variant: "outline",
                    color: "neutral",
                    onClick: () => unref(refresh)()
                  }, null, 8, ["onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AppDataTable, {
              data: unref(rows),
              columns,
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły PON",
              subtitle: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} / ${unref(selectedRow).portCode}` : void 0,
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AppDataTable, {
                data: unref(rows),
                columns,
                loading: unref(status) === "pending",
                "context-items": rowContextItems
              }, null, 8, ["data", "loading"]),
              createVNode(_component_AppRowDetailsSlideover, {
                open: unref(detailsOpen),
                "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
                title: "Szczegóły PON",
                subtitle: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} / ${unref(selectedRow).portCode}` : void 0,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/ftth/pons.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
