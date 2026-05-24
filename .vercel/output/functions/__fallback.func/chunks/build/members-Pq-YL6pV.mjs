import { _ as _sfc_main$2 } from './PageCard-Cd0S5FXf.mjs';
import { _ as _sfc_main$9, z as _sfc_main$c } from './server.mjs';
import { _ as _sfc_main$3 } from './Input-DVuEqpoa.mjs';
import { _ as _sfc_main$4 } from './Select-N__9sMNx.mjs';
import { _ as _sfc_main$5 } from './DropdownMenu-C0QiZHaA.mjs';
import { defineComponent, withAsyncContext, ref, computed, withCtx, createVNode, unref, isRef, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-B7i171gV.mjs';
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
import '@iconify/utils';
import 'consola';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './PopperArrow-CvIo2SqJ.mjs';
import './useFormControl-IzN_Be5X.mjs';
import './handleAndDispatchCustomEvent-Bk_AVSSo.mjs';
import './Kbd-BRG7R5Q0.mjs';
import '@internationalized/date';
import './RovingFocusGroup-ByIEls-F.mjs';
import './ssr-BO1H6xpe.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MembersList",
  __ssrInlineRender: true,
  props: {
    members: {}
  },
  setup(__props) {
    const items = [{
      label: "Edit member",
      onSelect: () => console.log("Edit member")
    }, {
      label: "Remove member",
      color: "error",
      onSelect: () => console.log("Remove member")
    }];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UAvatar = _sfc_main$c;
      const _component_USelect = _sfc_main$4;
      const _component_UDropdownMenu = _sfc_main$5;
      const _component_UButton = _sfc_main$9;
      _push(`<ul${ssrRenderAttrs(mergeProps({
        role: "list",
        class: "divide-y divide-default"
      }, _attrs))}><!--[-->`);
      ssrRenderList(__props.members, (member, index) => {
        _push(`<li class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"><div class="flex items-center gap-3 min-w-0">`);
        _push(ssrRenderComponent(_component_UAvatar, mergeProps({ ref_for: true }, member.avatar, { size: "md" }), null, _parent));
        _push(`<div class="text-sm min-w-0"><p class="text-highlighted font-medium truncate">${ssrInterpolate(member.name)}</p><p class="text-muted truncate">${ssrInterpolate(member.username)}</p></div></div><div class="flex items-center gap-3">`);
        _push(ssrRenderComponent(_component_USelect, {
          "model-value": member.role,
          items: ["member", "owner"],
          color: "neutral",
          ui: { value: "capitalize", item: "capitalize" }
        }, null, _parent));
        _push(ssrRenderComponent(_component_UDropdownMenu, {
          items,
          content: { align: "end" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-ellipsis-vertical",
                color: "neutral",
                variant: "ghost"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-ellipsis-vertical",
                  color: "neutral",
                  variant: "ghost"
                })
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div></li>`);
      });
      _push(`<!--]--></ul>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/MembersList.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "SettingsMembersList" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "members",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: members } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/members",
      { default: () => [] },
      "$6Lz_nx5mir"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const q = ref("");
    const filteredMembers = computed(() => {
      return members.value.filter((member) => {
        return member.name.search(new RegExp(q.value, "i")) !== -1 || member.username.search(new RegExp(q.value, "i")) !== -1;
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPageCard = _sfc_main$2;
      const _component_UButton = _sfc_main$9;
      const _component_UInput = _sfc_main$3;
      const _component_SettingsMembersList = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_UPageCard, {
        title: "Members",
        description: "Invite new members by email address.",
        variant: "naked",
        orientation: "horizontal",
        class: "mb-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              label: "Invite people",
              color: "neutral",
              class: "w-fit lg:ms-auto"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                label: "Invite people",
                color: "neutral",
                class: "w-fit lg:ms-auto"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UPageCard, {
        variant: "subtle",
        ui: { container: "p-0 sm:p-0 gap-y-0", wrapper: "items-stretch", header: "p-4 mb-0 border-b border-default" }
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(q),
              "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
              icon: "i-lucide-search",
              placeholder: "Search members",
              autofocus: "",
              class: "w-full"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: unref(q),
                "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                icon: "i-lucide-search",
                placeholder: "Search members",
                autofocus: "",
                class: "w-full"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_SettingsMembersList, { members: unref(filteredMembers) }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_SettingsMembersList, { members: unref(filteredMembers) }, null, 8, ["members"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings/members.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
