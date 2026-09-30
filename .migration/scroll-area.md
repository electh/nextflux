# scroll-area

2026-09-30 · transformation engine / preserve customized wrapper · completed.

## Changed

- `src/components/ui/scroll-area.jsx:1`: Preserve the customized scroll-area API while replacing Radix with Base Root/Viewport/Content/Scrollbar/Thumb/Corner and scrollbar positioning.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Render an overflowing vertical/horizontal ScrollArea; wheel/drag thumb, check thumb sizing and keyboard scrolling. Article scroll tracking still uses the preserved native DOM ref.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
