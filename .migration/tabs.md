# tabs

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/tabs.jsx:1`: Replace HeroUI Tabs selectedKey with Base value/onValueChange, TabsList/Trigger and native active styles; correct orientation selectors.
- `src/components/Search/SearchModal.jsx`: use the migrated tabs composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/ArticleListFooter.jsx`: use the migrated tabs composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Base Tabs uses manual keyboard activation by default: arrow keys move focus; Enter/Space selects. Search deliberately returns focus to its input after a value change.

## Verify by hand

Open Search; arrow between Articles/Feeds then Enter/Space to activate. Verify selected panel/results source and input focus.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
