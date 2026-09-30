# dropdown-menu

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/dropdown-menu.jsx:1`: Use Base Menu Root/Trigger/Positioner/Popup, groups and radio groups. Replace collection-based selectedKeys callbacks with scalar value/onValueChange and action handlers on each item.
- `src/components/FeedList/components/ProfileButton.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddFeedButton.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/MenuButton.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/MarkAllReadButton.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/Readability.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/components/Theme.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/components/Language.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/settingItem.jsx`: use the migrated dropdown-menu composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Base radio items default closeOnClick=false, so selection menus can remain open; regular action items close normally. Radio callbacks now receive the scalar value, not a Set/currentKey object.

## Verify by hand

Open a language/theme/action menu; navigate with arrows/typeahead and select with Enter. Confirm the scalar setting changes, radio-menu persistence, action-menu closure and focus return.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
