import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$8 } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$5 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$6 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$7 } from './Select-N__9sMNx.mjs';
import { _ as __nuxt_component_9, f as formatAddress } from './format-DL0Q0sjO.mjs';
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
import 'node:url';
import '@iconify/utils';
import 'consola';
import './ssr-BO1H6xpe.mjs';
import './PopperArrow-CvIo2SqJ.mjs';
import './overlay-CjyBzL1C.mjs';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './useFormControl-IzN_Be5X.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "nodes",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const open = ref(false);
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const editingNodeId = ref(null);
    const addressInput = ref("");
    const selectedAddress = ref(null);
    const schema = z.object({
      inventoryId: z.string().min(1),
      name: z.string().min(1),
      nodeType: z.enum(["SZKIELETOWY", "DYSTRYBUCYJNY"]),
      mediumCode: z.string().optional(),
      buildingNumber: z.string().optional(),
      status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"])
    });
    const state = reactive({
      nodeType: "DYSTRYBUCYJNY",
      mediumCode: "FO",
      status: "PLANNED"
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/network/nodes",
      {
        default: () => ({ success: false, data: [] })
      },
      "$cUbeQdtwlB"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { media: [] } })
      },
      "$sM9gLdULzw"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => data.value.data);
    const mediaItems = computed(() => options.value.data.media.map((item) => ({
      label: item.label,
      value: item.code
    })));
    const columns = [
      { accessorKey: "inventoryId", header: "ID" },
      { accessorKey: "name", header: "Nazwa" },
      { accessorKey: "nodeType", header: "Typ" },
      { accessorKey: "medium.label", header: "Medium" },
      {
        id: "address",
        header: "Adres",
        cell: ({ row }) => formatAddress(row.original)
      },
      { accessorKey: "status", header: "Status" }
    ];
    function resetForm() {
      editingNodeId.value = null;
      selectedRow.value = null;
      selectedAddress.value = null;
      addressInput.value = "";
      Object.assign(state, {
        inventoryId: void 0,
        name: void 0,
        nodeType: "DYSTRYBUCYJNY",
        mediumCode: "FO",
        buildingNumber: void 0,
        status: "PLANNED"
      });
    }
    function openCreate() {
      resetForm();
      open.value = true;
    }
    function openEdit(row) {
      selectedRow.value = row;
      editingNodeId.value = row.id;
      selectedAddress.value = null;
      addressInput.value = formatAddress(row);
      Object.assign(state, {
        inventoryId: row.inventoryId,
        name: row.name,
        nodeType: row.nodeType,
        mediumCode: void 0,
        buildingNumber: row.buildingNumber || void 0,
        status: row.status
      });
      open.value = true;
    }
    async function onSubmit(event) {
      await $fetch(editingNodeId.value ? `/api/network/nodes/${editingNodeId.value}` : "/api/network/nodes", {
        method: editingNodeId.value ? "PATCH" : "POST",
        body: {
          ...event.data,
          address: selectedAddress.value ? { ...selectedAddress.value, buildingNumber: event.data.buildingNumber } : editingNodeId.value ? void 0 : null
        }
      });
      toast.add({ title: "Węzeł zapisany", color: "success" });
      open.value = false;
      resetForm();
      await refresh();
    }
    async function deleteNode(row) {
      if (!(void 0).confirm(`Usunąć węzeł ${row.inventoryId}?`)) return;
      await $fetch(`/api/network/nodes/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Węzeł usunięty", color: "success" });
      await refresh();
    }
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj węzeł", icon: "i-lucide-pencil", onSelect: () => openEdit(row) },
        { label: "Szczegóły", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Usuń węzeł", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteNode(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$8;
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_USelect = _sfc_main$7;
      const _component_AddressAutocomplete = __nuxt_component_9;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-nodes",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Węzły sieci" }, {
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
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingNodeId) ? "Edytuj węzeł" : "Dodaj węzeł"
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
                                label: "ID inwentarzowy",
                                name: "inventoryId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(state).inventoryId,
                                      "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(state).inventoryId,
                                        "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
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
                                name: "nodeType",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).nodeType,
                                      "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                      items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).nodeType,
                                        "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                        items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Medium",
                                name: "mediumCode"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(state).mediumCode,
                                      "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                      items: unref(mediaItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).mediumCode,
                                        "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                        items: unref(mediaItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, { label: "Adres z definicji" }, {
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
                                name: "buildingNumber"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(state).buildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(state).buildingNumber,
                                        "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
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
                                      modelValue: unref(state).status,
                                      "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                      items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(state).status,
                                        "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                        items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
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
                                  label: "ID inwentarzowy",
                                  name: "inventoryId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(state).inventoryId,
                                      "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
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
                                  name: "nodeType",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).nodeType,
                                      "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                      items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Medium",
                                  name: "mediumCode"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(state).mediumCode,
                                      "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                      items: unref(mediaItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, { label: "Adres z definicji" }, {
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
                                  name: "buildingNumber"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(state).buildingNumber,
                                      "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
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
                                      modelValue: unref(state).status,
                                      "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                      items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
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
                                label: "ID inwentarzowy",
                                name: "inventoryId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(state).inventoryId,
                                    "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
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
                                name: "nodeType",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).nodeType,
                                    "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                    items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Medium",
                                name: "mediumCode"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(state).mediumCode,
                                    "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                    items: unref(mediaItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, { label: "Adres z definicji" }, {
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
                                name: "buildingNumber"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(state).buildingNumber,
                                    "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
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
                                    modelValue: unref(state).status,
                                    "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                    items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
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
                          label: "Dodaj węzeł",
                          icon: "i-lucide-plus",
                          onClick: openCreate
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj węzeł",
                            icon: "i-lucide-plus",
                            onClick: openCreate
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USlideover, {
                      open: unref(open),
                      "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                      title: unref(editingNodeId) ? "Edytuj węzeł" : "Dodaj węzeł"
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
                              label: "ID inwentarzowy",
                              name: "inventoryId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).inventoryId,
                                  "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
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
                              name: "nodeType",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).nodeType,
                                  "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                  items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Medium",
                              name: "mediumCode"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(state).mediumCode,
                                  "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                  items: unref(mediaItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, { label: "Adres z definicji" }, {
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
                              name: "buildingNumber"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).buildingNumber,
                                  "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
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
                                  modelValue: unref(state).status,
                                  "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                  items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
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
                          label: "Dodaj węzeł",
                          icon: "i-lucide-plus",
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
              createVNode(_component_UDashboardNavbar, { title: "Węzły sieci" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingNodeId) ? "Edytuj węzeł" : "Dodaj węzeł"
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
                            label: "ID inwentarzowy",
                            name: "inventoryId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).inventoryId,
                                "onUpdate:modelValue": ($event) => unref(state).inventoryId = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
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
                            name: "nodeType",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).nodeType,
                                "onUpdate:modelValue": ($event) => unref(state).nodeType = $event,
                                items: ["SZKIELETOWY", "DYSTRYBUCYJNY"],
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Medium",
                            name: "mediumCode"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(state).mediumCode,
                                "onUpdate:modelValue": ($event) => unref(state).mediumCode = $event,
                                items: unref(mediaItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, { label: "Adres z definicji" }, {
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
                            name: "buildingNumber"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).buildingNumber,
                                "onUpdate:modelValue": ($event) => unref(state).buildingNumber = $event,
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
                                modelValue: unref(state).status,
                                "onUpdate:modelValue": ($event) => unref(state).status = $event,
                                items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
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
                        label: "Dodaj węzeł",
                        icon: "i-lucide-plus",
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
              title: "Szczegóły węzła",
              subtitle: unref(selectedRow)?.inventoryId,
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
                title: "Szczegóły węzła",
                subtitle: unref(selectedRow)?.inventoryId,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/nodes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
