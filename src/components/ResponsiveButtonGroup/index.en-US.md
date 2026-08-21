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

<code src="./demo/basic.tsx" title="Comprehensive Responsive Button Group" description="Drag the slider to experience container responsiveness, priority layout, async loading panel persistence, and mode switching."></code>

<code src="./demo/semantic-styles.tsx" title="Semantic Styles" description="Customize the visible area, overflow trigger, menu portal, and menu item slots."></code>

## API

### ResponsiveButtonGroupProps

| Property                | Description                                            | Type                                        | Default                |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------- | ---------------------- |
| `items`                 | Action item list                                       | `readonly ResponsiveButtonGroupItem[]`      | -                      |
| `mode`                  | Display mode (`responsive` / `expanded` / `collapsed`) | `'responsive' \| 'expanded' \| 'collapsed'` | `'responsive'`         |
| `minVisibleCount`       | Minimum inline buttons to retain (excluding More)      | `number`                                    | `0`                    |
| `gap`                   | Gap between buttons in pixels                          | `number`                                    | `8`                    |
| `buttonProps`           | Shared props for all action buttons                    | `ResponsiveButtonGroupButtonProps`          | -                      |
| `overflowLabel`         | Custom text for More button                            | `ReactNode`                                 | Locale text            |
| `overflowIcon`          | Icon for More button                                   | `ReactNode`                                 | `<EllipsisOutlined />` |
| `showOverflowCount`     | Shows count of collapsed items on More button          | `boolean`                                   | `true`                 |
| `overflowButtonProps`   | Props for More trigger button                          | `ButtonProps`                               | -                      |
| `overflowDropdownProps` | Props forwarded to Dropdown                            | `DropdownProps`                             | -                      |
| `overflowMenuProps`     | Props forwarded to Menu                                | `MenuProps`                                 | -                      |
| `renderOverflowButton`  | Custom render for More button                          | `(info) => ReactNode`                       | -                      |
| `onItemClick`           | Unified click callback for all actions                 | `(info) => void \| Promise<unknown>`        | -                      |
| `onActionError`         | Rejected async action callback                         | `(error, info) => void`                     | -                      |
| `onVisibleChange`       | Callback when visible/collapsed keys change            | `(visibleKeys, collapsedKeys) => void`      | -                      |

### ResponsiveButtonGroupItem

| Property              | Description                                                                             | Type                                 | Default |
| --------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ | ------- |
| `key`                 | Unique string key                                                                       | `string`                             | -       |
| `label`               | Label for button and menu item                                                          | `ReactNode`                          | -       |
| `icon`                | Icon for button and menu item                                                           | `ReactNode`                          | -       |
| `priority`            | Collapse priority; lower values collapse earlier                                        | `number`                             | `0`     |
| `disabled`            | Whether the action is disabled                                                          | `boolean`                            | `false` |
| `danger`              | Whether the action is dangerous                                                         | `boolean`                            | `false` |
| `loading`             | Controlled loading state                                                                | `boolean`                            | `false` |
| `tooltip`             | Tooltip for both button and collapsed menu item                                         | `ButtonProps['tooltip']`             | -       |
| `buttonProps`         | Item-specific Button props                                                              | `ResponsiveButtonGroupButtonProps`   | -       |
| `renderCollapsedItem` | Custom render for collapsed menu item                                                   | `(info) => ReactNode`                | -       |
| `onClick`             | Click handler; returns Promise to automatically show Loading and delay dropdown closing | `(info) => void \| Promise<unknown>` | -       |

## Semantic styles

Every item `key` must be a unique string. `rootClassName`, `classNames`, and `styles` expose the `root`, `visible`, `overflowTrigger`, `popup`, and `menuItem` slots. `popup` targets the overflow menu portal root.

Responsive measurement renders each action once plus a single candidate overflow trigger; it does not render every collapsed combination.
