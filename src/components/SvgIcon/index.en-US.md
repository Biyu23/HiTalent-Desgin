---
category: Components
title: SvgIcon
toc: content
---

# SvgIcon

Designed to encapsulate and render arbitrary SVG icons provided by designers, resolving issues like arbitrary dimensions, missing viewBox, hardcoded colors, and lack of font-size scaling.

## When To Use

- When designers provide SVGs with arbitrary width/height (e.g. `24x24`, `37x19`, `1024x1024`) that need to scale smoothly like Ant Design icons.
- When you need to treat an SVG as a first-class Antd icon supporting `size`, `color`, `spin`, and `rotate`.
- When passing custom SVG icons into Antd `Button` (`icon` prop), menus, or toolbars.

## Code Demonstrations

<code src="./demo/basic.tsx" title="Basic Wrapping" description="Directly wrap an SVG with arbitrary width/height. SvgIcon normalizes it to 1em."></code>

<code src="./demo/create-icon.tsx" title="Factory Function" description="Use createSvgIcon to define reusable standalone icon components."></code>

<code src="./demo/size-color.tsx" title="Size, Color and Animations" description="Control size, color, spin animation and rotation effortlessly."></code>

<code src="./demo/button-usage.tsx" title="Usage in Button" description="Seamlessly integrate with Ant Design Button and Space."></code>

## API

### SvgIcon

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| children | Custom SVG element node (`<svg>...</svg>`) | `ReactNode` | - |
| component | Custom SVG component | `ComponentType<CustomIconComponentProps>` | - |
| size | Icon size in px (number) or CSS string | `number | string` | - |
| color | Icon color | `string` | - |
| spin | Whether to show spinning animation | `boolean` | `false` |
| rotate | Rotation angle in degrees | `number` | - |
| className | Custom class name | `string` | - |
| style | Custom style object | `CSSProperties` | - |
| onClick | Click event callback | `MouseEventHandler<HTMLSpanElement>` | - |
