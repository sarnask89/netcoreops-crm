import { _ as _sfc_main$2, a as _sfc_main$1$1, b as _sfc_main$b } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$5 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$6 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$7 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$8 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$a } from './FormField-D5WtVCdC.mjs';
import { _ as __nuxt_component_9, f as formatAddress } from './format-DL0Q0sjO.mjs';
import { _ as _sfc_main$4 } from './Textarea-C69jS_Io.mjs';
import { _ as _sfc_main$1 } from './Alert-C2QsFOV3.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { _ as _sfc_main$3 } from './Modal-CNftcmQ6.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, unref, isRef, createVNode, openBlock, createBlock, Fragment, useSSRContext } from 'vue';
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
import 'node:url';
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
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "customers",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const customerOpen = ref(false);
    const serviceOpen = ref(false);
    const detailsOpen = ref(false);
    const archiveOpen = ref(false);
    const selectedRow = ref(null);
    const editingCustomerId = ref(null);
    const archiveReason = ref("");
    const query = ref("");
    const issueFilter = ref("all");
    const billingAddressInput = ref("");
    const addressInput = ref("");
    const selectedBillingAddress = ref(null);
    const selectedAddress = ref(null);
    const optionalEmail = z.string().email().optional().or(z.literal(""));
    const customerSchema = z.object({
      customerType: z.enum(["INDIVIDUAL", "BUSINESS"]),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      pesel: z.string().optional(),
      identityDocumentNumber: z.string().optional(),
      companyName: z.string().optional(),
      taxId: z.string().optional(),
      regon: z.string().optional(),
      krs: z.string().optional(),
      representativeName: z.string().optional(),
      contactEmail: optionalEmail,
      contactPhone: z.string().optional(),
      billingBuildingNumber: z.string().optional(),
      billingApartmentNumber: z.string().optional(),
      billingAddress: z.string().optional()
    }).superRefine((value, ctx) => {
      if (value.customerType === "INDIVIDUAL") {
        if (!value.firstName) {
          ctx.addIssue({ code: "custom", path: ["firstName"], message: "Podaj imię" });
        }
        if (!value.lastName) {
          ctx.addIssue({ code: "custom", path: ["lastName"], message: "Podaj nazwisko" });
        }
      }
      if (value.customerType === "BUSINESS" && !value.companyName) {
        ctx.addIssue({ code: "custom", path: ["companyName"], message: "Podaj nazwę firmy" });
      }
    });
    const serviceSchema = z.object({
      customerId: z.string().uuid(),
      profileId: z.number().int().positive(),
      equipmentId: z.string().uuid().optional().nullable(),
      buildingNumber: z.string().min(1),
      apartmentNumber: z.string().optional(),
      status: z.enum(["PENDING", "ACTIVE"])
    });
    const customerState = reactive({
      customerType: "BUSINESS"
    });
    const serviceState = reactive({
      status: "ACTIVE"
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/customers",
      {
        default: () => ({ success: false, data: [] })
      },
      "$AEMZzunZ85"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { profiles: [], equipment: [] } })
      },
      "$x4i94C5HnY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customerItems = computed(() => data.value.data.map((customer) => ({
      label: customer.fullName,
      value: customer.id
    })));
    const profileItems = computed(() => options.value.data.profiles.map((profile) => ({
      label: profile.name,
      value: profile.id
    })));
    const equipmentItems = computed(() => [
      { label: "Bez urządzenia", value: null },
      ...options.value.data.equipment.map((equipment) => ({
        label: [equipment.inventoryId, equipment.hostname || equipment.managementIp].filter(Boolean).join(" - "),
        value: equipment.id
      }))
    ]);
    const rows = computed(() => data.value.data.filter((row) => {
      const text = [row.fullName, row.contactEmail, row.contactPhone, row.billingAddress, row.services[0]?.profile.name].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query.value || text.includes(query.value.toLowerCase());
      const hasIssues = Boolean(row.importIssues?.length || row.services.some((service) => service.importIssues?.length));
      const matchesIssues = issueFilter.value === "all" || hasIssues;
      return matchesQuery && matchesIssues;
    }));
    const columns = [
      {
        accessorKey: "fullName",
        header: "Klient"
      },
      {
        id: "customerType",
        header: "Typ",
        cell: ({ row }) => row.original.customerType === "BUSINESS" ? "Firma" : "Indywidualny"
      },
      {
        id: "identity",
        header: "Dane",
        cell: ({ row }) => {
          const customer = row.original;
          return customer.customerType === "BUSINESS" ? [customer.taxId && `NIP ${customer.taxId}`, customer.regon && `REGON ${customer.regon}`].filter(Boolean).join(", ") || "Brak" : [customer.pesel && `PESEL ${customer.pesel}`, customer.identityDocumentNumber].filter(Boolean).join(", ") || "Brak";
        }
      },
      { accessorKey: "contactEmail", header: "Email" },
      { accessorKey: "contactPhone", header: "Telefon" },
      {
        id: "billingAddress",
        header: "Adres klienta",
        cell: ({ row }) => formatAddress(row.original) || row.original.billingAddress || "Brak"
      },
      {
        id: "service",
        header: "Usługa",
        cell: ({ row }) => row.original.services[0]?.profile.name || "Brak"
      },
      {
        id: "address",
        header: "Adres usługi",
        cell: ({ row }) => row.original.services[0] ? formatAddress(row.original.services[0]) : "Brak"
      },
      {
        id: "equipment",
        header: "Urządzenie",
        cell: ({ row }) => row.original.services[0]?.equipment?.hostname || row.original.services[0]?.equipment?.inventoryId || "Brak"
      },
      {
        id: "importIssues",
        header: "Braki",
        cell: ({ row }) => row.original.importIssues?.length ? row.original.importIssues.join(", ") : "Brak"
      }
    ];
    function resetCustomerForm() {
      editingCustomerId.value = null;
      Object.assign(customerState, {
        customerType: "BUSINESS",
        firstName: void 0,
        lastName: void 0,
        pesel: void 0,
        identityDocumentNumber: void 0,
        companyName: void 0,
        taxId: void 0,
        regon: void 0,
        krs: void 0,
        representativeName: void 0,
        contactEmail: void 0,
        contactPhone: void 0,
        billingBuildingNumber: void 0,
        billingApartmentNumber: void 0,
        billingAddress: void 0
      });
      billingAddressInput.value = "";
      selectedBillingAddress.value = null;
    }
    function openCreateCustomer() {
      resetCustomerForm();
      customerOpen.value = true;
    }
    function openEditCustomer(row) {
      selectedRow.value = row;
      editingCustomerId.value = row.id;
      Object.assign(customerState, {
        customerType: row.customerType,
        firstName: row.firstName || void 0,
        lastName: row.lastName || void 0,
        pesel: row.pesel || void 0,
        identityDocumentNumber: row.identityDocumentNumber || void 0,
        companyName: row.companyName || void 0,
        taxId: row.taxId || void 0,
        regon: row.regon || void 0,
        krs: row.krs || void 0,
        representativeName: row.representativeName || void 0,
        contactEmail: row.contactEmail || void 0,
        contactPhone: row.contactPhone || void 0,
        billingBuildingNumber: row.billingBuildingNumber || void 0,
        billingApartmentNumber: row.billingApartmentNumber || void 0,
        billingAddress: row.billingAddress || void 0
      });
      billingAddressInput.value = formatAddress(row) || row.billingAddress || "";
      selectedBillingAddress.value = row.billingTerytArea && row.billingSimcLocality ? {
        terytCode: row.billingTerytArea.terytCode,
        simcCode: row.billingSimcLocality.simcCode,
        ulicCode: row.billingStreet?.ulicCode || void 0
      } : null;
      customerOpen.value = true;
    }
    async function saveCustomer(event) {
      if (billingAddressInput.value && !selectedBillingAddress.value) {
        if (!editingCustomerId.value) {
          toast.add({ title: "Wybierz adres klienta z autosugestii", color: "warning" });
          return;
        }
      }
      const body = {
        ...event.data,
        billingAddressRef: selectedBillingAddress.value ? {
          ...selectedBillingAddress.value,
          buildingNumber: event.data.billingBuildingNumber,
          apartmentNumber: event.data.billingApartmentNumber
        } : void 0
      };
      if (editingCustomerId.value) {
        await $fetch(`/api/crm/customers/${editingCustomerId.value}`, {
          method: "PATCH",
          body
        });
        toast.add({ title: "Klient zaktualizowany", color: "success" });
      } else {
        await $fetch("/api/crm/customers", {
          method: "POST",
          body: {
            ...body,
            billingAddressRef: body.billingAddressRef || null
          }
        });
        toast.add({ title: "Klient zapisany", color: "success" });
      }
      customerOpen.value = false;
      resetCustomerForm();
      await refresh();
    }
    function openArchiveCustomer(row) {
      selectedRow.value = row;
      archiveReason.value = "";
      archiveOpen.value = true;
    }
    async function archiveCustomer() {
      if (!selectedRow.value) return;
      await $fetch(`/api/crm/customers/${selectedRow.value.id}`, {
        method: "DELETE",
        body: { archiveReason: archiveReason.value || null }
      });
      toast.add({ title: "Klient zarchiwizowany", color: "success" });
      archiveOpen.value = false;
      await refresh();
    }
    async function createService(event) {
      if (!selectedAddress.value) {
        toast.add({ title: "Wybierz adres z autosugestii", color: "warning" });
        return;
      }
      await $fetch("/api/crm/services", {
        method: "POST",
        body: {
          ...event.data,
          equipmentId: event.data.equipmentId || null,
          address: {
            ...selectedAddress.value,
            buildingNumber: event.data.buildingNumber,
            apartmentNumber: event.data.apartmentNumber
          }
        }
      });
      toast.add({ title: "Usługa zapisana", color: "success" });
      serviceOpen.value = false;
      await refresh();
    }
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj", icon: "i-lucide-pencil", onSelect: () => openEditCustomer(row) },
        { label: "Szczegóły klienta", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        {
          label: "Dodaj usługę dla klienta",
          icon: "i-lucide-plus",
          onSelect: () => {
            serviceState.customerId = row.id;
            serviceOpen.value = true;
          }
        }
      ], [
        { label: "Archiwizuj", icon: "i-lucide-archive", color: "error", onSelect: () => openArchiveCustomer(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$b;
      const _component_UInput = _sfc_main$5;
      const _component_USelect = _sfc_main$6;
      const _component_USlideover = _sfc_main$7;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$8;
      const _component_UFormField = _sfc_main$a;
      const _component_AddressAutocomplete = __nuxt_component_9;
      const _component_UTextarea = _sfc_main$4;
      const _component_UAlert = _sfc_main$1;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      const _component_UModal = _sfc_main$3;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "crm-customers",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Klienci i usługi" }, {
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
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(customerOpen),
                    "onUpdate:open": ($event) => isRef(customerOpen) ? customerOpen.value = $event : null,
                    title: unref(editingCustomerId) ? "Edytuj klienta" : "Dodaj klienta"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(customerSchema),
                          state: unref(customerState),
                          class: "space-y-4",
                          onSubmit: saveCustomer
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Typ klienta",
                                name: "customerType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(customerState).customerType,
                                      "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                      items: [
                                        { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                        { label: "Firma", value: "BUSINESS" }
                                      ],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(customerState).customerType,
                                        "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                        items: [
                                          { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                          { label: "Firma", value: "BUSINESS" }
                                        ],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              if (unref(customerState).customerType === "INDIVIDUAL") {
                                _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Imię",
                                  name: "firstName",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).firstName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).firstName,
                                          "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Nazwisko",
                                  name: "lastName",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).lastName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).lastName,
                                          "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "PESEL",
                                  name: "pesel"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).pesel,
                                        "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).pesel,
                                          "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Dokument tożsamości",
                                  name: "identityDocumentNumber"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).identityDocumentNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).identityDocumentNumber,
                                          "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              } else {
                                _push5(`<!--[-->`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Nazwa firmy",
                                  name: "companyName",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).companyName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).companyName,
                                          "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "NIP",
                                  name: "taxId"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).taxId,
                                        "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).taxId,
                                          "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "REGON",
                                  name: "regon"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).regon,
                                        "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).regon,
                                          "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "KRS / EDG",
                                  name: "krs"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).krs,
                                        "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).krs,
                                          "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Osoba reprezentująca",
                                  name: "representativeName"
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(customerState).representativeName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).representativeName,
                                          "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div><!--]-->`);
                              }
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Email",
                                name: "contactEmail"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(customerState).contactEmail,
                                      "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).contactEmail,
                                        "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Telefon",
                                name: "contactPhone"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(customerState).contactPhone,
                                      "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).contactPhone,
                                        "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, { label: "Adres klienta z definicji" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_AddressAutocomplete, {
                                      modelValue: unref(billingAddressInput),
                                      "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                      onSelect: ($event) => selectedBillingAddress.value = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_AddressAutocomplete, {
                                        modelValue: unref(billingAddressInput),
                                        "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                        onSelect: ($event) => selectedBillingAddress.value = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Nr budynku",
                                name: "billingBuildingNumber"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(customerState).billingBuildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).billingBuildingNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Lokal",
                                name: "billingApartmentNumber"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(customerState).billingApartmentNumber,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).billingApartmentNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Opis adresu",
                                name: "billingAddress"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UTextarea, {
                                      modelValue: unref(customerState).billingAddress,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(customerState).billingAddress,
                                        "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
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
                                  label: "Typ klienta",
                                  name: "customerType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(customerState).customerType,
                                      "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                      items: [
                                        { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                        { label: "Firma", value: "BUSINESS" }
                                      ],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                unref(customerState).customerType === "INDIVIDUAL" ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "grid gap-4 md:grid-cols-2"
                                }, [
                                  createVNode(_component_UFormField, {
                                    label: "Imię",
                                    name: "firstName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).firstName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Nazwisko",
                                    name: "lastName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).lastName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "PESEL",
                                    name: "pesel"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).pesel,
                                        "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Dokument tożsamości",
                                    name: "identityDocumentNumber"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).identityDocumentNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                  createVNode(_component_UFormField, {
                                    label: "Nazwa firmy",
                                    name: "companyName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).companyName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                    createVNode(_component_UFormField, {
                                      label: "NIP",
                                      name: "taxId"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).taxId,
                                          "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_UFormField, {
                                      label: "REGON",
                                      name: "regon"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).regon,
                                          "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_UFormField, {
                                      label: "KRS / EDG",
                                      name: "krs"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).krs,
                                          "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_UFormField, {
                                      label: "Osoba reprezentująca",
                                      name: "representativeName"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(customerState).representativeName,
                                          "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ])
                                ], 64)),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Email",
                                    name: "contactEmail"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).contactEmail,
                                        "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Telefon",
                                    name: "contactPhone"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).contactPhone,
                                        "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, { label: "Adres klienta z definicji" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_AddressAutocomplete, {
                                      modelValue: unref(billingAddressInput),
                                      "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                      onSelect: ($event) => selectedBillingAddress.value = $event
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Nr budynku",
                                    name: "billingBuildingNumber"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).billingBuildingNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Lokal",
                                    name: "billingApartmentNumber"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).billingApartmentNumber,
                                        "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Opis adresu",
                                  name: "billingAddress"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(customerState).billingAddress,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
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
                            schema: unref(customerSchema),
                            state: unref(customerState),
                            class: "space-y-4",
                            onSubmit: saveCustomer
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "Typ klienta",
                                name: "customerType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(customerState).customerType,
                                    "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                    items: [
                                      { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                      { label: "Firma", value: "BUSINESS" }
                                    ],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              unref(customerState).customerType === "INDIVIDUAL" ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "grid gap-4 md:grid-cols-2"
                              }, [
                                createVNode(_component_UFormField, {
                                  label: "Imię",
                                  name: "firstName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).firstName,
                                      "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Nazwisko",
                                  name: "lastName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).lastName,
                                      "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "PESEL",
                                  name: "pesel"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).pesel,
                                      "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Dokument tożsamości",
                                  name: "identityDocumentNumber"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).identityDocumentNumber,
                                      "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createVNode(_component_UFormField, {
                                  label: "Nazwa firmy",
                                  name: "companyName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).companyName,
                                      "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "NIP",
                                    name: "taxId"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).taxId,
                                        "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "REGON",
                                    name: "regon"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).regon,
                                        "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "KRS / EDG",
                                    name: "krs"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).krs,
                                        "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Osoba reprezentująca",
                                    name: "representativeName"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(customerState).representativeName,
                                        "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ])
                              ], 64)),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Email",
                                  name: "contactEmail"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).contactEmail,
                                      "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Telefon",
                                  name: "contactPhone"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).contactPhone,
                                      "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, { label: "Adres klienta z definicji" }, {
                                default: withCtx(() => [
                                  createVNode(_component_AddressAutocomplete, {
                                    modelValue: unref(billingAddressInput),
                                    "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                    onSelect: ($event) => selectedBillingAddress.value = $event
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Nr budynku",
                                  name: "billingBuildingNumber"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).billingBuildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Lokal",
                                  name: "billingApartmentNumber"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).billingApartmentNumber,
                                      "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Opis adresu",
                                name: "billingAddress"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(customerState).billingAddress,
                                    "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
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
                          label: "Dodaj klienta",
                          icon: "i-lucide-user-plus",
                          variant: "subtle",
                          onClick: openCreateCustomer
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj klienta",
                            icon: "i-lucide-user-plus",
                            variant: "subtle",
                            onClick: openCreateCustomer
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(serviceOpen),
                    "onUpdate:open": ($event) => isRef(serviceOpen) ? serviceOpen.value = $event : null,
                    title: "Dodaj usługę"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(serviceSchema),
                          state: unref(serviceState),
                          class: "space-y-4",
                          onSubmit: createService
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
                                      modelValue: unref(serviceState).customerId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                      items: unref(customerItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(serviceState).customerId,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                        items: unref(customerItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Profil",
                                name: "profileId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(serviceState).profileId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                      items: unref(profileItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(serviceState).profileId,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                        items: unref(profileItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Urządzenie CPE",
                                name: "equipmentId"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(serviceState).equipmentId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                      items: unref(equipmentItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(serviceState).equipmentId,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                        items: unref(equipmentItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Adres usługi z definicji",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_AddressAutocomplete, {
                                      modelValue: unref(addressInput),
                                      "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                      onSelect: ($event) => selectedAddress.value = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_AddressAutocomplete, {
                                        modelValue: unref(addressInput),
                                        "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                        onSelect: ($event) => selectedAddress.value = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Nr budynku",
                                name: "buildingNumber",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(serviceState).buildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(serviceState).buildingNumber,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Lokal",
                                name: "apartmentNumber"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(serviceState).apartmentNumber,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(serviceState).apartmentNumber,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Status",
                                name: "status"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(serviceState).status,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                      items: ["PENDING", "ACTIVE"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(serviceState).status,
                                        "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                        items: ["PENDING", "ACTIVE"],
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
                                      modelValue: unref(serviceState).customerId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                      items: unref(customerItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Profil",
                                  name: "profileId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(serviceState).profileId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                      items: unref(profileItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Urządzenie CPE",
                                  name: "equipmentId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(serviceState).equipmentId,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                      items: unref(equipmentItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Adres usługi z definicji",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_AddressAutocomplete, {
                                      modelValue: unref(addressInput),
                                      "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                      onSelect: ($event) => selectedAddress.value = $event
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Nr budynku",
                                  name: "buildingNumber",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(serviceState).buildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Lokal",
                                  name: "apartmentNumber"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(serviceState).apartmentNumber,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Status",
                                  name: "status"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(serviceState).status,
                                      "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                      items: ["PENDING", "ACTIVE"],
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
                            schema: unref(serviceSchema),
                            state: unref(serviceState),
                            class: "space-y-4",
                            onSubmit: createService
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "Klient",
                                name: "customerId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(serviceState).customerId,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                    items: unref(customerItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Profil",
                                name: "profileId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(serviceState).profileId,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                    items: unref(profileItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Urządzenie CPE",
                                name: "equipmentId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(serviceState).equipmentId,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                    items: unref(equipmentItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Adres usługi z definicji",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_AddressAutocomplete, {
                                    modelValue: unref(addressInput),
                                    "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                    onSelect: ($event) => selectedAddress.value = $event
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Nr budynku",
                                name: "buildingNumber",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(serviceState).buildingNumber,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Lokal",
                                name: "apartmentNumber"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(serviceState).apartmentNumber,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Status",
                                name: "status"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(serviceState).status,
                                    "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                    items: ["PENDING", "ACTIVE"],
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
                          label: "Dodaj usługę",
                          icon: "i-lucide-plus"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj usługę",
                            icon: "i-lucide-plus"
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
                      modelValue: unref(issueFilter),
                      "onUpdate:modelValue": ($event) => isRef(issueFilter) ? issueFilter.value = $event : null,
                      items: [
                        { label: "Wszystkie", value: "all" },
                        { label: "Tylko z brakami", value: "issues" }
                      ],
                      class: "w-44"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_USlideover, {
                      open: unref(customerOpen),
                      "onUpdate:open": ($event) => isRef(customerOpen) ? customerOpen.value = $event : null,
                      title: unref(editingCustomerId) ? "Edytuj klienta" : "Dodaj klienta"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(customerSchema),
                          state: unref(customerState),
                          class: "space-y-4",
                          onSubmit: saveCustomer
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "Typ klienta",
                              name: "customerType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(customerState).customerType,
                                  "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                  items: [
                                    { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                    { label: "Firma", value: "BUSINESS" }
                                  ],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            unref(customerState).customerType === "INDIVIDUAL" ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "grid gap-4 md:grid-cols-2"
                            }, [
                              createVNode(_component_UFormField, {
                                label: "Imię",
                                name: "firstName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).firstName,
                                    "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Nazwisko",
                                name: "lastName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).lastName,
                                    "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "PESEL",
                                name: "pesel"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).pesel,
                                    "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Dokument tożsamości",
                                name: "identityDocumentNumber"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).identityDocumentNumber,
                                    "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode(_component_UFormField, {
                                label: "Nazwa firmy",
                                name: "companyName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).companyName,
                                    "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "NIP",
                                  name: "taxId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).taxId,
                                      "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "REGON",
                                  name: "regon"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).regon,
                                      "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "KRS / EDG",
                                  name: "krs"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).krs,
                                      "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Osoba reprezentująca",
                                  name: "representativeName"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(customerState).representativeName,
                                      "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ])
                            ], 64)),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Email",
                                name: "contactEmail"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).contactEmail,
                                    "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Telefon",
                                name: "contactPhone"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).contactPhone,
                                    "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, { label: "Adres klienta z definicji" }, {
                              default: withCtx(() => [
                                createVNode(_component_AddressAutocomplete, {
                                  modelValue: unref(billingAddressInput),
                                  "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                  onSelect: ($event) => selectedBillingAddress.value = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Nr budynku",
                                name: "billingBuildingNumber"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).billingBuildingNumber,
                                    "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Lokal",
                                name: "billingApartmentNumber"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).billingApartmentNumber,
                                    "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Opis adresu",
                              name: "billingAddress"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(customerState).billingAddress,
                                  "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
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
                          label: "Dodaj klienta",
                          icon: "i-lucide-user-plus",
                          variant: "subtle",
                          onClick: openCreateCustomer
                        })
                      ]),
                      _: 1
                    }, 8, ["open", "onUpdate:open", "title"]),
                    createVNode(_component_USlideover, {
                      open: unref(serviceOpen),
                      "onUpdate:open": ($event) => isRef(serviceOpen) ? serviceOpen.value = $event : null,
                      title: "Dodaj usługę"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(serviceSchema),
                          state: unref(serviceState),
                          class: "space-y-4",
                          onSubmit: createService
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "Klient",
                              name: "customerId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(serviceState).customerId,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                  items: unref(customerItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Profil",
                              name: "profileId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(serviceState).profileId,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                  items: unref(profileItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Urządzenie CPE",
                              name: "equipmentId"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(serviceState).equipmentId,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                  items: unref(equipmentItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Adres usługi z definicji",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_AddressAutocomplete, {
                                  modelValue: unref(addressInput),
                                  "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                  onSelect: ($event) => selectedAddress.value = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Nr budynku",
                              name: "buildingNumber",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(serviceState).buildingNumber,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Lokal",
                              name: "apartmentNumber"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(serviceState).apartmentNumber,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Status",
                              name: "status"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(serviceState).status,
                                  "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                  items: ["PENDING", "ACTIVE"],
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
                          label: "Dodaj usługę",
                          icon: "i-lucide-plus"
                        })
                      ]),
                      _: 1
                    }, 8, ["open", "onUpdate:open"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UDashboardNavbar, { title: "Klienci i usługi" }, {
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
                  createVNode(_component_USlideover, {
                    open: unref(customerOpen),
                    "onUpdate:open": ($event) => isRef(customerOpen) ? customerOpen.value = $event : null,
                    title: unref(editingCustomerId) ? "Edytuj klienta" : "Dodaj klienta"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(customerSchema),
                        state: unref(customerState),
                        class: "space-y-4",
                        onSubmit: saveCustomer
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "Typ klienta",
                            name: "customerType"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(customerState).customerType,
                                "onUpdate:modelValue": ($event) => unref(customerState).customerType = $event,
                                items: [
                                  { label: "Klient indywidualny", value: "INDIVIDUAL" },
                                  { label: "Firma", value: "BUSINESS" }
                                ],
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          unref(customerState).customerType === "INDIVIDUAL" ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "grid gap-4 md:grid-cols-2"
                          }, [
                            createVNode(_component_UFormField, {
                              label: "Imię",
                              name: "firstName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).firstName,
                                  "onUpdate:modelValue": ($event) => unref(customerState).firstName = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Nazwisko",
                              name: "lastName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).lastName,
                                  "onUpdate:modelValue": ($event) => unref(customerState).lastName = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "PESEL",
                              name: "pesel"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).pesel,
                                  "onUpdate:modelValue": ($event) => unref(customerState).pesel = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Dokument tożsamości",
                              name: "identityDocumentNumber"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).identityDocumentNumber,
                                  "onUpdate:modelValue": ($event) => unref(customerState).identityDocumentNumber = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            createVNode(_component_UFormField, {
                              label: "Nazwa firmy",
                              name: "companyName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).companyName,
                                  "onUpdate:modelValue": ($event) => unref(customerState).companyName = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "NIP",
                                name: "taxId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).taxId,
                                    "onUpdate:modelValue": ($event) => unref(customerState).taxId = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "REGON",
                                name: "regon"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).regon,
                                    "onUpdate:modelValue": ($event) => unref(customerState).regon = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "KRS / EDG",
                                name: "krs"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).krs,
                                    "onUpdate:modelValue": ($event) => unref(customerState).krs = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Osoba reprezentująca",
                                name: "representativeName"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(customerState).representativeName,
                                    "onUpdate:modelValue": ($event) => unref(customerState).representativeName = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ])
                          ], 64)),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Email",
                              name: "contactEmail"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).contactEmail,
                                  "onUpdate:modelValue": ($event) => unref(customerState).contactEmail = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Telefon",
                              name: "contactPhone"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).contactPhone,
                                  "onUpdate:modelValue": ($event) => unref(customerState).contactPhone = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, { label: "Adres klienta z definicji" }, {
                            default: withCtx(() => [
                              createVNode(_component_AddressAutocomplete, {
                                modelValue: unref(billingAddressInput),
                                "onUpdate:modelValue": [($event) => isRef(billingAddressInput) ? billingAddressInput.value = $event : null, ($event) => selectedBillingAddress.value = null],
                                onSelect: ($event) => selectedBillingAddress.value = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Nr budynku",
                              name: "billingBuildingNumber"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).billingBuildingNumber,
                                  "onUpdate:modelValue": ($event) => unref(customerState).billingBuildingNumber = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Lokal",
                              name: "billingApartmentNumber"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(customerState).billingApartmentNumber,
                                  "onUpdate:modelValue": ($event) => unref(customerState).billingApartmentNumber = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "Opis adresu",
                            name: "billingAddress"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(customerState).billingAddress,
                                "onUpdate:modelValue": ($event) => unref(customerState).billingAddress = $event,
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
                        label: "Dodaj klienta",
                        icon: "i-lucide-user-plus",
                        variant: "subtle",
                        onClick: openCreateCustomer
                      })
                    ]),
                    _: 1
                  }, 8, ["open", "onUpdate:open", "title"]),
                  createVNode(_component_USlideover, {
                    open: unref(serviceOpen),
                    "onUpdate:open": ($event) => isRef(serviceOpen) ? serviceOpen.value = $event : null,
                    title: "Dodaj usługę"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(serviceSchema),
                        state: unref(serviceState),
                        class: "space-y-4",
                        onSubmit: createService
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "Klient",
                            name: "customerId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(serviceState).customerId,
                                "onUpdate:modelValue": ($event) => unref(serviceState).customerId = $event,
                                items: unref(customerItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Profil",
                            name: "profileId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(serviceState).profileId,
                                "onUpdate:modelValue": ($event) => unref(serviceState).profileId = $event,
                                items: unref(profileItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Urządzenie CPE",
                            name: "equipmentId"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(serviceState).equipmentId,
                                "onUpdate:modelValue": ($event) => unref(serviceState).equipmentId = $event,
                                items: unref(equipmentItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Adres usługi z definicji",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_AddressAutocomplete, {
                                modelValue: unref(addressInput),
                                "onUpdate:modelValue": [($event) => isRef(addressInput) ? addressInput.value = $event : null, ($event) => selectedAddress.value = null],
                                onSelect: ($event) => selectedAddress.value = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "onSelect"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Nr budynku",
                            name: "buildingNumber",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(serviceState).buildingNumber,
                                "onUpdate:modelValue": ($event) => unref(serviceState).buildingNumber = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Lokal",
                            name: "apartmentNumber"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(serviceState).apartmentNumber,
                                "onUpdate:modelValue": ($event) => unref(serviceState).apartmentNumber = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Status",
                            name: "status"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(serviceState).status,
                                "onUpdate:modelValue": ($event) => unref(serviceState).status = $event,
                                items: ["PENDING", "ACTIVE"],
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
                        label: "Dodaj usługę",
                        icon: "i-lucide-plus"
                      })
                    ]),
                    _: 1
                  }, 8, ["open", "onUpdate:open"])
                ]),
                _: 1
              })
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4 sm:p-6"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UAlert, {
              color: "info",
              variant: "subtle",
              icon: "i-lucide-info",
              title: "CRM pokazuje dane opisowe",
              description: "Kody TERYT/SIMC/ULIC są utrzymywane w definicjach i eksporcie PIT, a tutaj widoczne są nazwy i adresy czytelne dla operatora."
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_AppDataTable, {
              data: unref(rows),
              columns,
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły klienta",
              subtitle: unref(selectedRow)?.fullName,
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UModal, {
              open: unref(archiveOpen),
              "onUpdate:open": ($event) => isRef(archiveOpen) ? archiveOpen.value = $event : null,
              title: "Archiwizuj klienta"
            }, {
              body: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UAlert, {
                    color: "warning",
                    variant: "subtle",
                    title: "Klient zostanie ukryty z listy domyślnej."
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
                        title: "Klient zostanie ukryty z listy domyślnej."
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
                    onClick: archiveCustomer
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
                      onClick: archiveCustomer
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "p-4 sm:p-6" }, [
                createVNode(_component_UAlert, {
                  color: "info",
                  variant: "subtle",
                  icon: "i-lucide-info",
                  title: "CRM pokazuje dane opisowe",
                  description: "Kody TERYT/SIMC/ULIC są utrzymywane w definicjach i eksporcie PIT, a tutaj widoczne są nazwy i adresy czytelne dla operatora."
                })
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
                title: "Szczegóły klienta",
                subtitle: unref(selectedRow)?.fullName,
                item: unref(selectedRow)
              }, null, 8, ["open", "onUpdate:open", "subtitle", "item"]),
              createVNode(_component_UModal, {
                open: unref(archiveOpen),
                "onUpdate:open": ($event) => isRef(archiveOpen) ? archiveOpen.value = $event : null,
                title: "Archiwizuj klienta"
              }, {
                body: withCtx(() => [
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode(_component_UAlert, {
                      color: "warning",
                      variant: "subtle",
                      title: "Klient zostanie ukryty z listy domyślnej."
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
                    onClick: archiveCustomer
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/customers.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
