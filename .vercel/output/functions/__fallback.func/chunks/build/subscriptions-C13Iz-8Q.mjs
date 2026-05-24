import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$b } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$4 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$5 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$6 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$7 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$8 } from './InputNumber-C_3Tnd-3.mjs';
import { _ as _sfc_main$a } from './Textarea-C69jS_Io.mjs';
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
  __name: "subscriptions",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const open = ref(false);
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const editingSubscriptionId = ref(null);
    const query = ref("");
    const statusFilter = ref("all");
    const schema = z.object({
      customerId: z.string().uuid(),
      customerDeviceId: z.string().uuid().nullable().optional(),
      tariffId: z.number().int().positive(),
      status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]),
      billingPeriod: z.enum(["monthly", "quarterly", "yearly"]),
      priceOverrideNet: z.number().min(0).nullable().optional(),
      discountPercent: z.number().min(0).max(100),
      activationFee: z.number().min(0),
      notes: z.string().optional()
    });
    const state = reactive({ status: "ACTIVE", billingPeriod: "monthly", discountPercent: 0, activationFee: 0 });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/billing/subscriptions",
      {
        default: () => ({ success: false, data: [] })
      },
      "$_KFgyGgkOv"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { customers: [], customerDevices: [], tariffs: [] } })
      },
      "$4hYu0AckH6"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customerItems = computed(() => options.value.data.customers.map((item) => ({ label: item.fullName, value: item.id })));
    const deviceItems = computed(() => [{ label: "Bez urządzenia", value: null }, ...options.value.data.customerDevices.map((item) => ({ label: item.hostname, value: item.id }))]);
    const tariffItems = computed(() => options.value.data.tariffs.map((item) => ({ label: `${item.name} (${item.defaultNetPrice} netto)`, value: item.id })));
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.customer.fullName, row.customerDevice?.hostname, row.customerDevice?.ipAddress, row.tariff.name, row.status].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query.value || text.includes(query.value.toLowerCase());
      const matchesStatus = statusFilter.value === "all" || row.status === statusFilter.value;
      return matchesQuery && matchesStatus;
    }));
    const columns = [
      { accessorKey: "customer.fullName", header: "Klient" },
      { accessorKey: "customerDevice.hostname", header: "Urządzenie" },
      { accessorKey: "tariff.name", header: "Taryfa" },
      { accessorKey: "status", header: "Status" },
      {
        id: "price",
        header: "Cena netto",
        cell: ({ row }) => row.original.priceOverrideNet || row.original.tariff.defaultNetPrice
      }
    ];
    async function onSubmit(event) {
      await $fetch(editingSubscriptionId.value ? `/api/billing/subscriptions/${editingSubscriptionId.value}` : "/api/billing/subscriptions", {
        method: editingSubscriptionId.value ? "PATCH" : "POST",
        body: event.data
      });
      toast.add({ title: "Subskrypcja zapisana", color: "success" });
      open.value = false;
      resetForm();
      await refresh();
    }
    function resetForm() {
      editingSubscriptionId.value = null;
      selectedRow.value = null;
      Object.assign(state, {
        customerId: void 0,
        customerDeviceId: null,
        tariffId: void 0,
        status: "ACTIVE",
        billingPeriod: "monthly",
        priceOverrideNet: void 0,
        discountPercent: 0,
        activationFee: 0,
        notes: void 0
      });
    }
    function openCreate() {
      resetForm();
      open.value = true;
    }
    function openEdit(row) {
      selectedRow.value = row;
      editingSubscriptionId.value = row.id;
      Object.assign(state, {
        customerId: row.customer.id,
        customerDeviceId: row.customerDevice?.id || null,
        tariffId: row.tariff.id,
        status: row.status,
        billingPeriod: row.billingPeriod,
        priceOverrideNet: row.priceOverrideNet == null ? void 0 : Number(row.priceOverrideNet),
        discountPercent: row.discountPercent == null ? 0 : Number(row.discountPercent),
        activationFee: row.activationFee == null ? 0 : Number(row.activationFee),
        notes: row.notes || void 0
      });
      open.value = true;
    }
    async function deleteSubscription(row) {
      if (!(void 0).confirm(`Usunąć subskrypcję ${row.customer.fullName} / ${row.tariff.name}?`)) return;
      await $fetch(`/api/billing/subscriptions/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Subskrypcja usunięta", color: "success" });
      await refresh();
    }
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj subskrypcję", icon: "i-lucide-pencil", onSelect: () => openEdit(row) },
        { label: "Szczegóły subskrypcji", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Usuń subskrypcję", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteSubscription(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$b;
      const _component_UInput = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_USlideover = _sfc_main$5;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$6;
      const _component_UFormField = _sfc_main$7;
      const _component_UInputNumber = _sfc_main$8;
      const _component_UTextarea = _sfc_main$a;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "billing-subscriptions",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Subskrypcje" }, {
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
                    modelValue: unref(statusFilter),
                    "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Aktywne", value: "ACTIVE" },
                      { label: "Wstrzymane", value: "SUSPENDED" },
                      { label: "Zakończone", value: "TERMINATED" }
                    ],
                    class: "w-44"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingSubscriptionId) ? "Edytuj subskrypcję" : "Dodaj subskrypcję"
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
                                label: "Klient",
                                name: "customerId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).customerId,
                                      "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                      items: unref(customerItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).customerId,
                                        "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                        items: unref(customerItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Urządzenie klienta",
                                name: "customerDeviceId"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).customerDeviceId,
                                      "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                      items: unref(deviceItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).customerDeviceId,
                                        "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                        items: unref(deviceItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Taryfa",
                                name: "tariffId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).tariffId,
                                      "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                      items: unref(tariffItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).tariffId,
                                        "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                        items: unref(tariffItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Cena ręczna netto",
                                name: "priceOverrideNet"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).priceOverrideNet,
                                      "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).priceOverrideNet,
                                        "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Rabat %",
                                name: "discountPercent"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).discountPercent,
                                      "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).discountPercent,
                                        "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Opłata aktywacyjna",
                                name: "activationFee"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(state).activationFee,
                                      "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).activationFee,
                                        "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Okres",
                                name: "billingPeriod"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).billingPeriod,
                                      "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                      items: ["monthly", "quarterly", "yearly"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).billingPeriod,
                                        "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                        items: ["monthly", "quarterly", "yearly"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Status",
                                name: "status"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).status,
                                      "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                      items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).status,
                                        "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                        items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Notatki",
                                name: "notes"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UTextarea, {
                                      modelValue: unref(state).notes,
                                      "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(state).notes,
                                        "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                        class: "w-full"
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
                                  label: "Klient",
                                  name: "customerId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).customerId,
                                      "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                      items: unref(customerItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Urządzenie klienta",
                                  name: "customerDeviceId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).customerDeviceId,
                                      "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                      items: unref(deviceItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Taryfa",
                                  name: "tariffId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).tariffId,
                                      "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                      items: unref(tariffItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Cena ręczna netto",
                                    name: "priceOverrideNet"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).priceOverrideNet,
                                        "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Rabat %",
                                    name: "discountPercent"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).discountPercent,
                                        "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Opłata aktywacyjna",
                                    name: "activationFee"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(state).activationFee,
                                        "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Okres",
                                    name: "billingPeriod"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).billingPeriod,
                                        "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                        items: ["monthly", "quarterly", "yearly"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Status",
                                  name: "status"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).status,
                                      "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                      items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Notatki",
                                  name: "notes"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(state).notes,
                                      "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                      class: "w-full"
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
                                label: "Klient",
                                name: "customerId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).customerId,
                                    "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                    items: unref(customerItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Urządzenie klienta",
                                name: "customerDeviceId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).customerDeviceId,
                                    "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                    items: unref(deviceItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Taryfa",
                                name: "tariffId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).tariffId,
                                    "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                    items: unref(tariffItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Cena ręczna netto",
                                  name: "priceOverrideNet"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).priceOverrideNet,
                                      "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Rabat %",
                                  name: "discountPercent"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).discountPercent,
                                      "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Opłata aktywacyjna",
                                  name: "activationFee"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(state).activationFee,
                                      "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Okres",
                                  name: "billingPeriod"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).billingPeriod,
                                      "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                      items: ["monthly", "quarterly", "yearly"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Status",
                                name: "status"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).status,
                                    "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                    items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Notatki",
                                name: "notes"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(state).notes,
                                    "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                    class: "w-full"
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
                          label: "Dodaj subskrypcję",
                          icon: "i-lucide-badge-dollar-sign",
                          onClick: openCreate
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj subskrypcję",
                            icon: "i-lucide-badge-dollar-sign",
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
                      modelValue: unref(statusFilter),
                      "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                      items: [
                        { label: "Wszystkie", value: "all" },
                        { label: "Aktywne", value: "ACTIVE" },
                        { label: "Wstrzymane", value: "SUSPENDED" },
                        { label: "Zakończone", value: "TERMINATED" }
                      ],
                      class: "w-44"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USlideover, {
                      open: unref(open),
                      "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                      title: unref(editingSubscriptionId) ? "Edytuj subskrypcję" : "Dodaj subskrypcję"
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
                              label: "Klient",
                              name: "customerId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).customerId,
                                  "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                  items: unref(customerItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Urządzenie klienta",
                              name: "customerDeviceId"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).customerDeviceId,
                                  "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                  items: unref(deviceItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Taryfa",
                              name: "tariffId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).tariffId,
                                  "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                  items: unref(tariffItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Cena ręczna netto",
                                name: "priceOverrideNet"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).priceOverrideNet,
                                    "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Rabat %",
                                name: "discountPercent"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).discountPercent,
                                    "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Opłata aktywacyjna",
                                name: "activationFee"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(state).activationFee,
                                    "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Okres",
                                name: "billingPeriod"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).billingPeriod,
                                    "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                    items: ["monthly", "quarterly", "yearly"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Status",
                              name: "status"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).status,
                                  "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                  items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Notatki",
                              name: "notes"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(state).notes,
                                  "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                  class: "w-full"
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
                          label: "Dodaj subskrypcję",
                          icon: "i-lucide-badge-dollar-sign",
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
              createVNode(_component_UDashboardNavbar, { title: "Subskrypcje" }, {
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
                    modelValue: unref(statusFilter),
                    "onUpdate:modelValue": ($event) => isRef(statusFilter) ? statusFilter.value = $event : null,
                    items: [
                      { label: "Wszystkie", value: "all" },
                      { label: "Aktywne", value: "ACTIVE" },
                      { label: "Wstrzymane", value: "SUSPENDED" },
                      { label: "Zakończone", value: "TERMINATED" }
                    ],
                    class: "w-44"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingSubscriptionId) ? "Edytuj subskrypcję" : "Dodaj subskrypcję"
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
                            label: "Klient",
                            name: "customerId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).customerId,
                                "onUpdate:modelValue": ($event) => unref(state).customerId = $event,
                                items: unref(customerItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Urządzenie klienta",
                            name: "customerDeviceId"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).customerDeviceId,
                                "onUpdate:modelValue": ($event) => unref(state).customerDeviceId = $event,
                                items: unref(deviceItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Taryfa",
                            name: "tariffId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).tariffId,
                                "onUpdate:modelValue": ($event) => unref(state).tariffId = $event,
                                items: unref(tariffItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Cena ręczna netto",
                              name: "priceOverrideNet"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).priceOverrideNet,
                                  "onUpdate:modelValue": ($event) => unref(state).priceOverrideNet = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Rabat %",
                              name: "discountPercent"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).discountPercent,
                                  "onUpdate:modelValue": ($event) => unref(state).discountPercent = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Opłata aktywacyjna",
                              name: "activationFee"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(state).activationFee,
                                  "onUpdate:modelValue": ($event) => unref(state).activationFee = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Okres",
                              name: "billingPeriod"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).billingPeriod,
                                  "onUpdate:modelValue": ($event) => unref(state).billingPeriod = $event,
                                  items: ["monthly", "quarterly", "yearly"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "Status",
                            name: "status"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).status,
                                "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                items: ["ACTIVE", "SUSPENDED", "TERMINATED"],
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Notatki",
                            name: "notes"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(state).notes,
                                "onUpdate:modelValue": ($event) => unref(state).notes = $event,
                                class: "w-full"
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
                        label: "Dodaj subskrypcję",
                        icon: "i-lucide-badge-dollar-sign",
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
              title: "Szczegóły subskrypcji",
              subtitle: unref(selectedRow)?.customer.fullName,
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
                title: "Szczegóły subskrypcji",
                subtitle: unref(selectedRow)?.customer.fullName,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/billing/subscriptions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
