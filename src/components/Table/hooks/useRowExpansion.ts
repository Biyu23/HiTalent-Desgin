import type { TableProps as AntdTableProps } from 'antd';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import type { RowKeyGetter, RowRegistry } from '../internal';
import { buildRowRegistry, isTableRowKey } from '../rowDrag/utils';
import type { TableRowKey } from '../type';

interface UseRowExpansionOptions<RecordType> {
  dataSource: readonly RecordType[];
  getKey: RowKeyGetter<RecordType>;
  childrenKey: string;
  registry: RowRegistry<RecordType>;
  treeMode: boolean;
  enabled: boolean;
  handleEnabled: boolean;
  selectionEnabled: boolean;
  expandable?: AntdTableProps<RecordType>['expandable'];
}

/**
 * 管理普通展开与拖拽自动展开，始终挂载以保留模式切换前的展开状态。
 * 普通展开遵循受控约定；拖拽临时展开仅持续到本次拖拽结束。
 */
export function useRowExpansion<RecordType>({
  dataSource,
  getKey,
  childrenKey,
  registry,
  treeMode,
  enabled,
  handleEnabled,
  selectionEnabled,
  expandable,
}: UseRowExpansionOptions<RecordType>) {
  const controlledExpandedKeys = useMemo(
    () => expandable?.expandedRowKeys?.filter(isTableRowKey),
    [expandable?.expandedRowKeys],
  );
  const [innerExpandedKeys, setInnerExpandedKeys] = useState<TableRowKey[]>(
    () => {
      if (expandable?.defaultExpandedRowKeys !== undefined)
        return expandable.defaultExpandedRowKeys.filter(isTableRowKey);
      if (expandable?.defaultExpandAllRows) {
        // 默认全部展开独立于拖拽模式，因此平铺模式也需要遍历子节点。
        const treeRegistry = buildRowRegistry(
          dataSource,
          getKey,
          childrenKey,
          true,
        );
        return treeRegistry.keys.filter((key) =>
          Boolean(
            expandable.expandedRowRender ||
              treeRegistry.meta.get(key)?.childKeys.length,
          ),
        );
      }
      return [];
    },
  );
  const expandedKeys = controlledExpandedKeys ?? innerExpandedKeys;
  useLayoutEffect(() => {
    // 退出受控模式时保留最后一次受控值。
    if (controlledExpandedKeys !== undefined)
      setInnerExpandedKeys(controlledExpandedKeys);
  }, [controlledExpandedKeys]);
  const setExpandedKeys = useCallback(
    (keys: TableRowKey[]) => {
      if (controlledExpandedKeys === undefined) setInnerExpandedKeys(keys);
      expandable?.onExpandedRowsChange?.(keys);
    },
    [controlledExpandedKeys, expandable?.onExpandedRowsChange],
  );

  // 受控父组件尚未采纳自动展开时，也允许当前拖拽继续进入目标节点。
  const [dragExpandedKeys, setDragExpandedKeys] = useState<TableRowKey[]>([]);
  const mergedExpandedKeys = useMemo(
    () => [...new Set([...expandedKeys, ...dragExpandedKeys])],
    [dragExpandedKeys, expandedKeys],
  );
  const expandedKeySet = useMemo(
    () => new Set(mergedExpandedKeys),
    [mergedExpandedKeys],
  );

  useEffect(() => {
    if (
      !treeMode ||
      !enabled ||
      controlledExpandedKeys !== undefined ||
      expandedKeys.every((key) => registry.meta.has(key))
    )
      return;
    // 数据移除节点时，只清理本地展开键；受控展开仍由调用方决定。
    setExpandedKeys(expandedKeys.filter((key) => registry.meta.has(key)));
  }, [
    controlledExpandedKeys,
    enabled,
    expandedKeys,
    registry,
    setExpandedKeys,
    treeMode,
  ]);

  const handleExpandedRowsChange = useCallback(
    (keys: readonly React.Key[]) => setExpandedKeys(keys.filter(isTableRowKey)),
    [setExpandedKeys],
  );
  const autoExpand = useCallback(
    (key: TableRowKey, record: RecordType) => {
      setDragExpandedKeys((keys) =>
        keys.includes(key) ? keys : [...keys, key],
      );
      setExpandedKeys([...new Set([...mergedExpandedKeys, key])]);
      expandable?.onExpand?.(true, record);
    },
    [expandable, mergedExpandedKeys, setExpandedKeys],
  );

  const mergedExpandable = useMemo<AntdTableProps<RecordType>['expandable']>(
    () => ({
      ...expandable,
      ...(treeMode && enabled
        ? {
            indentSize: expandable?.indentSize ?? 24,
            expandIconColumnIndex:
              expandable?.expandIconColumnIndex ??
              // Antd 对有选择列的显式索引减一，此处补偿后再跳过选择列。
              (handleEnabled ? 1 : 0) + (selectionEnabled ? 2 : 0),
          }
        : {}),
      expandedRowKeys: mergedExpandedKeys,
      onExpandedRowsChange: handleExpandedRowsChange,
    }),
    [
      expandable,
      enabled,
      handleExpandedRowsChange,
      mergedExpandedKeys,
      handleEnabled,
      selectionEnabled,
      treeMode,
    ],
  );
  const clearDragExpansion = useCallback(() => setDragExpandedKeys([]), []);

  return {
    expandable: mergedExpandable,
    expandedKeys: expandedKeySet,
    autoExpand,
    clearDragExpansion,
  };
}
