---
category: Components
title: ResponsiveButtonGroup
toc: content
---

# ResponsiveButtonGroup

Automatically calculates available space based on container width and smoothly collapses inline buttons into a "More" dropdown menu.

## When to use

- A toolbar, table header, or card actions bar contains multiple buttons that need to adapt across various screen sizes.
- Important primary actions (like Create, Submit) must stay visible while secondary actions collapse first according to priority.
- Actions seamlessly transition between inline buttons and dropdown menu items, sharing asynchronous Loading, disabled state, and Tooltips.

## Examples

<code src="./demo/basic.tsx" title="Adaptive Layout and Modes" description="Experience container width responsiveness, priority ordering, minimum visible count, and async Promise loading persistence."></code>

<code src="./demo/custom-overflow.tsx" title="Custom Overflow Menu" description="Customize More button icon, label, badge, and custom rendering for collapsed items."></code>

## API

Responsive mode requires `ResizeObserver`; without it, all actions remain inline unless the application provides a polyfill.
Space for More is reserved using the total item count. Smaller counts may leave a small gap to avoid layout feedback at width boundaries.
`renderOverflowButton` also runs for hidden measurement with all `items` and `open=false`. Keep custom triggers at a fixed width independent of `count`, `collapsedItems`, and `open`, and avoid render side effects.
Both item and group click callbacks run. Loading and menu closing wait for all returned tasks to settle; failures are reported through `onActionError`.

Use `className` and `style` for the root wrapper. Slots cover only the overflow trigger and popup.

### ResponsiveButtonGroupProps

| Property                | Description                                                                   | Type                                                                 | Default                |
| ----------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| `items`                 | Action item list data source                                                  | `readonly ResponsiveButtonGroupItem[]`                               | -                      |
| `mode`                  | Display mode (`responsive` / `expanded` / `collapsed`)                        | `'responsive' \| 'expanded' \| 'collapsed'`                          | `'responsive'`         |
| `minVisibleCount`       | Minimum inline buttons to retain (excluding More button)                      | `number`                                                             | `0`                    |
| `gap`                   | Gap between buttons in pixels                                                 | `number`                                                             | `8`                    |
| `overflowLabel`         | Custom text for More trigger button                                           | `ReactNode`                                                          | Locale text            |
| `overflowIcon`          | Custom icon for More trigger button                                           | `ReactNode`                                                          | `<EllipsisOutlined />` |
| `showOverflowCount`     | Whether to show the count of collapsed items on More button                   | `boolean`                                                            | `true`                 |
| `overflowButtonProps`   | Props forwarded to More trigger Button                                        | `ButtonProps`                                                        | -                      |
| `overflowDropdownProps` | Props forwarded to overflow Dropdown                                          | `DropdownProps`                                                      | -                      |
| `overflowMenuProps`     | Props forwarded to overflow Menu                                              | `MenuProps`                                                          | -                      |
| `renderOverflowButton`  | Custom render function for More trigger button                                | `(info: ResponsiveButtonGroupOverflowRenderInfo) => ReactNode`       | -                      |
| `onItemClick`           | Unified click callback for all actions; returns Promise to keep Loading state | `(info: ResponsiveButtonGroupClickInfo) => void \| Promise<unknown>` | -                      |
| `onActionError`         | Callback when async action execution fails                                    | `(error: unknown, info: ResponsiveButtonGroupClickInfo) => void`     | -                      |
| `onVisibleChange`       | Callback when visible or collapsed item sets change                           | `(visibleKeys: string[], collapsedKeys: string[]) => void`           | -                      |
| `classNames`            | Supports `overflowTrigger`, `popup`                                           | `ResponsiveButtonGroupClassNames`                                    | -                      |
| `styles`                | Supports `overflowTrigger`, `popup`                                           | `ResponsiveButtonGroupStyles`                                        | -                      |

### ResponsiveButtonGroupItem

| Property              | Description                                                                                             | Type                                                                 | Default |
| --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| `key`                 | Unique string key                                                                                       | `string`                                                             | -       |
| `label`               | Label for button and menu item                                                                          | `ReactNode`                                                          | -       |
| `icon`                | Icon for button and menu item                                                                           | `ReactNode`                                                          | -       |
| `priority`            | Collapse priority; lower values collapse earlier; items with equal priority collapse from back to front | `number`                                                             | `0`     |
| `disabled`            | Whether the item is disabled                                                                            | `boolean`                                                            | `false` |
| `danger`              | Whether the item is a dangerous action                                                                  | `boolean`                                                            | `false` |
| `loading`             | Controlled loading state                                                                                | `boolean`                                                            | `false` |
| `tooltip`             | Tooltip for both button and collapsed menu item                                                         | `ButtonProps['tooltip']`                                             | -       |
| `buttonProps`         | Item-specific Button props                                                                              | `ResponsiveButtonGroupButtonProps`                                   | -       |
| `renderCollapsedItem` | Custom render for collapsed menu item                                                                   | `(info: ResponsiveButtonGroupRenderInfo) => ReactNode`               | -       |
| `onClick`             | Click handler; returns Promise to automatically show Loading and delay dropdown closing                 | `(info: ResponsiveButtonGroupClickInfo) => void \| Promise<unknown>` | -       |
