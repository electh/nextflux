# custom-modal

2026-09-30 · transformation engine / preserve customized wrapper · completed.

## Changed

- `src/components/ui/CustomModal.jsx:1`: Replace the HeroUI responsive modal abstraction with desktop Dialog and mobile Base Drawer while retaining controlled stores, title/body/footer and height options.
- `src/components/FeedList/components/AddFeedModal.jsx`: use the migrated custom-modal composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddCategoryModal.jsx`: use the migrated custom-modal composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/EditFeedModal.jsx`: use the migrated custom-modal composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/RenameModal.jsx`: use the migrated custom-modal composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Desktop uses Dialog and mobile uses Drawer; mobile swipe-to-close is native. Existing store-based open/close semantics remain.

## Verify by hand

Open from its real trigger; check title, initial focus, Tab containment, Escape/cancel/outside behavior and focus return. For async confirm, check loading, success and server-error paths without losing the dialog.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
