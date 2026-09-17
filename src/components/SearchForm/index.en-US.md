---
category: Components
title: SearchForm
toc: content
---

# SearchForm

`SearchForm` is designed for multi-condition filtering in list pages, file management, candidate database, etc. It supports inline mode, on-page menu mode, and combined mode, with unified state management and built-in Active Filters.

## When to Use

- When filtering fields are few (4~8 items), and you want quick inline filtering on top of the page with fold/expand capability.
- When filtering fields are numerous and categorized, requiring a side drawer for business grouping and quick boolean filters.
- When you want to combine inline quick filtering with an advanced drawer filter while sharing the same active tags and query state.

## Examples

<code src="./demo/basic.tsx" title="Inline Mode & Threshold Expand" description="Display filter items inline. When the count exceeds defaultVisibleCount, smooth expand/collapse is provided."></code>

<code src="./demo/menu.tsx" title="Menu Mode & Business Groups" description="Display categorized filters and search/reset actions directly on the page."></code>

<code src="./demo/combined.tsx" title="Combined Mode" description="Inline high-frequency filters on top with a button to invoke the advanced drawer, sharing unified state."></code>

<code src="./demo/custom-tag.tsx" title="Custom Active Tag" description="Customize active filter tag label and visibility using formatTag."></code>

## API

The Form instance is the single source of values. External `setFieldsValue`, `setFieldValue`, and `resetFields` calls update tags and field visibility without triggering a search. Searches include unmounted fields; hidden fields retain their values.

Inline popovers edit a separate draft. Confirm validates the current field and searches; closing discards the draft. `children(form)` always receives the main form for cross-field dependencies. Menu and drawer controls edit the main form directly: change mode searches on edits, while submit mode searches when the Search button is clicked.

Removing a tag or clearing a field triggers a `tag-remove` search and preserves the actual result of custom `onClear`. Reset and Clear All restore initial values and invoke both `onReset` and a `reset` search. Form-level `initialValues` override field `initialValue`; `formItemProps.initialValue` is no longer supported.

Menu mode renders groups and action buttons on the page; only combined mode uses a drawer. The previously ineffective `span` property has been removed. Default tags use plain value text; use `formatTag` for localized booleans or array summaries.

Use `className` and `style` for the root. Both `classNames` and `styles` support `form`, `actions`, `activeFilters`, `menu`, `drawer`, `quickFilters`, and `group`. `actions` also targets the drawer action area.

### SearchForm

| Property            | Description                                                               | Type                                                                                          | Default             |
| ------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| mode                | Display mode: `inline` \| `menu` \| `combined`                            | `'inline' \| 'menu' \| 'combined'`                                                            | `'inline'`          |
| fields              | List of field definitions                                                 | `SearchFormFieldItem[]`                                                                       | `[]`                |
| groups              | Business groups configuration (used in menu mode and the combined drawer) | `SearchFieldGroup[]`                                                                          | -                   |
| form                | Ant Design Form instance                                                  | `FormInstance`                                                                                | -                   |
| initialValues       | Initial default values                                                    | `Record<string, unknown>`                                                                     | -                   |
| onSearch            | Callback when a search query is triggered                                 | `(values: Values, info: { source: 'submit' \| 'change' \| 'tag-remove' \| 'reset' }) => void` | -                   |
| onReset             | Callback when reset is triggered                                          | `() => void`                                                                                  | -                   |
| onValuesChange      | Callback when field values change                                         | `(changedValues: Partial<Values>, allValues: Values) => void`                                 | -                   |
| searchMode          | Search trigger mode: `submit` \| `change`                                 | `'submit' \| 'change'`                                                                        | `'submit'`          |
| defaultVisibleCount | Default visible field count threshold in inline mode                      | `number`                                                                                      | `4`                 |
| defaultExpanded     | Whether inline fields are expanded by default                             | `boolean`                                                                                     | `false`             |
| expanded            | Controlled expanded state                                                 | `boolean`                                                                                     | -                   |
| onExpandedChange    | Callback when expand state changes                                        | `(expanded: boolean) => void`                                                                 | -                   |
| showActiveFilters   | Whether to display the Active Filters Bar                                 | `boolean`                                                                                     | `true`              |
| showSearchButton    | Whether to display search button                                          | `boolean`                                                                                     | `true`              |
| showResetButton     | Whether to display reset button                                           | `boolean`                                                                                     | `true`              |
| searchText          | Search button text                                                        | `ReactNode`                                                                                   | `'Search'`          |
| resetText           | Reset button text                                                         | `ReactNode`                                                                                   | `'Reset'`           |
| menuTitle           | Title of drawer panel                                                     | `ReactNode`                                                                                   | `'Search Criteria'` |
| menuTrigger         | Trigger button content to open drawer                                     | `ReactNode`                                                                                   | `'Advanced Search'` |
| actionExtra         | Additional action content rendering                                       | `ReactNode`                                                                                   | -                   |
| disabled            | Whether to disable all fields                                             | `boolean`                                                                                     | `false`             |
| classNames          | Semantic class names                                                      | `SearchFormClassNames`                                                                        | -                   |
| styles              | Semantic styles                                                           | `SearchFormStyles`                                                                            | -                   |

### SearchFormFieldItem

| Property      | Description                                           | Type                                                     | Default |
| ------------- | ----------------------------------------------------- | -------------------------------------------------------- | ------- |
| name          | Unique field identifier, maps to Form name            | `string`                                                 | -       |
| label         | Field label                                           | `ReactNode`                                              | -       |
| children      | Field control element or render function              | `ReactNode \| ((form: FormInstance) => ReactNode)`       | -       |
| formItemProps | Extra props for underlying `Form.Item`                | `FormItemProps`                                          | -       |
| initialValue  | Initial default value                                 | `unknown`                                                | -       |
| group         | Group key (used in menu mode and the combined drawer) | `string`                                                 | -       |
| quick         | Whether field belongs to quick boolean filter         | `boolean`                                                | `false` |
| pinned        | Whether field is always visible when collapsed        | `boolean`                                                | `false` |
| formatTag     | Custom tag text generator. Return false/null to skip  | `(value, allValues, form) => ReactNode \| false \| null` | -       |
| onClear       | Custom clear logic for tag removal                    | `(form: FormInstance) => void`                           | -       |
| hidden        | Whether field is hidden                               | `boolean \| ((values, form) => boolean)`                 | -       |

### SearchFieldGroup

| Property        | Description                          | Type        | Default |
| --------------- | ------------------------------------ | ----------- | ------- |
| key             | Group identifier                     | `string`    | -       |
| title           | Group title                          | `ReactNode` | -       |
| defaultExpanded | Whether group is expanded by default | `boolean`   | `true`  |
| extra           | Extra node on the right              | `ReactNode` | -       |

### SearchFormRef

| Method      | Description                             | Type           |
| ----------- | --------------------------------------- | -------------- |
| form        | Get underlying Ant Design Form instance | `FormInstance` |
| submit      | Trigger search query manually           | `() => void`   |
| resetFields | Reset all fields and trigger search     | `() => void`   |
| openMenu    | Open drawer menu                        | `() => void`   |
| closeMenu   | Close drawer menu                       | `() => void`   |
