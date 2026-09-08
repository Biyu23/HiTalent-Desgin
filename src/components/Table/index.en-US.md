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
