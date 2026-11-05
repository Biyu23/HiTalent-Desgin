---
category: Components
title: EditableField
toc: content
---

# EditableField

Show read-only content with a hover edit action, then edit in a popup or inline.

<code src="./demo/basic.tsx">Popup, inline editing and save validation</code>

The default popup keeps the read-only content mounted without changing layout. The hover action overlays the right edge without adding padding; it may cover the end of long content. Inline mode replaces the content and may change its height.

Provide controlled `value`, `onChange`, `renderValue` and `renderEditor({ value, onChange, saving })`. Use the editor's `saving` flag to disable input during submission. Values containing objects or arrays must be updated immutably.

Validation rules belong to the caller; the component does not expose rules or integrate Form. When provided, `onSave(draft)` must return a Promise. Pending keeps Loading active, resolve commits the draft and closes editing, and reject preserves the draft. A resolved value is ignored: resolve(false) is still success. Without onSave, the draft is committed directly. Success calls `onChange(draft)` and exits editing; an error keeps the draft open. Error messages are handled by the caller, not the component. Cancel discards the draft. Moving the pointer away or clicking outside does not close the editor.

Optional props: `mode="popup" | "inline"`, `disabled`, `actionVisibility="hover" | "always"`, `popupWidth={320}`, `placement="bottomLeft"`, `getPopupContainer`, `className` and `style`.

External value changes during editing do not overwrite the draft. Each new edit starts from the latest committed value. The component adds a block wrapper; apply layout classes or styles to that wrapper.

Defaults use Ant Design's neutral background, text, spacing, radius and motion tokens; the Save button follows the theme primary color. Customize `styles` and `classNames` for `root`, `action`, `editor`, `footer` and `popup` (popup outer container). Root `style` overrides `styles.root`. Set `--editable-field-hover-bg` and `--editable-field-action-bg` on the root to override hover and action backgrounds without changing layout.

Labels are localized through `ConfigProvider.localeOverrides.EditableField`.
