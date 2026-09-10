import type { TableProps as AntdTableProps } from 'antd';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import type { RowKeyGetter } from '../internal';
import {
  buildRowRegistry,
  collectVisibleRowKeys,
  isTableRowKey,
} from '../rowDrag/utils';
import type { RowDragEndEvent, RowDragOptions, TableRowKey } from '../type';

interface UseRowDragOptions<RecordType> {
  dataSource: readonly RecordType[];
  rowKey: NonNullable<AntdTableProps<RecordType>['rowKey']>;
  enabled: boolean;
  options: RowDragOptions<RecordType>;
  expandable?: AntdTableProps<RecordType>['expandable'];
  onDragEnd?: (event: RowDragEndEvent<RecordType>) => void;
}

export function useRowDrag<RecordType>({
  dataSource,
  rowKey,
  enabled,
  options,
  expandable,
  onDragEnd,
}: UseRowDragOptions<RecordType>) {
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

  const controlledExpandedKeys = useMemo(
    () => expandable?.expandedRowKeys?.filter(isTableRowKey),
    [expandable?.expandedRowKeys],
  );
  const [innerExpandedKeys, setInnerExpandedKeys] = useState<TableRowKey[]>(
    () => {
      if (expandable?.defaultExpandedRowKeys !== undefined)
        return expandable.defaultExpandedRowKeys.filter(isTableRowKey);
      if (expandable?.defaultExpandAllRows) {
        // Expansion exists independently of the active drag mode.
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
    // Preserve the last controlled value when control is removed.
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
      !effectiveEnabled ||
      controlledExpandedKeys !== undefined ||
      expandedKeys.every((key) => registry.meta.has(key))
    )
      return;
    setExpandedKeys(expandedKeys.filter((key) => registry.meta.has(key)));
  }, [
    controlledExpandedKeys,
    effectiveEnabled,
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

  const mergedExpandable = useMemo<
    AntdTableProps<RecordType>['expandable']
  >(() => {
    return {
      ...expandable,
      ...(treeMode && effectiveEnabled
        ? {
            indentSize: expandable?.indentSize ?? 24,
            expandIconColumnIndex:
              expandable?.expandIconColumnIndex ??
              (options.handle === false ? 0 : 1),
          }
        : {}),
      expandedRowKeys: mergedExpandedKeys,
      onExpandedRowsChange: handleExpandedRowsChange,
    };
  }, [
    expandable,
    effectiveEnabled,
    handleExpandedRowsChange,
    mergedExpandedKeys,
    options.handle,
    treeMode,
  ]);

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
        expandedKeySet,
      ),
    [childrenKey, expandedKeySet, getKey, renderedDataSource, treeMode],
  );

  const clearPreview = useCallback((next: readonly RecordType[] | null) => {
    setPreviewDataSource(next);
    if (next === null) setDragExpandedKeys([]);
  }, []);

  return {
    enabled: effectiveEnabled,
    dataSource: renderedDataSource,
    expandable: mergedExpandable,
    childrenKey,
    providerProps: {
      enabled: effectiveEnabled,
      dataSource,
      registry,
      getKey,
      childrenKey,
      treeMode,
      renderKeys,
      expandedKeys: expandedKeySet,
      canDrag: options.canDrag,
      canDrop: options.canDrop,
      autoExpandDelay: options.autoExpandDelay ?? 600,
      handleEnabled: options.handle !== false,
      onPreview: clearPreview,
      onAutoExpand: autoExpand,
      onCommit: onDragEnd,
    },
  };
}
