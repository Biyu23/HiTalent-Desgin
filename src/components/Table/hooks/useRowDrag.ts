import type { TableProps as AntdTableProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RowKeyGetter } from '../internal';
import {
  buildRowRegistry,
  collectVisibleRowKeys,
  isTableRowKey,
} from '../rowDrag/utils';
import type { RowDragEndEvent, RowDragOptions } from '../type';
import { useRowExpansion } from './useRowExpansion';

interface UseRowDragOptions<RecordType> {
  dataSource: readonly RecordType[];
  rowKey: NonNullable<AntdTableProps<RecordType>['rowKey']>;
  enabled: boolean;
  options: RowDragOptions<RecordType>;
  expandable?: AntdTableProps<RecordType>['expandable'];
  onDragEnd?: (event: RowDragEndEvent<RecordType>) => void;
  selectionEnabled?: boolean;
}

/** 行拖拽的数据入口：统一行键、建立索引，并组合展开状态与拖拽预览。 */
export function useRowDrag<RecordType>({
  dataSource,
  rowKey,
  enabled,
  options,
  expandable,
  onDragEnd,
  selectionEnabled = false,
}: UseRowDragOptions<RecordType>) {
  // 只在业务记录转为行索引的边界校验键类型，后续使用 TableRowKey。
  const getKey = useMemo<RowKeyGetter<RecordType>>(() => {
    if (typeof rowKey === 'function') {
      return (record, index) => {
        const key = rowKey(record, index);
        return isTableRowKey(key) ? key : null;
      };
    }
    return (record) => {
      if (!record || typeof record !== 'object') return null;
      const key = (record as Record<PropertyKey, unknown>)[rowKey];
      return isTableRowKey(key) ? key : null;
    };
  }, [rowKey]);
  const childrenKey = options.childrenKey ?? 'children';
  const treeMode = enabled && options.mode === 'tree';
  const registry = useMemo(
    () => buildRowRegistry(dataSource, getKey, childrenKey, treeMode),
    [childrenKey, dataSource, getKey, treeMode],
  );
  // 重复键无法唯一确定拖拽节点；缺少键的单行则由注册表排除。
  const effectiveEnabled = enabled && registry.duplicateKeys.size === 0;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (registry.duplicateKeys.size) {
      console.warn(
        '[Table] Duplicate row keys disable row dragging for this table.',
        [...registry.duplicateKeys],
      );
    }
    if (registry.missingKeyCount) {
      console.warn(
        `[Table] ${registry.missingKeyCount} rows have no valid key and cannot be dragged.`,
      );
    }
  }, [registry]);

  const expansion = useRowExpansion({
    dataSource,
    getKey,
    childrenKey,
    registry,
    treeMode,
    enabled: effectiveEnabled,
    handleEnabled: options.handle !== false,
    selectionEnabled,
    expandable,
  });

  // 树拖拽保存开始时的数据快照；松手后恢复使用外部 dataSource。
  const [previewDataSource, setPreviewDataSource] = useState<
    readonly RecordType[] | null
  >(null);
  const renderedDataSource = previewDataSource ?? dataSource;
  const renderKeys = useMemo(
    () =>
      collectVisibleRowKeys(
        renderedDataSource,
        getKey,
        childrenKey,
        treeMode,
        expansion.expandedKeys,
      ),
    [childrenKey, expansion.expandedKeys, getKey, renderedDataSource, treeMode],
  );

  const clearPreview = useCallback(
    (next: readonly RecordType[] | null) => {
      setPreviewDataSource(next);
      if (next === null) expansion.clearDragExpansion();
    },
    [expansion.clearDragExpansion],
  );

  return {
    enabled: effectiveEnabled,
    dataSource: renderedDataSource,
    expandable: expansion.expandable,
    childrenKey,
    providerProps: {
      enabled: effectiveEnabled,
      dataSource,
      registry,
      getKey,
      childrenKey,
      treeMode,
      renderKeys,
      expandedKeys: expansion.expandedKeys,
      canDrag: options.canDrag,
      canDrop: options.canDrop,
      autoExpandDelay: options.autoExpandDelay ?? 600,
      handleEnabled: options.handle !== false,
      onPreview: clearPreview,
      onAutoExpand: expansion.autoExpand,
      onCommit: onDragEnd,
    },
  };
}
