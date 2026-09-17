import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useMergeState } from '../../../hooks/useMergeState';
import type { TableColumn, TableColumnKey, TableColumnState } from '../type';
import {
  areColumnStatesEqual,
  collectColumnMeta,
  normalizeColumnState,
} from '../utils/columns';

interface UseColumnStateOptions<RecordType> {
  columns: readonly TableColumn<RecordType>[];
  value?: TableColumnState;
  defaultValue?: TableColumnState;
  onChange?: (state: TableColumnState) => void;
}

function orderColumnState(
  state: TableColumnState,
  keys: readonly TableColumnKey[],
) {
  const itemMap = new Map(state.map((item) => [item.key, item]));
  return keys
    .map((key) => itemMap.get(key))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
}

export function useColumnState<RecordType>({
  columns,
  value,
  defaultValue,
  onChange,
}: UseColumnStateOptions<RecordType>) {
  const controlledValue = useMemo(
    () =>
      value === undefined ? undefined : normalizeColumnState(columns, value),
    [columns, value],
  );
  const [mergedState, { set: setMergedState }] =
    useMergeState<TableColumnState>({
      defaultValue: () => normalizeColumnState(columns, defaultValue),
      value: controlledValue,
      onChange,
    });
  const committedState = useMemo(
    () => normalizeColumnState(columns, mergedState),
    [columns, mergedState],
  );
  const [previewState, setPreviewState] = useState<TableColumnState | null>(
    null,
  );
  const currentState = previewState ?? committedState;

  const committedRef = useRef(committedState);
  const previewRef = useRef(previewState);
  committedRef.current = committedState;
  previewRef.current = previewState;

  useEffect(() => {
    previewRef.current = null;
    setPreviewState(null);
  }, [columns, controlledValue]);

  const setPreview = useCallback(
    (next: TableColumnState) => {
      const normalized = normalizeColumnState(columns, next);
      previewRef.current = normalized;
      setPreviewState(normalized);
    },
    [columns],
  );

  const commit = useCallback(
    (next: TableColumnState) => {
      const normalized = normalizeColumnState(columns, next);
      // React 17 中的指针监听使用原生事件；清除预览与保存结果之间，
      // 不得短暂渲染旧的已提交顺序。
      unstable_batchedUpdates(() => {
        if (!areColumnStatesEqual(committedRef.current, normalized)) {
          committedRef.current = normalized;
          setMergedState(normalized);
        }
        previewRef.current = null;
        setPreviewState(null);
      });
    },
    [columns, setMergedState],
  );

  const setVisibleKeys = useCallback(
    (keys: readonly TableColumnKey[]) => {
      const visibleKeys = new Set(keys);
      const metaMap = new Map(
        collectColumnMeta(columns).map((item) => [item.key, item]),
      );
      commit(
        committedRef.current.map((item) => ({
          ...item,
          visible: metaMap.get(item.key)?.hideable
            ? visibleKeys.has(item.key)
            : true,
        })),
      );
    },
    [columns, commit],
  );

  const previewColumnWidth = useCallback(
    (key: TableColumnKey, width: number) => {
      if (!Number.isFinite(width)) return;
      const source = previewRef.current ?? committedRef.current;
      setPreview(
        source.map((item) => (item.key === key ? { ...item, width } : item)),
      );
    },
    [setPreview],
  );

  const commitColumnWidth = useCallback(
    (key: TableColumnKey, width: number) => {
      if (!Number.isFinite(width)) return;
      const source = previewRef.current ?? committedRef.current;
      commit(
        source.map((item) => (item.key === key ? { ...item, width } : item)),
      );
    },
    [commit],
  );

  const previewColumnOrder = useCallback(
    (keys: readonly TableColumnKey[]) => {
      setPreview(orderColumnState(committedRef.current, keys));
    },
    [setPreview],
  );

  const commitColumnOrder = useCallback(
    (keys: readonly TableColumnKey[]) => {
      commit(orderColumnState(committedRef.current, keys));
    },
    [commit],
  );

  const cancelPreview = useCallback(() => {
    previewRef.current = null;
    setPreviewState(null);
  }, []);

  const reset = useCallback(
    () => commit(normalizeColumnState(columns, defaultValue)),
    [columns, commit, defaultValue],
  );

  const columnMeta = useMemo(() => collectColumnMeta(columns), [columns]);
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'production') return;
  //   const seen = new Set<TableColumnKey>();
  //   const duplicates = new Set<TableColumnKey>();
  //   columnMeta.forEach((item) => {
  //     if (seen.has(item.key)) duplicates.add(item.key);
  //     else seen.add(item.key);
  //   });
  //   if (duplicates.size) {
  //     console.warn('[Table] Column keys must be unique.', [...duplicates]);
  //   }
  // }, [columnMeta]);
  const orderedKeys = useMemo(
    () => currentState.map((item) => item.key),
    [currentState],
  );
  const visibleKeys = useMemo(
    () =>
      currentState
        .filter((item) => item.visible !== false)
        .map((item) => item.key),
    [currentState],
  );
  return {
    state: currentState,
    committedState,
    columnMeta,
    orderedKeys,
    visibleKeys,
    setVisibleKeys,
    previewColumnWidth,
    commitColumnWidth,
    previewColumnOrder,
    commitColumnOrder,
    cancelPreview,
    reset,
  };
}
