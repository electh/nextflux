# Luma style-only merge

2026-09-30. shadcn skill: CLI dry-run/diff review and AST-scoped style merge from the previously CLI-generated base-luma snapshot. No preset apply or dependency installation.

## Changed

- `src/components/ui/alert-dialog.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/badge.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/button.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/checkbox.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/context-menu.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/dialog.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/drawer.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/dropdown-menu.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/field.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/input-group.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/input.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/kbd.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/select.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/sheet.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/slider.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/switch.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/tabs.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/textarea.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/toggle-group.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/toggle.jsx`: merge Luma className/CVA styling only.
- `src/components/ui/tooltip.jsx`: merge Luma className/CVA styling only.
- `src/index.css`: remove legacy glossy button, menu and tooltip overrides so Luma component styling is visible. Theme variables and fonts are unchanged.

## Preserved

Base primitives, callback APIs, Field validation, scalar-slider fix, orientation selectors, render composition, imports and exports are retained. The custom Sidebar, animated Collapsible and ScrollArea wrappers remain unchanged; they are not overwritten by registry defaults. Label, Separator and Spinner have no required Luma styling difference. Dependency files, utils, mobile hook and components.json are byte-identical to the pre-merge snapshot. Existing theme selection remains in effect; this is not the blue/Inter preset.

## Verification

- AST comparison excluding className and CVA style definitions: no non-styling component changes.
- npm run lint, npm run build, npm test: pass (24 tests).
- Login browser smoke: default button/input height 36px, button radius 32px, input radius 24px. Empty submission focuses Server URL and aria-invalid=true. No console warnings/errors.
- Logged-in screens, touch gestures and server-backed workflows were not re-tested in this style-only pass.

## Recovery

The exact pre-merge state is saved at `/private/tmp/nextflux-luma-style.u16IaU/before-style-merge.tar.gz`. Work remains uncommitted.

## Radius refinement

Follow-up user feedback: reduce the oversized Luma corners. Changed only radius utility classes in 15 UI components; spacing, colors, behavior, theme tokens and the existing border-radius preference are preserved. At the default `--radius: 0.4rem`, buttons, inputs and tabs are 8px; menus are approximately 8–10px and dialogs 12.8px. Switches, slider thumbs and intentionally circular icons remain circular.

Verification: lint and production build pass. Read-only inspection of the live preview confirms `--radius: 0.4rem` and rendered button/input/tab corners of 8px. The user was interacting with the preview, so no navigation or form submission was performed.

## Neutral menu highlights

Follow-up user feedback: menu hover should not use the primary color. Following the shadcn styling skill, DropdownMenu, ContextMenu and Select option highlights now use semantic `bg-muted` / `text-foreground` instead of `bg-accent` / `text-accent-foreground`. This includes keyboard focus, submenu-open backgrounds, icons and shortcuts. Destructive items retain their warning colors. Global theme tokens and primary buttons are unchanged. Lint and production build pass; static checks confirm no accent highlight classes remain in these three components. The active user preview was not interrupted for interactive menu testing.

## Browser-comment fixes

- ArticleListFooter: remove legacy active white-text and list background overrides; restore the built-in neutral Tabs colors. Live preview confirms the active All tab has dark foreground on a light background.
- ProfileButton: flatten the nested Open Miniflux label into one flex row with nowrap. Live preview confirms a 36px menu item with inline external-link icon.
- CustomModal: use equal-width grid columns for both Dialog and Drawer footers. Previously two `w-full`, non-shrinking buttons overflowed a flex row and clipped Cancel. Live desktop preview confirms Cancel and Save each occupy 236px and are visible. No form data was submitted.

Applied using the shadcn styling skill; lint, build and all 24 tests pass.

Search modal follow-up: use DialogContent's built-in `showCloseButton={false}` and clip overflowing child surfaces with `overflow-hidden`. This hides only the search modal's close icon and restores its bottom corners without changing dismissal behavior. Read-only live preview confirms zero close buttons, hidden overflow and both bottom corners at 12.8px. Lint and production build pass.

Search type tabs: remove all local TabsList class overrides and redundant Fragment; use the existing Tabs component's defaults. Live preview confirms 36px list height, 14px labels and no child override selectors. Lint and production build pass.

Article filter follow-up: introduce a scoped `pill` TabsList variant with full-radius list/triggers and primary / primary-foreground active colors. Only ArticleListFooter opts in; default search tabs retain their standard appearance. Read-only dark-theme preview confirms full corners and primary-color active Starred with light text. Lint and build pass. Implemented as a semantic component variant following the shadcn skill.

Pill spacing refinement: reduce horizontal pill-list height from 36px to 32px to match its 24px filter triggers plus 4px padding on each side. Live measurements before: top/bottom 6px, left/right 4px; after: all four sides 4px. Default Tabs are unchanged. Lint and build pass.

Search tabs now opt into the same `pill` component variant at the user's request. The variant owns its 24px trigger height alongside the 32px list and 4px padding, ensuring consistent spacing without local SearchModal class overrides. Full corners and semantic primary active colors are shared with article filters. Lint/build pass; the search modal was closed during final read-only inspection.

Search keyboard fix: Base UI DialogPopup stops composite-key propagation, so the old window keydown listener missed ArrowUp/ArrowDown. Bind navigation to the search input instead, leaving Tabs keyboard behavior independent. Ignore composition/IME keyCode 229 and loading states; guard Enter against stale indices; reset selection on search-type changes. Live local article-search smoke confirms ArrowDown moves index 0 to 1 and ArrowUp returns to 0. No article was opened or marked read. Lint/build and 24 existing tests pass. Used the shadcn skill to verify the current Dialog/InputGroup integration.
