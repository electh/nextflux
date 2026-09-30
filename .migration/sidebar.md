# sidebar

2026-09-30 · transformation engine / preserve customized wrapper · completed.

## Changed

- `src/components/ui/sidebar.jsx:1`: Preserve sidebar sizing, state, keyboard shortcut and visual classes; replace Radix Slot with useRender for neutral parts and the real Base Button for interactive parts. Mobile overlay uses Sheet; link renders pass nativeButton=false.
- `src/App.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/FeedListSidebar.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/FeedsGroupContent.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/FeedsGroup.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/ProfileButton.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/ArticlesGroup.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddFeedButton.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/FeedItem.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/ArticleListHeader.jsx`: use the migrated sidebar composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

The mobile Sidebar is now a modal Sheet with focus containment and Escape/outside dismissal, instead of a hand-built overlay. Desktop collapse and shortcut remain.

## Verify by hand

Check desktop collapse and Ctrl/Cmd+B; on mobile open/close sidebar, test focus containment/Escape and activate rendered navigation links.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
