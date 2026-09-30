# project

2026-09-30 · whole-project shadcn CLI base-nova registry + transformation engine · completed, 0 wrappers remain on Radix.

## Changed

- `jsconfig.json`: fix alias baseUrl to project root so CLI writes to src/components/ui instead of src/src.
- `package-lock.json`: swap HeroUI and three Radix dependencies for @base-ui/react and tw-animate-css; npm lockfile synchronized.
- `package.json`: swap HeroUI and three Radix dependencies for @base-ui/react and tw-animate-css; npm lockfile synchronized.
- `src/components/ArticleList/ArticleList.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/ArticleCard.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/ArticleCardCover.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/ArticleListContent.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/ArticleListFooter.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/ArticleListHeader.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/EditFeedModal.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/EmptyPlaceholder.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/Indicator.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/MarkAllReadButton.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/MenuButton.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleList/components/RenameModal.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/ArticleView.css`: adapt obsolete HeroUI selectors/text token usage to migrated UI.
- `src/components/ArticleView/ArticleView.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/AISummary.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ActionButtons.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleAiAction.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleContent.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleExternalActions.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleHeader.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleImage.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleNavigationControls.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/ArticleStateActions.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/Attachments.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ArticleView/components/CodeBlock.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/FeedListSidebar.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/AddCategoryModal.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/AddFeedButton.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/AddFeedModal.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/ArticlesGroup.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/CategoryChip.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/FeedItem.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/FeedsGroupContent.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/ProfileButton.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/ResultListbox.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/FeedList/components/SyncButton.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Search/SearchModal.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Search/SearchResults.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/AI.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/About.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/Appearance.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/General.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/Readability.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/Settings.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/Shortcuts.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/components/Language.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/Settings/components/Theme.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/components/ui/CustomAlertDialog.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/CustomModal.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/collapsible.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/scroll-area.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/settingItem.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/sidebar.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/index.css`: remove HeroUI stylesheet, add animation CSS and semantic theme mappings while preserving light/dark/stone/leaf/nord-dark tokens.
- `src/main.jsx`: add shared TooltipProvider.
- `src/pages/ErrorPage.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `src/pages/LoginPage.jsx`: migrate HeroUI composition/handlers, render triggers, styling tokens and accessibility without changing API/storage contracts.
- `tailwind.config.js`: replace Radix collapsible height variable.
- `vite.config.js`: change vendor-ui chunk to Base UI.
- `components.json`: configure shadcn base-nova, JSX, Vite aliases and Tailwind 4.
- `src/components/ui/alert-dialog.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/badge.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/button.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/checkbox.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/context-menu.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/dialog.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/drawer.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/dropdown-menu.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/field.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/input-group.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/input.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/kbd.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/label.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/select.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/separator.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/sheet.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/slider.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/spinner.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/switch.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/tabs.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/textarea.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/toggle-group.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/toggle.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/tooltip.jsx`: add/migrate wrapper; see the corresponding component report.
- `src/components/ui/ContextMenu.jsx`: removed after all three consumers migrated to native context-menu.jsx.

The initial app used HeroUI plus Radix Collapsible/ScrollArea/Slot and had no shadcn configuration. New controls come from the actual base-nova registry; customized wrappers retain their own structure/layout. `.migration/<component>.md` contains a separate report for each of 30 affected wrappers.

Baseline: build and lint passed; 24 node tests passed. Final: `npm run lint`, `npm run build`, `npm test`, `git diff --check` passed. `npm ls` shows @base-ui/react@1.8.0 and none of the removed direct libraries. Source/package/lockfile scans for HeroUI, Radix and IconPlaceholder are clean. shadcn info reports base=base/style=base-nova and correct resolved aliases.

Production main CSS is about 183 kB, down from about 487 kB before migration. This is an uncompressed CSS-file comparison, not a claim about total download size.

## Left alone

Sonner is retained because it is not a Radix wrapper; no unrelated toast replacement was performed. Framer Motion, react-photo-view, react-virtuoso, API/database/store modules and existing node tests retain their responsibilities. Existing user-installed .agents and skills-lock.json files were preserved. Work is on codex/shadcn-base-ui and remains uncommitted for review.

## Behavior changes

- Base Tabs defaults to manual keyboard activation; arrows move focus, Enter/Space selects.
- Menu RadioItem defaults closeOnClick=false; selection menus may remain open, normal action items close.
- Mobile modals/settings now use native Base Drawer gestures; the sidebar uses modal Sheet focus management.
- Required forms now use native Base Field/Form validation; empty category submission displays its error and focuses Title.
- Feed/setting option controls use Base ToggleGroup array values; required settings ignore empty deselection.
- HeroUI ScrollShadow becomes native overflow containers. Scroll refs/events are preserved, but automatic edge-fade decoration is intentionally no longer supplied by HeroUI.
- Native shadcn sizing, outlines and transition timings replace HeroUI rendering; existing custom theme tokens/layout remain.

## Verify by hand

Browser smoke tests passed on the login page and an isolated fixture using real project components: required login/category fields, error visibility, feed-type select/value change, settings menu/navigation at desktop and 390px mobile width, visible slider tracks and arrow-key adjustment, native context-menu action/close, asynchronous local confirmation, search tab changes/input focus, Escape dismissal and desktop overlay focus return. Console error/warning checks were empty during interaction testing. Removing the still-open fixture subsequently caused expected Vite missing-module/route errors on that temporary page; the real login page was visually rechecked after navigation. The fixture and seed data source files were removed after testing; no authenticated server writes were sent.

Before release, verify with a disposable authenticated Miniflux account: add/edit feeds/categories, OPML/import/export, article menu actions, database-backed search/virtualized lists, scrolling/read tracking, AI save/stream/error paths, all stored themes and mobile sidebar navigation. Touch-device long-press/swipe and every server-error path remain manual release checks; the 24 existing node tests do not replace UI end-to-end coverage.

Derived final status: 0 wrappers remain on Radix.
