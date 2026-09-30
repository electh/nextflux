# field

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/field.jsx:1`: Adapt shadcn Field to Base Field Root/Label/Description/Error for actual Form validation. Consumers use FieldSet/FieldGroup, native required/name attributes, explicit labels and error messages.
- `src/pages/LoginPage.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddFeedModal.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/FeedList/components/AddCategoryModal.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/EditFeedModal.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleList/components/RenameModal.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/Settings/AI.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/settingItem.jsx`: use the migrated field composition/API; keep business callbacks and store ownership unchanged.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

Base Field/Form now owns native validation and invalid accessibility state; required fields cannot submit empty forms and errors are only announced/rendered when invalid.

## Verify by hand

Submit empty login/category forms, check invalid ring/error and focused field; fill valid values only in a disposable authenticated environment and verify payload.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
