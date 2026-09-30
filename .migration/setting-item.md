# setting-item

2026-09-30 · transformation engine / preserve customized wrapper · completed.

## Changed

- `src/components/ui/settingItem.jsx:1`: Recompose shared setting rows with Field, Base Switch/Slider, array-valued ToggleGroup and scalar radio menus while preserving existing setting storage and shortcut content.
- `src/components/Settings/Readability.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/components/Theme.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/components/Language.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/Appearance.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/AI.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/Shortcuts.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/General.jsx`: use the migrated setting-item composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Inspect the affected screen at desktop/mobile widths; use Tab/Enter/Space and verify labels, layout, disabled/loading state and retained business callbacks.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
