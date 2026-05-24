import { _ as _sfc_main$2, a as _sfc_main$1, b as _sfc_main$c } from './DashboardSidebarCollapse-DD95YI0W.mjs';
import { _ as _sfc_main$3 } from './Slideover-DjbGE3Jt.mjs';
import { u as useToast, _ as _sfc_main$9 } from './server.mjs';
import { _ as _sfc_main$4 } from './Form-CH5OBfDe.mjs';
import { _ as _sfc_main$5 } from './FormField-D5WtVCdC.mjs';
import { _ as _sfc_main$6 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$7 } from './Textarea-C69jS_Io.mjs';
import { _ as _sfc_main$8 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$a } from './InputNumber-C_3Tnd-3.mjs';
import { _ as _sfc_main$b } from './Switch-BjjnqNfE.mjs';
import { _ as __nuxt_component_6 } from './AppDataTable-CYd00jpA.mjs';
import { _ as __nuxt_component_7 } from './AppRowDetailsSlideover-Q--6Q5Iy.mjs';
import { defineComponent, ref, reactive, withAsyncContext, mergeProps, withCtx, unref, isRef, createVNode, useSSRContext } from 'vue';
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
  __name: "access-profiles",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const profileOpen = ref(false);
    const detailsOpen = ref(false);
    const selectedRow = ref(null);
    const editingProfileId = ref(null);
    const profileSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      defaultProtocol: z.enum(["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"]),
      defaultPort: z.number().int().positive().max(65535).nullable().optional(),
      username: z.string().optional(),
      passwordEncrypted: z.string().optional(),
      snmpCommunityEncrypted: z.string().optional(),
      apiBaseUrl: z.string().optional(),
      apiTokenEncrypted: z.string().optional(),
      sshKeyEncrypted: z.string().optional(),
      isActive: z.boolean()
    });
    const profileState = reactive({
      defaultProtocol: "ssh",
      defaultPort: 22,
      isActive: true
    });
    const { data, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/network/access-profiles",
      {
        default: () => ({ success: false, data: [] })
      },
      "$yNtm-wgAV-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const columns = [
      { accessorKey: "name", header: "Profil" },
      { accessorKey: "defaultProtocol", header: "Protokół" },
      { accessorKey: "defaultPort", header: "Port" },
      { accessorKey: "username", header: "Login" },
      {
        id: "secrets",
        header: "Sekrety",
        cell: ({ row }) => [
          row.original.snmpCommunityEncrypted ? "SNMP" : null,
          row.original.apiBaseUrl ? "API" : null
        ].filter(Boolean).join(", ") || "SSH/hasło"
      },
      {
        id: "equipment",
        header: "Urządzenia",
        cell: ({ row }) => `${row.original.equipment?.length || 0}`
      },
      {
        id: "enabled",
        header: "Aktywny",
        cell: ({ row }) => row.original.isActive ? "Tak" : "Nie"
      }
    ];
    function resetProfileForm() {
      editingProfileId.value = null;
      selectedRow.value = null;
      Object.assign(profileState, {
        name: void 0,
        description: void 0,
        defaultProtocol: "ssh",
        defaultPort: 22,
        username: void 0,
        passwordEncrypted: void 0,
        snmpCommunityEncrypted: void 0,
        apiBaseUrl: void 0,
        apiTokenEncrypted: void 0,
        sshKeyEncrypted: void 0,
        isActive: true
      });
    }
    function openCreateProfile() {
      resetProfileForm();
      profileOpen.value = true;
    }
    function openEditProfile(row) {
      selectedRow.value = row;
      editingProfileId.value = row.id;
      Object.assign(profileState, {
        name: row.name,
        description: row.description || void 0,
        defaultProtocol: row.defaultProtocol,
        defaultPort: row.defaultPort || void 0,
        username: row.username || void 0,
        snmpCommunityEncrypted: void 0,
        apiBaseUrl: row.apiBaseUrl || void 0,
        isActive: row.isActive
      });
      profileOpen.value = true;
    }
    async function saveProfile(event) {
      await $fetch(editingProfileId.value ? `/api/network/access-profiles/${editingProfileId.value}` : "/api/network/access-profiles", {
        method: editingProfileId.value ? "PATCH" : "POST",
        body: {
          ...event.data,
          defaultPort: event.data.defaultPort || null,
          description: event.data.description || null,
          username: event.data.username || null,
          passwordEncrypted: event.data.passwordEncrypted || null,
          snmpCommunityEncrypted: event.data.snmpCommunityEncrypted || null,
          apiBaseUrl: event.data.apiBaseUrl || null,
          apiTokenEncrypted: event.data.apiTokenEncrypted || null,
          sshKeyEncrypted: event.data.sshKeyEncrypted || null
        }
      });
      toast.add({ title: "Profil zarządzania zapisany", color: "success" });
      profileOpen.value = false;
      resetProfileForm();
      await refresh();
    }
    async function deleteProfile(row) {
      if (!(void 0).confirm(`Usunąć profil ${row.name}?`)) return;
      await $fetch(`/api/network/access-profiles/${row.id}`, { method: "DELETE" });
      toast.add({ title: "Profil usunięty", color: "success" });
      await refresh();
    }
    function showDetails(row) {
      selectedRow.value = row;
      detailsOpen.value = true;
    }
    function rowContextItems(row) {
      return [[
        { label: "Edytuj profil", icon: "i-lucide-pencil", onSelect: () => openEditProfile(row) },
        { label: "Szczegóły profilu", icon: "i-lucide-panel-right-open", onSelect: () => showDetails(row) },
        { label: "Usuń profil", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteProfile(row) },
        { label: "Odśwież", icon: "i-lucide-refresh-cw", onSelect: () => refresh() }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardPanel = _sfc_main$2;
      const _component_UDashboardNavbar = _sfc_main$1;
      const _component_UDashboardSidebarCollapse = _sfc_main$c;
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$9;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_UTextarea = _sfc_main$7;
      const _component_USelect = _sfc_main$8;
      const _component_UInputNumber = _sfc_main$a;
      const _component_USwitch = _sfc_main$b;
      const _component_AppDataTable = __nuxt_component_6;
      const _component_AppRowDetailsSlideover = __nuxt_component_7;
      _push(ssrRenderComponent(_component_UDashboardPanel, mergeProps({
        id: "network-access-profiles",
        ui: { body: "p-0 sm:p-0 gap-0 sm:gap-0" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UDashboardNavbar, { title: "Profile dostępowe sprzętu" }, {
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
                    open: unref(profileOpen),
                    "onUpdate:open": ($event) => isRef(profileOpen) ? profileOpen.value = $event : null,
                    title: unref(editingProfileId) ? "Edytuj profil" : "Dodaj profil zarządzania"
                  }, {
                    body: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UForm, {
                          schema: unref(profileSchema),
                          state: unref(profileState),
                          class: "space-y-4",
                          onSubmit: saveProfile
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
                                      modelValue: unref(profileState).name,
                                      "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).name,
                                        "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
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
                                      modelValue: unref(profileState).description,
                                      "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(profileState).description,
                                        "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Protokół domyślny",
                                name: "defaultProtocol"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USelect, {
                                      modelValue: unref(profileState).defaultProtocol,
                                      "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                      items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(profileState).defaultProtocol,
                                        "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                        items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Port",
                                name: "defaultPort"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInputNumber, {
                                      modelValue: unref(profileState).defaultPort,
                                      "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(profileState).defaultPort,
                                        "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div><div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Login",
                                name: "username"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(profileState).username,
                                      "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).username,
                                        "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Hasło / sekret",
                                name: "passwordEncrypted"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(profileState).passwordEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).passwordEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                        type: "password",
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "SNMP community",
                                name: "snmpCommunityEncrypted"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(profileState).snmpCommunityEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).snmpCommunityEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                        type: "password",
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="grid gap-4 md:grid-cols-2"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "API endpoint",
                                name: "apiBaseUrl"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(profileState).apiBaseUrl,
                                      "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).apiBaseUrl,
                                        "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "API token",
                                name: "apiTokenEncrypted"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UInput, {
                                      modelValue: unref(profileState).apiTokenEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).apiTokenEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                        type: "password",
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`</div>`);
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "SSH key",
                                name: "sshKeyEncrypted"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_UTextarea, {
                                      modelValue: unref(profileState).sshKeyEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                      class: "w-full font-mono",
                                      rows: 5
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_UTextarea, {
                                        modelValue: unref(profileState).sshKeyEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                        class: "w-full font-mono",
                                        rows: 5
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UFormField, {
                                label: "Aktywny",
                                name: "isActive"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_USwitch, {
                                      modelValue: unref(profileState).isActive,
                                      "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_USwitch, {
                                        modelValue: unref(profileState).isActive,
                                        "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
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
                                      modelValue: unref(profileState).name,
                                      "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
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
                                      modelValue: unref(profileState).description,
                                      "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Protokół domyślny",
                                    name: "defaultProtocol"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_USelect, {
                                        modelValue: unref(profileState).defaultProtocol,
                                        "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                        items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Port",
                                    name: "defaultPort"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInputNumber, {
                                        modelValue: unref(profileState).defaultPort,
                                        "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "Login",
                                    name: "username"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).username,
                                        "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "Hasło / sekret",
                                    name: "passwordEncrypted"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).passwordEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                        type: "password",
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "SNMP community",
                                  name: "snmpCommunityEncrypted"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(profileState).snmpCommunityEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                  createVNode(_component_UFormField, {
                                    label: "API endpoint",
                                    name: "apiBaseUrl"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).apiBaseUrl,
                                        "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_UFormField, {
                                    label: "API token",
                                    name: "apiTokenEncrypted"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(profileState).apiTokenEncrypted,
                                        "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                        type: "password",
                                        class: "w-full"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ]),
                                    _: 1
                                  })
                                ]),
                                createVNode(_component_UFormField, {
                                  label: "SSH key",
                                  name: "sshKeyEncrypted"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UTextarea, {
                                      modelValue: unref(profileState).sshKeyEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                      class: "w-full font-mono",
                                      rows: 5
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Aktywny",
                                  name: "isActive"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USwitch, {
                                      modelValue: unref(profileState).isActive,
                                      "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
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
                            schema: unref(profileSchema),
                            state: unref(profileState),
                            class: "space-y-4",
                            onSubmit: saveProfile
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UFormField, {
                                label: "Nazwa",
                                name: "name",
                                required: ""
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).name,
                                    "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
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
                                    modelValue: unref(profileState).description,
                                    "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Protokół domyślny",
                                  name: "defaultProtocol"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_USelect, {
                                      modelValue: unref(profileState).defaultProtocol,
                                      "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                      items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Port",
                                  name: "defaultPort"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInputNumber, {
                                      modelValue: unref(profileState).defaultPort,
                                      "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "Login",
                                  name: "username"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(profileState).username,
                                      "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "Hasło / sekret",
                                  name: "passwordEncrypted"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(profileState).passwordEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "SNMP community",
                                name: "snmpCommunityEncrypted"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).snmpCommunityEncrypted,
                                    "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                    type: "password",
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                                createVNode(_component_UFormField, {
                                  label: "API endpoint",
                                  name: "apiBaseUrl"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(profileState).apiBaseUrl,
                                      "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_UFormField, {
                                  label: "API token",
                                  name: "apiTokenEncrypted"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(profileState).apiTokenEncrypted,
                                      "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                      type: "password",
                                      class: "w-full"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              createVNode(_component_UFormField, {
                                label: "SSH key",
                                name: "sshKeyEncrypted"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UTextarea, {
                                    modelValue: unref(profileState).sshKeyEncrypted,
                                    "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                    class: "w-full font-mono",
                                    rows: 5
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Aktywny",
                                name: "isActive"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USwitch, {
                                    modelValue: unref(profileState).isActive,
                                    "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
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
                          label: "Dodaj profil",
                          icon: "i-lucide-key-round",
                          onClick: openCreateProfile
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            label: "Dodaj profil",
                            icon: "i-lucide-key-round",
                            onClick: openCreateProfile
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USlideover, {
                      open: unref(profileOpen),
                      "onUpdate:open": ($event) => isRef(profileOpen) ? profileOpen.value = $event : null,
                      title: unref(editingProfileId) ? "Edytuj profil" : "Dodaj profil zarządzania"
                    }, {
                      body: withCtx(() => [
                        createVNode(_component_UForm, {
                          schema: unref(profileSchema),
                          state: unref(profileState),
                          class: "space-y-4",
                          onSubmit: saveProfile
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UFormField, {
                              label: "Nazwa",
                              name: "name",
                              required: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).name,
                                  "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
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
                                  modelValue: unref(profileState).description,
                                  "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Protokół domyślny",
                                name: "defaultProtocol"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_USelect, {
                                    modelValue: unref(profileState).defaultProtocol,
                                    "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                    items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Port",
                                name: "defaultPort"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInputNumber, {
                                    modelValue: unref(profileState).defaultPort,
                                    "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "Login",
                                name: "username"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).username,
                                    "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "Hasło / sekret",
                                name: "passwordEncrypted"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).passwordEncrypted,
                                    "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                    type: "password",
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "SNMP community",
                              name: "snmpCommunityEncrypted"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).snmpCommunityEncrypted,
                                  "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                  type: "password",
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                              createVNode(_component_UFormField, {
                                label: "API endpoint",
                                name: "apiBaseUrl"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).apiBaseUrl,
                                    "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_UFormField, {
                                label: "API token",
                                name: "apiTokenEncrypted"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UInput, {
                                    modelValue: unref(profileState).apiTokenEncrypted,
                                    "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                    type: "password",
                                    class: "w-full"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              })
                            ]),
                            createVNode(_component_UFormField, {
                              label: "SSH key",
                              name: "sshKeyEncrypted"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UTextarea, {
                                  modelValue: unref(profileState).sshKeyEncrypted,
                                  "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                  class: "w-full font-mono",
                                  rows: 5
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Aktywny",
                              name: "isActive"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USwitch, {
                                  modelValue: unref(profileState).isActive,
                                  "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
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
                          label: "Dodaj profil",
                          icon: "i-lucide-key-round",
                          onClick: openCreateProfile
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
              createVNode(_component_UDashboardNavbar, { title: "Profile dostępowe sprzętu" }, {
                leading: withCtx(() => [
                  createVNode(_component_UDashboardSidebarCollapse)
                ]),
                right: withCtx(() => [
                  createVNode(_component_USlideover, {
                    open: unref(profileOpen),
                    "onUpdate:open": ($event) => isRef(profileOpen) ? profileOpen.value = $event : null,
                    title: unref(editingProfileId) ? "Edytuj profil" : "Dodaj profil zarządzania"
                  }, {
                    body: withCtx(() => [
                      createVNode(_component_UForm, {
                        schema: unref(profileSchema),
                        state: unref(profileState),
                        class: "space-y-4",
                        onSubmit: saveProfile
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UFormField, {
                            label: "Nazwa",
                            name: "name",
                            required: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(profileState).name,
                                "onUpdate:modelValue": ($event) => unref(profileState).name = $event,
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
                                modelValue: unref(profileState).description,
                                "onUpdate:modelValue": ($event) => unref(profileState).description = $event,
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Protokół domyślny",
                              name: "defaultProtocol"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_USelect, {
                                  modelValue: unref(profileState).defaultProtocol,
                                  "onUpdate:modelValue": ($event) => unref(profileState).defaultProtocol = $event,
                                  items: ["ssh", "snmp", "http", "https", "tr069", "netconf", "routeros"],
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Port",
                              name: "defaultPort"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInputNumber, {
                                  modelValue: unref(profileState).defaultPort,
                                  "onUpdate:modelValue": ($event) => unref(profileState).defaultPort = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "Login",
                              name: "username"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).username,
                                  "onUpdate:modelValue": ($event) => unref(profileState).username = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "Hasło / sekret",
                              name: "passwordEncrypted"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).passwordEncrypted,
                                  "onUpdate:modelValue": ($event) => unref(profileState).passwordEncrypted = $event,
                                  type: "password",
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "SNMP community",
                            name: "snmpCommunityEncrypted"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(profileState).snmpCommunityEncrypted,
                                "onUpdate:modelValue": ($event) => unref(profileState).snmpCommunityEncrypted = $event,
                                type: "password",
                                class: "w-full"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode("div", { class: "grid gap-4 md:grid-cols-2" }, [
                            createVNode(_component_UFormField, {
                              label: "API endpoint",
                              name: "apiBaseUrl"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).apiBaseUrl,
                                  "onUpdate:modelValue": ($event) => unref(profileState).apiBaseUrl = $event,
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_UFormField, {
                              label: "API token",
                              name: "apiTokenEncrypted"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UInput, {
                                  modelValue: unref(profileState).apiTokenEncrypted,
                                  "onUpdate:modelValue": ($event) => unref(profileState).apiTokenEncrypted = $event,
                                  type: "password",
                                  class: "w-full"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            })
                          ]),
                          createVNode(_component_UFormField, {
                            label: "SSH key",
                            name: "sshKeyEncrypted"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UTextarea, {
                                modelValue: unref(profileState).sshKeyEncrypted,
                                "onUpdate:modelValue": ($event) => unref(profileState).sshKeyEncrypted = $event,
                                class: "w-full font-mono",
                                rows: 5
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormField, {
                            label: "Aktywny",
                            name: "isActive"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_USwitch, {
                                modelValue: unref(profileState).isActive,
                                "onUpdate:modelValue": ($event) => unref(profileState).isActive = $event
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
                        label: "Dodaj profil",
                        icon: "i-lucide-key-round",
                        onClick: openCreateProfile
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
              title: "Szczegóły profilu",
              subtitle: unref(selectedRow)?.name,
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
                title: "Szczegóły profilu",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/network/access-profiles.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
