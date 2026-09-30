# collapsible

2026-09-30 · transformation engine / preserve customized wrapper · completed.

## Changed

- `src/components/ui/collapsible.jsx:1`: Rewire the customized wrapper to Base UI Root/Trigger/Panel, render composition, --collapsible-panel-height and starting/ending transition attributes.
- `src/components/FeedList/components/AddFeedModal.jsx`: use the migrated collapsible composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/FeedsGroupContent.jsx`: use the migrated collapsible composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/EditFeedModal.jsx`: use the migrated collapsible composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Toggle category and advanced-feed panels via click and keyboard; ensure expanded state, height animation and reduced-motion behavior.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
