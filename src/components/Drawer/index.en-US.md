---
category: Components
title: Drawer
toc: content
---

# Drawer

Extends Ant Design Drawer with placement-aware resizing and minimization to a global Dock.

## When to use

- A drawer contains tables, forms, or details whose visible area should be adjustable.
- A complex task needs to be set aside temporarily without losing its context.
- A drawer is rendered inside a local container and its size must stay within that boundary.

## Capabilities

- Resize width for `left` / `right` and height for `top` / `bottom`.
- Keep the resize handle on the inner edge facing the page content.
- Resolve `maxSize` against the actual Drawer container size.
- Support controlled `size` and uncontrolled `defaultSize`.
- Minimize to eight global Dock positions with multi-instance stacking, scrolling, and independent dragging.
- Preserve DOM, form values, scroll position, and manually adjusted size while minimized.
- Share the same global Dock with Modal.

## Examples

<code src="./demo/resizable-body.tsx" title="Basic" description="Drag the inner edge to resize the drawer width or height."></code>

<code src="./demo/resizable.tsx" title="Local container" description="Render inside a local container and constrain resizing to its bounds."></code>

<code src="./demo/minimize.tsx" title="Minimize and Ref API" description="Minimize from the header or DrawerRef and preserve content and size on restore."></code>

<code src="./demo/controlled-minimize.tsx" title="Controlled minimize" description="Control minimized with onMinimizeChange and choose from eight Dock positions."></code>

<code src="./demo/shared-dock.tsx" title="Shared global Dock" description="Modal and Drawer can share a position and restore or close independently."></code>

## API

All Ant Design `DrawerProps` are supported in addition to the enhancements below.

| Property           | Description                                                                               | Type                                                                                     | Default        |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `size`             | Axis size; width for left/right and height for top/bottom; controlled when provided       | `'default' \| 'large' \| number \| string`                                               | -              |
| `defaultSize`      | Initial axis size in uncontrolled mode                                                    | `number \| string`                                                                       | `378`          |
| `maxSize`          | Maximum resize value, also constrained by the actual container                            | `number`                                                                                 | container size |
| `resizable`        | Enable resizing or provide lifecycle callbacks                                            | `boolean \| DrawerResizableConfig`                                                       | `false`        |
| `minimizable`      | Allow minimization to the global Dock                                                     | `boolean`                                                                                | `false`        |
| `minimized`        | Controlled minimized state                                                                | `boolean`                                                                                | -              |
| `minimizePosition` | Position of the minimized card                                                            | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `onMinimizeChange` | Called when minimize or restore is requested                                              | `(minimized: boolean) => void`                                                           | -              |
| `onClose`          | Called by the close button, ESC, or Dock close; event is undefined for programmatic close | `(event?) => void`                                                                       | -              |
| `width`            | Legacy controlled horizontal size; use `size` instead                                     | `number \| string`                                                                       | -              |
| `height`           | Legacy controlled vertical size; use `size` instead                                       | `number \| string`                                                                       | -              |
| `classNames`       | Ant Design semantic classes plus `dragger`, `minimizeButton`, and `minimizedDock`         | `DrawerClassNames`                                                                       | -              |
| `styles`           | Ant Design semantic styles plus `dragger`, `minimizeButton`, and `minimizedDock`          | `DrawerStyles`                                                                           | -              |

### DrawerRef

The component `ref` exposes imperative controls. `panelRef` continues to reference the Drawer panel DOM element.

| Method     | Description                             | Type         |
| ---------- | --------------------------------------- | ------------ |
| `minimize` | Minimize the Drawer                     | `() => void` |
| `restore`  | Restore the Drawer from the global Dock | `() => void` |

### DrawerResizableConfig

| Property        | Description                                 | Type                     |
| --------------- | ------------------------------------------- | ------------------------ |
| `onResizeStart` | Called when resizing starts                 | `() => void`             |
| `onResize`      | Called with the current axis size in pixels | `(size: number) => void` |
| `onResizeEnd`   | Called when resizing ends or is cancelled   | `() => void`             |

## Minimized state

- Without `minimized`, the component keeps minimized state internally.
- With `minimized`, the component is controlled; update it in `onMinimizeChange` to change the visual state.
- When `open=false`, neither the Drawer nor its Dock card is shown. Calling `minimize()` does not set `open=true`.
- Enabling `minimizable` preserves the hidden DOM, form state, and resized dimensions.
- In minimizable mode, the close button is placed at the right end of the header. `closable=false`, custom `closeIcon`, and closable object options remain supported.
- Modal and Drawer instances with the same library prefix share Dock containers by `minimizePosition`.

## Size modes

- Providing `size` enables controlled mode. Update `size` from `onResize` to reflect drag changes visually.
- Without `size` or the current axis's legacy `width` / `height`, the component stores resize results internally and preserves them when reopened.
- `width` / `height` remain Ant Design 5 compatibility properties and are treated as controlled values.
- `size="default"` resolves to 378px and `size="large"` to 736px. CSS strings are accepted for initial or controlled sizes.

## Placements

| placement | Handle edge | Drag direction to grow |
| --------- | ----------- | ---------------------- |
| `left`    | right       | right                  |
| `right`   | left        | left                   |
| `top`     | bottom      | down                   |
| `bottom`  | top         | up                     |

## Notes

- `maxSize` is capped by the available width or height of the actual Drawer root container.
- With `getContainer={false}`, give the parent a positioning context such as `position: relative`; minimized cards still enter the global Dock.
- This component does not add `minSize`; the minimum remains 0, matching Ant Design 6.
- The handle uses `role="separator"`; keyboard resizing is not included.
- When a minimized instance is no longer needed, close it and update the business-level `open` state.
