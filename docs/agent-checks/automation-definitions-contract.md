# Automation variable definitions contract

This document records the expected automation variable definitions page behavior for agent and reviewer checks.

## Required behavior

- The page loads variable definitions from `/api/automation/variables`.
- The page loads the source catalog from `/api/automation/variables/sources`.
- Variable value types remain `string`, `int`, `date`, and `bool`.
- `STATIC` and `DATABASE` source forms stay separated.
- Database variables expose table, row lookup column, row lookup value, and field selection.
- Static variables expose a static text/value input.
- Row actions stay behind `AppDataTable` context items rather than a visible actions column.

## Source page

- `app/pages/automation/definitions.vue`

## Rationale

The automation plan depends on deterministic variable definitions before templates and render previews are expanded further.
