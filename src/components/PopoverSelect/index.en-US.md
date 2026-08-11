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
- A legacy API stores comma-separated strings while the component should work with arrays internally.

Use Ant Design Select directly for small, straightforward option sets that need no extra panel behavior.

## Core capabilities

- `rc-virtual-list` keeps 10,000+ options responsive.
- `fieldNames` reads backend records directly without a preprocessing `map`.
- `valueType` converts between arrays and delimited strings.
- Single select, multiple select, select all, and confirmation share one state model.
- `optionRender` and `dropdownRender` extend option and panel content.

## Demos

<code src="./demo/basic.tsx" title="Basic Single Select and Search" description="Single select closes after selection; enable showSearch for local keyword filtering."></code>

<code src="./demo/multiple.tsx" title="Multiple Select with Confirmation" description="Multiple mode confirms before committing and can expose cancel, clear, and max-tag controls."></code>

<code src="./demo/string-value.tsx" title="String Value and Select All" description="valueType='string' converts between a delimited string and an array; select all follows the current search results."></code>

<code src="./demo/virtual.tsx" title="Field Mapping and Virtual Scroll" description="Read non-standard fields through fieldNames and render 10,000 options smoothly."></code>

<code src="./demo/custom.tsx" title="Custom Rendering" description="Customize each option with optionRender and inject additional actions around the list with dropdownRender."></code>

<code src="./demo/empty-state.tsx" title="Empty State and No Match" description="Show clear Empty feedback when no options exist or a search has no matching result."></code>

<code src="./demo/disabled-options.tsx" title="Disabled Options" description="Disable individual records or make the entire component unavailable with disabled."></code>

## API

The component also accepts `NativeProps`, including `className`, `style`, and CSS variables.

| Property         | Description                                 | Type                                   | Default  |
| ---------------- | ------------------------------------------- | -------------------------------------- | -------- |
| `options`        | Data options                                | `OptionType[]`                         | `[]`     |
| `placeholder`    | Placeholder content                         | `ReactNode`                            | -        |
| `showSearch`     | Shows local search                          | `boolean`                              | `false`  |
| `allowClear`     | Allows clearing the value                   | `boolean`                              | `false`  |
| `mode`           | Single- or multiple-select mode             | `single \| multiple`                   | `single` |
| `value`          | Controlled value                            | `ValueType \| ValueType[]`             | -        |
| `defaultValue`   | Uncontrolled initial value                  | `ValueType \| ValueType[]`             | -        |
| `onChange`       | Runs when values or selected options change | `(value, options?) => void`            | -        |
| `fieldNames`     | Maps backend field names                    | `FieldNames`                           | -        |
| `dropdownRender` | Renders the complete panel                  | `(menu: ReactElement) => ReactElement` | -        |
| `showConfirm`    | Shows confirmation in multiple mode         | `boolean`                              | `true`   |
| `showCancelBtn`  | Shows a cancel action                       | `boolean`                              | `false`  |
| `showClearBtn`   | Shows a clear action                        | `boolean`                              | `false`  |
| `optionRender`   | Renders custom option content               | `(item: OptionType) => ReactNode`      | -        |
| `separator`      | Separates displayed multiple values         | `string`                               | `, `     |
| `maxTagCount`    | Maximum visible tags in multiple mode       | `number`                               | -        |
| `virtual`        | Enables virtual scrolling                   | `boolean`                              | `true`   |
| `listHeight`     | Maximum list height in pixels               | `number`                               | `150`    |
| `listItemHeight` | Virtual-list item height in pixels          | `number`                               | `32`     |
| `valueType`      | Submits an array or a delimited string      | `string \| array`                      | `string` |
| `valueSeparator` | Separator for string submission             | `string`                               | `,`      |
| `showSelectAll`  | Shows select all in multiple mode           | `boolean`                              | `false`  |

## Notes

- Provide stable, unique values for large option sets.
- `fieldNames` changes how fields are read; it does not mutate source records.
- In string mode, the separator must match the backend contract and option values must not contain that separator.
- Keep custom option heights stable so virtual-list measurement remains accurate.
