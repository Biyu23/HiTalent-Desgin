---
category: Components
title: PopoverSelect
toc: content
---

# PopoverSelect

Hosts a selection panel inside a Popover card, providing virtual scrolling, search filtering, select-all, field mapping, multi-select confirmation, and JSON-array string value serialization.

## When to use

- Need a Popover card form to host the selection panel and save screen space.
- Large number of options where virtual scrolling is required to keep opening, searching, and scrolling responsive.
- Backend records do not use a standard `label` / `value` structure and require field mapping.
- Multi-select workflows require draft operations such as confirm, cancel, clear, or select-all scoped to the current search results.
- Backend API requires a string field while option values must preserve original number or string types.

## Demos

<code src="./demo/basic.tsx" title="Basic Single Selection" description="Supports Popover single selection, search filtering, clear button, and custom field mapping (fieldNames)."></code>

<code src="./demo/multiple.tsx" title="Multiple Select with Confirmation" description="Multiple mode supports confirm, cancel, and clear draft operations, with maxTagCount auto (+N) truncation."></code>

<code src="./demo/string-value.tsx" title="String Submission & Select All" description="valueType='string' submits values as a JSON array string preserving number and string types; showSelectAll supports selecting all filtered results."></code>

## API

In addition to the properties below, the component also supports native props including `className`, `style`, and `rootClassName`.

### PopoverSelectProps

| Property               | Description                                                | Type                                        | Default               |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------- | --------------------- |
| `options`              | Data options list                                          | `OptionType[]`                              | `[]`                  |
| `placeholder`          | Placeholder text                                           | `ReactNode`                                 | -                     |
| `showSearch`           | Whether to show search box for local filtering             | `boolean`                                   | `false`               |
| `allowClear`           | Whether to show clear button                               | `boolean`                                   | `false`               |
| `mode`                 | Selection mode, single or multiple                         | `'single' \| 'multiple'`                    | `'single'`            |
| `value`                | Current selected value (controlled)                        | `ValueType \| ValueType[] \| string`        | -                     |
| `defaultValue`         | Default selected value (uncontrolled)                      | `ValueType \| ValueType[] \| string`        | -                     |
| `onChange`             | Callback when value and selected options change            | `(value, options) => void`                  | -                     |
| `valueType`            | Value submission format in multiple mode                   | `'array' \| 'string'`                       | `'array'`             |
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
| `dropdownRender`       | Custom dropdown panel renderer                             | `(menu: ReactElement) => ReactElement`      | -                     |
| `optionRender`         | Custom single option renderer                              | `(item: OptionType) => ReactNode`           | -                     |
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
