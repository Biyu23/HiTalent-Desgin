import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EnhancedColumnType } from '../type';
import { getColumnKey } from '../utils/columnHelpers';

interface UseColumnConfigOptions<RecordType> {
  columns: readonly EnhancedColumnType<RecordType>[];
  onColumnsChange?: (columns: EnhancedColumnType<RecordType>[]) => void;
  showColumnSetting: boolean;
  enableColumnResize: boolean;
  enableColumnDrag: boolean;
}

function buildEnrichedColumns<RecordType extends Record<string, unknown>>(
  columns: readonly EnhancedColumnType<RecordType>[],
  visibleKeys: string[],
  columnWidths: Record<string, number>,
  orderedKeys: string[],
): EnhancedColumnType<RecordType>[] {
  const keyToCol = new Map<string, EnhancedColumnType<RecordType>>();
  columns.forEach((col, i) => keyToCol.set(getColumnKey(col, i), col));

  return orderedKeys
    .map((key) => {
      const col = keyToCol.get(key);
      if (!col) return null;
      return {
        ...col,
        hidden: !visibleKeys.includes(key),
        width: columnWidths[key] ?? col.width ?? col.defaultWidth,
      };
    })
    .filter(Boolean) as EnhancedColumnType<RecordType>[];
}

function deriveFromColumns<RecordType extends Record<string, unknown>>(
  columns: readonly EnhancedColumnType<RecordType>[],
): {
  visibleKeys: string[];
  columnWidths: Record<string, number>;
  orderedKeys: string[];
} {
  const visibleKeys: string[] = [];
  const columnWidths: Record<string, number> = {};
  const orderedKeys: string[] = [];

  columns.forEach((col, i) => {
    const key = getColumnKey(col, i);
    orderedKeys.push(key);
    if (!col.hidden) {
      visibleKeys.push(key);
    }
    const w = col.width ?? col.defaultWidth;
    if (w !== undefined) {
      columnWidths[key] = w as number;
    }
  });

  return { visibleKeys, columnWidths, orderedKeys };
}

export function useColumnConfig<RecordType extends Record<string, unknown>>(
  options: UseColumnConfigOptions<RecordType>,
) {
  const {
    columns,
    onColumnsChange,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
  } = options;

  const [initialSnapshot] = useState(() => {
    const derived = deriveFromColumns(columns);
    return { columns, ...derived };
  });

  const columnKeys = useMemo(
    () => columns.map((col, i) => getColumnKey(col, i)),
    [columns],
  );

  const [internalVisibleKeys, setInternalVisibleKeys] = useState<string[]>(
    () => deriveFromColumns(columns).visibleKeys,
  );
  const [internalColumnWidths, setInternalColumnWidths] = useState<
    Record<string, number>
  >(() => deriveFromColumns(columns).columnWidths);
  const [internalOrderedKeys, setInternalOrderedKeys] = useState<string[]>(
    () => deriveFromColumns(columns).orderedKeys,
  );

  const stateRef = useRef({
    visibleKeys: internalVisibleKeys,
    columnWidths: internalColumnWidths,
    orderedKeys: internalOrderedKeys,
  });
  stateRef.current = {
    visibleKeys: internalVisibleKeys,
    columnWidths: internalColumnWidths,
    orderedKeys: internalOrderedKeys,
  };

  const syncVersionRef = useRef(0);
  const localVersionRef = useRef(0);

  useEffect(() => {
    syncVersionRef.current += 1;
    const currentSyncVer = syncVersionRef.current;
    const derived = deriveFromColumns(columns);

    queueMicrotask(() => {
      if (
        syncVersionRef.current === currentSyncVer &&
        localVersionRef.current < currentSyncVer
      ) {
        setInternalVisibleKeys(derived.visibleKeys);
        setInternalColumnWidths(derived.columnWidths);
        setInternalOrderedKeys(derived.orderedKeys);
        localVersionRef.current = currentSyncVer;
      }
    });
  }, [columns]);

  const visibleKeys = internalVisibleKeys;
  const columnWidths = internalColumnWidths;
  const orderedKeys = internalOrderedKeys;

  const onColumnsChangeRef = useRef(onColumnsChange);
  onColumnsChangeRef.current = onColumnsChange;

  const triggerColumnsChange = useCallback(
    (vKeys: string[], widths: Record<string, number>, oKeys: string[]) => {
      localVersionRef.current = syncVersionRef.current + 1;
      onColumnsChangeRef.current?.(
        buildEnrichedColumns(columns, vKeys, widths, oKeys),
      );
    },
    [columns],
  );

  const setVisibleKeys = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      const prevKeys = stateRef.current.visibleKeys;
      const nextValue = typeof next === 'function' ? next(prevKeys) : next;

      setInternalVisibleKeys(nextValue);
      triggerColumnsChange(
        nextValue,
        stateRef.current.columnWidths,
        stateRef.current.orderedKeys,
      );
    },
    [triggerColumnsChange],
  );

  const setColumnWidth = useCallback((columnKey: string, width: number) => {
    setInternalColumnWidths((prev) => ({ ...prev, [columnKey]: width }));
  }, []);

  const setOrderedKeys = useCallback(
    (
      next: string[] | ((prev: string[]) => string[]),
      opts?: { silent?: boolean },
    ) => {
      const prevKeys = stateRef.current.orderedKeys;
      const nextValue = typeof next === 'function' ? next(prevKeys) : next;

      setInternalOrderedKeys(nextValue);
      if (!opts?.silent) {
        triggerColumnsChange(
          stateRef.current.visibleKeys,
          stateRef.current.columnWidths,
          nextValue,
        );
      }
    },
    [triggerColumnsChange],
  );

  const commitResize = useCallback(
    (columnKey: string, finalWidth: number) => {
      const nextWidths = {
        ...stateRef.current.columnWidths,
        [columnKey]: finalWidth,
      };

      setInternalColumnWidths(nextWidths);
      triggerColumnsChange(
        stateRef.current.visibleKeys,
        nextWidths,
        stateRef.current.orderedKeys,
      );
    },
    [triggerColumnsChange],
  );

  const resetAll = useCallback(() => {
    const reset = deriveFromColumns(initialSnapshot.columns);
    setInternalVisibleKeys(reset.visibleKeys);
    setInternalColumnWidths(reset.columnWidths);
    setInternalOrderedKeys(reset.orderedKeys);
    triggerColumnsChange(
      reset.visibleKeys,
      reset.columnWidths,
      reset.orderedKeys,
    );
  }, [initialSnapshot.columns, triggerColumnsChange]);

  return {
    columnKeys,
    visibleKeys,
    columnWidths,
    orderedKeys,
    setVisibleKeys,
    setColumnWidth,
    setOrderedKeys,
    commitResize,
    resetAll,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
  };
}
