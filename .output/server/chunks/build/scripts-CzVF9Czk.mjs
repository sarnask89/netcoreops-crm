import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$d } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$5 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$6 } from './Textarea-C69jS_Io.mjs';
import { _ as _sfc_main$7 } from './Table-9O8FnRDu.mjs';
import { _ as _sfc_main$8 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$a } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$b } from './InputNumber-C_3Tnd-3.mjs';
import { _ as _sfc_main$c } from './Switch-BjjnqNfE.mjs';
import { _ as __nuxt_component_6, a as _sfc_main$2$1 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, nextTick, mergeProps, withCtx, unref, isRef, createVNode, useSSRContext } from 'vue';
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
import './index-DC8E8gNZ.mjs';
import './RovingFocusGroup-ByIEls-F.mjs';
import './VisuallyHiddenInput-Cbbw7kMc.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "scripts",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const scriptOpen = ref(false);
    const renderOpen = ref(false);
    const detailsOpen = ref(false);
    const selectedScript = ref(null);
    const selectedScriptId = ref();
    const editingScriptId = ref(null);
    const renderedBody = ref("");
    const renderedVariables = ref({});
    const triggerTypeItems = ["MANUAL", "PROFILE_APPLIED", "SERVICE_ACTIVATED", "DEVICE_DISCOVERED", "SCHEDULED_30_MIN"];
    const scriptLanguageItems = ["bash", "python", "ansible", "expect", "typescript", "tsx"];
    const scriptSchema = z.object({
      name: z.string().min(1),
      scope: z.enum(["DEVICE", "PROFILE", "CUSTOMER_SERVICE"]),
      triggerType: z.enum(triggerTypeItems),
      scriptLanguage: z.enum(scriptLanguageItems),
      scriptBody: z.string().min(1),
      profileId: z.number().int().positive().nullable().optional(),
      equipmentId: z.string().uuid().nullable().optional(),
      isEnabled: z.boolean(),
      timeoutSeconds: z.number().int().positive().max(3600)
    });
    const scriptState = reactive({
      scope: "DEVICE",
      triggerType: "MANUAL",
      scriptLanguage: "bash",
      isEnabled: false,
      timeoutSeconds: 60,
      scriptBody: "if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]"
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/automation/scripts",
      {
        default: () => ({ success: false, data: [] })
      },
      "$Ufn5IP0GET"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: options } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/system/options",
      {
        default: () => ({ success: false, data: { profiles: [], equipment: [] } })
      },
      "$HUVzC8zFa_"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: variables } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/automation/variables",
      {
        default: () => ({ success: false, data: [] })
      },
      "$oFpQY2qU3E"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const profileItems = computed(() => [
      { label: "Bez profilu", value: null },
      ...options.value.data.profiles.map((profile) => ({ label: profile.name, value: profile.id }))
    ]);
    const equipmentItems = computed(() => [
      { label: "Bez urządzenia", value: null },
      ...options.value.data.equipment.map((equipment) => ({
        label: [equipment.inventoryId, equipment.hostname || equipment.managementIp].filter(Boolean).join(" - "),
        value: equipment.id
      }))
    ]);
    const scriptItems = computed(() => data.value.data.map((script) => ({
      label: script.name,
      value: script.id
    })));
    const columns = [
      { accessorKey: "name", header: "Skrypt" },
      { accessorKey: "scope", header: "Zakres" },
      { accessorKey: "triggerType", header: "Wyzwalacz" },
      { accessorKey: "scriptLanguage", header: "Język" },
      { accessorKey: "profile.name", header: "Profil" },
      {
        id: "equipment",
        header: "Urządzenie",
        cell: ({ row }) => row.original.equipment?.inventoryId || "Brak"
      },
      {
        id: "enabled",
        header: "Aktywny",
        cell: ({ row }) => row.original.isEnabled ? "Tak" : "Nie"
      },
      {
        id: "timeout",
        header: "Timeout",
        cell: ({ row }) => `${row.original.timeoutSeconds}s`
      },
      {
        id: "lastRun",
        header: "Ostatni przebieg",
        cell: ({ row }) => row.original.lastRunAt ? new Date(row.original.lastRunAt).toLocaleString("pl-PL") : "Brak"
      }
    ];
    const variableColumns = [
      { accessorKey: "name", header: "Zmienna" },
      { accessorKey: "value", header: "Wartość" }
    ];
    const scriptContextItems = computed(() => {
      const variableItems = variables.value.data.map((variable) => ({
        label: `${variable.variableName} (${variable.valueType})`,
        icon: "i-lucide-braces",
        onSelect: () => insertScriptText(`{{${variable.variableName}}}`)
      }));
      const conditionItems = variables.value.data.map((variable) => ({
        label: `if $${variable.variableName}=true [ ]`,
        icon: "i-lucide-git-branch",
        onSelect: () => insertScriptText(`if $${variable.variableName}=true [  ]`)
      }));
      return [variableItems, conditionItems];
    });
    function resetScriptForm() {
      editingScriptId.value = null;
      selectedScript.value = null;
      Object.assign(scriptState, {
        name: void 0,
        scope: "DEVICE",
        triggerType: "MANUAL",
        scriptLanguage: "bash",
        scriptBody: "if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]",
        profileId: null,
        equipmentId: null,
        isEnabled: false,
        timeoutSeconds: 60
      });
    }
    function openCreateScript() {
      resetScriptForm();
      scriptOpen.value = true;
    }
    function openEditScript(row) {
      selectedScript.value = row;
      editingScriptId.value = row.id;
      Object.assign(scriptState, {
        name: row.name,
        scope: row.scope,
        triggerType: row.triggerType,
        scriptLanguage: row.scriptLanguage,
        scriptBody: row.scriptBody,
        profileId: row.profile?.id || row.profileId || null,
        equipmentId: row.equipment?.id || row.equipmentId || null,
        isEnabled: row.isEnabled,
        timeoutSeconds: row.timeoutSeconds
      });
      scriptOpen.value = true;
    }
    async function saveScript(event) {
      await $fetch(editingScriptId.value ? `/api/automation/scripts/${editingScriptId.value}` : "/api/automation/scripts", {
        method: editingScriptId.value ? "PATCH" : "POST",
        body: {
          ...event.data,
          profileId: event.data.profileId || null,
          equipmentId: event.data.equipmentId || null
        }
      });
      toast.add({ title: "Skrypt zapisany", color: "success" });
      scriptOpen.value = false;
      resetScriptForm();
      await refresh();
    }
    async function deleteScript(row) {
      if (!(void 0).confirm(`Usunąć skrypt ${row.name}?`)) return;
      await $fetch(`/api/automation/scripts/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Skrypt usunięty", color: "success" });
      await refresh();
    }
    async function renderScript() {
      if (!selectedScriptId.value) {
        toast.add({ title: "Wybierz skrypt", color: "warning" });
        return;
      }
      const response = await $fetch(`/api/automation/scripts/${selectedScriptId.value}/render`, {
        method: "POST",
        body: { variables: {} }
      });
      renderedBody.value = response.data.renderedBody;
      renderedVariables.value = response.data.variables;
    }
    async function runScript(row) {
      try {
        const response = await $fetch(`/api/automation/scripts/${row.id}/run`, { method: "POST" });
        toast.add({
          title: "Skrypt uruchomiony",
          description: `OLT: ${response.data.equipmentScanned}, ONU: ${response.data.onusScanned}, alerty: ${response.data.alerts.length}`,
          color: response.data.alerts.length ? "warning" : "success"
        });
        await refresh();
      } catch (error) {
        const message = error && typeof error === "object" && "statusMessage" in error ? String(error.statusMessage) : "Nie udało się uruchomić skryptu";
        toast.add({ title: message, color: "error" });
      }
    }
    function showDetails(row) {
      selectedScript.value = row;
      detailsOpen.value = true;
    }
    function openRenderFor(row) {
      selectedScriptId.value = row.id;
      renderOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Uruchom teraz", icon: "i-lucide-play", onSelect: () => runScript(row) },
        { label: "Edytuj skrypt", icon: "i-lucide-pencil", onSelect: () => openEditScript(row) },
        { label: "Szczegóły skryptu", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Renderuj skrypt", icon: "i-lucide-play", onSelect: () => openRenderFor(row) }
      ], [
        { label: "Usuń skrypt", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteScript(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    async function insertScriptText(text) {
      const currentValue = scriptState.scriptBody || "";
      const activeElement = (void 0).activeElement;
      if (activeElement instanceof HTMLTextAreaElement && activeElement.value === currentValue) {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        scriptState.scriptBody = `${currentValue.slice(0, start)}${text}${currentValue.slice(end)}`;
        await nextTick();
        activeElement.selectionStart = start + text.length;
        activeElement.selectionEnd = start + text.length;
        activeElement.focus();
        return;
      }
      scriptState.scriptBody = `${currentValue}${currentValue ? "\n" : ""}${text}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$d;
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UFormField = _sfc_main$4;
      const _component_USelect = _sfc_main$5;
      const _component_UTextarea = _sfc_main$6;
      const _component_UTable = _sfc_main$7;
      const _component_UForm = _sfc_main$8;
      const _component_UInput = _sfc_main$a;
      const _component_UInputNumber = _sfc_main$b;
      const _component_USwitch = _sfc_main$c;
      const _component_UContextMenu = _sfc_main$2$1;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "automation-scripts",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Automatyzacja" }, {
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
                    open: unref(renderOpen),
                    "onUpdate:open": ($event) => isRef(renderOpen) ? renderOpen.value = $event : null,
                    title: "Podgląd skryptu"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="space-y-4"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_UFormField, { label: "Skrypt" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_USelect, {
                                modelValue: unref(selectedScriptId),
                                "onUpdate:modelValue": ($event) => isRef(selectedScriptId) ? selectedScriptId.value = $event : null,
                                items: unref(scriptItems),
                                class: "w-full"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_USelect, {
                                  modelValue: unref(selectedScriptId),
                                  "onUpdate:modelValue": ($event) => isRef(selectedScriptId) ? selectedScriptId.value = $event : null,
                                  items: unref(scriptItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UButton, {
                          label: "Renderuj",
                          icon: "i-lucide-play",
                          onClick: renderScript
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UFormField, { label: "Wynik" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UTextarea, {
                                modelValue: unref(renderedBody),
                                "onUpdate:modelValue": ($event) => isRef(renderedBody) ? renderedBody.value = $event : null,
                                class: "w-full font-mono",
                                rows: 12,
                                readonly: ""
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(renderedBody),
                                  "onUpdate:modelValue": ($event) => isRef(renderedBody) ? renderedBody.value = $event : null,
                                  class: "w-full font-mono",
                                  rows: 12,
                                  readonly: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UTable, {
                          data: Object.entries(unref(renderedVariables)).map(([name, value]) => ({ name, value })),
                          columns: variableColumns
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "space-y-4" }, [
                            createVNode(_component_UFormField, { label: "Skrypt" }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(selectedScriptId),
                                  "onUpdate:modelValue": ($event) => isRef(selectedScriptId) ? selectedScriptId.value = $event : null,
                                  items: unref(scriptItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UButton, {
                              label: "Renderuj",
                              icon: "i-lucide-play",
                              onClick: renderScript
                            }),
                            createVNode(_component_UFormField, { label: "Wynik" }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(renderedBody),
                                  "onUpdate:modelValue": ($event) => isRef(renderedBody) ? renderedBody.value = $event : null,
                                  class: "w-full font-mono",
                                  rows: 12,
                                  readonly: ""
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UTable, {
                              data: Object.entries(unref(renderedVariables)).map(([name, value]) => ({ name, value })),
                              columns: variableColumns
                            }, null, 8, ["data"])
                          ])
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UButton, {
                          label: "Podgląd",
                          icon: "i-lucide-eye",
                          variant: "subtle"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Podgląd",
                            icon: "i-lucide-eye",
                            variant: "subtle"
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USlideover, {
                    open: unref(scriptOpen),
                    "onUpdate:open": ($event) => isRef(scriptOpen) ? scriptOpen.value = $event : null,
                    title: unref(editingScriptId) ? "Edytuj skrypt" : "Dodaj skrypt automatyzacji"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(scriptSchema),
                          state: unref(scriptState),
                          class: "space-y-4",
                          onSubmit: saveScript
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
                                      modelValue: unref(scriptState).name,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(scriptState).name,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Zakres",
                                name: "scope"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(scriptState).scope,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                      items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).scope,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                        items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Wyzwalacz",
                                name: "triggerType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(scriptState).triggerType,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                      items: [...triggerTypeItems],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).triggerType,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                        items: [...triggerTypeItems],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Język",
                                name: "scriptLanguage"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(scriptState).scriptLanguage,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                      items: [...scriptLanguageItems],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).scriptLanguage,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                        items: [...scriptLanguageItems],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Timeout s",
                                name: "timeoutSeconds"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(scriptState).timeoutSeconds,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(scriptState).timeoutSeconds,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Profil",
                                name: "profileId"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(scriptState).profileId,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                      items: unref(profileItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).profileId,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                        items: unref(profileItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Urządzenie",
                                name: "equipmentId"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(scriptState).equipmentId,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                      items: unref(equipmentItems),
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).equipmentId,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                        items: unref(equipmentItems),
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Aktywny",
                                name: "isEnabled"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USwitch, {
                                      modelValue: unref(scriptState).isEnabled,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USwitch, {
                                        modelValue: unref(scriptState).isEnabled,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Treść skryptu",
                                name: "scriptBody",
                                required: ""
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(_component_UTextarea, {
                                            modelValue: unref(scriptState).scriptBody,
                                            "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                            class: "w-full font-mono",
                                            rows: 14
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(_component_UTextarea, {
                                              modelValue: unref(scriptState).scriptBody,
                                              "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                              class: "w-full font-mono",
                                              rows: 14
                                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                        default: withCtx(() => [
                                          createVNode(_component_UTextarea, {
                                            modelValue: unref(scriptState).scriptBody,
                                            "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                            class: "w-full font-mono",
                                            rows: 14
                                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                        ]),
                                        _: 1
                                      }, 8, ["items"])
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
                                      modelValue: unref(scriptState).name,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Zakres",
                                    name: "scope"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).scope,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                        items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Wyzwalacz",
                                    name: "triggerType"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).triggerType,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                        items: [...triggerTypeItems],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Język",
                                    name: "scriptLanguage"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(scriptState).scriptLanguage,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                        items: [...scriptLanguageItems],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Timeout s",
                                    name: "timeoutSeconds"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(scriptState).timeoutSeconds,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "Profil",
                                  name: "profileId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(scriptState).profileId,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                      items: unref(profileItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Urządzenie",
                                  name: "equipmentId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(scriptState).equipmentId,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                      items: unref(equipmentItems),
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Aktywny",
                                  name: "isEnabled"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USwitch, {
                                      modelValue: unref(scriptState).isEnabled,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Treść skryptu",
                                  name: "scriptBody",
                                  required: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                      default: withCtx(() => [
                                        createVNode(_component_UTextarea, {
                                          modelValue: unref(scriptState).scriptBody,
                                          "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                          class: "w-full font-mono",
                                          rows: 14
                                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                      ]),
                                      _: 1
                                    }, 8, ["items"])
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
                            schema: unref(scriptSchema),
                            state: unref(scriptState),
                            class: "space-y-4",
                            onSubmit: saveScript
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "Nazwa",
                                name: "name",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(scriptState).name,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Zakres",
                                  name: "scope"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(scriptState).scope,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                      items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Wyzwalacz",
                                  name: "triggerType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(scriptState).triggerType,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                      items: [...triggerTypeItems],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Język",
                                  name: "scriptLanguage"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(scriptState).scriptLanguage,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                      items: [...scriptLanguageItems],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Timeout s",
                                  name: "timeoutSeconds"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(scriptState).timeoutSeconds,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "Profil",
                                name: "profileId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(scriptState).profileId,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                    items: unref(profileItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Urządzenie",
                                name: "equipmentId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(scriptState).equipmentId,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                    items: unref(equipmentItems),
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Aktywny",
                                name: "isEnabled"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USwitch, {
                                    modelValue: unref(scriptState).isEnabled,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Treść skryptu",
                                name: "scriptBody",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(scriptState).scriptBody,
                                        "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                        class: "w-full font-mono",
                                        rows: 14
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }, 8, ["items"])
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
                          label: "Dodaj skrypt",
                          icon: "i-lucide-file-terminal",
                          onClick: openCreateScript
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj skrypt",
                            icon: "i-lucide-file-terminal",
                            onClick: openCreateScript
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USlideover, {
                      open: unref(renderOpen),
                      "onUpdate:open": ($event) => isRef(renderOpen) ? renderOpen.value = $event : null,
                      title: "Podgląd skryptu"
                    }, {
                      body: withCtx(() => [
                        createVNode("div", { class: "space-y-4" }, [
                          createVNode(_component_UFormField, { label: "Skrypt" }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(selectedScriptId),
                                "onUpdate:modelValue": ($event) => isRef(selectedScriptId) ? selectedScriptId.value = $event : null,
                                items: unref(scriptItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UButton, {
                            label: "Renderuj",
                            icon: "i-lucide-play",
                            onClick: renderScript
                          }),
                          createVNode(_component_UFormField, { label: "Wynik" }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(renderedBody),
                                "onUpdate:modelValue": ($event) => isRef(renderedBody) ? renderedBody.value = $event : null,
                                class: "w-full font-mono",
                                rows: 12,
                                readonly: ""
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UTable, {
                            data: Object.entries(unref(renderedVariables)).map(([name, value]) => ({ name, value })),
                            columns: variableColumns
                          }, null, 8, ["data"])
                        ])
                      ]),
                      default: withCtx(() => [
                        createVNode(_component_UButton, {
                          label: "Podgląd",
                          icon: "i-lucide-eye",
                          variant: "subtle"
                        })
                      ]),
                      _: 1
                    }, 8, ["open", "onUpdate:open"]),
                    createVNode(_component_USlideover, {
                      open: unref(scriptOpen),
                      "onUpdate:open": ($event) => isRef(scriptOpen) ? scriptOpen.value = $event : null,
                      title: unref(editingScriptId) ? "Edytuj skrypt" : "Dodaj skrypt automatyzacji"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(scriptSchema),
                          state: unref(scriptState),
                          class: "space-y-4",
                          onSubmit: saveScript
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "Nazwa",
                              name: "name",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(scriptState).name,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Zakres",
                                name: "scope"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(scriptState).scope,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                    items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Wyzwalacz",
                                name: "triggerType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(scriptState).triggerType,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                    items: [...triggerTypeItems],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Język",
                                name: "scriptLanguage"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(scriptState).scriptLanguage,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                    items: [...scriptLanguageItems],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Timeout s",
                                name: "timeoutSeconds"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(scriptState).timeoutSeconds,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "Profil",
                              name: "profileId"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(scriptState).profileId,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                  items: unref(profileItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Urządzenie",
                              name: "equipmentId"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(scriptState).equipmentId,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                  items: unref(equipmentItems),
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Aktywny",
                              name: "isEnabled"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(scriptState).isEnabled,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Treść skryptu",
                              name: "scriptBody",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(scriptState).scriptBody,
                                      "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                      class: "w-full font-mono",
                                      rows: 14
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }, 8, ["items"])
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
                          label: "Dodaj skrypt",
                          icon: "i-lucide-file-terminal",
                          onClick: openCreateScript
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
              createVNode(_component_UDashboardNavbar, { title: "Automatyzacja" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_USlideover, {
                    open: unref(renderOpen),
                    "onUpdate:open": ($event) => isRef(renderOpen) ? renderOpen.value = $event : null,
                    title: "Podgląd skryptu"
                  }, {
                    body: withCtx(() => [
                      createVNode("div", { class: "space-y-4" }, [
                        createVNode(_component_UFormField, { label: "Skrypt" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(selectedScriptId),
                              "onUpdate:modelValue": ($event) => isRef(selectedScriptId) ? selectedScriptId.value = $event : null,
                              items: unref(scriptItems),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          label: "Renderuj",
                          icon: "i-lucide-play",
                          onClick: renderScript
                        }),
                        createVNode(_component_UFormField, { label: "Wynik" }, {
                          default: withCtx(() => [
                            createVNode(_component_UTextarea, {
                              modelValue: unref(renderedBody),
                              "onUpdate:modelValue": ($event) => isRef(renderedBody) ? renderedBody.value = $event : null,
                              class: "w-full font-mono",
                              rows: 12,
                              readonly: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UTable, {
                          data: Object.entries(unref(renderedVariables)).map(([name, value]) => ({ name, value })),
                          columns: variableColumns
                        }, null, 8, ["data"])
                      ])
                    ]),
                    default: withCtx(() => [
                      createVNode(_component_UButton, {
                        label: "Podgląd",
                        icon: "i-lucide-eye",
                        variant: "subtle"
                      })
                    ]),
                    _: 1
                  }, 8, ["open", "onUpdate:open"]),
                  createVNode(_component_USlideover, {
                    open: unref(scriptOpen),
                    "onUpdate:open": ($event) => isRef(scriptOpen) ? scriptOpen.value = $event : null,
                    title: unref(editingScriptId) ? "Edytuj skrypt" : "Dodaj skrypt automatyzacji"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(scriptSchema),
                        state: unref(scriptState),
                        class: "space-y-4",
                        onSubmit: saveScript
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "Nazwa",
                            name: "name",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(scriptState).name,
                                "onUpdate:modelValue": ($event) => unref(scriptState).name = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Zakres",
                              name: "scope"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(scriptState).scope,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).scope = $event,
                                  items: ["DEVICE", "PROFILE", "CUSTOMER_SERVICE"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Wyzwalacz",
                              name: "triggerType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(scriptState).triggerType,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).triggerType = $event,
                                  items: [...triggerTypeItems],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Język",
                              name: "scriptLanguage"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(scriptState).scriptLanguage,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).scriptLanguage = $event,
                                  items: [...scriptLanguageItems],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Timeout s",
                              name: "timeoutSeconds"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(scriptState).timeoutSeconds,
                                  "onUpdate:modelValue": ($event) => unref(scriptState).timeoutSeconds = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "Profil",
                            name: "profileId"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(scriptState).profileId,
                                "onUpdate:modelValue": ($event) => unref(scriptState).profileId = $event,
                                items: unref(profileItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Urządzenie",
                            name: "equipmentId"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USelect, {
                                modelValue: unref(scriptState).equipmentId,
                                "onUpdate:modelValue": ($event) => unref(scriptState).equipmentId = $event,
                                items: unref(equipmentItems),
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Aktywny",
                            name: "isEnabled"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USwitch, {
                                modelValue: unref(scriptState).isEnabled,
                                "onUpdate:modelValue": ($event) => unref(scriptState).isEnabled = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Treść skryptu",
                            name: "scriptBody",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UContextMenu, { items: unref(scriptContextItems) }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(scriptState).scriptBody,
                                    "onUpdate:modelValue": ($event) => unref(scriptState).scriptBody = $event,
                                    class: "w-full font-mono",
                                    rows: 14
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }, 8, ["items"])
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
                        label: "Dodaj skrypt",
                        icon: "i-lucide-file-terminal",
                        onClick: openCreateScript
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
              title: "Szczegóły skryptu",
              subtitle: unref(selectedScript)?.name,
              item: unref(selectedScript)
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
                title: "Szczegóły skryptu",
                subtitle: unref(selectedScript)?.name,
                item: unref(selectedScript)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/automation/scripts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
