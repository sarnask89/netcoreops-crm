# NetCoreOps Agent Notes

## Scope

- Work in WSL in `/home/sarna/netcoreops`.
- Do not modify `C:\Users\xxx\crm-portal`. It may be read only as structural inspiration, especially for LMS-like CRM/database modeling.
- Prefer `cdc` to enter or run commands in the project directory.
- Use `rtk` in WSL where possible. Project helper scripts accept `rtk` and `nortk` modes.
- PostgreSQL is local in WSL. Sudo is configured without a password.

## Common Commands

Project scripts live in `/home/sarna/netcoreops/scripts/bin` and are symlinked into `/usr/bin`.

- Prefer local project helper scripts for routine work instead of raw `pnpm`/`nuxt` commands.
- Use `rtk` mode for checks, builds, dev server, imports, and live diagnostics unless the user explicitly asks for `nortk` or `rtk` is unavailable.

- `/usr/bin/cdc -> /home/sarna/netcoreops/scripts/bin/cdc`
  - `cdc` opens a shell in `/home/sarna/netcoreops`.
  - `cdc <command>` runs a command from the project directory.
- `/usr/bin/netcoreops-check -> /home/sarna/netcoreops/scripts/bin/netcoreops-check`
  - `netcoreops-check rtk` runs `rtk pnpm run lint`, `rtk pnpm run typecheck`, and `rtk pnpm run test`.
  - `netcoreops-check nortk` runs the same checks without `rtk`.
- `/usr/bin/netcoreops-build -> /home/sarna/netcoreops/scripts/bin/netcoreops-build`
  - `netcoreops-build rtk` runs the Nuxt production build through `rtk`.
  - `netcoreops-build nortk` runs the same build without `rtk`.
  - The script sets `NODE_OPTIONS=--max-old-space-size=4096` unless already provided.
- `/usr/bin/netcoreops-dev -> /home/sarna/netcoreops/scripts/bin/netcoreops-dev`
  - `netcoreops-dev rtk 3000` starts Nuxt dev on `0.0.0.0:3000` through `rtk`.
  - `netcoreops-dev nortk 3000` starts without `rtk`.
- `/usr/bin/netcoreops-db-import-sandomierz -> /home/sarna/netcoreops/scripts/bin/netcoreops-db-import-sandomierz`
  - `netcoreops-db-import-sandomierz rtk` imports TERYT/SIMC/ULIC dictionaries and restricts them to powiat sandomierski.
  - `netcoreops-db-import-sandomierz nortk` runs the same flow without `rtk`.
- `/usr/bin/netcoreops-mikrotik-check -> /home/sarna/netcoreops/scripts/bin/netcoreops-mikrotik-check`
  - `netcoreops-mikrotik-check rtk` runs read-only MikroTik DHCP lease status, ping, and ARP-ping checks.
  - Optional inventory ids can be passed after the mode, for example `netcoreops-mikrotik-check rtk MT-10-0-222-86`.
- `/usr/bin/netcoreops-netflow-configure -> /home/sarna/netcoreops/scripts/bin/netcoreops-netflow-configure`
  - `netcoreops-netflow-configure rtk --collector=10.0.222.226:2055` enables RouterOS Traffic Flow/NetFlow on active MikroTik equipment.
  - Interfaces are selected from DHCP server interfaces plus the active default-route uplink interface.
  - Optional inventory ids can be passed after the mode/collector to target specific routers.
- `/usr/bin/netcoreops-netflow-collector -> /home/sarna/netcoreops/scripts/bin/netcoreops-netflow-collector`
  - `netcoreops-netflow-collector rtk --port=2055` starts the local UDP NetFlow collector.
  - The collector parses NetFlow v5/v9 and IPFIX/v10 headers, aggregates packets per exporter/version, and writes `diagnostic_runs` rows with `run_type = netflow-received`.
  - This WSL collector is the only supported NetCoreOps NetFlow ingest path for this deployment.
- `/usr/bin/netcoreops-netflow-status -> /home/sarna/netcoreops/scripts/bin/netcoreops-netflow-status`
  - `netcoreops-netflow-status rtk` reads `/ip/traffic-flow`, `/ip/traffic-flow/target`, DHCP server interfaces, and default routes from active MikroTik equipment.
  - Optional inventory ids can be passed after the mode, for example `netcoreops-netflow-status rtk MT-10-0-222-86`.
- `/usr/bin/netcoreops-dhcp-active-users -> /home/sarna/netcoreops/scripts/bin/netcoreops-dhcp-active-users`
  - `netcoreops-dhcp-active-users rtk` samples active users on active MikroTik routers.
  - The active-user metric does not trust DHCP `bound` alone. A lease counts only when its MAC/IP also has live ARP, bridge host, or switch FDB evidence.
  - The script stores global, per-DHCP-server, and per-interface counts plus joined/left deltas in `diagnostic_runs` with `run_type = dhcp-active-users`.
- `/usr/bin/netcoreops-dhcp-active-users-watch -> /home/sarna/netcoreops/scripts/bin/netcoreops-dhcp-active-users-watch`
  - Runs `netcoreops-dhcp-active-users rtk` repeatedly. Default interval is 300 seconds; override with `NETCOREOPS_DHCP_ACTIVE_USERS_INTERVAL`.
- `/usr/bin/netcoreops-repair-ftth-customer-links -> /home/sarna/netcoreops/scripts/bin/netcoreops-repair-ftth-customer-links`
  - Reconciles existing `ftth_transparent_links` rows back into `customer_devices.ftth_onu_id` and `customer_devices.onu_equipment_id`.
  - Use after changing FTTH import/linking logic or after importing MAC maps that created transparent links before customer devices were backfilled.
Recommended verification after code changes:

```bash
cdc netcoreops-check rtk
cdc netcoreops-build rtk
```

Recommended local dev start:

```bash
sudo service postgresql start
sudo fuser -k 3000/tcp || true
setsid -f netcoreops-dev rtk 3000 >/tmp/netcoreops-dev.log 2>&1
```

## Current Product Direction

NetCoreOps is a local Nuxt 4 + Nuxt UI + Drizzle/PostgreSQL CRM/PIT system for network operators.

UI action model:

- Row actions in portal tables must be exposed through the right-click context menu.
- Do not add a visible actions column or per-row action buttons unless the user explicitly asks for that surface.
- When adding edit/delete/archive/details behavior to a table page, wire it into the page `rowContextItems` function used by `AppDataTable`.

Important data modeling rules:

- TERYT/SIMC/ULIC codes stay in definition/dictionary tables.
- CRM screens should show human-readable address and customer data, not raw street/locality codes.
- Address forms should use autosuggestion/autocomplete against imported TERYT/SIMC/ULIC data.
- Address data should be stored as structured fields:
  - TERYT area reference
  - SIMC locality reference
  - ULIC street reference
  - building number
  - apartment/unit number
  - optional free-text note only where needed for legacy/description purposes
- Customer address handling should follow the same pattern already used for service/device-related address selection.

## Planned Feature Notes

The next implementation should cover these accepted requirements:

1. Customer addresses
   - Replace the single free-text customer billing address form with structured address fields.
   - Add autosuggestion/autocomplete using the existing address dictionary search.
   - Keep CRM display human-readable: street name, building, apartment, locality.
   - Keep dictionary codes visible in definitions/PIT/export layers, not in normal CRM lists.

2. Automation variables and template rendering
   - Automation scripts must be able to use database-backed variables and static text.
   - Add frontend-editable variable definitions in a separate definitions page.
   - Definition format should be conceptually `variable_name: table|row/field` plus support for static text.
   - Variable definitions should include a value type: `string`, `int`, `date`, or `bool`.
   - Variables should support generating command lists such as firewall rules or managed device configuration.
   - Example target expression:

```text
ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}}
```

   - The implementation should support a preview/render endpoint before any real execution backend exists.
   - The renderer should support conditional blocks such as `if $deviceaccess=true [ ... ]` and `{{#if deviceaccess=true}}...{{/if}}`.
   - Script editors should use Nuxt UI context menus on right click to insert declared variables or typed variable placeholders.
   - Script execution remains out of scope unless explicitly requested; v1 should store definitions and render deterministic command text.

3. Dashboard search
   - Modify the dashboard search so typing `@` switches into database/function search.
   - Search targets should include CRM customers, devices, access profiles, automation scripts, dictionaries/functions, and useful routes.
   - Search results should navigate to the relevant page or function.
   - Normal search should continue to show static navigation entries.

## Existing Implemented Areas

- PostgreSQL/Drizzle baseline with migrations in `server/db/migrations`.
- Sandomierz-only TERYT/SIMC/ULIC importer: `server/db/import-teryt.ts`.
- UKE/PIT dictionaries, validation, and CSV export.
- Network modules: nodes, lines, equipment.
- Equipment management fields: hostname, management IP, port, protocol.
- Access profiles and profile-to-device/model bindings.
- Automation scripts module with stored script body, scope, trigger, language, profile/equipment links, and enabled/timeout fields.
- CRM customers and services with individual/business customer type.
- Live network drivers and import/diagnostic APIs:
  - MikroTik RouterOS v7: DHCP leases, networks, ping, ARP ping, bridge host, switch FDB fallback.
  - Dasan NOS over SSH: ONU active list, ONU MAC table, MAC lookup through `show mac | include`, RX power/ONU info.
  - Equipment diagnostics API redacts access secrets before returning command-tree/raw previews.

## Live Network Notes

### MikroTik

- RouterOS routers and RouterOS-controlled switches use the same driver surface.
- Supported read paths:
  - `/ip/dhcp-server/lease/print`
  - `/ip/dhcp-server/network/print`
  - `/ping`
  - `/tool/arp-ping`
  - `/interface/bridge/host/print`
  - `/interface/ethernet/switch/host/print`
  - `/interface/ethernet/switch/fdb/print`
- A RouterOS switch may still expose DHCP server commands, even if this deployment does not use switches as DHCP servers.
- Live smoke endpoint:

```bash
curl -sS http://127.0.0.1:3000/api/diagnostics/equipment/<equipment-id>/dhcp-leases?limit=3
curl -sS -X POST -H 'content-type: application/json' --data '{}' http://127.0.0.1:3000/api/diagnostics/equipment/<equipment-id>/mikrotik-check
```

### Dasan

- Dasan SSH runs on the management SSH port stored in the access profile/equipment config.
- Use `terminal length 0` before `show` commands to avoid paging.
- Most useful command discovery commands:
  - User CLI level: `show cli`, `show list`
  - Enable level: `enable`, then `show cli`, `show list`
- Dasan `show` commands support pipe filters. Use this for targeted MAC diagnostics:

```text
show mac | include XX:XX:XX:XX:XX:XX
show mac | exclude WORD
```

- Useful observed user-level commands:
  - `show arp`, `show ip arp`, `show ip interface brief`
  - `show interface (IFNAME|)`
  - `show port`, `show port module-info`, `show port status (PORTS|)`
  - `show vlan`
  - `show system`, `show version`
  - `show olt mac OLT_ID (|ONU_ID)`
  - `show olt mac count OLT_ID (|ONU_ID)`
  - `show olt rx-power OLT_ID (|ONU_ID)`
  - `show olt status (OLT_ID|)`
  - `show olt statistics (OLT_ID|)`
  - `show onu active (OLT_ID|)`
  - `show onu active count (OLT_ID|)`
  - `show onu detail-info (OLT_ID|)`
  - `show onu info (OLT_ID|)`
  - `show onu ip-host OLT_ID ONU_ID`
  - `show onu mac OLT_ID ONU_ID uni (eth|virtual-eth) UNI_PORT`
  - `show onu mac-address OLT_ID`
  - `show onu mgmt ip-path OLT_ID`
  - `show onu running-config OLT_ID ONU_ID`
  - `show onu status (OLT_ID|)`
  - `show onu system-status OLT_ID ONU_ID`
  - `show onu uni-status (OLT_ID|)`
  - `show onu vlan-filter OLT_ID`
  - `show onu vlan-gem-mapping OLT_ID`
- Additional useful enable-level commands:
  - `show mac (NAME|)`
  - `show mac NAME PORT`
  - `show mac count (PORTS|)`
  - `show running-config`
  - `show running-config gpon`
  - `show running-config gpon-olt (PORT|)`
  - `show running-config interface`
  - `show running-config rate-limit-profile (NAME|)`
  - `show running-config snmp`
- ONU management IPs are expected on VLAN 400, but VLAN 400 uses a different MAC than the customer access VLAN on the same ONU.
- Do not infer ONU management IP from customer access MAC. Prefer `show onu ip-host OLT_ID ONU_ID`, which returns per-host MAC/IP entries for the ONU.
- On the tested Dasan OLT, `show onu ip-host <oltPort> <onuId>` works directly from `SWITCH>`; entering `configure terminal -> gpon -> gpon olt ...` is not required for read-only diagnostics.
- Useful ONU management diagnostic:

```text
show onu ip-host OLT_ID ONU_ID
```

## Operational Notes

- Use `apply_patch` for manual file edits.
- Temporary scripts must be created only under system `/tmp` or under a clearly named local temporary workspace inside the repo. Do not leave ad hoc temporary scripts in normal project directories.
- Avoid destructive git commands.
- The repo may be in an unborn or dirty git state; do not revert user work.
- Use the `netcoreops-memory` skill when the user asks to remember something or when durable NetCoreOps context should be preserved.
- Save the most important NetCoreOps changes, plans, decisions, and explicit user memory requests to Mem. Do not store secrets, raw credentials, or noisy transient command output.
- After successful fixes and deployments, make a git commit and push the branch unless the user explicitly asks not to.
- Branch strategy: keep `main` as the aggregate/integration branch; use focused branches named `nms`, `crm`, `tools`, `integrations`, and `module-generator` for their respective workstreams.
  - `nms`: portal/application NMS and FTTH domain screens/APIs.
  - `tools`: operational scripts, diagnostics/import helpers, network drivers, and NetFlow collector/analytics code.
- If build memory issues return in WSL, ensure `/swapfile-netcoreops` is active before building:

```bash
sudo swapon /swapfile-netcoreops || true
```
