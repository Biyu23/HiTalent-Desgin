---
category: Components
title: PopoverSelect
toc: content
---

# PopoverSelect

Uses a Popover-hosted selection panel with virtual scrolling, select all, field mapping, custom rendering, and flexible value formats.

## When to use

- A large option set needs virtual scrolling to keep opening, searching, and scrolling responsive.
- Backend records do not use a fixed `label` / `value` shape.
- Multi-select needs confirm, cancel, clear, or select-all behavior scoped to current search results.
- An API requires a string field while option values must retain their original number or string types.

Use Ant Design Select directly for small, straightforward option sets that need no extra panel behavior.

## Core capabilities

- `rc-virtual-list` keeps 10,000+ options responsive.
- `fieldNames` reads backend records directly without a preprocessing `map`.
- `valueType="string"` uses a JSON-array string protocol that preserves number and string values without ambiguity.
- Single select, multiple select, select all, and confirmation share one state model.
- `optionRender` and `dropdownRender` extend option and panel content.

## Demos

<code src="./demo/multiple.tsx" title="Multiple Select with Confirmation" description="Multiple mode confirms before committing and supports cancel, clear, and maxTagCount ellipsis."></code>

<code src="./demo/string-value.tsx" title="Type-safe String Submission" description="valueType='string' preserves number and string value types in a JSON-array string; select all follows the current search results."></code>

<code src="./demo/semantic-styles.tsx" title="Semantic Styles and Portal" description="Customize trigger, menu item, and popup-root slots while the portal inherits the active namespace."></code>

## API

The component also accepts `NativeProps`, including `className`, `style`, and CSS variables.

| Property               | Description                                 | Type                                   | Default        |
| ---------------------- | ------------------------------------------- | -------------------------------------- | -------------- |
| `options`              | Data options                                | `OptionType[]`                         | `[]`           |
| `placeholder`          | Placeholder content                         | `ReactNode`                            | -              |
| `showSearch`           | Shows local search                          | `boolean`                              | `false`        |
| `allowClear`           | Allows clearing the value                   | `boolean`                              | `false`        |
| `mode`                 | Single- or multiple-select mode             | `single \| multiple`                   | `single`       |
| `value`                | Controlled value                            | `ValueType \| ValueType[]`             | -              |
| `defaultValue`         | Uncontrolled initial value                  | `ValueType \| ValueType[]`             | -              |
| `onChange`             | Runs when values or selected options change | `(value, options?) => void`            | -              |
| `fieldNames`           | Maps backend field names                    | `FieldNames`                           | -              |
| `dropdownRender`       | Renders the complete panel                  | `(menu: ReactElement) => ReactElement` | -              |
| `showConfirm`          | Shows confirmation in multiple mode         | `boolean`                              | `true`         |
| `showCancelBtn`        | Shows a cancel action                       | `boolean`                              | `false`        |
| `showClearBtn`         | Shows a clear action                        | `boolean`                              | `false`        |
| `optionRender`         | Renders custom option content               | `(item: OptionType) => ReactNode`      | -              |
| `separator`            | Separates displayed multiple values         | `string`                               | `, `           |
| `maxTagCount`          | Maximum visible tags in multiple mode       | `number`                               | -              |
| `virtual`              | Enables virtual scrolling                   | `boolean`                              | `true`         |
| `listHeight`           | Maximum list height in pixels               | `number`                               | `150`          |
| `listItemHeight`       | Virtual-list item height in pixels          | `number`                               | `34`           |
| `valueType`            | Submits an array or JSON-array string       | `string \| array`                      | -              |
| `showSelectAll`        | Shows select all in multiple mode           | `boolean`                              | `false`        |
| `showArrow`            | Whether to show dropdown arrow              | `boolean`                              | `true`         |
| `disabled`             | Whether the component is disabled           | `boolean`                              | `false`        |
| `ellipsis`             | Truncates text and displays full Tooltip    | `boolean \| { tooltip?: string }`      | `true`         |
| `open`                 | Controlled open state of dropdown popover   | `boolean`                              | -              |
| `onOpenChange`         | Callback when open state changes            | `(open: boolean) => void`              | -              |
| `afterOpenChange`      | Callback when open/close transition ends    | `(open: boolean) => void`              | -              |
| `placement`            | Popover placement position                  | `TooltipPlacement`                     | `'bottomLeft'` |
| `getPopupContainer`    | Container node for popup overlay            | `(triggerNode) => HTMLElement`         | -              |
| `autoAdjustOverflow`   | Auto adjust overflow placement              | `boolean`                              | `true`         |
| `destroyTooltipOnHide` | Destroy popover on hide                     | `boolean`                              | `false`        |

## Notes

- Provide stable, unique values for large option sets.
- `fieldNames` changes how fields are read; it does not mutate source records.
- String-mode input and output are JSON-array strings such as `[1,"PM"]`, preserving number and string types.
- Keep custom option heights stable so virtual-list measurement remains accurate.

## Value contracts and semantic styles

Single selection uses `mode="single"` (or omits `mode`) and emits a scalar or `undefined`. Multiple selection must explicitly choose `valueType="array"` or `valueType="string"`; the callback result is an array or string respectively.

String mode uses an unambiguous JSON-array codec, so async options, numeric values, and look-alike string values retain the correct type.

Styling is exposed through `rootClassName`, `classNames`, and `styles`. Slots are `root`, `trigger`, `triggerText`, `actions`, `popup`, `search`, `selectAll`, `menu`, `item`, `footer`, and `empty`. The `popup` slot targets the portal root and automatically receives the active namespace and CSS-in-JS hash.
