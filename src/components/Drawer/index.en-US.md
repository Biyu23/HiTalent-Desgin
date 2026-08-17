---
category: Components
title: Drawer
toc: content
---

# Drawer

Extends Ant Design Drawer with directional resize handles, minimization to a global Dock, state persistence, and multi-window orchestration.

## Features

- **Directional Resizing**: Automatically mounts a drag handle on the inner edge based on `placement` (width for `left`/`right`, height for `top`/`bottom`), with `minSize` (default 100px) anti-collapse and `maxSize` container bounds.
- **Global Dock Minimization**: Supports 8 dock positions with multi-instance stacking; preserves DOM, form inputs, scroll position, and resized dimensions during minimization.
- **Dual-Mode Sizing**: Supports controlled `size` and uncontrolled `defaultSize`, fully compatible with `default` (378px), `large` (736px), and custom numbers or CSS units.
- **Imperative Control & Dock Sharing**: Exposes `minimize` / `restore` via `DrawerRef`, and shares the unified global Dock with Modal.

## Code Demonstrations

<code src="./demo/resizable-body.tsx" title="Basic & Resizing" description="Drag the inner edge to resize width or height with 4-direction support and min/max constraints."></code>

<code src="./demo/minimize.tsx" title="Minimize & Task Persistence" description="Minimize to the global Dock from header button or DrawerRef, preserving form input and resized dimensions on restore."></code>

<code src="./demo/controlled-minimize.tsx" title="Controlled Dock Positions" description="Manage minimized state in controlled mode across 8 global dock positions."></code>

<code src="./demo/resizable.tsx" title="Local Container Rendering" description="Mount the drawer inside a local container; resizing is automatically bounded by the container dimensions."></code>

<code src="./demo/shared-dock.tsx" title="Shared Dock with Modal" description="Modals and Drawers dock together in the same global Dock with independent restore and close operations."></code>

<code src="./demo/custom-style.tsx" title="Custom Styles" description="Deeply customize header, body, footer, mask, content, resize handle, and minimized dock via styles and classNames."></code>

## API

Fully compatible with Ant Design `DrawerProps` in addition to the enhancements below.

### DrawerProps

| Property           | Description                                                                               | Type                                                                                     | Default        |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `resizable`        | Enable resize dragging or provide lifecycle callbacks                                     | `boolean \| DrawerResizableConfig`                                                       | `false`        |
| `minSize`          | Minimum resize size in pixels (prevents collapsing to 0)                                  | `number`                                                                                 | `100`          |
| `maxSize`          | Maximum resize size in pixels, constrained by container bounds                            | `number`                                                                                 | container size |
| `size`             | Controlled axis size (width for horizontal, height for vertical)                          | `'default' \| 'large' \| number \| string`                                               | -              |
| `defaultSize`      | Initial axis size in uncontrolled mode                                                    | `number \| string`                                                                       | `378`          |
| `minimizable`      | Allow minimizing to the global Dock (keeps DOM and form state)                            | `boolean`                                                                                | `false`        |
| `minimized`        | Controlled minimized state                                                                | `boolean`                                                                                | -              |
| `minimizePosition` | Dock position for minimized card                                                          | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `onMinimizeChange` | Callback when minimized or restored                                                       | `(minimized: boolean) => void`                                                           | -              |
| `onClose`          | Callback for close button, ESC, or Dock close (event is undefined for programmatic close) | `(event?) => void`                                                                       | -              |
| `classNames`       | Semantic class names, extended with `dragger`, `minimizeButton`, `minimizedDock`          | `DrawerClassNames`                                                                       | -              |
| `styles`           | Semantic styles, extended with `dragger`, `minimizeButton`, `minimizedDock`               | `DrawerStyles`                                                                           | -              |

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

## Notes

- **Minimum Size & Boundary Protection**: `minSize` defaults to 100px to prevent the drawer from collapsing to 0px and losing its handle. `maxSize` is always capped by the host container's available size.
- **State Persistence**: When `minimizable` is enabled, `destroyOnHidden: false` is maintained internally so that DOM nodes and form state remain intact during minimization.
- **Controlled vs Uncontrolled**: When `size` is omitted, the component operates in uncontrolled mode and remembers resized dimensions across open/close cycles; in controlled mode, update `size` via `onResize`.
- **Local Container**: With `getContainer={false}`, ensure the parent element has relative positioning (e.g. `position: relative`); drawer dimensions will be bounded by the parent container.
