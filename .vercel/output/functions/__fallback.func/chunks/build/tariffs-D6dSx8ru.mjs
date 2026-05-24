import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$c } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$4 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$5 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$6 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$7 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$8 } from './InputNumber-C_3Tnd-3.mjs';
import { _ as _sfc_main$a } from './Textarea-C69jS_Io.mjs';
import { _ as _sfc_main$b } from './Switch-BjjnqNfE.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, unref, isRef, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import * as z from 'zod';
import { u as useFetch } from './fetch-B7i171gV.mjs';
import './DashboardSidebarToggle-C_vEEhTE.mjs';
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
import '@iconify/utils';
import 'consola';
import './ssr-BO1H6xpe.mjs';
import './PopperArrow-CvIo2SqJ.mjs';
import './useFormControl-IzN_Be5X.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
import './overlay-CjyBzL1C.mjs';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './RovingFocusGroup-ByIEls-F.mjs';
import './VisuallyHiddenInput-Cbbw7kMc.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tariffs",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const open = ref(false);
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const editingTariffId = ref(null);
    const query = ref("");
    const typeFilter = ref("all");
    const schema = z.object({
      name: z.string().min(1),
      serviceType: z.enum(["internet", "iptv", "voip", "other"]),
      defaultNetPrice: z.number().min(0),
      vatRate: z.number().min(0).max(100),
      downloadMbps: z.number().int().positive().nullable().optional(),
      uploadMbps: z.number().int().positive().nullable().optional(),
      queueName: z.string().optional(),
      iptvPackageCode: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean()
    });
    const state = reactive({ serviceType: "internet", defaultNetPrice: 0, vatRate: 23, isActive: true });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/billing/tariffs",
      {
        default: () => ({ success: false, data: [] })
      },
      "$uCIDDQHbIJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.name, row.serviceType, row.queueName, row.iptvPackageCode].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query.value || text.includes(query.value.toLowerCase());
      const matchesType = typeFilter.value === "all" || row.serviceType === typeFilter.value;
      return matchesQuery && matchesType;
    }));
    const columns = [
      { accessorKey: "name", header: "Taryfa" },
      { accessorKey: "serviceType", header: "Typ" },
      {
        id: "speed",
        header: "Parametry",
        cell: ({ row }) => row.original.serviceType === "internet" ? `${row.original.downloadMbps || 0}/${row.original.uploadMbps || 0} Mb/s` : row.original.iptvPackageCode || row.original.queueName || "Brak"
      },
      { accessorKey: "defaultNetPrice", header: "Cena netto" },
      { accessorKey: "vatRate", header: "VAT %" },
      { accessorKey: "isActive", header: "Aktywna" }
    ];
    function resetForm() {
      editingTariffId.value = null;
      selectedRow.value = null;
      Object.assign(state, {
        name: void 0,
        serviceType: "internet",
        defaultNetPrice: 0,
        vatRate: 23,
        downloadMbps: void 0,
        uploadMbps: void 0,
        queueName: void 0,
        iptvPackageCode: void 0,
        description: void 0,
        isActive: true
      });
    }
    function openCreate() {
      resetForm();
      open.value = true;
    }
    function openEdit(row) {
      selectedRow.value = row;
      editingTariffId.value = row.id;
      Object.assign(state, {
        name: row.name,
        serviceType: row.serviceType,
        defaultNetPrice: Number(row.defaultNetPrice),
        vatRate: Number(row.vatRate),
        downloadMbps: row.downloadMbps ?? void 0,
        uploadMbps: row.uploadMbps ?? void 0,
        queueName: row.queueName || void 0,
        iptvPackageCode: row.iptvPackageCode || void 0,
        description: row.description || void 0,
        isActive: row.isActive
      });
      open.value = true;
    }
    async function onSubmit(event) {
      await $fetch(editingTariffId.value ? `/api/billing/tariffs/${editingTariffId.value}` : "/api/billing/tariffs", {
        method: editingTariffId.value ? "PATCH" : "POST",
        body: event.data
      });
      toast.add({ title: "Taryfa zapisana", color: "success" });
      open.value = false;
      resetForm();
      await refresh();
    }
    async function deleteTariff(row) {
      if (!(void 0).confirm(`Usunąć taryfę ${row.name}?`)) return;
      await $fetch(`/api/billing/tariffs/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Taryfa usunięta", color: "success" });
      await refresh();
    }
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj taryfę", icon: "i-lucide-pencil", onSelect: () => openEdit(row) },
        { label: "Szczegóły taryfy", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Usuń taryfę", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteTariff(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$c;
      const _component_UInput = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_USlideover = _sfc_main$5;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$6;
      const _component_UFormField = _sfc_main$7;
      const _component_UInputNumber = _sfc_main$8;
      const _component_UTextarea = _sfc_main$a;
      const _component_USwitch = _sfc_main$b;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "billing-tariffs",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Taryfy" }, {
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
                    modelValue: unref(typeFilter),
                    "onUpdate:modelValue": ($event) => isRef(typeFilter) ? typeFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Internet", value: "internet" },
                      { label: "IPTV", value: "iptv" },
                      { label: "VoIP", value: "voip" },
                      { label: "Inne", value: "other" }
                    ],
                    class: "w-40"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingTariffId) ? "Edytuj taryfę" : "Dodaj taryfę"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(schema),
                          state: unref(state),
                          class: "space-y-4",
                          onSubmit
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Nazwa",
                                name: "name",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(state).name,
                                      "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(state).name,
                                        "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Typ",
                                name: "serviceType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).serviceType,
                                      "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                      items: ["internet", "iptv", "voip", "other"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).serviceType,
                                        "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                        items: ["internet", "iptv", "voip", "other"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Cena netto",
                                name: "defaultNetPrice"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).defaultNetPrice,
                                      "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).defaultNetPrice,
                                        "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "VAT %",
                                name: "vatRate"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).vatRate,
                                      "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).vatRate,
                                        "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Download Mb/s",
                                name: "downloadMbps"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).downloadMbps,
                                      "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).downloadMbps,
                                        "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Upload Mb/s",
                                name: "uploadMbps"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).uploadMbps,
                                      "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).uploadMbps,
                                        "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Queue",
                                name: "queueName"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(state).queueName,
                                      "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(state).queueName,
                                        "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Pakiet IPTV",
                                name: "iptvPackageCode"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(state).iptvPackageCode,
                                      "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(state).iptvPackageCode,
                                        "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Opis",
                                name: "description"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UTextarea, {
                                      modelValue: unref(state).description,
                                      "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(state).description,
                                        "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Aktywna",
                                name: "isActive"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USwitch, {
                                      modelValue: unref(state).isActive,
                                      "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USwitch, {
                                        modelValue: unref(state).isActive,
                                        "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UButton, {
                                type: "submit",
                                label: "Zapisz",
                                icon: "i-lucide-save"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_UFormField, {
                                  label: "Nazwa",
                                  name: "name",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(state).name,
                                      "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Typ",
                                  name: "serviceType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).serviceType,
                                      "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                      items: ["internet", "iptv", "voip", "other"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Cena netto",
                                    name: "defaultNetPrice"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).defaultNetPrice,
                                        "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "VAT %",
                                    name: "vatRate"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).vatRate,
                                        "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Download Mb/s",
                                    name: "downloadMbps"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).downloadMbps,
                                        "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Upload Mb/s",
                                    name: "uploadMbps"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).uploadMbps,
                                        "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Queue",
                                  name: "queueName"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(state).queueName,
                                      "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Pakiet IPTV",
                                  name: "iptvPackageCode"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(state).iptvPackageCode,
                                      "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Opis",
                                  name: "description"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(state).description,
                                      "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Aktywna",
                                  name: "isActive"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USwitch, {
                                      modelValue: unref(state).isActive,
                                      "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UButton, {
                                  type: "submit",
                                  label: "Zapisz",
                                  icon: "i-lucide-save"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UForm, {
                            schema: unref(schema),
                            state: unref(state),
                            class: "space-y-4",
                            onSubmit
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "Nazwa",
                                name: "name",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(state).name,
                                    "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Typ",
                                name: "serviceType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).serviceType,
                                    "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                    items: ["internet", "iptv", "voip", "other"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Cena netto",
                                  name: "defaultNetPrice"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).defaultNetPrice,
                                      "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "VAT %",
                                  name: "vatRate"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).vatRate,
                                      "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Download Mb/s",
                                  name: "downloadMbps"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).downloadMbps,
                                      "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Upload Mb/s",
                                  name: "uploadMbps"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).uploadMbps,
                                      "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Queue",
                                name: "queueName"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(state).queueName,
                                    "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Pakiet IPTV",
                                name: "iptvPackageCode"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(state).iptvPackageCode,
                                    "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Opis",
                                name: "description"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(state).description,
                                    "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Aktywna",
                                name: "isActive"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USwitch, {
                                    modelValue: unref(state).isActive,
                                    "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UButton, {
                                type: "submit",
                                label: "Zapisz",
                                icon: "i-lucide-save"
                              })
                            ]),
                            _: 1
                          }, 8, ["schema", "state"])
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UButton, {
                          label: "Dodaj taryfę",
                          icon: "i-lucide-receipt",
                          onClick: openCreate
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj taryfę",
                            icon: "i-lucide-receipt",
                            onClick: openCreate
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
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
                      modelValue: unref(typeFilter),
                      "onUpdate:modelValue": ($event) => isRef(typeFilter) ? typeFilter.value = $event : null,
                      items: [
                        { label: "Wszystkie", value: "all" },
                        { label: "Internet", value: "internet" },
                        { label: "IPTV", value: "iptv" },
                        { label: "VoIP", value: "voip" },
                        { label: "Inne", value: "other" }
                      ],
                      class: "w-40"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USlideover, {
                      open: unref(open),
                      "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                      title: unref(editingTariffId) ? "Edytuj taryfę" : "Dodaj taryfę"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(schema),
                          state: unref(state),
                          class: "space-y-4",
                          onSubmit
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "Nazwa",
                              name: "name",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).name,
                                  "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Typ",
                              name: "serviceType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).serviceType,
                                  "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                  items: ["internet", "iptv", "voip", "other"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Cena netto",
                                name: "defaultNetPrice"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).defaultNetPrice,
                                    "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "VAT %",
                                name: "vatRate"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).vatRate,
                                    "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Download Mb/s",
                                name: "downloadMbps"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).downloadMbps,
                                    "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Upload Mb/s",
                                name: "uploadMbps"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).uploadMbps,
                                    "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Queue",
                              name: "queueName"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).queueName,
                                  "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Pakiet IPTV",
                              name: "iptvPackageCode"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).iptvPackageCode,
                                  "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Opis",
                              name: "description"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(state).description,
                                  "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Aktywna",
                              name: "isActive"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(state).isActive,
                                  "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UButton, {
                              type: "submit",
                              label: "Zapisz",
                              icon: "i-lucide-save"
                            })
                          ]),
                          _: 1
                        }, 8, ["schema", "state"])
                      ]),
                      default: withCtx(() => [
                        createVNode(_component_UButton, {
                          label: "Dodaj taryfę",
                          icon: "i-lucide-receipt",
                          onClick: openCreate
                        })
                      ]),
                      _: 1
                    }, 8, ["open", "onUpdate:open", "title"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Taryfy" }, {
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
                    modelValue: unref(typeFilter),
                    "onUpdate:modelValue": ($event) => isRef(typeFilter) ? typeFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Internet", value: "internet" },
                      { label: "IPTV", value: "iptv" },
                      { label: "VoIP", value: "voip" },
                      { label: "Inne", value: "other" }
                    ],
                    class: "w-40"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingTariffId) ? "Edytuj taryfę" : "Dodaj taryfę"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(schema),
                        state: unref(state),
                        class: "space-y-4",
                        onSubmit
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "Nazwa",
                            name: "name",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).name,
                                "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Typ",
                            name: "serviceType"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).serviceType,
                                "onUpdate:modelValue": ($event) => unref(state).serviceType = $event,
                                items: ["internet", "iptv", "voip", "other"],
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Cena netto",
                              name: "defaultNetPrice"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).defaultNetPrice,
                                  "onUpdate:modelValue": ($event) => unref(state).defaultNetPrice = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "VAT %",
                              name: "vatRate"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).vatRate,
                                  "onUpdate:modelValue": ($event) => unref(state).vatRate = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Download Mb/s",
                              name: "downloadMbps"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).downloadMbps,
                                  "onUpdate:modelValue": ($event) => unref(state).downloadMbps = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Upload Mb/s",
                              name: "uploadMbps"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).uploadMbps,
                                  "onUpdate:modelValue": ($event) => unref(state).uploadMbps = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "Queue",
                            name: "queueName"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).queueName,
                                "onUpdate:modelValue": ($event) => unref(state).queueName = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Pakiet IPTV",
                            name: "iptvPackageCode"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).iptvPackageCode,
                                "onUpdate:modelValue": ($event) => unref(state).iptvPackageCode = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Opis",
                            name: "description"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(state).description,
                                "onUpdate:modelValue": ($event) => unref(state).description = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Aktywna",
                            name: "isActive"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USwitch, {
                                modelValue: unref(state).isActive,
                                "onUpdate:modelValue": ($event) => unref(state).isActive = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UButton, {
                            type: "submit",
                            label: "Zapisz",
                            icon: "i-lucide-save"
                          })
                        ]),
                        _: 1
                      }, 8, ["schema", "state"])
                    ]),
                    default: withCtx(() => [
                      createVNode(_component_UButton, {
                        label: "Dodaj taryfę",
                        icon: "i-lucide-receipt",
                        onClick: openCreate
                      })
                    ]),
                    _: 1
                  }, 8, ["open", "onUpdate:open", "title"])
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
              title: "Szczegóły taryfy",
              subtitle: unref(selectedRow)?.name,
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
                title: "Szczegóły taryfy",
                subtitle: unref(selectedRow)?.name,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/billing/tariffs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
