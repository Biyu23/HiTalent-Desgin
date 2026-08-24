---
category: Components
title: Drawer
toc: content
---

# Drawer

Extends Ant Design Drawer with directional resize handles, minimization to a global Dock, state persistence, and multi-window orchestration.

## When to Use

- When drawer width or height needs to be dynamically adjusted based on content (supports all 4 placement directions).
- When a user is working on complex form inputs or tasks and needs to temporarily minimize to the global Dock and restore later without losing progress.
- When multiple drawers or modals need to be orchestrated together in a shared floating task dock.

## Code Demonstrations

<code src="./demo/resizable.tsx" title="Directional Resizing" description="Drag the inner edge to resize width or height with 4-direction support and min/max size constraints."></code>

<code src="./demo/minimizable.tsx" title="Minimize & Task Persistence" description="Minimize to the global Dock from the header button or DrawerRef, preserving form input and resized dimensions on restore."></code>

<code src="./demo/controlled.tsx" title="Controlled Dock Positions" description="Manage minimized state in controlled mode across 8 global dock positions."></code>

<code src="./demo/shared-dock.tsx" title="Shared Dock with Modal" description="Drawers and Modals can dock together in the same global Dock with independent restore and close operations."></code>

<code src="./demo/custom-style.tsx" title="Custom Styles" description="Customize resize handle, minimized dock card, and other regions via styles and classNames."></code>

## API

Inherits all native properties from [Ant Design Drawer](https://ant.design/components/drawer#api), with the following extensions:

### DrawerProps

| Property           | Description                                                                                  | Type                                                                                                     | Default          |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `size`             | Controlled axis size (width for horizontal, height for vertical)                             | `'default' \| 'large' \| number \| string`                                                               | -                |
| `defaultSize`      | Initial axis size in uncontrolled mode                                                       | `number \| string`                                                                                       | `378`            |
| `minSize`          | Minimum resize size in pixels (prevents collapsing to 0)                                     | `number`                                                                                                 | `100`            |
| `maxSize`          | Maximum resize size in pixels, constrained by container bounds                               | `number`                                                                                                 | container size   |
| `resizable`        | Enable resize dragging or provide lifecycle callbacks                                        | `boolean \| DrawerResizableConfig`                                                                       | `false`          |
| `minimizable`      | Allow minimizing to the global Dock (keeps DOM and form state)                               | `boolean`                                                                                                | `false`          |
| `minimized`        | Controlled minimized state                                                                   | `boolean`                                                                                                | -                |
| `minimizePosition` | Dock position for minimized card                                                             | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `onMinimizeChange` | Callback when minimized or restored                                                          | `(minimized: boolean) => void`                                                                           | -                |
| `onClose`          | Callback for close button or Dock close (event is undefined for programmatic close)          | `(event?: React.MouseEvent \| React.KeyboardEvent) => void`                                              | -                |
| `classNames`       | Custom class names configuration, extended with `dragger`, `minimizeButton`, `minimizedDock` | `DrawerClassNames`                                                                                       | -                |
| `styles`           | Custom styles configuration, extended with `dragger`, `minimizedDock`                        | `DrawerStyles`                                                                                           | -                |

### DrawerRef

Imperative control handle via `ref`. Panel DOM element remains accessible via `panelRef`.

| Method     | Description                                 | Type         |
| ---------- | ------------------------------------------- | ------------ |
| `minimize` | Minimize current drawer to the global Dock  | `() => void` |
| `restore`  | Restore current drawer from the global Dock | `() => void` |

### DrawerResizableConfig

| Property        | Description                                               | Type                     |
| --------------- | --------------------------------------------------------- | ------------------------ |
| `onResizeStart` | Triggered when resizing starts                            | `() => void`             |
| `onResize`      | Triggered during resizing with the current size in pixels | `(size: number) => void` |
| `onResizeEnd`   | Triggered when resizing ends                              | `() => void`             |

### DrawerClassNames

Inherits Ant Design `DrawerProps['classNames']`, extended with:

| Property         | Description                              | Type     |
| ---------------- | ---------------------------------------- | -------- |
| `minimizeButton` | Class name of the header minimize button | `string` |
| `minimizedDock`  | Class name of the minimized Dock card    | `string` |
| `dragger`        | Class name of the resize drag handle     | `string` |

### DrawerStyles

Inherits Ant Design `DrawerProps['styles']`, extended with:

| Property        | Description                             | Type                  |
| --------------- | --------------------------------------- | --------------------- |
| `minimizedDock` | Inline style of the minimized Dock card | `React.CSSProperties` |
| `dragger`       | Inline style of the resize drag handle  | `React.CSSProperties` |

## Notes

- **Minimum Size & Boundary Protection**: `minSize` defaults to 100px to prevent the drawer from collapsing to 0px and losing its handle. `maxSize` is always capped by the host container's available size.
- **State Persistence**: When `minimizable` is enabled, `destroyOnHidden: false` is maintained internally so that DOM nodes and form state remain intact during minimization.
- **Controlled vs Uncontrolled**: When `size` is omitted, the component operates in uncontrolled mode and remembers resized dimensions; in controlled mode, update `size` via `onResize`.
- **Shared Global Dock**: Modals and Drawers share the same floating dock manager, and cards are arranged automatically.
