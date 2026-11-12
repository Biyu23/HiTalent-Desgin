---
category: Components
title: EditableField
toc: content
---

# EditableField

Switch between a custom value display and an editor rendered inline, in a Popover, or in a Modal.

<code src="./demo/basic.tsx">Hover and custom actions, Modal, read-only and Form integration</code>

## Value contract

- value is the committed controlled value. The parent or Form.Item owns it.
- renderValue(value) renders the display and must handle undefined.
- Function children receive { value, submit, cancel }. Render a separate editor component here; do not call Hooks inside the render function.
- The editor owns draft state, validation, requests, loading and action buttons.
- submit(nextValue) synchronously calls onChange and closes editing. Input and cancellation never call onChange.
- cancel() closes and unmounts the editor. Opening again initializes a fresh draft from the latest external value.
- No built-in footer, onSave, saving, or draft onChange. Complete asynchronous work before calling submit; onChange return promises are not awaited.

## Interaction

trigger="action" opens through the right action. actionVisibility="hover" reveals it on hover; touch devices show it permanently. "always" keeps it visible. renderAction({ onClick }) replaces the full action: bind the callback to the edit trigger.

trigger="value" opens on value click, with no right action. Prefer noninteractive display content in this mode to avoid conflicting link actions.

readOnly blocks display links, buttons and keyboard interaction and hides editing controls. children can be omitted. disabled has the same restrictions and inherits Ant Design's componentDisabled unless explicitly overridden. readOnly always wins. Becoming read-only or disabled closes the editor.

Read-only isolation uses native inert and requires browser support. Independently portaled custom content must enforce permissions itself.

The action overlays the right edge without changing layout. For long content, reserve space through styles.value. Editing actions stop click propagation to parent list items.

## Containers

- mode="inline": hide the display and show the editor in its place; height may change.
- mode="popup" (default): keep the display and open a Popover, default bottomLeft and popupWidth=320. Outside clicks do not close it.
- mode="modal": keep the display and open an Ant Design Modal with no footer. Close and Escape cancel; mask clicks do not close it.

popoverProps accepts title, placement, arrow, getPopupContainer, styles, classNames, rootClassName and zIndex.
modalProps accepts title, width, centered, closable, keyboard, getContainer, styles, classNames, rootClassName and zIndex. To block closing during a save, lift the editor's saving state and set closable=false and keyboard=false.

All containers use the same children contract and unmount their editor when editing ends.

## Ant Design Form

Place EditableField directly inside a named Form.Item. Form injects value and onChange. Only submit changes the Form value. The field forwards id to its root for Form scrolling.

Outer Form.Item rules validate after collecting the committed value; they do not prevent the editor from closing. Validate inside the editor before submit when required. If an inline editor has its own Ant Design Form, use component={false} to avoid nested native form elements.

## Styles and migration

styles and classNames support root, value, action and editor. Configure overlay styling through popoverProps or modalProps. Root style can override --editable-field-hover-bg and --editable-field-action-bg. Defaults use theme tokens, and the edit label / default Modal title use ConfigProvider.localeOverrides.EditableField.edit.

Replace renderEditor with function children. Move draft state, former onSave logic and action buttons into the editor; call submit after success. Move placement and getPopupContainer into popoverProps. The old footer and popup style slots are removed.
