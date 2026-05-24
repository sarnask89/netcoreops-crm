import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$3 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './DashboardToolbar-D0tdyEuQ.mjs';
import { _ as _sfc_main$5 } from './Tabs-CY9AYAqS.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, withAsyncContext, mergeProps, withCtx, unref, isRef, openBlock, createBlock, createVNode, useSSRContext } from 'vue';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const tab = ref("onus");
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const { data: olts, status: oltsStatus, refresh: refreshOlts } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/olts",
      {
        default: () => ({ success: false, data: [] })
      },
      "$gL8lp0MjSB"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: onus, status: onusStatus, refresh: refreshOnus } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/onuses",
      {
        default: () => ({ success: false, data: [] })
      },
      "$y6lP0O3TxT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: links, status: linksStatus, refresh: refreshLinks } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/transparent-links",
      {
        default: () => ({ success: false, data: [] })
      },
      "$FMVedfKCif"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const tabs = [{
      label: "ONU",
      value: "onus",
      icon: "i-lucide-router"
    }, {
      label: "OLT",
      value: "olts",
      icon: "i-lucide-server"
    }, {
      label: "Transparent links",
      value: "links",
      icon: "i-lucide-link"
    }];
    const oltColumns = [
      { accessorKey: "equipment.inventoryId", header: "OLT" },
      { accessorKey: "equipment.managementIp", header: "IP zarządzania" },
      {
        id: "model",
        header: "Model",
        cell: ({ row }) => row.original.model || [row.original.equipment.model?.manufacturer, row.original.equipment.model?.modelName].filter(Boolean).join(" ") || "Brak"
      },
      { accessorKey: "vendor", header: "Vendor" },
      { accessorKey: "managementVlanId", header: "VLAN mgmt" },
      { accessorKey: "ponPortCount", header: "PON" },
      { accessorKey: "onuCount", header: "ONU" },
      { accessorKey: "activeOnuCount", header: "Aktywne" },
      { accessorKey: "equipment.node.name", header: "Węzeł" }
    ];
    const onuColumns = [
      { accessorKey: "oltInventoryId", header: "OLT" },
      { accessorKey: "ponPortCode", header: "PON" },
      { accessorKey: "onuIdentifier", header: "ONU ID" },
      { accessorKey: "serialNumber", header: "Serial" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "signalRx", header: "RX" },
      {
        id: "managementIp",
        header: "IP zarządzania",
        cell: ({ row }) => row.original.managementIpHosts.map((host) => host.currentIp).filter(Boolean).join(", ") || "Brak"
      },
      {
        id: "accessMacs",
        header: "MAC access",
        cell: ({ row }) => row.original.accessMacs.length
      },
      {
        id: "transparent",
        header: "Transparent",
        cell: ({ row }) => row.original.transparentCandidate ? "Tak" : "Nie"
      },
      {
        id: "customers",
        header: "Klienci",
        cell: ({ row }) => row.original.linkedCustomerNames.join(", ") || "Brak"
      }
    ];
    const linkColumns = [
      {
        id: "onu",
        header: "ONU",
        cell: ({ row }) => `${row.original.onu.ponPort.olt.equipment.inventoryId} ${row.original.onu.ponPort.portCode}/${row.original.onu.onuIdentifier}`
      },
      { accessorKey: "macAddress", header: "MAC za ONU" },
      { accessorKey: "linkType", header: "Typ" },
      {
        id: "target",
        header: "Powiązanie",
        cell: ({ row }) => row.original.customerDevice?.customer.fullName || row.original.backboneEquipment?.inventoryId || "Brak"
      },
      { accessorKey: "confidence", header: "Pewność" }
    ];
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function contextItems(row) {
      return [[
        { label: "Szczegóły", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) }
      ], [
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refreshAll() }
      ]];
    }
    async function refreshAll() {
      await Promise.all([refreshOlts(), refreshOnus(), refreshLinks()]);
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
        id: "network-ftth",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "FTTH / GPON" }, {
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
                    color: "neutral",
                    variant: "outline",
                    onClick: refreshAll
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      label: "Odśwież",
                      icon: "i-lucide-refresh-cw",
                      color: "neutral",
                      variant: "outline",
                      onClick: refreshAll
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UDashboardToolbar, null, {
              left: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UTabs, {
                    modelValue: unref(tab),
                    "onUpdate:modelValue": ($event) => isRef(tab) ? tab.value = $event : null,
                    items: tabs,
                    size: "sm"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UTabs, {
                      modelValue: unref(tab),
                      "onUpdate:modelValue": ($event) => isRef(tab) ? tab.value = $event : null,
                      items: tabs,
                      size: "sm"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "FTTH / GPON" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UButton, {
                    label: "Odśwież",
                    icon: "i-lucide-refresh-cw",
                    color: "neutral",
                    variant: "outline",
                    onClick: refreshAll
                  })
                ]),
                _: 1
              }),
              createVNode(_component_UDashboardToolbar, null, {
                left: withCtx(() => [
                  createVNode(_component_UTabs, {
                    modelValue: unref(tab),
                    "onUpdate:modelValue": ($event) => isRef(tab) ? tab.value = $event : null,
                    items: tabs,
                    size: "sm"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(tab) === "onus") {
              _push2(ssrRenderComponent(_component_AppDataTable, {
                data: unref(onus).data,
                columns: onuColumns,
                loading: unref(onusStatus) === "pending",
                "context-items": contextItems
              }, null, _parent2, _scopeId));
            } else if (unref(tab) === "olts") {
              _push2(ssrRenderComponent(_component_AppDataTable, {
                data: unref(olts).data,
                columns: oltColumns,
                loading: unref(oltsStatus) === "pending",
                "context-items": contextItems
              }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_AppDataTable, {
                data: unref(links).data,
                columns: linkColumns,
                loading: unref(linksStatus) === "pending",
                "context-items": contextItems
              }, null, _parent2, _scopeId));
            }
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły FTTH",
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
          } else {
            return [
              unref(tab) === "onus" ? (openBlock(), createBlock(_component_AppDataTable, {
                key: 0,
                data: unref(onus).data,
                columns: onuColumns,
                loading: unref(onusStatus) === "pending",
                "context-items": contextItems
              }, null, 8, ["data", "loading"])) : unref(tab) === "olts" ? (openBlock(), createBlock(_component_AppDataTable, {
                key: 1,
                data: unref(olts).data,
                columns: oltColumns,
                loading: unref(oltsStatus) === "pending",
                "context-items": contextItems
              }, null, 8, ["data", "loading"])) : (openBlock(), createBlock(_component_AppDataTable, {
                key: 2,
                data: unref(links).data,
                columns: linkColumns,
                loading: unref(linksStatus) === "pending",
                "context-items": contextItems
              }, null, 8, ["data", "loading"])),
              createVNode(_component_AppRowDetailsSlideover, {
                open: unref(detailsOpen),
                "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
                title: "Szczegóły FTTH",
                item: unref(selectedRow)
              }, null, 8, ["open", "onUpdate:open", "item"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/ftth/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
