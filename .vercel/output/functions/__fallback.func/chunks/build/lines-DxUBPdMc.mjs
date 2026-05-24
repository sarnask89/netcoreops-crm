import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$a } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$5 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$6 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$7 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$8 } from './InputNumber-C_3Tnd-3.mjs';
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
import './RovingFocusGroup-ByIEls-F.mjs';
import './VisuallyHiddenInput-Cbbw7kMc.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "lines",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const open = ref(false);
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const editingLineId = ref(null);
    const lineSchema = z.object({
      inventoryId: z.string().min(1),
      nodeStartId: z.string().uuid(),
      nodeEndId: z.string().uuid(),
      mediumCode: z.string().optional(),
      fiberCount: z.number().int().nonnegative().nullable().optional(),
      lengthMeters: z.number().nonnegative().nullable().optional(),
      status: z.enum(["PLANNED", "ACTIVE", "DECOMMISSIONED"])
    });
    const lineState = reactive({
      status: "ACTIVE",
      mediumCode: "FO"
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/network/lines",
      {
        default: () => ({ success: false, data: [] })
      },
      "$WmLrN3aUsj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: nodes } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/network/nodes",
      {
        default: () => ({ success: false, data: [] })
      },
      "$o5rO6vRO5F"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { media: [] } })
      },
      "$8rMXd6gBK8"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const nodeItems = computed(() => nodes.value.data.map((node) => ({
      label: `${node.inventoryId} - ${node.name}`,
      value: node.id
    })));
    const mediaItems = computed(() => options.value.data.media.map((item) => ({
      label: item.label,
      value: item.code
    })));
    const columns = [
      { accessorKey: "inventoryId", header: "ID" },
      { accessorKey: "startNode.name", header: "Początek" },
      { accessorKey: "endNode.name", header: "Koniec" },
      { accessorKey: "medium.label", header: "Medium" },
      { accessorKey: "fiberCount", header: "Włókna" },
      { accessorKey: "lengthMeters", header: "Metry" },
      { accessorKey: "status", header: "Status" }
    ];
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function resetForm() {
      editingLineId.value = null;
      selectedRow.value = null;
      Object.assign(lineState, {
        inventoryId: void 0,
        nodeStartId: void 0,
        nodeEndId: void 0,
        mediumCode: "FO",
        fiberCount: void 0,
        lengthMeters: void 0,
        status: "ACTIVE"
      });
    }
    function openCreate() {
      resetForm();
      open.value = true;
    }
    function openEdit(row) {
      selectedRow.value = row;
      editingLineId.value = row.id;
      Object.assign(lineState, {
        inventoryId: row.inventoryId,
        nodeStartId: row.startNode.id,
        nodeEndId: row.endNode.id,
        mediumCode: void 0,
        fiberCount: row.fiberCount ?? void 0,
        lengthMeters: row.lengthMeters ?? void 0,
        status: row.status
      });
      open.value = true;
    }
    async function saveLine(event) {
      await $fetch(editingLineId.value ? `/api/network/lines/${editingLineId.value}` : "/api/network/lines", {
        method: editingLineId.value ? "PATCH" : "POST",
        body: event.data
      });
      toast.add({ title: "Linia zapisana", color: "success" });
      open.value = false;
      resetForm();
      await refresh();
    }
    async function deleteLine(row) {
      if (!(void 0).confirm(`Usunąć linię ${row.inventoryId}?`)) return;
      await $fetch(`/api/network/lines/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Linia usunięta", color: "success" });
      await refresh();
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj linię", icon: "i-lucide-pencil", onSelect: () => openEdit(row) },
        { label: "Szczegóły", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Usuń linię", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteLine(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$a;
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_USelect = _sfc_main$7;
      const _component_UInputNumber = _sfc_main$8;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-lines",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Linie sieciowe" }, {
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
                    title: unref(editingLineId) ? "Edytuj linię" : "Dodaj linię"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(lineSchema),
                          state: unref(lineState),
                          class: "space-y-4",
                          onSubmit: saveLine
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
                                      modelValue: unref(lineState).inventoryId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(lineState).inventoryId,
                                        "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Węzeł początkowy",
                                name: "nodeStartId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(lineState).nodeStartId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                      items: unref(nodeItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(lineState).nodeStartId,
                                        "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                        items: unref(nodeItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Węzeł końcowy",
                                name: "nodeEndId",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(lineState).nodeEndId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                      items: unref(nodeItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(lineState).nodeEndId,
                                        "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                        items: unref(nodeItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
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
                                      modelValue: unref(lineState).mediumCode,
                                      "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                      items: unref(mediaItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(lineState).mediumCode,
                                        "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                        items: unref(mediaItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Liczba włókien",
                                name: "fiberCount"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(lineState).fiberCount,
                                      "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(lineState).fiberCount,
                                        "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Długość m",
                                name: "lengthMeters"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(lineState).lengthMeters,
                                      "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(lineState).lengthMeters,
                                        "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
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
                                      modelValue: unref(lineState).status,
                                      "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
                                      items: ["PLANNED", "ACTIVE", "DECOMMISSIONED"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(lineState).status,
                                        "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
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
                                      modelValue: unref(lineState).inventoryId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Węzeł początkowy",
                                  name: "nodeStartId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(lineState).nodeStartId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                      items: unref(nodeItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Węzeł końcowy",
                                  name: "nodeEndId",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(lineState).nodeEndId,
                                      "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                      items: unref(nodeItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Medium",
                                  name: "mediumCode"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(lineState).mediumCode,
                                      "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                      items: unref(mediaItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Liczba włókien",
                                    name: "fiberCount"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(lineState).fiberCount,
                                        "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Długość m",
                                    name: "lengthMeters"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(lineState).lengthMeters,
                                        "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
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
                                      modelValue: unref(lineState).status,
                                      "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
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
                            schema: unref(lineSchema),
                            state: unref(lineState),
                            class: "space-y-4",
                            onSubmit: saveLine
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "ID inwentarzowy",
                                name: "inventoryId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(lineState).inventoryId,
                                    "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Węzeł początkowy",
                                name: "nodeStartId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(lineState).nodeStartId,
                                    "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                    items: unref(nodeItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Węzeł końcowy",
                                name: "nodeEndId",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(lineState).nodeEndId,
                                    "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                    items: unref(nodeItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Medium",
                                name: "mediumCode"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(lineState).mediumCode,
                                    "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                    items: unref(mediaItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Liczba włókien",
                                  name: "fiberCount"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(lineState).fiberCount,
                                      "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Długość m",
                                  name: "lengthMeters"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(lineState).lengthMeters,
                                      "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
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
                                    modelValue: unref(lineState).status,
                                    "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
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
                          label: "Dodaj linię",
                          icon: "i-lucide-plus",
                          onClick: openCreate
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj linię",
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
                      title: unref(editingLineId) ? "Edytuj linię" : "Dodaj linię"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(lineSchema),
                          state: unref(lineState),
                          class: "space-y-4",
                          onSubmit: saveLine
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "ID inwentarzowy",
                              name: "inventoryId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(lineState).inventoryId,
                                  "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Węzeł początkowy",
                              name: "nodeStartId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(lineState).nodeStartId,
                                  "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                  items: unref(nodeItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Węzeł końcowy",
                              name: "nodeEndId",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(lineState).nodeEndId,
                                  "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                  items: unref(nodeItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Medium",
                              name: "mediumCode"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(lineState).mediumCode,
                                  "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                  items: unref(mediaItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Liczba włókien",
                                name: "fiberCount"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(lineState).fiberCount,
                                    "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Długość m",
                                name: "lengthMeters"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(lineState).lengthMeters,
                                    "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
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
                                  modelValue: unref(lineState).status,
                                  "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
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
                          label: "Dodaj linię",
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
              createVNode(_component_UDashboardNavbar, { title: "Linie sieciowe" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_USlideover, {
                    open: unref(open),
                    "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
                    title: unref(editingLineId) ? "Edytuj linię" : "Dodaj linię"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(lineSchema),
                        state: unref(lineState),
                        class: "space-y-4",
                        onSubmit: saveLine
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "ID inwentarzowy",
                            name: "inventoryId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(lineState).inventoryId,
                                "onUpdate:modelValue": ($event) => unref(lineState).inventoryId = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Węzeł początkowy",
                            name: "nodeStartId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(lineState).nodeStartId,
                                "onUpdate:modelValue": ($event) => unref(lineState).nodeStartId = $event,
                                items: unref(nodeItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Węzeł końcowy",
                            name: "nodeEndId",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(lineState).nodeEndId,
                                "onUpdate:modelValue": ($event) => unref(lineState).nodeEndId = $event,
                                items: unref(nodeItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Medium",
                            name: "mediumCode"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(lineState).mediumCode,
                                "onUpdate:modelValue": ($event) => unref(lineState).mediumCode = $event,
                                items: unref(mediaItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Liczba włókien",
                              name: "fiberCount"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(lineState).fiberCount,
                                  "onUpdate:modelValue": ($event) => unref(lineState).fiberCount = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Długość m",
                              name: "lengthMeters"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(lineState).lengthMeters,
                                  "onUpdate:modelValue": ($event) => unref(lineState).lengthMeters = $event,
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
                                modelValue: unref(lineState).status,
                                "onUpdate:modelValue": ($event) => unref(lineState).status = $event,
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
                        label: "Dodaj linię",
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
              data: unref(data).data,
              columns,
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły linii",
              subtitle: unref(selectedRow)?.inventoryId,
              item: unref(selectedRow)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AppDataTable, {
                data: unref(data).data,
                columns,
                loading: unref(status) === "pending",
                "context-items": rowContextItems
              }, null, 8, ["data", "loading"]),
              createVNode(_component_AppRowDetailsSlideover, {
                open: unref(detailsOpen),
                "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
                title: "Szczegóły linii",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/lines.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
