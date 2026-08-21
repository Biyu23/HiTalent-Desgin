---
category: Components
title: Modal
toc: content
---

# Modal

Enhances Ant Design Modal with dragging (`draggable`), double-click maximization (`maximizable`), free resizing (`resizable`), minimization to global Dock (`minimizable`), and controlled states.

## Demos

<code src="./demo/draggable.tsx">Draggable</code>
<code src="./demo/resizable.tsx">Resizable</code>
<code src="./demo/maximizable.tsx">Maximizable</code>
<code src="./demo/minimizable.tsx">Minimizable & Dock Position</code>
<code src="./demo/controlled.tsx">Controlled State & Ref</code>
<code src="./demo/semantic-styles.tsx">Semantic Styles and Portal Root</code>

## API

All standard properties are inherited from Ant Design [ModalProps](https://ant.design/components/modal#api). Only enhanced properties and methods unique to this component are listed below.

### ModalProps (Enhanced Props)

| Property            | Description                                                                                        | Type                                                                                                     | Default          |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `draggable`         | Enables dragging from the title bar or footer (supports double-click title bar to toggle maximize) | `boolean`                                                                                                | `false`          |
| `resizable`         | Enables free resizing from the bottom-right corner, or provides resize constraints                 | `boolean \| ModalResizableConfig`                                                                        | `false`          |
| `maximizable`       | Supports fullscreen maximization                                                                   | `boolean`                                                                                                | `false`          |
| `minimizable`       | Supports minimizing to the global Dock (preserves DOM and form inputs)                             | `boolean`                                                                                                | `false`          |
| `minimizePosition`  | Dock placement position for minimized floating card                                                | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `minimized`         | Controlled minimized state                                                                         | `boolean`                                                                                                | -                |
| `maximized`         | Controlled maximized state                                                                         | `boolean`                                                                                                | -                |
| `onMinimizeChange`  | Callback fired when minimized state changes                                                        | `(minimized: boolean) => void`                                                                           | -                |
| `onMaximizedChange` | Callback fired when maximized state changes                                                        | `(maximized: boolean) => void`                                                                           | -                |

### ModalResizableConfig

| Property        | Description                                              | Type                                                | Default |
| --------------- | -------------------------------------------------------- | --------------------------------------------------- | ------- |
| `minWidth`      | Minimum width in pixels                                  | `number`                                            | `320`   |
| `minHeight`     | Minimum height in pixels                                 | `number`                                            | `200`   |
| `maxWidth`      | Maximum width (still bounded by viewport and container)  | `number`                                            | -       |
| `maxHeight`     | Maximum height (still bounded by viewport and container) | `number`                                            | -       |
| `onResizeStart` | Callback fired when resize interaction starts            | `() => void`                                        | -       |
| `onResize`      | Real-time callback fired during resizing                 | `(size: { width: number; height: number }) => void` | -       |
| `onResizeEnd`   | Callback fired when resize interaction ends              | `() => void`                                        | -       |

### ModalRef

Imperative methods exposed via `ref`:

| Method          | Description                                     | Type         |
| --------------- | ----------------------------------------------- | ------------ |
| `restore`       | Restores a minimized dialog                     | `() => void` |
| `maximize`      | Maximizes the dialog                            | `() => void` |
| `unmaximize`    | Exits maximized mode and restores previous size | `() => void` |
| `minimize`      | Minimizes the dialog into the Dock              | `() => void` |
| `resetPosition` | Resets window position back to center           | `() => void` |
| `resetSize`     | Resets manually resized dimensions              | `() => void` |

## Semantic styles

`rootClassName` targets the Modal root boundary. `classNames` and `styles` expose `root`, `mask`, `wrapper`, `content`, `header`, `title`, `actions`, `body`, `footer`, `resizeHandle`, and `minimizedDock`. Inline styles for `root` are applied to the portal root through an instance-scoped CSS-in-JS rule.

Header operations are isolated from high-frequency position and size state, so moving or resizing the window does not repeatedly render the action area.
