import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EnhancedColumnType } from '../type';
import { getColumnKey } from '../utils/columnHelpers';

interface UseColumnConfigOptions<RecordType> {
  /** 原始 columns */
  columns: EnhancedColumnType<RecordType>[];
  /** 受控：可见列 keys */
  visibleKeys?: string[];
  /** 非受控：默认可见列 keys */
  defaultVisibleKeys?: string[];
  /** 可见列变更回调 */
  onVisibleKeysChange?: (visibleKeys: string[]) => void;
  /** 受控：列宽 */
  columnWidths?: Record<string, number>;
  /** 非受控：默认列宽 */
  defaultColumnWidths?: Record<string, number>;
  /** 列宽变更回调 */
  onColumnWidthChange?: (widths: Record<string, number>) => void;
  /** 受控：列顺序 */
  orderedKeys?: string[];
  /** 非受控：默认列顺序 */
  defaultOrderedKeys?: string[];
  /** 列顺序变更回调 */
  onColumnOrderChange?: (columnKeys: string[]) => void;
  /** 列设置是否显示 */
  showColumnSetting: boolean;
  /** 列宽调整是否启用 */
  enableColumnResize: boolean;
  /** 列拖拽是否启用 */
  enableColumnDrag: boolean;
}

/**
 * useColumnConfig — 管理 Table 列配置的核心 hook
 *
 * 统一管理：
 * - 列显隐（visibleKeys）
 * - 列宽（columnWidths）
 * - 列顺序（orderedKeys）
 *
 * 全部基于 useMergeState 的受控/非受控双模式
 */
export function useColumnConfig<RecordType>(
  options: UseColumnConfigOptions<RecordType>,
) {
  const {
    columns,
    visibleKeys: visibleKeysProp,
    defaultVisibleKeys: defaultVisibleKeysProp,
    onVisibleKeysChange,
    columnWidths: columnWidthsProp,
    defaultColumnWidths: defaultColumnWidthsProp,
    onColumnWidthChange,
    orderedKeys: orderedKeysProp,
    defaultOrderedKeys: defaultOrderedKeysProp,
    onColumnOrderChange,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
  } = options;

  // ---- 列 key 列表（稳定引用） ----
  const columnKeys = useMemo(
    () => columns.map((col, i) => getColumnKey(col, i)),
    [columns],
  );

  // ---- 默认可见列 keys ----
  const fallbackVisibleKeys = useMemo(() => {
    if (defaultVisibleKeysProp) return defaultVisibleKeysProp;
    return columns
      .filter((col) => {
        if (col.hideable === false) return true;
        return !col.hidden;
      })
      .map((col, i) => getColumnKey(col, i));
  }, [columns, defaultVisibleKeysProp]);

  // ---- 默认列宽 ----
  const fallbackColumnWidths = useMemo(() => {
    if (defaultColumnWidthsProp) return defaultColumnWidthsProp;
    const widths: Record<string, number> = {};
    columns.forEach((col, i) => {
      if (col.defaultWidth !== undefined) {
        widths[getColumnKey(col, i)] = col.defaultWidth;
      }
    });
    return widths;
  }, [columns, defaultColumnWidthsProp]);

  // ---- 默认列顺序 ----
  const fallbackOrderedKeys = useMemo(() => {
    if (defaultOrderedKeysProp) return defaultOrderedKeysProp;
    return columnKeys;
  }, [columnKeys, defaultOrderedKeysProp]);

  // ---- 受控/非受控状态 ----
  const [internalVisibleKeys, setInternalVisibleKeys] = useState<string[]>(() =>
    visibleKeysProp !== undefined ? visibleKeysProp : fallbackVisibleKeys,
  );
  const [internalColumnWidths, setInternalColumnWidths] = useState<
    Record<string, number>
  >(() =>
    columnWidthsProp !== undefined ? columnWidthsProp : fallbackColumnWidths,
  );
  const [internalOrderedKeys, setInternalOrderedKeys] = useState<string[]>(() =>
    orderedKeysProp !== undefined ? orderedKeysProp : fallbackOrderedKeys,
  );

  // 同步受控值
  const isVisibleControlled = visibleKeysProp !== undefined;
  const isWidthControlled = columnWidthsProp !== undefined;
  const isOrderControlled = orderedKeysProp !== undefined;

  useEffect(() => {
    if (isVisibleControlled) {
      setInternalVisibleKeys(visibleKeysProp!);
    }
  }, [isVisibleControlled, visibleKeysProp]);

  useEffect(() => {
    if (isWidthControlled) {
      setInternalColumnWidths(columnWidthsProp!);
    }
  }, [isWidthControlled, columnWidthsProp]);

  useEffect(() => {
    if (isOrderControlled) {
      setInternalOrderedKeys(orderedKeysProp!);
    }
  }, [isOrderControlled, orderedKeysProp]);

  // 导出当前值
  const visibleKeys = isVisibleControlled
    ? visibleKeysProp!
    : internalVisibleKeys;
  const columnWidths = isWidthControlled
    ? columnWidthsProp!
    : internalColumnWidths;
  const orderedKeys = isOrderControlled
    ? orderedKeysProp!
    : internalOrderedKeys;

  // ---- Actions ----
  const setVisibleKeys = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      const nextValue = typeof next === 'function' ? next(visibleKeys) : next;
      if (!isVisibleControlled) {
        setInternalVisibleKeys(nextValue);
      }
      onVisibleKeysChange?.(nextValue);
    },
    [visibleKeys, isVisibleControlled, onVisibleKeysChange],
  );

  const setColumnWidth = useCallback(
    (columnKey: string, width: number) => {
      const nextValue = { ...columnWidths, [columnKey]: width };
      if (!isWidthControlled) {
        setInternalColumnWidths(nextValue);
      }
      onColumnWidthChange?.(nextValue);
    },
    [columnWidths, isWidthControlled, onColumnWidthChange],
  );

  const setColumnWidths = useCallback(
    (
      next:
        | Record<string, number>
        | ((prev: Record<string, number>) => Record<string, number>),
    ) => {
      const nextValue = typeof next === 'function' ? next(columnWidths) : next;
      if (!isWidthControlled) {
        setInternalColumnWidths(nextValue);
      }
      onColumnWidthChange?.(nextValue);
    },
    [columnWidths, isWidthControlled, onColumnWidthChange],
  );

  const setOrderedKeys = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      const nextValue = typeof next === 'function' ? next(orderedKeys) : next;
      if (!isOrderControlled) {
        setInternalOrderedKeys(nextValue);
      }
      onColumnOrderChange?.(nextValue);
    },
    [orderedKeys, isOrderControlled, onColumnOrderChange],
  );

  const resetAll = useCallback(() => {
    setVisibleKeys(fallbackVisibleKeys);
    setColumnWidths(fallbackColumnWidths);
    setOrderedKeys(fallbackOrderedKeys);
  }, [fallbackVisibleKeys, fallbackColumnWidths, fallbackOrderedKeys]);

  // ---- tooltipRender 默认内容 ----
  const defaultToolbarContent = useMemo(() => {
    if (!showColumnSetting) return null;
    // Toolbar 返回占位，实际渲染在 Toolbar 组件中
    return null;
  }, [showColumnSetting]);

  return {
    columnKeys,
    visibleKeys,
    columnWidths,
    orderedKeys,
    setVisibleKeys,
    setColumnWidth,
    setColumnWidths,
    setOrderedKeys,
    resetAll,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
    defaultToolbarContent,
  };
}
