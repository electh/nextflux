# select

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/select.jsx:1`: Add Base Select composition. Consumers provide items and scalar values, use SelectGroup/Item, and preserve number-valued category IDs; empty category maps to null.
- `src/components/FeedList/components/AddFeedModal.jsx`: use the migrated select composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/EditFeedModal.jsx`: use the migrated select composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Open Add feed Type and Edit feed Category; use arrows/typeahead/Enter, verify visible label, numeric category value and null placeholder, then Escape.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
