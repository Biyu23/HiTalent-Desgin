import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  ColumnId,
  ColumnState,
  ColumnStateChangeInfo,
  ColumnStateItem,
  EnhancedColumnType,
} from '../type';
import { collectColumnMeta, createColumnState } from '../utils/columnHelpers';

interface UseColumnConfigOptions<RecordType> {
  columns: readonly EnhancedColumnType<RecordType>[];
  columnState?: ColumnState;
  defaultColumnState?: ColumnState;
  controlled: boolean;
  onColumnStateChange?: (
    next: ColumnState,
    info: ColumnStateChangeInfo,
  ) => void;
}

function withOrder(
  state: readonly ColumnStateItem[],
  orderedIds: readonly ColumnId[],
): ColumnStateItem[] {
  const itemMap = new Map(state.map((item) => [item.id, item]));
  return orderedIds
    .map((id) => itemMap.get(id))
    .filter((item): item is ColumnStateItem => Boolean(item));
}

export function useColumnConfig<RecordType>(
  options: UseColumnConfigOptions<RecordType>,
) {
  const {
    columns,
    columnState,
    defaultColumnState,
    controlled,
    onColumnStateChange,
  } = options;

  const [internalState, setInternalState] = useState<ColumnStateItem[]>(() =>
    createColumnState(columns, defaultColumnState),
  );
  const [previewOrder, setPreviewOrder] = useState<ColumnId[] | null>(null);
  const [previewWidths, setPreviewWidths] = useState<
    Readonly<Record<ColumnId, number>>
  >({});

  const schemaState = useMemo(
    () => createColumnState(columns, controlled ? columnState : internalState),
    [columns, controlled, columnState, internalState],
  );

  const currentState = useMemo(() => {
    const ordered = previewOrder
      ? withOrder(schemaState, previewOrder)
      : schemaState;
    if (!Object.keys(previewWidths).length) return ordered;
    return ordered.map((item) => {
      const width = previewWidths[item.id];
      return width === undefined ? item : { ...item, width };
    });
  }, [previewOrder, previewWidths, schemaState]);

  const stateRef = useRef(currentState);
  stateRef.current = currentState;
  const onChangeRef = useRef(onColumnStateChange);
  onChangeRef.current = onColumnStateChange;

  const emitChange = useCallback(
    (next: ColumnStateItem[], info: ColumnStateChangeInfo) => {
      const normalized = createColumnState(columns, next);
      if (!controlled) setInternalState(normalized);
      stateRef.current = normalized;
      onChangeRef.current?.(normalized, info);
    },
    [columns, controlled],
  );

  const columnMeta = useMemo(() => collectColumnMeta(columns), [columns]);
  const orderedIds = useMemo(
    () => currentState.map((item) => item.id),
    [currentState],
  );
  const visibleIds = useMemo(
    () => currentState.filter((item) => !item.hidden).map((item) => item.id),
    [currentState],
  );
  const columnWidths = useMemo(() => {
    const result: Record<ColumnId, number> = {};
    currentState.forEach((item) => {
      if (typeof item.width === 'number' && Number.isFinite(item.width)) {
        result[item.id] = item.width;
      }
    });
    return result;
  }, [currentState]);

  const setVisibleIds = useCallback(
    (nextVisibleIds: readonly ColumnId[]) => {
      const visibleSet = new Set(nextVisibleIds);
      const metaMap = new Map(columnMeta.map((item) => [item.id, item]));
      const next = stateRef.current.map((item) => ({
        ...item,
        hidden:
          metaMap.get(item.id)?.column.hideable === false
            ? false
            : !visibleSet.has(item.id),
      }));
      emitChange(next, { reason: 'visibility' });
    },
    [columnMeta, emitChange],
  );

  const previewColumnWidth = useCallback(
    (columnId: ColumnId, width: number) => {
      if (!Number.isFinite(width)) return;
      setPreviewWidths((previous) => ({ ...previous, [columnId]: width }));
    },
    [],
  );

  const commitColumnWidth = useCallback(
    (columnId: ColumnId, width: number) => {
      if (!Number.isFinite(width)) return;
      const next = stateRef.current.map((item) =>
        item.id === columnId ? { ...item, width } : item,
      );
      setPreviewWidths({});
      emitChange(next, { reason: 'resize', columnId });
    },
    [emitChange],
  );

  const previewColumnOrder = useCallback((next: readonly ColumnId[]) => {
    setPreviewOrder([...next]);
  }, []);

  const commitColumnOrder = useCallback(
    (next: readonly ColumnId[]) => {
      const nextState = withOrder(stateRef.current, next);
      setPreviewOrder(null);
      emitChange(nextState, { reason: 'reorder' });
    },
    [emitChange],
  );

  const cancelColumnOrder = useCallback(() => setPreviewOrder(null), []);

  const resetColumnState = useCallback(() => {
    setPreviewOrder(null);
    setPreviewWidths({});
    emitChange([...(defaultColumnState ?? [])], {
      reason: 'reset',
    });
  }, [defaultColumnState, emitChange]);

  return {
    columnMeta,
    visibleIds,
    columnWidths,
    orderedIds,
    setVisibleIds,
    previewColumnWidth,
    commitColumnWidth,
    previewColumnOrder,
    commitColumnOrder,
    cancelColumnOrder,
    resetColumnState,
  };
}
