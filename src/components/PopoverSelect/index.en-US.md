---
category: Components
title: PopoverSelect
toc: content
---

# PopoverSelect

A popup selector for filters, with select-all, option reordering, and multiple value formats.

## Demos

<code src="./demo/batch.tsx" title="Select all" description="Select matching results, skipping disabled options."></code>

<code src="./demo/sortable.tsx" title="Drag to reorder" description="Drag handles to reorder options."></code>

### Custom trigger text

Set the initial text with `placeholder` and retain the title with `labelRender`. Clearing restores the initial text.

```tsx | pure
<PopoverSelect
  placeholder="Enabled"
  options={[
    { label: 'Yes', value: 1 },
    { label: 'No', value: 0 },
  ]}
  labelRender={(label, { values }) =>
    values.length ? <>Enabled: {label}</> : label
  }
  allowClear
/>
```

## Reordering options

Enable `sortable` and feed the result of `onSortChange` back into `options`:

```tsx | pure
<PopoverSelect options={options} sortable onSortChange={setOptions} />
```

- `options` controls the displayed order. The callback returns a new full array containing the original option objects, including custom fields. The input array is never mutated. Without updating `options`, the original order is retained.
- `onSortChange` fires immediately after reordering. It does not trigger `onChange` or reorder selected values. Confirm and Cancel only affect selection drafts; they do not undo option sorting.
- Sorting pauses while the search contains non-whitespace text. Disabled options cannot initiate dragging but may shift when other options move.
- Handles support mouse, touch, and keyboard: focus a handle, press Space to start, use Up/Down to move, then Space to finish or Escape to cancel.
- `optionRender` still customizes option content. If `dropdownRender` replaces the default menu entirely, the custom menu is responsible for its own drag behavior.

## API

### Responsibilities and extension points

`PopoverSelect` manages selection, search, select-all and confirmation. `PopoverSelect.Selector` only manages the trigger, popup visibility and width, and can host arbitrary content independently.

| Extension                       | Purpose                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `optionRender(item, info)`      | Render option content; `info` contains `value`, `selected`, `disabled`         |
| `dropdownRender(menu, context)` | Wrap or replace the list; search and footer remain part of the panel           |
| `footerRender(footer, context)` | Customize footer actions; return `null` to hide the footer                     |
| `labelRender(label, info)`      | Render committed values; `info` contains `values` and their original `options` |

`context` exposes `options`, `displayOptions` (normalized options with the original object in `source`), `selectedValues`, `searchValue`, `mode`, `confirmRequired`, and the operations `toggleValue(value)`, `selectAll(checked)`, `clear()`, `confirm()`, `cancel()`.

With confirmation enabled, `context.selectedValues` contains the draft. Toggle, select-all and clear only change the draft; `confirm()` commits and requests close, while `cancel()` discards the draft and requests close. Changes to actual external selected values synchronize the draft; reordering options does not reset it. In immediate mode, selection changes commit directly and `confirm()` only requests close. The trigger's clear icon always clears committed values immediately.

Existing single-argument `optionRender` and `dropdownRender` callbacks, and zero-argument `Selector.content` callbacks, remain supported. Controlled `open` must be updated through `onOpenChange`.

### Standalone Selector

```tsx | pure
<PopoverSelect.Selector
  content={({ close }) => <button onClick={close}>Done</button>}
>
  Open custom panel
</PopoverSelect.Selector>
```

`content` accepts a node or `({ open, close }) => ReactNode`. Selector shares `open`, `defaultOpen`, `onOpenChange`, `afterOpenChange`, `placement`, `getPopupContainer`, `autoAdjustOverflow`, and `destroyTooltipOnHide`. It also accepts `children`, `hasValue`, `allowClear`, `onClear`, `disabled`, `showArrow`, `ellipsis`, and styling props. Selector owns no selection data; the caller handles clearing.

### Base properties

Use `className` and `style` for the root wrapper; use `classNames` and `styles` for the regions below.

### PopoverSelectProps

| Property               | Description                                                | Type                                        | Default               |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------- | --------------------- |
| `options`              | Data options list                                          | `OptionType[]`                              | `[]`                  |
| `sortable`             | Enable option drag handles; paused while searching         | `boolean`                                   | `false`               |
| `onSortChange`         | Receive all reordered original options; update `options`   | `(options: OptionType[]) => void`           | -                     |
| `placeholder`          | Placeholder text                                           | `ReactNode`                                 | -                     |
| `showSearch`           | Whether to show search box for local filtering             | `boolean`                                   | `false`               |
| `allowClear`           | Whether to show clear button                               | `boolean`                                   | `false`               |
| `mode`                 | Selection mode, single or multiple                         | `'single' \| 'multiple'`                    | `'single'`            |
| `value`                | Current selected value (controlled)                        | `ValueType \| ValueType[] \| string`        | -                     |
| `defaultValue`         | Default selected value (uncontrolled)                      | `ValueType \| ValueType[] \| string`        | -                     |
| `onChange`             | Callback when value and selected options change            | `(value, options) => void`                  | -                     |
| `valueType`            | Value submission format in multiple mode                   | `'array' \| 'string'`                       | `'array'`             |
| `valueSeparator`       | Separator used to parse and submit values in string mode   | `string`                                    | `','`                 |
| `fieldNames`           | Custom backend field name mapping                          | `PopoverSelectFieldNames<OptionType>`       | -                     |
| `showConfirm`          | Whether to show confirm button in multiple mode            | `boolean`                                   | `mode === 'multiple'` |
| `showCancelBtn`        | Whether to show cancel button to discard draft changes     | `boolean`                                   | `false`               |
| `showClearBtn`         | Whether to show clear button to clear draft/selected value | `boolean`                                   | `false`               |
| `showSelectAll`        | Whether to show select all checkbox in multiple mode       | `boolean`                                   | `false`               |
| `maxTagCount`          | Max number of visible tags before truncating to `(+N)`     | `number`                                    | -                     |
| `separator`            | Separator between selected tags                            | `string`                                    | `', '`                |
| `ellipsis`             | Text truncation and Tooltip config                         | `boolean \| { tooltip?: string }`           | `true`                |
| `virtual`              | Whether to enable virtual scrolling                        | `boolean`                                   | `true`                |
| `listHeight`           | Max list height in pixels                                  | `number`                                    | `150`                 |
| `listItemHeight`       | Virtual list item height in pixels                         | `number`                                    | `34`                  |
| `showArrow`            | Whether to show dropdown arrow                             | `boolean`                                   | `true`                |
| `disabled`             | Whether to disable the component                           | `boolean`                                   | `false`               |
| `dropdownRender`       | Customize the option list                                  | `(menu, context) => ReactElement`           | -                     |
| `optionRender`         | Custom option content                                      | `(item, info) => ReactNode`                 | -                     |
| `footerRender`         | Custom footer actions                                      | `(footer, context) => ReactNode`            | -                     |
| `labelRender`          | Custom committed-value label                               | `(label, info) => ReactNode`                | -                     |
| `defaultOpen`          | Initial uncontrolled popup state                           | `boolean`                                   | `false`               |
| `open`                 | Popover open state (controlled)                            | `boolean`                                   | -                     |
| `onOpenChange`         | Callback when Popover open state changes                   | `(open: boolean) => void`                   | -                     |
| `afterOpenChange`      | Callback when Popover open/close transition finishes       | `(open: boolean) => void`                   | -                     |
| `placement`            | Popover placement                                          | `TooltipPlacement`                          | `'bottomLeft'`        |
| `getPopupContainer`    | Mounting container node for popup                          | `(triggerNode: HTMLElement) => HTMLElement` | -                     |
| `autoAdjustOverflow`   | Whether to automatically adjust position on overflow       | `boolean`                                   | `true`                |
| `destroyTooltipOnHide` | Whether to destroy popup DOM on hide                       | `boolean`                                   | `false`               |
| `classNames`           | Custom semantic slot classNames                            | `PopoverSelectClassNames`                   | -                     |
| `styles`               | Custom semantic slot inline styles                         | `PopoverSelectStyles`                       | -                     |

### PopoverSelectClassNames

| Property  | Description                          | Type     |
| --------- | ------------------------------------ | -------- |
| `trigger` | Class name of the trigger button     | `string` |
| `popup`   | Class name of the popup container    | `string` |
| `menu`    | Class name of the options menu list  | `string` |
| `footer`  | Class name of the footer button area | `string` |

### PopoverSelectStyles

| Property  | Description                           | Type                  |
| --------- | ------------------------------------- | --------------------- |
| `trigger` | Inline style of the trigger button    | `React.CSSProperties` |
| `popup`   | Inline style of the popup container   | `React.CSSProperties` |
| `menu`    | Inline style of the options menu list | `React.CSSProperties` |
| `footer`  | Inline style of the footer            | `React.CSSProperties` |
