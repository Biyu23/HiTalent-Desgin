---
category: Components
title: ResponsiveButtonGroup
toc: content
---

# ResponsiveButtonGroup

Automatically distributes actions between inline buttons and a More menu based on the component container width.

## When to use

- A page header, card header, or table toolbar contains many actions.
- Important actions should remain visible while secondary actions collapse as space decreases.
- The same action must preserve disabled, loading, and click behavior when moving between button and menu forms.

For a fixed set of buttons that does not need responsive collapsing, use Ant Design `Space`, `Flex`, or `Space.Compact` directly.

## Collapse rules

- A lower `priority` collapses earlier; the default is `0`.
- When priorities are equal, items collapse from the visual left; RTL layouts reverse the corresponding data-index direction.
- Inline buttons and menu items always preserve the original `items` order.
- `minVisibleCount` is a strict constraint. If the container becomes too narrow, content may overflow rather than hiding more buttons.

## Examples

<code src="./demo/basic.tsx" title="Responsive basics" description="Resize the container to see actions collapse and return according to priority."></code>

<code src="./demo/modes.tsx" title="Display modes" description="Use responsive, expanded, or collapsed mode."></code>

<code src="./demo/custom.tsx" title="Customization and async state" description="Customize collapsed content and the More trigger while sharing Promise loading across both forms."></code>

## API

### ResponsiveButtonGroupProps

| Property                | Description                                                  | Type                                        | Default            |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------- | ------------------ |
| `items`                 | Action definitions                                           | `readonly ResponsiveButtonGroupItem[]`      | -                  |
| `mode`                  | Responsive, forced expanded, or forced collapsed             | `'responsive' \| 'expanded' \| 'collapsed'` | `'responsive'`     |
| `minVisibleCount`       | Minimum inline action count, excluding More                  | `number`                                    | `0`                |
| `gap`                   | Gap between buttons in pixels                                | `number`                                    | `8`                |
| `buttonProps`           | Shared props for action buttons                              | `ResponsiveButtonGroupButtonProps`          | -                  |
| `overflowLabel`         | More button label                                            | `ReactNode`                                 | Locale text        |
| `overflowIcon`          | More button icon                                             | `ReactNode`                                 | `EllipsisOutlined` |
| `showOverflowCount`     | Shows the number of collapsed actions                        | `boolean`                                   | `true`             |
| `overflowButtonProps`   | Props for the More button                                    | `ButtonProps`                               | -                  |
| `overflowDropdownProps` | Dropdown props; `children` and `menu` are managed internally | `DropdownProps`                             | -                  |
| `overflowMenuProps`     | Menu props; `items` and `onClick` are managed internally     | `MenuProps`                                 | -                  |
| `renderOverflowButton`  | Customizes the More trigger content                          | `(info) => ReactNode`                       | -                  |
| `onItemClick`           | Shared callback for every action                             | `(info) => void \| Promise<unknown>`        | -                  |
| `onVisibleChange`       | Called when inline and collapsed key sets change             | `(visibleKeys, collapsedKeys) => void`      | -                  |

Native `className`, `style`, `tabIndex`, `data-*`, and `aria-*` props are also supported.

### ResponsiveButtonGroupItem

| Property              | Description                                                    | Type                                 | Default |
| --------------------- | -------------------------------------------------------------- | ------------------------------------ | ------- |
| `key`                 | Unique identifier                                              | `React.Key`                          | -       |
| `label`               | Button and default menu label                                  | `ReactNode`                          | -       |
| `icon`                | Button and default menu icon                                   | `ReactNode`                          | -       |
| `priority`            | Collapse priority; lower values collapse earlier               | `number`                             | `0`     |
| `disabled`            | Disables the action                                            | `boolean`                            | `false` |
| `danger`              | Marks a dangerous action                                       | `boolean`                            | `false` |
| `loading`             | Controlled loading state                                       | `boolean`                            | `false` |
| `tooltip`             | Inline button tooltip                                          | `ButtonProps['tooltip']`             | -       |
| `buttonProps`         | Per-item Button props overriding shared props                  | `ResponsiveButtonGroupButtonProps`   | -       |
| `renderCollapsedItem` | Custom collapsed content without replacing menu behavior       | `(info) => ReactNode`                | -       |
| `onClick`             | Action callback; returning a Promise enables automatic loading | `(info) => void \| Promise<unknown>` | -       |

The click info `source` is either `'button'` or `'overflow'`, indicating whether the action came from an inline button or the More menu.

## Modes

- `responsive`: calculates the layout from the component container width.
- `expanded`: keeps every action inline and allows horizontal overflow.
- `collapsed`: collapses every action except those required by `minVisibleCount`.

## Notes

- The component relies on real DOM measurements. During SSR and before the first client measurement, all buttons render inline.
- The first version accepts `items` only and does not automatically convert compound controls such as Upload, Dropdown, or Popconfirm.
- `buttonProps` is intended for visual and general interaction settings. Implement navigation, form submission, and element identity through the item `onClick` so behavior remains consistent after collapsing.
- Keep `renderCollapsedItem` and `renderOverflowButton` pure; do not rely on their invocation count.
- A custom More trigger should remain focusable and provide an accessible name.
- Promises returned by `onClick` and `onItemClick` jointly control the item's automatic loading state.
