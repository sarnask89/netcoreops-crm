# LMS/LMS-Plus Parity And FTTH Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring NetCoreOps closer to LMS/LMS-Plus operator workflows while separating all FTTH/GPON/ONU logic into a dedicated network submodule linked cleanly to customer devices and backbone devices.

**Architecture:** Keep CRM, billing, generic network inventory, and FTTH as separate bounded modules. FTTH owns OLT/PON/ONU/MAC/IP-host discovery and exposes relations to generic `networkEquipment` and `customerDevices`; billing owns tariffs/subscriptions/assignments; CRM owns customers/contracts/contact/address data.

**Tech Stack:** Nuxt 4, Nuxt UI v4, Nitro API, Drizzle ORM, PostgreSQL, WSL scripts with optional `rtk`, Dasan SSH driver, MikroTik RouterOS API driver.

---

## Reference Baseline

LMS database documentation treats these as separate but connected domains:

- `customers`, customer groups and contacts.
- `networks`, `netdevices`, `netlinks`, `nodes`, `macs`.
- `tariffs`, `assignments`, `nodeassignments`, liabilities/payments/cash.
- documents/contracts/invoices.
- helpdesk, events and user/access rights.

References:

- LMS database structure: https://lms.org.pl/doc/devel.html
- Stable LMS DB reference: https://stable.lms.org.pl/doc/html/en/devel-db.html
- LMS nodes UI/workflow reference: https://stable.lms.org.pl/doc/html/en/menu-nodes.html

NetCoreOps already has customers, network nodes/lines/equipment, customer devices, tariffs, subscriptions, diagnostics, import runs, PIT/UKE dictionaries and export. The largest gaps versus LMS/LMS-Plus level are deeper assignment/billing/accounting, documents/contracts, IP/MAC inventory, rights/audit trail, and a cleanly separated FTTH model.

## Target Module Split

### Generic Network

Owns infrastructure that is not GPON-specific:

- `networkNodes`
- `networkLines`
- `networkEquipment`
- `deviceTypes`
- `deviceModels`
- `accessProfiles`
- `managementDrivers`

It may know that a device is an OLT or switch, but it must not own ONU service state, PON MAC tables or VLAN 400 IP-host details.

### FTTH Submodule

New route group:

- `/network/ftth/olts`
- `/network/ftth/pons`
- `/network/ftth/onus`
- `/network/ftth/mac-map`
- `/network/ftth/imports`
- `/network/ftth/diagnostics`

New API group:

- `/api/ftth/olts`
- `/api/ftth/pons`
- `/api/ftth/onus`
- `/api/ftth/mac-map`
- `/api/ftth/imports/dasan/:equipmentId/...`
- `/api/ftth/diagnostics/...`

New DB tables:

- `ftthOlts`: one row per OLT-capable `networkEquipment`.
- `ftthPonPorts`: OLT PON ports, e.g. `1`, `2`, `1/1`, depending on vendor.
- `ftthOnus`: ONU identity and state, linked to `ftthPonPorts` and optionally to a `networkEquipment` row.
- `ftthOnuIpHosts`: output of `show onu ip-host OLT_ID ONU_ID`; VLAN 400 management IP/MAC lives here.
- `ftthOnuMacs`: output of `show onu mac <olt_port> <onu_id>` or `show olt mac`.
- `ftthTransparentLinks`: detected transparent/bridge ONU cases where several downstream MACs imply customer CPE or backbone equipment behind the ONU.

Existing columns `networkEquipment.onuPort`, `networkEquipment.onuId` and `customerDevices.onuEquipmentId` stay temporarily as compatibility fields, then become derived/legacy after migration.

## Required LMS/LMS-Plus Parity Work

### 1. Preserve Current Work And Stabilize Baseline

- [ ] Run `cdc git status --short` and note that UI audit changes may be in progress.
- [ ] Run `cdc netcoreops-check rtk`.
- [ ] Fix any type/lint/test failures before schema work.
- [ ] Run `cdc netcoreops-build rtk`.
- [ ] Commit or checkpoint the current UI-table work before FTTH schema changes.

### 2. Add LMS-Style IP/MAC Inventory

Create separate inventory instead of storing only one MAC/IP on `customerDevices`.

Files:

- Modify `server/db/schema.ts`.
- Modify `server/db/relations.ts`.
- Add tests in `server/network-drivers/parsers.test.ts` or new `server/utils/network-inventory.test.ts`.

Tables:

- `ipNetworks`: name, CIDR, gateway, VLAN, owner node/equipment, status.
- `ipAddresses`: network id, IP, assignment type, customer device id, equipment id, source import run id.
- `macAddresses`: MAC, owner type, customer device id, equipment id, source, firstSeenAt, lastSeenAt.

Reason: LMS has `networks`, `nodes`, and `macs`; NetCoreOps needs the same separation so DHCP lease import, Dasan MAC tables and PIT export do not fight over one field.

### 3. Split FTTH Schema Out Of Generic Equipment

Files:

- Modify `server/db/schema.ts`.
- Modify `server/db/relations.ts`.
- Add migration through `pnpm db:generate`.
- Add seed/update scripts only if needed.

Core schema:

- `ftthOlts.networkEquipmentId -> networkEquipment.id`.
- `ftthPonPorts.oltId -> ftthOlts.id`.
- `ftthOnus.ponPortId -> ftthPonPorts.id`.
- `ftthOnus.networkEquipmentId -> networkEquipment.id` for an ONU represented as managed/passive equipment.
- `ftthOnuIpHosts.onuId -> ftthOnus.id`.
- `ftthOnuMacs.onuId -> ftthOnus.id`.
- `ftthTransparentLinks.onuId -> ftthOnus.id`.
- `ftthTransparentLinks.backboneEquipmentId -> networkEquipment.id` when the MAC belongs to backbone equipment behind transparent ONU.
- `ftthTransparentLinks.customerDeviceId -> customerDevices.id` when the MAC belongs to customer CPE.

Detection rule:

- If `show onu mac <olt_port> <onu_id>` returns more than one usable downstream MAC, classify the ONU as `transparentCandidate`.
- If any downstream MAC matches `networkEquipment.macAddress`, create/update `ftthTransparentLinks` with `linkType = BACKBONE_BEHIND_ONU`.
- If any downstream MAC matches `customerDevices.macAddress`, create/update `ftthTransparentLinks` with `linkType = CUSTOMER_DEVICE_BEHIND_ONU`.
- Do not use VLAN 400 MAC as customer access MAC. VLAN 400 management MAC/IP belongs to `ftthOnuIpHosts`.

### 4. Move Dasan FTTH Driver Functions Behind FTTH Service

Files:

- Create `server/ftth/types.ts`.
- Create `server/ftth/dasan-ftth.service.ts`.
- Create `server/ftth/transparent-onu-detector.ts`.
- Move or wrap current Dasan operations from `server/network-drivers/dasan.driver.ts`.

Required driver operations:

- `listOnus(oltEquipmentId)`: currently `show onu active`.
- `getOnuMacTable(oltEquipmentId, oltPort, onuId)`: `show onu mac <olt_port> <onu_id>` preferred; fallback to `show olt mac <olt_port> <onu_id>`.
- `getOnuIpHosts(oltEquipmentId, oltPort, onuId)`: `show onu ip-host <olt_port> <onu_id>`.
- `getOnuSignal(oltEquipmentId, oltPort, onuId)`: `show olt rx-power <olt_port> <onu_id>`.
- `lookupMac(oltEquipmentId, mac)`: `show mac | include <mac>`.

Acceptance:

- Live call for known OLT and ONU returns parsed IP-host rows.
- Live MAC table call identifies at least one downstream MAC or returns an explicit empty result.
- All raw outputs are redacted before storage/display.

### 5. Add FTTH Import Preview/Apply Workflow

Files:

- Create `server/api/ftth/imports/dasan/[equipmentId]/onus.post.ts`.
- Create `server/api/ftth/imports/dasan/[equipmentId]/mac-map.post.ts`.
- Create `server/api/ftth/imports/dasan/[equipmentId]/ip-hosts.post.ts`.
- Create `server/ftth/import-actions.ts`.
- Replace old `/api/import/dasan/...` endpoints with wrappers or deprecate them after UI migration.

Modes:

- `preview`: returns actions only.
- `apply`: upserts `ftthOlts`, `ftthPonPorts`, `ftthOnus`, `ftthOnuMacs`, `ftthOnuIpHosts`, `ftthTransparentLinks`.

Conflict handling:

- Existing ONU by `(oltId, ponPort, onuIdentifier)` updates.
- Existing serial number on another ONU becomes conflict, not insert failure.
- MAC already owned by a backbone device creates transparent backbone link.
- MAC already owned by a customer CPE creates customer link.
- VLAN 400 IP-host MAC is never treated as access MAC.

### 6. Create FTTH UI Section

Files:

- Create `app/pages/network/ftth/olts.vue`.
- Create `app/pages/network/ftth/pons.vue`.
- Create `app/pages/network/ftth/onus.vue`.
- Create `app/pages/network/ftth/imports.vue`.
- Create `app/pages/network/ftth/diagnostics.vue`.
- Modify `app/layouts/default.vue` navigation.

UI rules:

- Tables use full panel width outside sidebar.
- Right-click context menus on rows.
- Edit forms open in `UPopover` where the form is small and local.
- Diagnostic/detail/test functions open in `USlideover`.
- ONU row menu includes:
  - `Szczegóły ONU`
  - `MAC table`
  - `IP-host / VLAN 400`
  - `RX power`
  - `Transparent bridge analysis`
  - `Powiąż z klientem`
  - `Powiąż ze sprzętem szkieletowym`

### 7. Rework Customer Device Relations

Files:

- Modify `server/db/schema.ts`.
- Modify `server/db/relations.ts`.
- Modify `server/api/crm/customer-devices/index.get.ts`.
- Modify customer-device diagnostics endpoints.

Target:

- `customerDevices` links to `ftthOnus` through a new nullable `ftthOnuId`.
- Keep `equipmentId` for router/DHCP source.
- Keep `networkEquipment` relation for CPE if the CPE is also inventoried as equipment.
- Display customer device relation as human-readable:
  - Router/DHCP source
  - OLT
  - PON port
  - ONU id/serial
  - active tariff/subscription

### 8. Complete LMS-Style Billing Assignments

Files:

- Extend `tariffs` and `subscriptions`, or add assignment tables.
- Add APIs under `/api/billing/assignments`.
- Add UI under `/billing/assignments`.

Needed concepts:

- Customer-level assignment, equivalent to LMS `assignments`.
- Device/node-level assignment, equivalent to LMS `nodeassignments`.
- Tariff changes with date ranges.
- Liability/payment schedule.
- Invoice/export-ready ledger later.

Acceptance:

- One customer can have several devices.
- Each device can have several active/inactive subscriptions.
- Tariff default price is copied into subscription, with override allowed.
- Historical subscriptions remain queryable.

### 9. Add LMS Operational Modules After FTTH

Priority order:

- Documents/contracts: contract templates, generated agreement, attachment store.
- Payments/cash ledger: manual payments, imported bank statements, balance.
- Helpdesk: tickets linked to customer/device/ONU.
- Events/tasks: installation, service call, outage.
- User/roles/audit: operator accounts, permissions, audit log.

These should not block FTTH separation.

## Test Plan

- `cdc netcoreops-check rtk`
- `cdc netcoreops-build rtk`
- `pnpm db:generate`
- `pnpm db:migrate`
- Parser tests:
  - Dasan `show onu ip-host`
  - Dasan `show onu mac`
  - Multiple downstream MACs create transparent candidate.
  - VLAN 400 host is kept in `ftthOnuIpHosts`, not customer device.
- Import tests:
  - Preview writes nothing.
  - Apply upserts OLT/PON/ONU.
  - Duplicate serial does not crash.
  - Backbone MAC behind ONU links to `networkEquipment`.
  - Customer MAC behind ONU links to `customerDevices`.
- UI smoke:
  - `/network/ftth/onus` loads full-width table.
  - Right-click on ONU opens context menu.
  - Diagnostics open in slideover.
  - Edit/create lightweight definitions open in popover.

## Rollout Order

1. Finish/checkpoint current UI audit work.
2. Add FTTH schema and migrations.
3. Add parsers and service layer.
4. Move Dasan imports into `/api/ftth`.
5. Add FTTH UI section and navigation.
6. Migrate existing ONU rows from `networkEquipment` into `ftthOnus`.
7. Update CRM customer-device views to use FTTH relations.
8. Extend billing assignments.
9. Add documents/payments/helpdesk/users/audit.
