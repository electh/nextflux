# context-menu

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/context-menu.jsx:1`: Replace the handwritten coordinate-based menu with Base UI ContextMenu triggers, grouped items and controlled native dismissal. Delete src/components/ui/ContextMenu.jsx; remove obsolete coordinate state/handlers from its three consumers.
- `src/components/FeedList/components/FeedsGroupContent.jsx`: use the migrated context-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/FeedItem.jsx`: use the migrated context-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/ArticleCard.jsx`: use the migrated context-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/ContextMenu.jsx`: removed after all consumers moved to the lowercase native wrapper.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Right-click/long-press, placement, keyboard navigation and Escape dismissal are now managed by Base UI instead of manual coordinates.

## Verify by hand

Right-click an article/feed/category, arrow to an action and Enter; verify dismissal/focus return. Check mobile long-press on a touch device.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
