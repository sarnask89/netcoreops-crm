# Automation editor contract

This document records the expected automation script editor behavior for agent and reviewer checks.

## Required behavior

- The automation scripts page loads variable definitions from `/api/automation/variables`.
- Variable definitions expose `variableName` and `valueType` for insert menus.
- The script body editor uses a Nuxt UI `UContextMenu`.
- The variable insert action writes `{{variableName}}` placeholders.
- The conditional insert action writes `if $variableName=true [  ]` placeholders.
- Render preview stays wired to the dedicated script `/render` endpoint.

## Source page

- `app/pages/automation/scripts.vue`

## Rationale

The automation plan relies on right-click variable insertion and render preview before any command execution surface is expanded.
