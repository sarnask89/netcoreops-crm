import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$b } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$5 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$6 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$7 } from './Switch-BjjnqNfE.mjs';
import { _ as _sfc_main$8 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$a } from './Textarea-C69jS_Io.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
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
import './VisuallyHiddenInput-Cbbw7kMc.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './RovingFocusGroup-ByIEls-F.mjs';
import './Table-9O8FnRDu.mjs';
import './index-DC8E8gNZ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "definitions",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const variableOpen = ref(false);
    const editingId = ref(null);
    const selectedVariable = ref(null);
    const detailsOpen = ref(false);
    const variableSchema = z.object({
      variableName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
      label: z.string().optional(),
      valueType: z.enum(["string", "int", "date", "bool"]),
      sourceType: z.enum(["STATIC", "DATABASE"]),
      tableName: z.string().optional(),
      rowLookupColumn: z.string().optional(),
      rowLookupValue: z.string().optional(),
      fieldName: z.string().optional(),
      staticValue: z.string().optional(),
      fallbackValue: z.string().optional(),
      isActive: z.boolean()
    });
    const variableState = reactive({
      sourceType: "DATABASE",
      valueType: "string",
      isActive: true
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/automation/variables",
      {
        default: () => ({ success: false, data: [] })
      },
      "$azIgIRAcW2"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: sources } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/automation/variables/sources",
      {
        default: () => ({ success: false, data: {} })
      },
      "$rK0DZXEQIb"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const tableItems = computed(() => Object.entries(sources.value.data).map(([value, source]) => ({
      label: source.label,
      value
    })));
    const selectedSource = computed(() => variableState.tableName ? sources.value.data[variableState.tableName] : null);
    const lookupColumnItems = computed(() => selectedSource.value?.lookupColumns || []);
    const fieldItems = computed(() => selectedSource.value?.fields || []);
    const columns = [
      { accessorKey: "variableName", header: "Zmienna" },
      { accessorKey: "label", header: "Opis" },
      { accessorKey: "valueType", header: "Typ" },
      {
        id: "source",
        header: "Źródło",
        cell: ({ row }) => row.original.sourceType === "STATIC" ? `static:${row.original.staticValue || ""}` : `${row.original.tableName}|${row.original.rowLookupColumn}=${row.original.rowLookupValue}|${row.original.fieldName}`
      },
      {
        id: "active",
        header: "Aktywna",
        cell: ({ row }) => row.original.isActive ? "Tak" : "Nie"
      }
    ];
    function resetForm() {
      editingId.value = null;
      Object.assign(variableState, {
        variableName: "",
        label: "",
        sourceType: "DATABASE",
        valueType: "string",
        tableName: void 0,
        rowLookupColumn: void 0,
        rowLookupValue: "",
        fieldName: void 0,
        staticValue: "",
        fallbackValue: "",
        isActive: true
      });
    }
    function editVariable(variable) {
      editingId.value = variable.id;
      Object.assign(variableState, {
        variableName: variable.variableName,
        label: variable.label || "",
        sourceType: variable.sourceType,
        valueType: variable.valueType,
        tableName: variable.tableName || void 0,
        rowLookupColumn: variable.rowLookupColumn || void 0,
        rowLookupValue: variable.rowLookupValue || "",
        fieldName: variable.fieldName || void 0,
        staticValue: variable.staticValue || "",
        fallbackValue: variable.fallbackValue || "",
        isActive: variable.isActive
      });
      variableOpen.value = true;
    }
    function showDetails(variable) {
      selectedVariable.value = variable;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj definicję", icon: "i-lucide-pencil", onSelect: () => editVariable(row) },
        { label: "Szczegóły definicji", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) }
      ], [
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    async function saveVariable(event) {
      const body = {
        ...event.data,
        tableName: event.data.sourceType === "DATABASE" ? event.data.tableName : null,
        rowLookupColumn: event.data.sourceType === "DATABASE" ? event.data.rowLookupColumn : null,
        rowLookupValue: event.data.sourceType === "DATABASE" ? event.data.rowLookupValue : null,
        fieldName: event.data.sourceType === "DATABASE" ? event.data.fieldName : null,
        staticValue: event.data.sourceType === "STATIC" ? event.data.staticValue : null
      };
      if (editingId.value) {
        await $fetch(`/api/automation/variables/${editingId.value}`, { method: "PATCH", body });
      } else {
        await $fetch("/api/automation/variables", { method: "POST", body });
      }
      toast.add({ title: "Definicja zapisana", color: "success" });
      variableOpen.value = false;
      resetForm();
      await refresh();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$b;
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_USwitch = _sfc_main$7;
      const _component_USelect = _sfc_main$8;
      const _component_UTextarea = _sfc_main$a;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "automation-definitions",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Definicje zmiennych" }, {
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
                    open: unref(variableOpen),
                    "onUpdate:open": ($event) => isRef(variableOpen) ? variableOpen.value = $event : null,
                    title: "Definicja zmiennej"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(variableSchema),
                          state: unref(variableState),
                          class: "space-y-4",
                          onSubmit: saveVariable
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Nazwa zmiennej",
                                name: "variableName",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(variableState).variableName,
                                      "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(variableState).variableName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
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
                                      modelValue: unref(variableState).isActive,
                                      "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USwitch, {
                                        modelValue: unref(variableState).isActive,
                                        "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Opis",
                                name: "label"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(variableState).label,
                                      "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(variableState).label,
                                        "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Typ źródła",
                                name: "sourceType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(variableState).sourceType,
                                      "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                      items: ["DATABASE", "STATIC"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).sourceType,
                                        "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                        items: ["DATABASE", "STATIC"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Typ danych",
                                name: "valueType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(variableState).valueType,
                                      "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                      items: ["string", "int", "date", "bool"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).valueType,
                                        "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                        items: ["string", "int", "date", "bool"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              if (unref(variableState).sourceType === "DATABASE") {
                                _push5(`<!--[-->`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Tabela",
                                  name: "tableName",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_USelect, {
                                        modelValue: unref(variableState).tableName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                        items: unref(tableItems),
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_USelect, {
                                          modelValue: unref(variableState).tableName,
                                          "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                          items: unref(tableItems),
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Kolumna wyboru wiersza",
                                  name: "rowLookupColumn",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_USelect, {
                                        modelValue: unref(variableState).rowLookupColumn,
                                        "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                        items: unref(lookupColumnItems),
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_USelect, {
                                          modelValue: unref(variableState).rowLookupColumn,
                                          "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                          items: unref(lookupColumnItems),
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Wartość wiersza",
                                  name: "rowLookupValue",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UInput, {
                                        modelValue: unref(variableState).rowLookupValue,
                                        "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(variableState).rowLookupValue,
                                          "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Pole do podstawienia",
                                  name: "fieldName",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_USelect, {
                                        modelValue: unref(variableState).fieldName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                        items: unref(fieldItems),
                                        class: "w-full"
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_USelect, {
                                          modelValue: unref(variableState).fieldName,
                                          "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                          items: unref(fieldItems),
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                                _push5(`<!--]-->`);
                              } else {
                                _push5(ssrRenderComponent(_component_UFormField, {
                                  label: "Tekst statyczny",
                                  name: "staticValue",
                                  required: ""
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(ssrRenderComponent(_component_UTextarea, {
                                        modelValue: unref(variableState).staticValue,
                                        "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                        class: "w-full",
                                        rows: 4
                                      }, null, _parent6, _scopeId5));
                                    } else {
                                      return [
                                        createVNode(_component_UTextarea, {
                                          modelValue: unref(variableState).staticValue,
                                          "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                          class: "w-full",
                                          rows: 4
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              }
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Wartość awaryjna",
                                name: "fallbackValue"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(variableState).fallbackValue,
                                      "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(variableState).fallbackValue,
                                        "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
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
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Nazwa zmiennej",
                                    name: "variableName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(variableState).variableName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
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
                                        modelValue: unref(variableState).isActive,
                                        "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Opis",
                                  name: "label"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(variableState).label,
                                      "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Typ źródła",
                                    name: "sourceType"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).sourceType,
                                        "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                        items: ["DATABASE", "STATIC"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Typ danych",
                                    name: "valueType"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).valueType,
                                        "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                        items: ["string", "int", "date", "bool"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                unref(variableState).sourceType === "DATABASE" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createVNode(_component_UFormField, {
                                    label: "Tabela",
                                    name: "tableName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).tableName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                        items: unref(tableItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                    createVNode(_component_UFormField, {
                                      label: "Kolumna wyboru wiersza",
                                      name: "rowLookupColumn",
                                      required: ""
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_USelect, {
                                          modelValue: unref(variableState).rowLookupColumn,
                                          "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                          items: unref(lookupColumnItems),
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_UFormField, {
                                      label: "Wartość wiersza",
                                      name: "rowLookupValue",
                                      required: ""
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UInput, {
                                          modelValue: unref(variableState).rowLookupValue,
                                          "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                          class: "w-full"
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createVNode(_component_UFormField, {
                                    label: "Pole do podstawienia",
                                    name: "fieldName",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).fieldName,
                                        "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                        items: unref(fieldItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ]),
                                    _: 1
                                  })
                                ], 64)) : (openBlock(), createBlock(_component_UFormField, {
                                  key: 1,
                                  label: "Tekst statyczny",
                                  name: "staticValue",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(variableState).staticValue,
                                      "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                      class: "w-full",
                                      rows: 4
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })),
                                createVNode(_component_UFormField, {
                                  label: "Wartość awaryjna",
                                  name: "fallbackValue"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(variableState).fallbackValue,
                                      "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
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
                            schema: unref(variableSchema),
                            state: unref(variableState),
                            class: "space-y-4",
                            onSubmit: saveVariable
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Nazwa zmiennej",
                                  name: "variableName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(variableState).variableName,
                                      "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
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
                                      modelValue: unref(variableState).isActive,
                                      "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Opis",
                                name: "label"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(variableState).label,
                                    "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Typ źródła",
                                  name: "sourceType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(variableState).sourceType,
                                      "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                      items: ["DATABASE", "STATIC"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Typ danych",
                                  name: "valueType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(variableState).valueType,
                                      "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                      items: ["string", "int", "date", "bool"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              unref(variableState).sourceType === "DATABASE" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createVNode(_component_UFormField, {
                                  label: "Tabela",
                                  name: "tableName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(variableState).tableName,
                                      "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                      items: unref(tableItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Kolumna wyboru wiersza",
                                    name: "rowLookupColumn",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(variableState).rowLookupColumn,
                                        "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                        items: unref(lookupColumnItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Wartość wiersza",
                                    name: "rowLookupValue",
                                    required: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(variableState).rowLookupValue,
                                        "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Pole do podstawienia",
                                  name: "fieldName",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(variableState).fieldName,
                                      "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                      items: unref(fieldItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                })
                              ], 64)) : (openBlock(), createBlock(_component_UFormField, {
                                key: 1,
                                label: "Tekst statyczny",
                                name: "staticValue",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(variableState).staticValue,
                                    "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                    class: "w-full",
                                    rows: 4
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })),
                              createVNode(_component_UFormField, {
                                label: "Wartość awaryjna",
                                name: "fallbackValue"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(variableState).fallbackValue,
                                    "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
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
                          label: "Dodaj definicję",
                          icon: "i-lucide-braces",
                          onClick: resetForm
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj definicję",
                            icon: "i-lucide-braces",
                            onClick: resetForm
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USlideover, {
                      open: unref(variableOpen),
                      "onUpdate:open": ($event) => isRef(variableOpen) ? variableOpen.value = $event : null,
                      title: "Definicja zmiennej"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(variableSchema),
                          state: unref(variableState),
                          class: "space-y-4",
                          onSubmit: saveVariable
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Nazwa zmiennej",
                                name: "variableName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(variableState).variableName,
                                    "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
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
                                    modelValue: unref(variableState).isActive,
                                    "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Opis",
                              name: "label"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(variableState).label,
                                  "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Typ źródła",
                                name: "sourceType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(variableState).sourceType,
                                    "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                    items: ["DATABASE", "STATIC"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Typ danych",
                                name: "valueType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(variableState).valueType,
                                    "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                    items: ["string", "int", "date", "bool"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            unref(variableState).sourceType === "DATABASE" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode(_component_UFormField, {
                                label: "Tabela",
                                name: "tableName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(variableState).tableName,
                                    "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                    items: unref(tableItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Kolumna wyboru wiersza",
                                  name: "rowLookupColumn",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(variableState).rowLookupColumn,
                                      "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                      items: unref(lookupColumnItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Wartość wiersza",
                                  name: "rowLookupValue",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(variableState).rowLookupValue,
                                      "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Pole do podstawienia",
                                name: "fieldName",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(variableState).fieldName,
                                    "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                    items: unref(fieldItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              })
                            ], 64)) : (openBlock(), createBlock(_component_UFormField, {
                              key: 1,
                              label: "Tekst statyczny",
                              name: "staticValue",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(variableState).staticValue,
                                  "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                  class: "w-full",
                                  rows: 4
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })),
                            createVNode(_component_UFormField, {
                              label: "Wartość awaryjna",
                              name: "fallbackValue"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(variableState).fallbackValue,
                                  "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
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
                          label: "Dodaj definicję",
                          icon: "i-lucide-braces",
                          onClick: resetForm
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
              createVNode(_component_UDashboardNavbar, { title: "Definicje zmiennych" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_USlideover, {
                    open: unref(variableOpen),
                    "onUpdate:open": ($event) => isRef(variableOpen) ? variableOpen.value = $event : null,
                    title: "Definicja zmiennej"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(variableSchema),
                        state: unref(variableState),
                        class: "space-y-4",
                        onSubmit: saveVariable
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Nazwa zmiennej",
                              name: "variableName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(variableState).variableName,
                                  "onUpdate:modelValue": ($event) => unref(variableState).variableName = $event,
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
                                  modelValue: unref(variableState).isActive,
                                  "onUpdate:modelValue": ($event) => unref(variableState).isActive = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "Opis",
                            name: "label"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(variableState).label,
                                "onUpdate:modelValue": ($event) => unref(variableState).label = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Typ źródła",
                              name: "sourceType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(variableState).sourceType,
                                  "onUpdate:modelValue": ($event) => unref(variableState).sourceType = $event,
                                  items: ["DATABASE", "STATIC"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Typ danych",
                              name: "valueType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(variableState).valueType,
                                  "onUpdate:modelValue": ($event) => unref(variableState).valueType = $event,
                                  items: ["string", "int", "date", "bool"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          unref(variableState).sourceType === "DATABASE" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode(_component_UFormField, {
                              label: "Tabela",
                              name: "tableName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(variableState).tableName,
                                  "onUpdate:modelValue": ($event) => unref(variableState).tableName = $event,
                                  items: unref(tableItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Kolumna wyboru wiersza",
                                name: "rowLookupColumn",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(variableState).rowLookupColumn,
                                    "onUpdate:modelValue": ($event) => unref(variableState).rowLookupColumn = $event,
                                    items: unref(lookupColumnItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Wartość wiersza",
                                name: "rowLookupValue",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(variableState).rowLookupValue,
                                    "onUpdate:modelValue": ($event) => unref(variableState).rowLookupValue = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Pole do podstawienia",
                              name: "fieldName",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(variableState).fieldName,
                                  "onUpdate:modelValue": ($event) => unref(variableState).fieldName = $event,
                                  items: unref(fieldItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            })
                          ], 64)) : (openBlock(), createBlock(_component_UFormField, {
                            key: 1,
                            label: "Tekst statyczny",
                            name: "staticValue",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(variableState).staticValue,
                                "onUpdate:modelValue": ($event) => unref(variableState).staticValue = $event,
                                class: "w-full",
                                rows: 4
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })),
                          createVNode(_component_UFormField, {
                            label: "Wartość awaryjna",
                            name: "fallbackValue"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(variableState).fallbackValue,
                                "onUpdate:modelValue": ($event) => unref(variableState).fallbackValue = $event,
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
                        label: "Dodaj definicję",
                        icon: "i-lucide-braces",
                        onClick: resetForm
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
            _push2(ssrRenderComponent(_component_AppDataTable, {
              data: unref(data).data,
              columns,
              loading: unref(status) === "pending",
              "context-items": rowContextItems
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AppRowDetailsSlideover, {
              open: unref(detailsOpen),
              "onUpdate:open": ($event) => isRef(detailsOpen) ? detailsOpen.value = $event : null,
              title: "Szczegóły definicji",
              subtitle: unref(selectedVariable)?.variableName,
              item: unref(selectedVariable)
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
                title: "Szczegóły definicji",
                subtitle: unref(selectedVariable)?.variableName,
                item: unref(selectedVariable)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/automation/definitions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
