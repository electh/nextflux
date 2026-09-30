# switch

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/switch.jsx:1`: Replace HeroUI Switch with Base Switch; settings use checked/onCheckedChange and accessible labels.
- `src/components/ui/settingItem.jsx`: use the migrated switch composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Click labels and press Space on settings switches; verify checked state, disabled behavior and stored value.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
