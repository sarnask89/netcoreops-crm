import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$3 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './DashboardToolbar-D0tdyEuQ.mjs';
import { _ as _sfc_main$5 } from './Tabs-CY9AYAqS.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, unref, isRef, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
import 'node:url';
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
import './PopperArrow-CvIo2SqJ.mjs';
import './RovingFocusGroup-ByIEls-F.mjs';
import './RovingFocusItem-CDE9BQzI.mjs';
import './Badge-CElKKp_G.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';
import './Slideover-DjbGE3Jt.mjs';
import './overlay-CjyBzL1C.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dictionaries",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const active = ref("teryt");
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/dictionaries",
      {
        default: () => ({
          success: false,
          data: { media: [], technologies: [], teryt: [], simc: [], ulic: [] }
        })
      },
      "$ZmRRFJ_Fxz"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const tabs = [
      { label: "TERYT", value: "teryt" },
      { label: "SIMC", value: "simc" },
      { label: "ULIC", value: "ulic" },
      { label: "Media UKE", value: "media" },
      { label: "Technologie UKE", value: "technologies" }
    ];
    const columns = computed(() => {
      if (active.value === "teryt") {
        return [
          { accessorKey: "terytCode", header: "TERYT" },
          { accessorKey: "name", header: "Nazwa" },
          { accessorKey: "areaType", header: "Typ" },
          { accessorKey: "county", header: "Powiat" },
          { accessorKey: "commune", header: "Gmina" }
        ];
      }
      if (active.value === "simc") {
        return [
          { accessorKey: "simcCode", header: "SIMC" },
          { accessorKey: "name", header: "Miejscowość" },
          { accessorKey: "localityType", header: "Typ" },
          { accessorKey: "terytArea.terytCode", header: "TERYT" }
        ];
      }
      if (active.value === "ulic") {
        return [
          { accessorKey: "ulicCode", header: "ULIC" },
          { accessorKey: "streetType", header: "Cecha" },
          { accessorKey: "name", header: "Ulica" },
          { accessorKey: "locality.name", header: "Miejscowość" },
          { accessorKey: "locality.simcCode", header: "SIMC" }
        ];
      }
      return [
        { accessorKey: "code", header: "Kod" },
        { accessorKey: "label", header: "Etykieta" },
        { accessorKey: "description", header: "Opis" }
      ];
    });
    const rows = computed(() => data.value.data[active.value] || []);
    const counts = computed(() => ({
      teryt: data.value.data.teryt.length,
      simc: data.value.data.simc.length,
      ulic: data.value.data.ulic.length,
      media: data.value.data.media.length,
      technologies: data.value.data.technologies.length
    }));
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Szczegóły definicji", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UDashboardToolbar = _sfc_main$4;
      const _component_UTabs = _sfc_main$5;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "dictionaries",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Definicje i słowniki" }, {
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
                    label: "Odśwież",
                    icon: "i-lucide-refresh-cw",
                    variant: "subtle",
                    onClick: ($event) => unref(refresh)()
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      label: "Odśwież",
                      icon: "i-lucide-refresh-cw",
                      variant: "subtle",
                      onClick: ($event) => unref(refresh)()
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UDashboardToolbar, null, {
              left: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UTabs, {
                    modelValue: unref(active),
                    "onUpdate:modelValue": ($event) => isRef(active) ? active.value = $event : null,
                    items: tabs
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UTabs, {
                      modelValue: unref(active),
                      "onUpdate:modelValue": ($event) => isRef(active) ? active.value = $event : null,
                      items: tabs
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Definicje i słowniki" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UButton, {
                    label: "Odśwież",
                    icon: "i-lucide-refresh-cw",
                    variant: "subtle",
                    onClick: ($event) => unref(refresh)()
                  }, null, 8, ["onClick"])
                ]),
                _: 1
              }),
              createVNode(_component_UDashboardToolbar, null, {
                left: withCtx(() => [
                  createVNode(_component_UTabs, {
                    modelValue: unref(active),
                    "onUpdate:modelValue": ($event) => isRef(active) ? active.value = $event : null,
                    items: tabs
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-3 p-4 sm:p-6 md:grid-cols-5"${_scopeId}><!--[-->`);
            ssrRenderList(unref(counts), (count, key) => {
              _push2(`<div class="border border-default rounded-lg p-3"${_scopeId}><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(key)}</p><p class="text-2xl font-semibold text-highlighted"${_scopeId}>${ssrInterpolate(count)}</p></div>`);
            });
            _push2(`<!--]--></div>`);
            _push2(ssrRenderComponent(_component_AppDataTable, {
              data: unref(rows),
              columns: unref(columns),
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły definicji",
              subtitle: unref(active),
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "grid gap-3 p-4 sm:p-6 md:grid-cols-5" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(counts), (count, key) => {
                  return openBlock(), createBlock("div", {
                    key,
                    class: "border border-default rounded-lg p-3"
                  }, [
                    createVNode("p", { class: "text-sm text-muted" }, toDisplayString(key), 1),
                    createVNode("p", { class: "text-2xl font-semibold text-highlighted" }, toDisplayString(count), 1)
                  ]);
                }), 128))
              ]),
              createVNode(_component_AppDataTable, {
                data: unref(rows),
                columns: unref(columns),
                loading: unref(status) === "pending",
                "context-items": rowContextItems
              }, null, 8, ["data", "columns", "loading"]),
              createVNode(_component_AppRowDetailsSlideover, {
                open: unref(detailsOpen),
                "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
                title: "Szczegóły definicji",
                subtitle: unref(active),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/system/dictionaries.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
