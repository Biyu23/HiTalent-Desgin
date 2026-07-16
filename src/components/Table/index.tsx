import { Table as AntdTable } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import EnhancedHeaderCell from './components/EnhancedHeaderCell';
import PresetBodyCell from './components/PresetBodyCell';
import Toolbar from './components/Toolbar';
import { useColumnConfig } from './hooks/useColumnConfig';
import { useColumnDrag } from './hooks/useColumnDrag';
import { useRowDrag } from './hooks/useRowDrag';
import './index.less';
import TableContext from './TableContext';
import type { EnhancedColumnType, TableProps, TableRef } from './type';
import {
  filterVisibleColumns,
  getColumnKey,
  sanitizeColumn,
  sortColumnsByOrder,
} from './utils/columnHelpers';

const DEFAULT_TABLE_PROPS = {
  showColumnSetting: true,
  enableColumnResize: true,
  enableColumnDrag: false,
  enableRowDrag: false,
  enableInlineEdit: false,
  zebraStripe: true,
  hoverHighlight: true,
} as const;

/**
 * Table 组件
 *
 * 在 Ant Design Table 基础上增强：
 * - 列显示/隐藏设置（操作栏右上角齿轮按钮）
 * - 列宽拖拽调整（resize handle）
 * - 列拖拽排序（@dnd-kit）
 * - 树结构行拖拽（@dnd-kit）
 * - 表头搜索图标
 * - Cell 预设渲染（tag / progress / date / number / boolean / empty）
 * - 斑马纹 / 行悬停高亮
 * - 行内编辑
 */
function Table<RecordType extends Record<string, any> = any>(
  props: TableProps<RecordType>,
  ref: React.Ref<TableRef>,
) {
  const {
    // ---- 解构自定义属性 ----
    columns: columnsProp,
    showColumnSetting = DEFAULT_TABLE_PROPS.showColumnSetting,
    defaultVisibleKeys,
    visibleKeys: visibleKeysProp,
    onVisibleKeysChange,
    enableColumnResize = DEFAULT_TABLE_PROPS.enableColumnResize,
    defaultColumnWidths,
    columnWidths: columnWidthsProp,
    onColumnWidthChange,
    enableColumnDrag = DEFAULT_TABLE_PROPS.enableColumnDrag,
    defaultOrderedKeys,
    orderedKeys: orderedKeysProp,
    onColumnOrderChange,
    enableRowDrag = DEFAULT_TABLE_PROPS.enableRowDrag,
    onRowDragEnd,
    enableInlineEdit = DEFAULT_TABLE_PROPS.enableInlineEdit,
    onCellEdit,
    onColumnSearch,
    zebraStripe = DEFAULT_TABLE_PROPS.zebraStripe,
    hoverHighlight = DEFAULT_TABLE_PROPS.hoverHighlight,
    toolbarRender,
    toolbarExtra,
    columnSettingLoading,
    className,
    style,
    rowKey: rowKeyProp,
    dataSource,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('table');

  // ---- 原始列定义（用于 component 注入时查找配置） ----
  const columnConfigMap = useMemo(() => {
    const map = new Map<string, EnhancedColumnType<RecordType>>();
    columnsProp.forEach((col, index) => {
      map.set(getColumnKey(col, index), col);
    });
    return map;
  }, [columnsProp]);

  // ---- 列配置 Hook ----
  const {
    visibleKeys,
    columnWidths,
    orderedKeys,
    setVisibleKeys,
    setColumnWidth,
    setColumnWidths,
    setOrderedKeys,
    resetAll,
  } = useColumnConfig<RecordType>({
    columns: columnsProp,
    visibleKeys: visibleKeysProp,
    defaultVisibleKeys,
    onVisibleKeysChange,
    columnWidths: columnWidthsProp,
    defaultColumnWidths,
    onColumnWidthChange,
    orderedKeys: orderedKeysProp,
    defaultOrderedKeys,
    onColumnOrderChange,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
  });

  // ---- 列拖拽 Hook ----
  const { HeaderWrapper, HeaderCellWrapper } = useColumnDrag({
    orderedKeys,
    onReorder: setOrderedKeys,
    columns: columnsProp,
    enabled: enableColumnDrag,
  });

  // ---- 行拖拽 Hook ----
  const { BodyWrapper, RowWrapper } = useRowDrag({
    dataSource: (dataSource || []) as any[],
    rowKey: (rowKeyProp as any) || 'key',
    enabled: enableRowDrag,
    onDragEnd: (result) => {
      onRowDragEnd?.(result);
    },
  });

  // ---- 行级唯一标识 ----
  const rowKey = useMemo(() => {
    if (rowKeyProp) return rowKeyProp;
    return 'key';
  }, [rowKeyProp]);

  // ---- 处理后的列数据 ----
  const processedColumns = useMemo(() => {
    // 1. 剥离扩展属性 → antd 兼容格式
    let sanitized = columnsProp.map((col) => sanitizeColumn(col));

    // 2. 过滤可见列
    sanitized = filterVisibleColumns(sanitized, visibleKeys);

    // 3. 按 order 排序
    sanitized = sortColumnsByOrder(sanitized, orderedKeys);

    // 4. 注入列宽
    return sanitized.map((col, index) => {
      const key = getColumnKey(col, index);
      const width = columnWidths[key];
      if (width !== undefined) {
        return { ...col, width };
      }
      return col;
    });
  }, [columnsProp, visibleKeys, orderedKeys, columnWidths]);

  // ---- antd Table components 注入 ----
  const tableComponents = useMemo(() => {
    const comps: Record<string, any> = {};

    // ---- header ----
    const headerComps: Record<string, any> = {};

    // header.wrapper: 列拖拽的 DndContext + SortableContext
    if (enableColumnDrag) {
      headerComps.wrapper = HeaderWrapper;
    }

    // header.cell: 注入 ResizeHandle + SearchIcon + 列拖拽手柄
    headerComps.cell = (cellProps: any) => {
      const { children, column: antdColumn, ...rest } = cellProps;
      const colKey = antdColumn?.key || antdColumn?.dataIndex?.toString() || '';
      const originalCol = columnConfigMap.get(colKey);

      // 构建表头 cell 内容
      const cellContent = originalCol ? (
        <EnhancedHeaderCell
          column={originalCol}
          columnKey={colKey}
          enableColumnResize={enableColumnResize}
        >
          {children}
        </EnhancedHeaderCell>
      ) : (
        children
      );

      // 列拖拽包裹（必须在 EnhancedHeaderCell 外层，因为 drag handle 需要占位）
      const wrappedContent = enableColumnDrag ? (
        <HeaderCellWrapper columnKey={colKey}>{cellContent}</HeaderCellWrapper>
      ) : (
        cellContent
      );

      return <th {...rest}>{wrappedContent}</th>;
    };

    comps.header = headerComps;

    // ---- body ----
    const bodyComps: Record<string, any> = {};

    // body.wrapper: 行拖拽的 DndContext + SortableContext
    if (enableRowDrag) {
      bodyComps.wrapper = BodyWrapper;
    }

    // body.row: 行拖拽 SortableRow
    if (enableRowDrag) {
      bodyComps.row = RowWrapper;
    }

    // body.cell: 注入 PresetBodyCell（Cell 预设渲染 + 行内编辑）
    bodyComps.cell = (cellProps: any) => {
      const { children, column: antdColumn, record, ...rest } = cellProps;
      const colKey = antdColumn?.key || antdColumn?.dataIndex?.toString() || '';
      const originalCol = columnConfigMap.get(colKey);
      const rowKeyValue = record?.[(rest as any)['data-row-key']];

      if (originalCol?.cellPreset || originalCol?.editable) {
        return (
          <td {...rest}>
            <PresetBodyCell
              record={record}
              column={originalCol}
              rowKey={rowKeyValue}
              columnKey={colKey}
            >
              {children}
            </PresetBodyCell>
          </td>
        );
      }

      return <td {...rest}>{children}</td>;
    };

    comps.body = bodyComps;

    return comps;
  }, [
    enableColumnResize,
    enableColumnDrag,
    enableRowDrag,
    columnConfigMap,
    HeaderWrapper,
    HeaderCellWrapper,
    BodyWrapper,
    RowWrapper,
  ]);

  // ---- 行内编辑状态 ----
  const [editingCell, setEditingCell] = useState<{
    recordKey: React.Key;
    columnKey: string;
  } | null>(null);

  const handleStartEdit = useCallback(
    (recordKey: React.Key, columnKey: string) => {
      if (enableInlineEdit) {
        setEditingCell({ recordKey, columnKey });
      }
    },
    [enableInlineEdit],
  );

  const handleEndEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  // ---- Context 值 ----
  const contextValue = useMemo(
    () => ({
      columnWidths,
      onColumnWidthChange: setColumnWidth,
      visibleKeys,
      orderedKeys,
      editingCell,
      onStartEdit: handleStartEdit,
      onEndEdit: handleEndEdit,
      enableInlineEdit,
      onCellEdit,
      onColumnSearch,
    }),
    [
      columnWidths,
      setColumnWidth,
      visibleKeys,
      orderedKeys,
      editingCell,
      handleStartEdit,
      handleEndEdit,
      enableInlineEdit,
      onCellEdit,
      onColumnSearch,
    ],
  );

  // ---- 操作栏渲染 ----
  const defaultToolbar = useMemo(
    () => (
      <Toolbar
        columns={columnsProp}
        visibleKeys={visibleKeys}
        onVisibleKeysChange={setVisibleKeys}
        showColumnSetting={showColumnSetting}
        toolbarExtra={toolbarExtra}
        columnSettingLoading={columnSettingLoading}
      />
    ),
    [
      columnsProp,
      visibleKeys,
      setVisibleKeys,
      showColumnSetting,
      toolbarExtra,
      columnSettingLoading,
    ],
  );

  const finalToolbar = toolbarRender
    ? toolbarRender(defaultToolbar)
    : defaultToolbar;

  // ---- 命令式 API ----
  useImperativeHandle(
    ref,
    () => ({
      getVisibleColumns: () => visibleKeys,
      setVisibleColumns: (keys: string[]) => setVisibleKeys(keys),
      getColumnWidths: () => columnWidths,
      setColumnWidths: (widths: Record<string, number>) =>
        setColumnWidths(widths),
      resetAll,
    }),
    [visibleKeys, columnWidths, setVisibleKeys, setColumnWidths, resetAll],
  );

  // ---- 类名 ----
  const mergedClassName = clsx(prefixCls, className, {
    [`${prefixCls}-zebra`]: zebraStripe,
    [`${prefixCls}-no-hover`]: !hoverHighlight,
  });

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`${prefixCls}-wrapper`}>
        {/* 操作栏 */}
        {finalToolbar}
        {/* antd Table */}
        <AntdTable<RecordType>
          {...restProps}
          className={mergedClassName}
          style={style}
          columns={processedColumns}
          rowKey={rowKey}
          dataSource={dataSource}
          components={tableComponents}
        />
      </div>
    </TableContext.Provider>
  );
}

const TableWithRef = forwardRef(Table) as <
  RecordType extends Record<string, any> = any,
>(
  props: TableProps<RecordType> & { ref?: React.Ref<TableRef> },
) => React.ReactElement;

export default memo(TableWithRef) as typeof TableWithRef;
