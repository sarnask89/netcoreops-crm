import { _ as _sfc_main$2, a as _sfc_main$1$1, b as _sfc_main$a } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$4 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$5 } from './Select-N__9sMNx.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as _sfc_main$1 } from './Slideover-DjbGE3Jt.mjs';
import { _ as __nuxt_component_10 } from './AppDiagnosticResult-CoGySpM6.mjs';
import { _ as _sfc_main$3 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$6 } from './Modal-CNftcmQ6.mjs';
import { _ as _sfc_main$7 } from './Alert-C2QsFOV3.mjs';
import { _ as _sfc_main$8 } from './Textarea-C69jS_Io.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, unref, isRef, openBlock, createBlock, createVNode, toDisplayString, useSSRContext } from 'vue';
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
import './Badge-CElKKp_G.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "customer-devices",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const selectedDevice = ref(null);
    const diagnostic = ref(null);
    const loadingAction = ref("");
    const diagnosticOpen = ref(false);
    const query = ref("");
    const issueFilter = ref("all");
    const editOpen = ref(false);
    const archiveOpen = ref(false);
    const archiveReason = ref("");
    const editState = reactive({});
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/customer-devices",
      {
        default: () => ({ success: false, data: [] })
      },
      "$t96j--XlOS"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const columns = [
      { accessorKey: "customer.fullName", header: "Klient" },
      { accessorKey: "hostname", header: "Hostname" },
      { accessorKey: "ipAddress", header: "IP" },
      { accessorKey: "macAddress", header: "MAC" },
      { accessorKey: "equipment.inventoryId", header: "Router/OLT" },
      { accessorKey: "onuEquipment.inventoryId", header: "ONU" },
      {
        id: "subscriptions",
        header: "Subskrypcje",
        cell: ({ row }) => row.original.subscriptions?.map((item) => item.tariff.name).join(", ") || "Brak"
      },
      { accessorKey: "status", header: "Status" },
      {
        id: "importIssues",
        header: "Braki",
        cell: ({ row }) => row.original.importIssues?.length ? row.original.importIssues.join(", ") : "Brak"
      }
    ];
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.customer.fullName, row.hostname, row.ipAddress, row.macAddress, row.status].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query.value || text.includes(query.value.toLowerCase());
      const matchesIssues = issueFilter.value === "all" || Boolean(row.importIssues?.length);
      return matchesQuery && matchesIssues;
    }));
    async function runAction(action) {
      if (!selectedDevice.value) return;
      loadingAction.value = action;
      try {
        diagnostic.value = await $fetch(`/api/diagnostics/customer-devices/${selectedDevice.value.id}/${action}`, { method: "POST" });
      } catch (error) {
        toast.add({ title: "Diagnostyka nie powiodła się", description: error instanceof Error ? error.message : String(error), color: "error" });
      } finally {
        loadingAction.value = "";
      }
    }
    function openDiagnostics(row, action) {
      selectedDevice.value = row;
      diagnostic.value = null;
      diagnosticOpen.value = true;
      if (action) void runAction(action);
    }
    function openEdit(row) {
      selectedDevice.value = row;
      Object.assign(editState, {
        hostname: row.hostname,
        ipAddress: row.ipAddress || void 0,
        macAddress: row.macAddress || void 0,
        status: row.status
      });
      editOpen.value = true;
    }
    async function saveDevice() {
      if (!selectedDevice.value) return;
      await $fetch(`/api/crm/customer-devices/${selectedDevice.value.id}`, {
        method: "PATCH",
        body: editState
      });
      toast.add({ title: "Urządzenie zapisane", color: "success" });
      editOpen.value = false;
      await refresh();
    }
    function openArchive(row) {
      selectedDevice.value = row;
      archiveReason.value = "";
      archiveOpen.value = true;
    }
    async function archiveDevice() {
      if (!selectedDevice.value) return;
      await $fetch(`/api/crm/customer-devices/${selectedDevice.value.id}`, {
        method: "DELETE",
        body: { archiveReason: archiveReason.value || null }
      });
      toast.add({ title: "Urządzenie zarchiwizowane", color: "success" });
      archiveOpen.value = false;
      await refresh();
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj", icon: "i-lucide-pencil", onSelect: () => openEdit(row) },
        { label: "Panel diagnostyczny", icon: "i-lucide-activity", onSelect: () => openDiagnostics(row) },
        { label: "Ping / ARP / DHCP", icon: "i-lucide-radar", onSelect: () => openDiagnostics(row, "check") },
        { label: "OLT lookup", icon: "i-lucide-git-branch", onSelect: () => openDiagnostics(row, "olt-lookup") },
        { label: "Sync lease", icon: "i-lucide-refresh-cw", onSelect: () => openDiagnostics(row, "sync-lease") }
      ], [
        { label: "Archiwizuj", icon: "i-lucide-archive", color: "error", onSelect: () => openArchive(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$a;
      const _component_UInput = _sfc_main$4;
      const _component_USelect = _sfc_main$5;
      const _component_UButton = _sfc_main$9;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_USlideover = _sfc_main$1;
      const _component_AppDiagnosticResult = __nuxt_component_10;
      const _component_UFormField = _sfc_main$3;
      const _component_UModal = _sfc_main$6;
      const _component_UAlert = _sfc_main$7;
      const _component_UTextarea = _sfc_main$8;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "crm-customer-devices",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Urządzenia klienta" }, {
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
                    placeholder: "Szukaj",
                    class: "w-56"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(issueFilter),
                    "onUpdate:modelValue": ($event) => isRef(issueFilter) ? issueFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Tylko z brakami", value: "issues" }
                    ],
                    class: "w-44"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Odśwież",
                    icon: "i-lucide-refresh-cw",
                    variant: "subtle",
                    onClick: ($event) => unref(refresh)()
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(query),
                      "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                      icon: "i-lucide-search",
                      placeholder: "Szukaj",
                      class: "w-56"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USelect, {
                      modelValue: unref(issueFilter),
                      "onUpdate:modelValue": ($event) => isRef(issueFilter) ? issueFilter.value = $event : null,
                      items: [
                        { label: "Wszystkie", value: "all" },
                        { label: "Tylko z brakami", value: "issues" }
                      ],
                      class: "w-44"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
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
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Urządzenia klienta" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: unref(query),
                    "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
                    icon: "i-lucide-search",
                    placeholder: "Szukaj",
                    class: "w-56"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_USelect, {
                    modelValue: unref(issueFilter),
                    "onUpdate:modelValue": ($event) => isRef(issueFilter) ? issueFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Tylko z brakami", value: "issues" }
                    ],
                    class: "w-44"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_UButton, {
                    label: "Odśwież",
                    icon: "i-lucide-refresh-cw",
                    variant: "subtle",
                    onClick: ($event) => unref(refresh)()
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
            _push2(ssrRenderComponent(_component_USlideover, {
              open: unref(diagnosticOpen),
              "onUpdate:open": ($event) => isRef(diagnosticOpen) ? diagnosticOpen.value = $event : null,
              title: "Panel diagnostyczny",
              description: unref(selectedDevice)?.hostname
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (unref(selectedDevice)) {
                    _push3(`<div class="space-y-4"${_scopeId2}><div class="text-sm text-muted"${_scopeId2}>${ssrInterpolate(unref(selectedDevice).hostname)} / ${ssrInterpolate(unref(selectedDevice).ipAddress || unref(selectedDevice).macAddress)}</div><div class="flex flex-wrap gap-2"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UButton, {
                      size: "xs",
                      label: "Ping/ARP/DHCP",
                      icon: "i-lucide-radar",
                      loading: unref(loadingAction) === "check",
                      onClick: ($event) => runAction("check")
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UButton, {
                      size: "xs",
                      label: "OLT lookup",
                      icon: "i-lucide-git-branch",
                      variant: "subtle",
                      loading: unref(loadingAction) === "olt-lookup",
                      onClick: ($event) => runAction("olt-lookup")
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UButton, {
                      size: "xs",
                      label: "Sync lease",
                      icon: "i-lucide-refresh-cw",
                      variant: "subtle",
                      loading: unref(loadingAction) === "sync-lease",
                      onClick: ($event) => runAction("sync-lease")
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                    _push3(ssrRenderComponent(_component_AppDiagnosticResult, { result: unref(diagnostic) }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    _push3(`<div class="text-sm text-muted"${_scopeId2}> Wybierz urządzenie z tabeli. </div>`);
                  }
                } else {
                  return [
                    unref(selectedDevice) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "space-y-4"
                    }, [
                      createVNode("div", { class: "text-sm text-muted" }, toDisplayString(unref(selectedDevice).hostname) + " / " + toDisplayString(unref(selectedDevice).ipAddress || unref(selectedDevice).macAddress), 1),
                      createVNode("div", { class: "flex flex-wrap gap-2" }, [
                        createVNode(_component_UButton, {
                          size: "xs",
                          label: "Ping/ARP/DHCP",
                          icon: "i-lucide-radar",
                          loading: unref(loadingAction) === "check",
                          onClick: ($event) => runAction("check")
                        }, null, 8, ["loading", "onClick"]),
                        createVNode(_component_UButton, {
                          size: "xs",
                          label: "OLT lookup",
                          icon: "i-lucide-git-branch",
                          variant: "subtle",
                          loading: unref(loadingAction) === "olt-lookup",
                          onClick: ($event) => runAction("olt-lookup")
                        }, null, 8, ["loading", "onClick"]),
                        createVNode(_component_UButton, {
                          size: "xs",
                          label: "Sync lease",
                          icon: "i-lucide-refresh-cw",
                          variant: "subtle",
                          loading: unref(loadingAction) === "sync-lease",
                          onClick: ($event) => runAction("sync-lease")
                        }, null, 8, ["loading", "onClick"])
                      ]),
                      createVNode(_component_AppDiagnosticResult, { result: unref(diagnostic) }, null, 8, ["result"])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-sm text-muted"
                    }, " Wybierz urządzenie z tabeli. "))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_USlideover, {
              open: unref(editOpen),
              "onUpdate:open": ($event) => isRef(editOpen) ? editOpen.value = $event : null,
              title: "Edytuj urządzenie klienta",
              description: unref(selectedDevice)?.customer.fullName
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Hostname" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(editState).hostname,
                          "onUpdate:modelValue": ($event) => unref(editState).hostname = $event,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).hostname,
                            "onUpdate:modelValue": ($event) => unref(editState).hostname = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "IP" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(editState).ipAddress,
                          "onUpdate:modelValue": ($event) => unref(editState).ipAddress = $event,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).ipAddress,
                            "onUpdate:modelValue": ($event) => unref(editState).ipAddress = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "MAC" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(editState).macAddress,
                          "onUpdate:modelValue": ($event) => unref(editState).macAddress = $event,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).macAddress,
                            "onUpdate:modelValue": ($event) => unref(editState).macAddress = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Status" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(editState).status,
                          "onUpdate:modelValue": ($event) => unref(editState).status = $event,
                          items: ["ACTIVE", "INACTIVE", "BLOCKED"],
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(editState).status,
                            "onUpdate:modelValue": ($event) => unref(editState).status = $event,
                            items: ["ACTIVE", "INACTIVE", "BLOCKED"],
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Zapisz",
                    icon: "i-lucide-save",
                    onClick: saveDevice
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "space-y-4" }, [
                      createVNode(_component_UFormField, { label: "Hostname" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).hostname,
                            "onUpdate:modelValue": ($event) => unref(editState).hostname = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "IP" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).ipAddress,
                            "onUpdate:modelValue": ($event) => unref(editState).ipAddress = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "MAC" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(editState).macAddress,
                            "onUpdate:modelValue": ($event) => unref(editState).macAddress = $event,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Status" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(editState).status,
                            "onUpdate:modelValue": ($event) => unref(editState).status = $event,
                            items: ["ACTIVE", "INACTIVE", "BLOCKED"],
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        label: "Zapisz",
                        icon: "i-lucide-save",
                        onClick: saveDevice
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UModal, {
              open: unref(archiveOpen),
              "onUpdate:open": ($event) => isRef(archiveOpen) ? archiveOpen.value = $event : null,
              title: "Archiwizuj urządzenie"
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UAlert, {
                    color: "warning",
                    variant: "subtle",
                    title: "Rekord zostanie ukryty z listy domyślnej."
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UTextarea, {
                    modelValue: unref(archiveReason),
                    "onUpdate:modelValue": ($event) => isRef(archiveReason) ? archiveReason.value = $event : null,
                    placeholder: "Powód archiwizacji",
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "space-y-4" }, [
                      createVNode(_component_UAlert, {
                        color: "warning",
                        variant: "subtle",
                        title: "Rekord zostanie ukryty z listy domyślnej."
                      }),
                      createVNode(_component_UTextarea, {
                        modelValue: unref(archiveReason),
                        "onUpdate:modelValue": ($event) => isRef(archiveReason) ? archiveReason.value = $event : null,
                        placeholder: "Powód archiwizacji",
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ])
                  ];
                }
              }),
              footer: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Anuluj",
                    color: "neutral",
                    variant: "subtle",
                    onClick: ($event) => archiveOpen.value = false
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    label: "Archiwizuj",
                    color: "error",
                    icon: "i-lucide-archive",
                    onClick: archiveDevice
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      label: "Anuluj",
                      color: "neutral",
                      variant: "subtle",
                      onClick: ($event) => archiveOpen.value = false
                    }, null, 8, ["onClick"]),
                    createVNode(_component_UButton, {
                      label: "Archiwizuj",
                      color: "error",
                      icon: "i-lucide-archive",
                      onClick: archiveDevice
                    })
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
              createVNode(_component_USlideover, {
                open: unref(diagnosticOpen),
                "onUpdate:open": ($event) => isRef(diagnosticOpen) ? diagnosticOpen.value = $event : null,
                title: "Panel diagnostyczny",
                description: unref(selectedDevice)?.hostname
              }, {
                body: withCtx(() => [
                  unref(selectedDevice) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-4"
                  }, [
                    createVNode("div", { class: "text-sm text-muted" }, toDisplayString(unref(selectedDevice).hostname) + " / " + toDisplayString(unref(selectedDevice).ipAddress || unref(selectedDevice).macAddress), 1),
                    createVNode("div", { class: "flex flex-wrap gap-2" }, [
                      createVNode(_component_UButton, {
                        size: "xs",
                        label: "Ping/ARP/DHCP",
                        icon: "i-lucide-radar",
                        loading: unref(loadingAction) === "check",
                        onClick: ($event) => runAction("check")
                      }, null, 8, ["loading", "onClick"]),
                      createVNode(_component_UButton, {
                        size: "xs",
                        label: "OLT lookup",
                        icon: "i-lucide-git-branch",
                        variant: "subtle",
                        loading: unref(loadingAction) === "olt-lookup",
                        onClick: ($event) => runAction("olt-lookup")
                      }, null, 8, ["loading", "onClick"]),
                      createVNode(_component_UButton, {
                        size: "xs",
                        label: "Sync lease",
                        icon: "i-lucide-refresh-cw",
                        variant: "subtle",
                        loading: unref(loadingAction) === "sync-lease",
                        onClick: ($event) => runAction("sync-lease")
                      }, null, 8, ["loading", "onClick"])
                    ]),
                    createVNode(_component_AppDiagnosticResult, { result: unref(diagnostic) }, null, 8, ["result"])
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-sm text-muted"
                  }, " Wybierz urządzenie z tabeli. "))
                ]),
                _: 1
              }, 8, ["open", "onUpdate:open", "description"]),
              createVNode(_component_USlideover, {
                open: unref(editOpen),
                "onUpdate:open": ($event) => isRef(editOpen) ? editOpen.value = $event : null,
                title: "Edytuj urządzenie klienta",
                description: unref(selectedDevice)?.customer.fullName
              }, {
                body: withCtx(() => [
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode(_component_UFormField, { label: "Hostname" }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(editState).hostname,
                          "onUpdate:modelValue": ($event) => unref(editState).hostname = $event,
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, { label: "IP" }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(editState).ipAddress,
                          "onUpdate:modelValue": ($event) => unref(editState).ipAddress = $event,
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, { label: "MAC" }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(editState).macAddress,
                          "onUpdate:modelValue": ($event) => unref(editState).macAddress = $event,
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, { label: "Status" }, {
                      default: withCtx(() => [
                        createVNode(_component_USelect, {
                          modelValue: unref(editState).status,
                          "onUpdate:modelValue": ($event) => unref(editState).status = $event,
                          items: ["ACTIVE", "INACTIVE", "BLOCKED"],
                          class: "w-full"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UButton, {
                      label: "Zapisz",
                      icon: "i-lucide-save",
                      onClick: saveDevice
                    })
                  ])
                ]),
                _: 1
              }, 8, ["open", "onUpdate:open", "description"]),
              createVNode(_component_UModal, {
                open: unref(archiveOpen),
                "onUpdate:open": ($event) => isRef(archiveOpen) ? archiveOpen.value = $event : null,
                title: "Archiwizuj urządzenie"
              }, {
                body: withCtx(() => [
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode(_component_UAlert, {
                      color: "warning",
                      variant: "subtle",
                      title: "Rekord zostanie ukryty z listy domyślnej."
                    }),
                    createVNode(_component_UTextarea, {
                      modelValue: unref(archiveReason),
                      "onUpdate:modelValue": ($event) => isRef(archiveReason) ? archiveReason.value = $event : null,
                      placeholder: "Powód archiwizacji",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ])
                ]),
                footer: withCtx(() => [
                  createVNode(_component_UButton, {
                    label: "Anuluj",
                    color: "neutral",
                    variant: "subtle",
                    onClick: ($event) => archiveOpen.value = false
                  }, null, 8, ["onClick"]),
                  createVNode(_component_UButton, {
                    label: "Archiwizuj",
                    color: "error",
                    icon: "i-lucide-archive",
                    onClick: archiveDevice
                  })
                ]),
                _: 1
              }, 8, ["open", "onUpdate:open"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/customer-devices.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
