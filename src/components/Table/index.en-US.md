---
category: Components
title: Table
toc: content
---

# Table

Adds persistable column state, resizing, row and column drag, tree moves, cell presets, and a toolbar to Ant Design Table.

## When to use

- People need to save column order, visibility, and adjusted widths.
- Rows or columns must be reordered through direct manipulation.
- Tree records need to move before, after, or inside another node.
- Common date, number, and tag cells should share reusable presentation.

Sorting, filtering, pagination, selection, and expansion continue to use the native Ant Design Table APIs.

## Core capabilities

- Separates static column schema from dynamic `ColumnState` that can be persisted directly.
- Supports controlled `columnState` and uncontrolled `defaultColumnState`.
- Visibility, width, drag, and reset changes report a clear `info.reason`.
- Flat row drag supports `before` / `after`; tree mode adds `inside` and complete paths.
- `allowDrop` holds synchronous business rules while the component blocks drops onto the dragged node or its descendants.

## Demos

<code src="./demo/column-drag.tsx" title="Column Settings, Resize, and Drag" description="Control column state while combining visibility, width adjustment, drag order, reset, and persistence callbacks."></code>

<code src="./demo/row-drag-flat.tsx" title="Flat Row Drag" description="Place a row before or after another record and receive the final position through onRowDragEnd."></code>

<code src="./demo/row-drag-tree.tsx" title="Tree Row Drag" description="Move nodes to before, after, or inside positions and receive dragPath and targetPath."></code>

<code src="./demo/sort.tsx" title="Header Sorting" description="Reuse Ant Design sorter and onChange for local ordering and controlled remote-sort state."></code>

<code src="./demo/semantic-styles.tsx" title="Semantic Styles" description="Customize the table boundary, toolbar, settings panel, drag handles, and drag overlay."></code>

## API

### TableProps

All Ant Design `TableProps` remain available, with enhanced `columns` and additional `NativeProps` support.

| Property               | Description                                           | Type                                          | Default  |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------- | -------- |
| `columns`              | Enhanced columns; leaf columns should have stable IDs | `EnhancedColumnType<RecordType>[]`            | required |
| `showColumnSetting`    | Shows the column-settings entry                       | `boolean`                                     | `true`   |
| `columnSettingTitle`   | Column-settings panel title                           | `ReactNode`                                   | -        |
| `columnSettingLoading` | Loading state for column settings                     | `boolean`                                     | -        |
| `enableColumnResize`   | Enables column-width resizing                         | `boolean`                                     | `true`   |
| `enableColumnDrag`     | Enables column reordering                             | `boolean`                                     | `false`  |
| `enableRowDrag`        | Enables row drag and optional rules                   | `boolean \| RowDragConfig<RecordType>`        | `false`  |
| `onRowDragEnd`         | Receives a committed row move                         | `(result: RowDragResult<RecordType>) => void` | -        |
| `zebraStripe`          | Shows alternating row backgrounds                     | `boolean`                                     | `true`   |
| `hoverHighlight`       | Highlights the hovered row                            | `boolean`                                     | `true`   |
| `toolbarRender`        | Replaces the complete toolbar render                  | `(defaultToolbar: ReactNode) => ReactNode`    | -        |
| `toolbarExtra`         | Appends toolbar content                               | `ReactNode`                                   | -        |
| `columnState`          | Controlled state; requires a change callback          | `ColumnState`                                 | -        |
| `defaultColumnState`   | Uncontrolled initial column state                     | `ColumnState`                                 | -        |
| `onColumnStateChange`  | Receives state plus the reason for each change        | `(next: ColumnState, info) => void`           | -        |

### ColumnState

`ColumnState` is a readonly `ColumnStateItem[]` that can be serialized directly.

| Field    | Description              | Type      | Default  |
| -------- | ------------------------ | --------- | -------- |
| `id`     | Stable column ID         | `string`  | required |
| `hidden` | Whether the column hides | `boolean` | -        |
| `width`  | Column width in pixels   | `number`  | -        |

### RowDragConfig

| Property             | Description                                  | Type                                         | Default |
| -------------------- | -------------------------------------------- | -------------------------------------------- | ------- |
| `treeMode`           | Calculates tree-aware drop positions         | `boolean`                                    | `false` |
| `childrenColumnName` | Field that contains child records            | `string`                                     | -       |
| `draggable`          | Enables drag globally or per record          | `boolean \| (record) => boolean`             | -       |
| `allowDrop`          | Synchronously approves a candidate placement | `(info: RowDropInfo<RecordType>) => boolean` | -       |
| `handleColumn`       | Hides or configures the drag-handle column   | `false \| object`                            | -       |

### TableRef

| Method/property    | Description                         | Type               |
| ------------------ | ----------------------------------- | ------------------ |
| `resetColumnState` | Resets order, visibility, and width | `() => void`       |
| `nativeElement`    | Ant Design Table root element       | `HTMLDivElement`   |
| `scrollTo`         | Ant Design Table scroll method      | `(config) => void` |

## Notes

- Give every leaf column a stable, unique `id` when enhanced column behavior is enabled.
- Columns with `hideable: false` remain visible.
- `onColumnStateChange` returns serializable state, not static definitions such as `render` or ReactNode.
- `allowDrop` runs repeatedly while hovering; keep it synchronous, fast, and free of side effects.
- For very large row counts, combine the table with pagination or virtualization; drag behavior does not window data.

## Migration

| Previous API                         | Replacement                                             |
| ------------------------------------ | ------------------------------------------------------- |
| `onColumnsChange`                    | `onColumnStateChange`                                   |
| `hidden` / `defaultWidth` on columns | `columnState` / `defaultColumnState`                    |
| `TableRef.resetAll`                  | `TableRef.resetColumnState`                             |
| `useTableColumns`                    | Build and persist `ColumnState` after fetching          |
| `searchable` / `onColumnSearch`      | Ant Design `filters` / `filterDropdown`                 |
| Inline-edit extension                | Ant Design `render` / `onCell` + Form + controlled data |

`TableRef` also preserves Ant Design `nativeElement` and `scrollTo`.

## Root boundary and semantic styles

The Table `root` is the outer boundary containing both the toolbar and the Ant Design Table. `className` and `style` target the Ant Design Table, while `rootClassName` targets the outer boundary.

`classNames` and `styles` expose `root`, `toolbar`, `toolbarExtra`, `settingTrigger`, `settingPopup`, `table`, `headerCell`, `resizeHandle`, `rowDragHandle`, and `dragOverlay`. Settings and drag overlays render in portals but still receive the active prefix and CSS-in-JS hash.
