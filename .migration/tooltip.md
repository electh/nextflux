# tooltip

2026-09-30 · shadcn CLI base-nova registry + consumer transformation engine · completed.

## Changed

- `src/components/ui/tooltip.jsx:1`: Use Base Tooltip Provider/Root/Trigger/Positioner/Popup; migrate render triggers, delay to Trigger and remove duplicate arrows/stale Radix state classes. src/main.jsx supplies the shared provider.
- `src/main.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleAiAction.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleStateActions.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleExternalActions.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/ArticleNavigationControls.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ArticleView/components/CodeBlock.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/components/ui/settingItem.jsx`: use the migrated tooltip composition/API; keep business callbacks and store ownership unchanged.
- `src/main.jsx`: wrap the app with TooltipProvider.

Shared consumer sweep replaces HeroUI handlers/compound parts and Radix asChild with the corresponding native API. `rg -n 'radix-ui|@radix-ui|IconPlaceholder' src/components/ui` and the consumer import scan are clean. Global theme/alias/dependency changes are documented in project.md.

## Left alone

Sonner toast calls, Framer Motion, image viewers, virtualization, API/database modules and store ownership are intentionally retained; they are not Radix primitives. Existing user-installed .agents skills and skills-lock.json are preserved.

## Behavior changes

The shared registry provider defaults to delay=0; explicit trigger delays are retained. Native focus/hover handling and a single registry arrow replace HeroUI overlay parts.

## Verify by hand

Focus/hover article and toolbar icon controls; check configured delay, content, single arrow and Escape behavior.

Automated project lint/build and 24 existing node tests pass. Browser smoke checks cover desktop/mobile settings, slider keyboard input/track size, category validation, feed-type selection, search tabs, native context menu, async confirmation and desktop focus return. No authenticated API writes or touch-device gesture validation were performed.
