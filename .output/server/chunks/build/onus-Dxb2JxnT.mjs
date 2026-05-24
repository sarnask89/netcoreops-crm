import { _ as _sfc_main$2, a as _sfc_main$1$1, b as _sfc_main$6 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$5 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$4 } from './Select-N__9sMNx.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { _ as _sfc_main$1 } from './Slideover-DjbGE3Jt.mjs';
import { _ as _sfc_main$3 } from './FormField-D5WtVCdC.mjs';
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
import 'node:url';
import '@iconify/utils';
import 'consola';
import './ssr-BO1H6xpe.mjs';
import './PopperArrow-CvIo2SqJ.mjs';
import './useFormControl-IzN_Be5X.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
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
import './RovingFocusGroup-ByIEls-F.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';
import './overlay-CjyBzL1C.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "onus",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const detailsOpen = ref(false);
    const linkCustomerOpen = ref(false);
    const linkEquipmentOpen = ref(false);
    const detailsTitle = ref("Szczegóły ONU");
    const selectedRow = ref(null);
    const detailsItem = ref(null);
    const query = ref("");
    const statusFilter = ref("all");
    const customerDeviceId = ref(null);
    const networkEquipmentId = ref(null);
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/ftth/onuses",
      {
        default: () => ({ success: false, data: [] })
      },
      "$S5IyVCcVXP"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: devices, refresh: refreshDevices } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/customer-devices",
      {
        default: () => ({ success: false, data: [] })
      },
      "$sw9KUCOtZn"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options, refresh: refreshOptions } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { equipment: [] } })
      },
      "$ExkUyyPzZj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customerDeviceItems = computed(() => [
      { label: "Odłącz wszystkie urządzenia klienta", value: null },
      ...devices.value.data.map((device) => ({
        label: [device.customer.fullName, device.hostname, device.ipAddress, device.macAddress].filter(Boolean).join(" - "),
        value: device.id
      }))
    ]);
    const equipmentItems = computed(() => [
      { label: "Odłącz sprzęt szkieletowy", value: null },
      ...options.value.data.equipment.map((equipment) => ({
        label: [equipment.inventoryId, equipment.hostname, equipment.managementIp].filter(Boolean).join(" - "),
        value: equipment.id
      }))
    ]);
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.oltInventoryId, row.ponPortCode, row.onuIdentifier, row.serialNumber, row.status, row.equipment?.inventoryId, ...row.linkedCustomerNames].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query.value || text.includes(query.value.toLowerCase());
      const matchesStatus = statusFilter.value === "all" || row.status.toUpperCase() === statusFilter.value;
      return matchesQuery && matchesStatus;
    }));
    const columns = [
      { accessorKey: "oltInventoryId", header: "OLT" },
      { accessorKey: "ponPortCode", header: "PON" },
      { accessorKey: "onuIdentifier", header: "ONU ID" },
      { accessorKey: "serialNumber", header: "Serial" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "signalRx", header: "RX" },
      {
        id: "managementIp",
        header: "IP-host / VLAN 400",
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
      },
      {
        id: "equipment",
        header: "Sprzęt",
        cell: ({ row }) => row.original.equipment?.inventoryId || "Brak"
      }
    ];
    async function refreshAll() {
      await Promise.all([refresh(), refreshDevices(), refreshOptions()]);
    }
    function showDetails(row, item = row, title = "Szczegóły ONU") {
      selectedRow.value = row;
      detailsItem.value = item;
      detailsTitle.value = title;
      detailsOpen.value = true;
    }
    function openCustomerLink(row) {
      selectedRow.value = row;
      customerDeviceId.value = null;
      linkCustomerOpen.value = true;
    }
    function openEquipmentLink(row) {
      selectedRow.value = row;
      networkEquipmentId.value = row.equipment?.id || null;
      linkEquipmentOpen.value = true;
    }
    async function saveCustomerLink() {
      if (!selectedRow.value) return;
      await $fetch(`/api/ftth/onuses/${selectedRow.value.id}/link-customer`, {
        method: "POST",
        body: { customerDeviceId: customerDeviceId.value }
      });
      toast.add({ title: "Powiązanie z klientem zapisane", color: "success" });
      linkCustomerOpen.value = false;
      await refreshAll();
    }
    async function saveEquipmentLink() {
      if (!selectedRow.value) return;
      await $fetch(`/api/ftth/onuses/${selectedRow.value.id}/link-equipment`, {
        method: "POST",
        body: { networkEquipmentId: networkEquipmentId.value }
      });
      toast.add({ title: "Powiązanie ze sprzętem zapisane", color: "success" });
      linkEquipmentOpen.value = false;
      await refreshAll();
    }
    function rowContextItems(row) {
      return [[
        { label: "Szczegóły ONU", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "MAC table", icon: "i-lucide-list-tree", onSelect: () => showDetails(row, row.accessMacs, "MAC table") },
        { label: "IP-host / VLAN 400", icon: "i-lucide-router", onSelect: () => showDetails(row, row.managementIpHosts, "IP-host / VLAN 400") },
        { label: "RX power", icon: "i-lucide-activity", onSelect: () => showDetails(row, { onu: row.onuIdentifier, signalRx: row.signalRx }, "RX power") },
        { label: "Transparent bridge analysis", icon: "i-lucide-link", onSelect: () => showDetails(row, row.transparentLinks, "Transparent bridge analysis") }
      ], [
        { label: "Powiąż z klientem", icon: "i-lucide-user-round-plus", onSelect: () => openCustomerLink(row) },
        { label: "Powiąż ze sprzętem szkieletowym", icon: "i-lucide-server-cog", onSelect: () => openEquipmentLink(row) }
      ], [
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refreshAll() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$6;
      const _component_UInput = _sfc_main$5;
      const _component_USelect = _sfc_main$4;
      const _component_UButton = _sfc_main$9;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      const _component_USlideover = _sfc_main$1;
      const _component_UFormField = _sfc_main$3;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-ftth-onus",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "FTTH ONU" }, {
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
                    placeholder: "Szukaj ONU",
                    class: "w-28 sm:w-56"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(statusFilter),
                    "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Aktywne", value: "ACTIVE" },
                      { label: "Nieznane", value: "UNKNOWN" },
                      { label: "Offline", value: "OFFLINE" }
                    ],
                    class: "w-28 sm:w-40"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-refresh-cw",
                    variant: "outline",
                    color: "neutral",
                    onClick: () => refreshAll()
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(query),
                      "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                      icon: "i-lucide-search",
                      placeholder: "Szukaj ONU",
                      class: "w-28 sm:w-56"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USelect, {
                      modelValue: unref(statusFilter),
                      "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                      items: [
                        { label: "Wszystkie", value: "all" },
                        { label: "Aktywne", value: "ACTIVE" },
                        { label: "Nieznane", value: "UNKNOWN" },
                        { label: "Offline", value: "OFFLINE" }
                      ],
                      class: "w-28 sm:w-40"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_UButton, {
                      icon: "i-lucide-refresh-cw",
                      variant: "outline",
                      color: "neutral",
                      onClick: () => refreshAll()
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "FTTH ONU" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: unref(query),
                    "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                    icon: "i-lucide-search",
                    placeholder: "Szukaj ONU",
                    class: "w-28 sm:w-56"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_USelect, {
                    modelValue: unref(statusFilter),
                    "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Aktywne", value: "ACTIVE" },
                      { label: "Nieznane", value: "UNKNOWN" },
                      { label: "Offline", value: "OFFLINE" }
                    ],
                    class: "w-28 sm:w-40"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-refresh-cw",
                    variant: "outline",
                    color: "neutral",
                    onClick: () => refreshAll()
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
              title: unref(detailsTitle),
              subtitle: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0,
              item: unref(detailsItem)
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_USlideover, {
              open: unref(linkCustomerOpen),
              "onUpdate:open": ($event) => isRef(linkCustomerOpen) ? linkCustomerOpen.value = $event : null,
              title: "Powiąż ONU z klientem",
              description: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Urządzenie klienta" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(customerDeviceId),
                          "onUpdate:modelValue": ($event) => isRef(customerDeviceId) ? customerDeviceId.value = $event : null,
                          items: unref(customerDeviceItems),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(customerDeviceId),
                            "onUpdate:modelValue": ($event) => isRef(customerDeviceId) ? customerDeviceId.value = $event : null,
                            items: unref(customerDeviceItems),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Zapisz powiązanie",
                    icon: "i-lucide-save",
                    onClick: saveCustomerLink
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "space-y-4" }, [
                      createVNode(_component_UFormField, { label: "Urządzenie klienta" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(customerDeviceId),
                            "onUpdate:modelValue": ($event) => isRef(customerDeviceId) ? customerDeviceId.value = $event : null,
                            items: unref(customerDeviceItems),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        label: "Zapisz powiązanie",
                        icon: "i-lucide-save",
                        onClick: saveCustomerLink
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_USlideover, {
              open: unref(linkEquipmentOpen),
              "onUpdate:open": ($event) => isRef(linkEquipmentOpen) ? linkEquipmentOpen.value = $event : null,
              title: "Powiąż ONU ze sprzętem",
              description: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Sprzęt szkieletowy / CPE" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(networkEquipmentId),
                          "onUpdate:modelValue": ($event) => isRef(networkEquipmentId) ? networkEquipmentId.value = $event : null,
                          items: unref(equipmentItems),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(networkEquipmentId),
                            "onUpdate:modelValue": ($event) => isRef(networkEquipmentId) ? networkEquipmentId.value = $event : null,
                            items: unref(equipmentItems),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Zapisz powiązanie",
                    icon: "i-lucide-save",
                    onClick: saveEquipmentLink
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "space-y-4" }, [
                      createVNode(_component_UFormField, { label: "Sprzęt szkieletowy / CPE" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(networkEquipmentId),
                            "onUpdate:modelValue": ($event) => isRef(networkEquipmentId) ? networkEquipmentId.value = $event : null,
                            items: unref(equipmentItems),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        label: "Zapisz powiązanie",
                        icon: "i-lucide-save",
                        onClick: saveEquipmentLink
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
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
                title: unref(detailsTitle),
                subtitle: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0,
                item: unref(detailsItem)
              }, null, 8, ["open", "onUpdate:open", "title", "subtitle", "item"]),
              createVNode(_component_USlideover, {
                open: unref(linkCustomerOpen),
                "onUpdate:open": ($event) => isRef(linkCustomerOpen) ? linkCustomerOpen.value = $event : null,
                title: "Powiąż ONU z klientem",
                description: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0
              }, {
                body: withCtx(() => [
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode(_component_UFormField, { label: "Urządzenie klienta" }, {
                      default: withCtx(() => [
                        createVNode(_component_USelect, {
                          modelValue: unref(customerDeviceId),
                          "onUpdate:modelValue": ($event) => isRef(customerDeviceId) ? customerDeviceId.value = $event : null,
                          items: unref(customerDeviceItems),
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UButton, {
                      label: "Zapisz powiązanie",
                      icon: "i-lucide-save",
                      onClick: saveCustomerLink
                    })
                  ])
                ]),
                _: 1
              }, 8, ["open", "onUpdate:open", "description"]),
              createVNode(_component_USlideover, {
                open: unref(linkEquipmentOpen),
                "onUpdate:open": ($event) => isRef(linkEquipmentOpen) ? linkEquipmentOpen.value = $event : null,
                title: "Powiąż ONU ze sprzętem",
                description: unref(selectedRow) ? `${unref(selectedRow).oltInventoryId} ${unref(selectedRow).ponPortCode}/${unref(selectedRow).onuIdentifier}` : void 0
              }, {
                body: withCtx(() => [
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode(_component_UFormField, { label: "Sprzęt szkieletowy / CPE" }, {
                      default: withCtx(() => [
                        createVNode(_component_USelect, {
                          modelValue: unref(networkEquipmentId),
                          "onUpdate:modelValue": ($event) => isRef(networkEquipmentId) ? networkEquipmentId.value = $event : null,
                          items: unref(equipmentItems),
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UButton, {
                      label: "Zapisz powiązanie",
                      icon: "i-lucide-save",
                      onClick: saveEquipmentLink
                    })
                  ])
                ]),
                _: 1
              }, 8, ["open", "onUpdate:open", "description"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/ftth/onus.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
