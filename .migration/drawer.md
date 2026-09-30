# drawer

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/drawer.jsx:1`: Add the shadcn Base Drawer wrapper; mobile Settings and responsive CustomModal use native swipe handling, controlled open state and titles.
- `src/components/Settings/Settings.jsx`: use the migrated drawer composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/CustomModal.jsx`: use the migrated drawer composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Mobile overlays now use Base Drawer gestures and focus handling rather than HeroUI Modal; swipe and nested-stack animation timing follows the registry.

## Verify by hand

Open from its real trigger; check title, initial focus, Tab containment, Escape/cancel/outside behavior and focus return. For async confirm, check loading, success and server-error paths without losing the dialog.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
