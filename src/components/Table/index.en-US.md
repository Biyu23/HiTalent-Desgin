---
category: Components
title: Table
toc: content
---

# Table

Table extends Ant Design Table with column state, column settings, resizing, column reordering, and flat or tree row reordering.

## Demos

<code src="./demo/candidate-drag.tsx" title="Candidate flat drag" description="Selection, row and column dragging, column settings, resizing, horizontal scrolling, and pagination in a dense candidate list."></code>

<code src="./demo/team-tree-drag.tsx" title="Team tree drag" description="Hierarchical team metrics with cross-level row dragging, column dragging, settings, and a summary row."></code>

<code src="./demo/candidate-sort.tsx" title="Candidate sorting" description="Controlled sorting in an isolated scenario without row dragging."></code>

## API notes

- Passing `columnState` makes the column state controlled. Otherwise, `defaultColumnState` initializes internal state.
- `onColumnStateChange` only reports the next state and does not determine whether state is controlled.
- `columnSetting`, `columnResize`, `columnDrag`, and `rowDrag` enable each enhancement independently.
- `onRowDragEnd` returns `source`, `target`, `placement`, and an immutable `nextDataSource`.
- Every enhanced leaf column requires a unique string `key`.
- Sorting and row dragging express different ordering semantics and should normally be mutually exclusive in a business view.
- Column state `width` is an explicit override. Without it, widths follow updates to `columns.width`. Resizing preserves the user's width; `resetColumnState()` restores the default column state.
- The child field is resolved from `rowDrag.childrenKey`, `expandable.childrenColumnName`, top-level `childrenColumnName`, then `children`. Rendering and dragging use the same field.
- Virtual tables use `div` rows and cells by default. Custom `components.body.row` components must forward props and their DOM ref with `forwardRef` for measurement and dragging.
- A function-valued `components.body` owns the entire body and is passed through unchanged, with built-in row dragging disabled. Use object-valued body components for built-in row dragging.
- Column settings call function-valued `columns.title` with an empty title context. Titles that depend on sorting or filtering can read business state through a closure.
- `hoverHighlight={false}` disables hover highlighting while preserving striped and selected backgrounds. Native `rowHoverable={false}` is also respected.
- Row dragging supports mouse and keyboard: focus the handle, press Space or Enter to start, use Up/Down to choose a target, then Space/Enter to commit or Escape to cancel. In tree mode, Left/Right move through the before/inside/after placements. Touch dragging and spoken drag instructions are not provided.
- Whole-row dragging (`rowDrag.handle=false`) supports focusing the row for keyboard operation and preserves pointer, mouse and keyboard callbacks from `onRow`. Calling `preventDefault()` prevents drag activation.
- `rowDrag.autoExpandDelay` defaults to 600ms for both tree nodes and detail rows. Setting it to `false` disables automatic expansion and cancels pending expansion. The latest `canDrag` and `canDrop` rules are checked again before committing a drop.
- Column resizing and dragging follow the rendered LTR/RTL direction. Children of fixed column groups inherit `fixed` and cannot be dragged unless explicitly overridden.
- Expansion persists when switching row drag modes. Removing controlled `expandedRowKeys` resumes local state from the last controlled value. Automatic expansion merges the current expanded keys.
- Disabling row dragging, switching modes, or replacing row data cancels an active row drag. Disabling `columnResize` or setting the active column to `resizable: false` cancels resizing.
- Business props returned by `onCell` and `onHeaderCell`, including `column`, are preserved for custom cell components.
- Unsaved column-setting choices remain until saved or closed; parent rerenders do not overwrite the draft. Reopening loads the latest column state.
- Dragging supports `ConfigProvider.antdPrefixCls`, nested Tables and virtual horizontal scrolling. Nested elements and drag events are scoped to their own Table.
