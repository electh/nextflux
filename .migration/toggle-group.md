# toggle-group

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/toggle-group.jsx:1`: Use Base ToggleGroup array values for compact setting options and discovered feed selection; reject empty selection in required setting groups and correct orientation styles.
- `src/components/FeedList/components/ResultListbox.jsx`: use the migrated toggle-group composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/settingItem.jsx`: use the migrated toggle-group composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Base uses array values even for single selection. Required settings keep the previous value when an attempted deselect produces an empty array; feed discovery remains single-select.

## Verify by hand

Inspect the affected screen at desktop/mobile widths; use Tab/Enter/Space and verify labels, layout, disabled/loading state and retained business callbacks.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
