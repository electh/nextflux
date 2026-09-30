# spinner

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/spinner.jsx:1`: Add the native SVG shadcn Spinner for explicit loading composition.
- `src/pages/LoginPage.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddFeedModal.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddCategoryModal.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/SyncButton.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Search/SearchResults.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/EditFeedModal.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/RenameModal.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/MarkAllReadButton.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleAiAction.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleStateActions.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleExternalActions.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/AISummary.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/AI.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/CustomAlertDialog.jsx`: use the migrated spinner composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

No additional application-specific behavior delta identified; registry visual density and native interaction styling replace the former HeroUI styling. Review the checklist below before release.

## Verify by hand

Inspect the affected screen at desktop/mobile widths; use Tab/Enter/Space and verify labels, layout, disabled/loading state and retained business callbacks.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
