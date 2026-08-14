---
category: Components
title: Drawer
toc: content
---

# Drawer

Adds placement-aware edge resizing while preserving Ant Design Drawer's mask, motion, focus management, nested drawers, and push behavior.

## When to use

- A drawer contains tables, forms, or details whose viewing area should be adjustable.
- A drawer lives inside a local container and must stay within that boundary.

## Core capabilities

- `left` / `right` resize width; `top` / `bottom` resize height.
- The handle stays on the inner edge facing page content, while the outer edge remains fixed.
- `maxSize` is capped by the actual Drawer container size.
- Supports controlled `size` and uncontrolled `defaultSize`.
- Supports Pointer Events, local containers, and custom handle semantics.

## Demos

<code src="./demo/resizable-body.tsx" title="Basic Usage" description="Drag the edge to resize drawer width or height."></code>

<code src="./demo/resizable.tsx" title="Local Container" description="Render drawer within a local container, bounded by its container area."></code>

## API

All Ant Design `DrawerProps` remain available in addition to these enhancements.

| Property      | Description                                                           | Type                                       | Default        |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------ | -------------- |
| `size`        | Axis size: width for left/right and height for top/bottom; controlled | `'default' \| 'large' \| number \| string` | -              |
| `defaultSize` | Initial axis size in uncontrolled mode                                | `number \| string`                         | `378`          |
| `maxSize`     | Maximum resize size, still capped by the actual Drawer container      | `number`                                   | Container size |
| `resizable`   | Enables resizing or supplies resize lifecycle callbacks               | `boolean \| DrawerResizableConfig`         | `false`        |
| `width`       | Legacy controlled horizontal size; use `size` instead                 | `number \| string`                         | -              |
| `height`      | Legacy controlled vertical size; use `size` instead                   | `number \| string`                         | -              |
| `classNames`  | Ant Design semantic classes plus `dragger`                            | `DrawerClassNames`                         | -              |
| `styles`      | Ant Design semantic styles plus `dragger`                             | `DrawerStyles`                             | -              |

### DrawerResizableConfig

| Property        | Description                               | Type                     |
| --------------- | ----------------------------------------- | ------------------------ |
| `onResizeStart` | Called when resizing starts               | `() => void`             |
| `onResize`      | Called with the current pixel size        | `(size: number) => void` |
| `onResizeEnd`   | Called when resizing ends or is cancelled | `() => void`             |

## Size modes

- Providing `size` enables controlled mode. Update `size` from `onResize` to change the rendered size.
- Without `size` or the legacy property for the current axis, the Drawer is uncontrolled. It preserves the dragged size while the component instance remains mounted.
- Legacy `width` / `height` values are also treated as controlled values.
- `size="default"` resolves to 378px and `size="large"` to 736px. CSS strings remain valid initial or controlled sizes.

## Placement directions

| placement | Handle edge | Drag direction that increases size |
| --------- | ----------- | ---------------------------------- |
| `left`    | Right       | Right                              |
| `right`   | Left        | Left                               |
| `top`     | Bottom      | Down                               |
| `bottom`  | Top         | Up                                 |

## Notes

- `maxSize` is always capped by the available width or height of the actual Drawer root container.
- With `getContainer={false}`, give the parent a positioning context such as `position: relative`.
- This component intentionally has no `minSize`; the minimum follows Ant Design 6 at 0.
- The handle uses `role="separator"`; keyboard resizing is outside this version's scope.
