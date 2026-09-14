---
category: Components
title: Modal
toc: content
---

# Modal

Enhances Ant Design Modal with dragging (`draggable`), free resizing (`resizable`), fullscreen maximization (`maximizable`), minimization to global Dock (`minimizable`), and controlled state / imperative Ref methods.

## When To Use

- Need to freely drag modal position or resize modal width and height.
- The modal contains rich content, large tables, or charts that require one-click fullscreen expansion.
- Users need to temporarily suspend current task by minimizing into global Dock and seamlessly restore later without losing DOM or form state.
- Need to precisely control minimize, maximize, and position/size reset via external state or imperative Ref.

## Examples

<code src="./demo/draggable.tsx" title="Draggable" description="Enable draggable prop to move the modal by dragging from the title bar or footer area."></code>

<code src="./demo/resizable.tsx" title="Resizable" description="Enable resizable prop to adjust modal dimensions via the bottom-right handle, supporting minWidth/minHeight constraints and onResize callback."></code>

<code src="./demo/maximizable.tsx" title="Maximizable" description="Enable maximizable prop to toggle fullscreen mode via top-right maximize icon or double-clicking the title bar."></code>

<code src="./demo/minimizable.tsx" title="Minimizable & Global Dock" description="Enable minimizable prop to fold the modal into global Dock with 8 placement options, preserving DOM and form state."></code>

<code src="./demo/controlled.tsx" title="Controlled State & Ref" description="Precisely control modal states via minimized/maximized props and imperative ModalRef methods."></code>

## API

Inherits all properties from [Ant Design Modal](https://ant.design/components/modal#api), with the following enhanced properties:

### ModalProps

| Property            | Description                                                                  | Type                                                                                                     | Default          |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `draggable`         | Whether to allow dragging (handle is title bar and footer)                   | `boolean`                                                                                                | `false`          |
| `resizable`         | Whether to allow resizing, or provide resize configuration                   | `boolean \| ModalResizableConfig`                                                                        | `false`          |
| `maximizable`       | Whether to support fullscreen maximization                                   | `boolean`                                                                                                | `false`          |
| `minimizable`       | Whether to support minimizing to global Dock (preserves DOM and form inputs) | `boolean`                                                                                                | `false`          |
| `minimizePosition`  | Placement position for minimized floating Dock card                          | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `minimized`         | Controlled minimized state                                                   | `boolean`                                                                                                | -                |
| `maximized`         | Controlled maximized state                                                   | `boolean`                                                                                                | -                |
| `onMinimizeChange`  | Callback fired when minimized state changes                                  | `(minimized: boolean) => void`                                                                           | -                |
| `onMaximizedChange` | Callback fired when maximized state changes                                  | `(maximized: boolean) => void`                                                                           | -                |
| `classNames`        | Antd native slots plus `minimizedDock`                                       | `ModalClassNames`                                                                                        | -                |
| `styles`            | Antd native slots plus `minimizedDock`                                       | `ModalStyles`                                                                                            | -                |

### ModalResizableConfig

| Property        | Description                                                  | Type                                                | Default |
| --------------- | ------------------------------------------------------------ | --------------------------------------------------- | ------- |
| `minWidth`      | Minimum width in pixels                                      | `number`                                            | `320`   |
| `minHeight`     | Minimum height in pixels                                     | `number`                                            | `200`   |
| `maxWidth`      | Maximum width in pixels (bounded by viewport and container)  | `number`                                            | -       |
| `maxHeight`     | Maximum height in pixels (bounded by viewport and container) | `number`                                            | -       |
| `onResizeStart` | Callback fired when resize interaction starts                | `() => void`                                        | -       |
| `onResize`      | Real-time callback fired during resizing                     | `(size: { width: number; height: number }) => void` | -       |
| `onResizeEnd`   | Callback fired when resize interaction ends                  | `() => void`                                        | -       |

### ModalRef

Imperative methods exposed via `ref`:

| Method          | Description                                           | Type         |
| --------------- | ----------------------------------------------------- | ------------ |
| `restore`       | Restores a minimized modal                            | `() => void` |
| `maximize`      | Maximizes the modal                                   | `() => void` |
| `unmaximize`    | Exits maximized mode and restores previous dimensions | `() => void` |
| `minimize`      | Minimizes the modal into global Dock                  | `() => void` |
| `resetPosition` | Resets dragged position back to center                | `() => void` |
| `resetSize`     | Resets manually resized dimensions                    | `() => void` |

### ModalClassNames

Inherits Ant Design `ModalProps['classNames']`, extended with the following fields:

| Property        | Description                              | Type     |
| --------------- | ---------------------------------------- | -------- |
| `minimizedDock` | Custom className for minimized Dock card | `string` |

### ModalStyles

Inherits Ant Design `ModalProps['styles']`, extended with the following fields:

| Property        | Description                                 | Type                  |
| --------------- | ------------------------------------------- | --------------------- |
| `minimizedDock` | Custom inline style for minimized Dock card | `React.CSSProperties` |
