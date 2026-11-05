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

/** 重排已归一化的状态项，宽度和显隐配置随列一起移动。 */
function orderColumnState(
  state: TableColumnState,
  keys: readonly TableColumnKey[],
) {
  const itemMap = new Map(state.map((item) => [item.key, item]));
  return keys
    .map((key) => itemMap.get(key))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
}

/** 列状态唯一写入口：外部输入、临时预览与正式提交在此汇合。 */
export function useColumnState<RecordType>({
  columns,
  value,
  defaultValue,
  onChange,
}: UseColumnStateOptions<RecordType>) {
  // 列定义仅遍历一次，设置面板、拖拽与状态归一化共享同一份元数据。
  const columnMeta = useMemo(() => collectColumnMeta(columns), [columns]);
  const metaMap = useMemo(
    () => new Map(columnMeta.map((item) => [item.key, item])),
    [columnMeta],
  );
  const controlledValue = useMemo(
    () =>
      value === undefined ? undefined : normalizeColumnState(columnMeta, value),
    [columnMeta, value],
  );
  const [mergedState, setMergedState] = useMergeState<TableColumnState>({
    defaultValue: () => normalizeColumnState(columnMeta, defaultValue),
    ...(controlledValue !== undefined ? { value: controlledValue } : {}),
    onChange,
  });
  // 受控输入已在入口归一化，直接复用；本地状态还需对齐动态增删的列定义。
  const committedState = useMemo<TableColumnState>(
    () => controlledValue ?? normalizeColumnState(columnMeta, mergedState),
    [columnMeta, controlledValue, mergedState],
  );
  const [previewState, setPreviewState] = useState<TableColumnState | null>(
    null,
  );
  // 预览只影响渲染；正式提交前不会触发业务回调。
  const currentState = previewState ?? committedState;

  // 原生指针事件读取最新状态；React state 仍负责驱动界面。
  const committedRef = useRef(committedState);
  const previewRef = useRef(previewState);
  committedRef.current = committedState;
  previewRef.current = previewState;

  useEffect(() => {
    previewRef.current = null;
    setPreviewState(null);
  }, [columns, value]);

  const commit = useCallback(
    (next: TableColumnState) => {
      // React 17 中的指针监听使用原生事件；清除预览与保存结果之间，
      // 不得短暂渲染旧的已提交顺序。
      unstable_batchedUpdates(() => {
        if (!areColumnStatesEqual(committedRef.current, next)) {
          // 受控值由父组件确认；未采纳的请求不能成为后续操作的基准。
          if (value === undefined) committedRef.current = next;
          setMergedState(next);
        }
        previewRef.current = null;
        setPreviewState(null);
      });
    },
    [value, setMergedState],
  );

  const setVisibleKeys = useCallback(
    (keys: readonly TableColumnKey[]) => {
      const visibleKeys = new Set(keys);
      commit(
        committedRef.current.map((item) => ({
          ...item,
          visible: metaMap.get(item.key)?.hideable
            ? visibleKeys.has(item.key)
            : true,
        })),
      );
    },
    [metaMap, commit],
  );

  // 宽度来自 usePointerResize 的数值计算，无需在内部再次做输入校验。
  const commitColumnWidth = useCallback(
    (key: TableColumnKey, width: number) => {
      const source = previewRef.current ?? committedRef.current;
      commit(
        source.map((item) => (item.key === key ? { ...item, width } : item)),
      );
    },
    [commit],
  );

  const previewColumnOrder = useCallback((keys: readonly TableColumnKey[]) => {
    const next = orderColumnState(committedRef.current, keys);
    previewRef.current = next;
    setPreviewState(next);
  }, []);

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
    () => commit(normalizeColumnState(columnMeta, defaultValue)),
    [columnMeta, commit, defaultValue],
  );

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
    commitColumnWidth,
    previewColumnOrder,
    commitColumnOrder,
    cancelPreview,
    reset,
  };
}
