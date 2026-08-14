---
category: Components
title: Modal
toc: content
---

# Modal

Adds drag, resize, maximize, and multi-window minimization to Ant Design Modal, creating a desktop-class work window that preserves task context.

## When to use

- People need to move the dialog to inspect information behind it.
- A form or complex view benefits from resizing or fullscreen reading.
- Parallel tasks need to minimize temporarily and restore without losing form or component state.

For short confirmations and one-time notices, keep the default Ant Design Modal behavior without enabling window features.

## Core capabilities

- Drag from the title bar or empty footer space while interactive controls remain clickable.
- Resize from the bottom-right corner with minimum and maximum constraints.
- Maximize, restore, minimize, and automatically arrange a global dock.
- Preserve DOM and form state while minimized.
- Control one instance through `ModalRef` and clean up all instances through static methods.

## Demos

<code src="./demo/basic.tsx" title="Basic Usage" description="Control visibility with open and handle close and confirmation through onCancel and onOk."></code>

<code src="./demo/form-submit.tsx" title="Form Submission" description="Combine Form validation with confirmLoading for async submission, then reset form state after closing."></code>

<code src="./demo/resize.tsx" title="Drag and Resize" description="Move the dialog from its title bar or empty footer space and resize from the bottom-right corner without blocking controls."></code>

<code src="./demo/advanced.tsx" title="Advanced Window Management" description="Combine draggable, resizable, maximizable, and minimizable while preserving content state in the dock."></code>

<code src="./demo/imperative-control.tsx" title="Imperative Control (Ref API)" description="Use ModalRef outside the component to call minimize, restore, maximize, and unmaximize."></code>

<code src="./demo/multiple-minimize.tsx" title="Multi-Window Minimize" description="Minimize several instances into an automatically arranged global dock; each card remains independently draggable."></code>

<code src="./demo/destroy-all.tsx" title="Destroy All Modals" description="Use Modal.destroyAll() to clear normal, maximized, and minimized instances during route transitions."></code>

## API

### ModalProps

All Ant Design `ModalProps` remain available except the replaced `closable`, `title`, and `onCancel` definitions.

| Property            | Description                                     | Type                                                                                     | Default        |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `closable`          | Shows the close button                          | `boolean`                                                                                | `true`         |
| `title`             | Dialog title                                    | `ReactNode`                                                                              | -              |
| `onCancel`          | Handles close, ESC, or programmatic destruction | `(event?) => void`                                                                       | -              |
| `draggable`         | Allows dragging from the title bar              | `boolean`                                                                                | `false`        |
| `resizable`         | Enables resizing                                | `boolean`                                                                                | `false`        |
| `minimizable`       | Allows minimizing into the global dock          | `boolean`                                                                                | `false`        |
| `maximizable`       | Allows fullscreen maximization                  | `boolean`                                                                                | `false`        |
| `minimizePosition`  | Dock position for minimized cards               | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `minimized`         | Controlled minimized state                      | `boolean`                                                                                | -              |
| `maximized`         | Controlled maximized state                      | `boolean`                                                                                | -              |
| `onMinimizeChange`  | Runs when minimized state changes               | `(minimized: boolean) => void`                                                           | -              |
| `onMaximizedChange` | Runs when maximized state changes               | `(maximized: boolean) => void`                                                           | -              |

### ModalResizableConfig

| Property    | Description                               | Type     | Default |
| ----------- | ----------------------------------------- | -------- | ------- |
| `minWidth`  | Minimum width in pixels                   | `number` | `320`   |
| `minHeight` | Minimum height in pixels                  | `number` | `200`   |
| `maxWidth`  | Maximum width, still limited by viewport  | `number` | -       |
| `maxHeight` | Maximum height, still limited by viewport | `number` | -       |

### ModalRef

| Method       | Description                       | Type         |
| ------------ | --------------------------------- | ------------ |
| `restore`    | Restores a minimized dialog       | `() => void` |
| `maximize`   | Maximizes the dialog              | `() => void` |
| `unmaximize` | Returns to the normal window size | `() => void` |
| `minimize`   | Minimizes the dialog              | `() => void` |

### ModalStaticMethods

| Method       | Description                                           | Type         |
| ------------ | ----------------------------------------------------- | ------------ |
| `destroyAll` | Destroys all normal, maximized, and minimized dialogs | `() => void` |

## Notes

- Dragging starts only from the title bar and empty footer space; form controls, buttons, and editable regions retain their interactions.
- Set realistic `minWidth` and `minHeight` constraints for the content being shown.
- Minimization preserves the DOM. Close instances when they are no longer needed, or use `Modal.destroyAll()` for route-level cleanup.
- Window order and the dock use global context; avoid sharing one instance group across separate React roots.
