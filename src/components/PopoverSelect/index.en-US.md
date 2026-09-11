---
category: Components
title: PopoverSelect
toc: content
---

# PopoverSelect

Hosts a selection panel inside a Popover card, providing virtual scrolling, search filtering, select-all, field mapping, multi-select confirmation, and delimiter-separated string value serialization.

## When to use

- Need a Popover card form to host the selection panel and save screen space.
- Large number of options where virtual scrolling is required to keep opening, searching, and scrolling responsive.
- Backend records do not use a standard `label` / `value` structure and require field mapping.
- Multi-select workflows require draft operations such as confirm, cancel, clear, or select-all scoped to the current search results.
- Backend API requires a delimiter-separated string while option values need to recover their original number or string types.

## Demos

<code src="./demo/basic.tsx" title="Basic Single Selection" description="Supports Popover single selection, search filtering, clear button, and custom field mapping (fieldNames)."></code>

<code src="./demo/multiple.tsx" title="Multiple Select with Confirmation" description="Multiple mode supports confirm, cancel, and clear draft operations, with maxTagCount auto (+N) truncation."></code>

<code src="./demo/string-value.tsx" title="String Submission & Select All" description="valueType='string' parses and submits values using valueSeparator, restoring value types from options; showSelectAll supports selecting all filtered results."></code>

## Reordering options

<code src="./demo/sortable.tsx" title="Reordering options" description="Reorder options using a dedicated handle in regular or virtual lists, while confirming selection separately."></code>

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

<code src="./demo/custom.tsx" title="Custom renderers and standalone popup" description="Reuse selection and confirmation through read-only state and explicit operations."></code>

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

In addition to the properties below, the component also supports native props including `className`, `style`, and `rootClassName`.

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

| Property      | Description                                                     | Type     |
| ------------- | --------------------------------------------------------------- | -------- |
| `root`        | Class name of the root wrapper                                  | `string` |
| `trigger`     | Class name of the trigger button                                | `string` |
| `triggerText` | Class name of the trigger text container                        | `string` |
| `actions`     | Class name of the right action container (arrow and clear icon) | `string` |
| `popup`       | Class name of the popup container                               | `string` |
| `search`      | Class name of the search input area                             | `string` |
| `selectAll`   | Class name of the select-all checkbox area                      | `string` |
| `menu`        | Class name of the options menu list                             | `string` |
| `item`        | Class name of each option item                                  | `string` |
| `footer`      | Class name of the footer button area                            | `string` |
| `empty`       | Class name of the empty state area                              | `string` |

### PopoverSelectStyles

| Property  | Description                           | Type                  |
| --------- | ------------------------------------- | --------------------- |
| `root`    | Inline style of the root wrapper      | `React.CSSProperties` |
| `trigger` | Inline style of the trigger button    | `React.CSSProperties` |
| `popup`   | Inline style of the popup container   | `React.CSSProperties` |
| `menu`    | Inline style of the options menu list | `React.CSSProperties` |
