# Nuxt Safe Optimization Design

## Goal

Reduce Nuxt development overhead and repository clutter without removing CRM, network, FTTH, or other visible portal routes.

## Scope

- Remove only generated or accidental artifacts that are confirmed inside `/home/sarna/netcoreops`.
- Remove direct package dependencies only when the application does not import them directly.
- Keep Nuxt UI, CRM, FTTH, network pages, context-menu behavior, and local `rtk` workflow unchanged.
- Avoid aggressive production build tuning because the current WSL environment has already shown Nuxt build OOM behavior.

## Changes

- Disable Nuxt DevTools by default in `nuxt.config.ts` to reduce dev-server startup/runtime overhead.
- Replace the one `simple-icons` icon reference with an equivalent Lucide icon, then remove `@iconify-json/simple-icons`.
- Remove unused direct dependencies `@tanstack/table-core`, `net-snmp`, and `scule`; transitive copies required by Nuxt UI/Nuxt may remain in the lockfile.
- Delete the accidental `--host` directory, stale `scripts/bin/.netcoreops-build.swp` swap file, and generated `.output` build directory after verifying their absolute paths.

## Verification

- Run `cdc netcoreops-check rtk`.
- Smoke-test Nuxt dev pages if the dev server can start cleanly.
- Do not run the full production build in this pass unless memory is explicitly prepared and the user asks for it.
