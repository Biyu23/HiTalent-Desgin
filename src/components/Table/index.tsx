import { Table as AntdTable } from 'antd';
import type { TableRef as AntdTableRef, ColumnsType } from 'antd/es/table';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import {
  useAntdPrefixCls,
  usePrefixCls,
} from '../../configProvider/usePrefixCls';
import ColumnDragProvider from './columnDrag/ColumnDragProvider';
import {
  TableCellAdapterProvider,
  useTableComponents,
} from './components/TableCellAdapters';
import Toolbar from './components/Toolbar';
import { useColumnState } from './hooks/useColumnState';
import { useRowDrag } from './hooks/useRowDrag';
import RowDragProvider from './rowDrag/RowDragProvider';
import { RowDragHandle } from './rowDrag/SortableRow';
import { useStyles } from './style';
import TableContext from './TableContext';
import type {
  RowDragOptions,
  TableLeafColumn,
  TableProps,
  TableRef,
} from './type';
import { processColumns } from './utils/columns';

const EMPTY_DATA_SOURCE: readonly never[] = [];

/**
 * 组件入口仅负责能力组装和 Antd 属性适配。
 * 列状态由 useColumnState 管理；行数据及展开由 useRowDrag 组合。
 */
function InternalTable<RecordType = Record<string, unknown>>(
  props: TableProps<RecordType>,
  ref: React.Ref<TableRef>,
) {
  const {
    columns,
    columnState,
    defaultColumnState,
    onColumnStateChange,
    columnSetting = true,
    columnResize = true,
    columnDrag = false,
    rowDrag: rowDragProp = false,
    onRowDragEnd,
    zebraStripe = true,
    hoverHighlight = true,
    toolbarRender,
    toolbarExtra,
    prefixCls: customPrefixCls,
    className,
    style,
    classNames,
    styles,
    components: userComponents,
    rowKey: rowKeyProp,
    dataSource,
    expandable,
    childrenColumnName,
    ...tableProps
  } = props;

  const prefixCls = usePrefixCls('table', customPrefixCls);
  const antdPrefix = useAntdPrefixCls();
  const { styles: tableStyles, cx } = useStyles();
  const locale = useLocale('Table');
  const tableRef = useRef<AntdTableRef>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollVirtual = useCallback((left: number) => {
    // 虚拟表格 rc-table 将位置参数转交给 rc-virtual-list。
    const position: { left: number; top?: number } = { left };
    tableRef.current?.scrollTo(position);
  }, []);
  const column = useColumnState({
    columns,
    value: columnState,
    defaultValue: defaultColumnState,
    onChange: onColumnStateChange,
  });

  // 函数式表体已接管所有行，内置行适配器无法参与，应关闭行拖拽。
  const rowDragEnabled =
    Boolean(rowDragProp) && typeof userComponents?.body !== 'function';
  const rowDragOptions = useMemo<RowDragOptions<RecordType>>(() => {
    const options = typeof rowDragProp === 'object' ? rowDragProp : {};
    return {
      ...options,
      childrenKey:
        options.childrenKey ??
        expandable?.childrenColumnName ??
        childrenColumnName ??
        'children',
    };
  }, [childrenColumnName, expandable?.childrenColumnName, rowDragProp]);
  const rowKey = rowKeyProp ?? ('key' as keyof RecordType);
  // 由钩子管理展开状态时，仍兼容原有的顶层展开参数。
  const expandableConfig = useMemo(
    () => ({
      expandedRowKeys: tableProps.expandedRowKeys,
      defaultExpandedRowKeys: tableProps.defaultExpandedRowKeys,
      defaultExpandAllRows: tableProps.defaultExpandAllRows,
      expandedRowRender: tableProps.expandedRowRender,
      onExpand: tableProps.onExpand,
      onExpandedRowsChange: tableProps.onExpandedRowsChange
        ? (keys: readonly React.Key[]) =>
            tableProps.onExpandedRowsChange?.([...keys])
        : undefined,
      ...expandable,
    }),
    [
      expandable,
      tableProps.expandedRowKeys,
      tableProps.defaultExpandedRowKeys,
      tableProps.defaultExpandAllRows,
      tableProps.expandedRowRender,
      tableProps.onExpand,
      tableProps.onExpandedRowsChange,
    ],
  );
  const row = useRowDrag({
    dataSource: dataSource ?? EMPTY_DATA_SOURCE,
    rowKey,
    enabled: rowDragEnabled,
    options: rowDragOptions,
    expandable: expandableConfig,
    onDragEnd: onRowDragEnd,
    selectionEnabled: Boolean(tableProps.rowSelection),
  });

  // 列设置仅处理业务列；手柄属于组件内部列，在列处理完成后插入。
  const processedColumns = useMemo(() => {
    const result = processColumns(columns, column.state);
    if (row.enabled && rowDragOptions.handle !== false) {
      const handle = rowDragOptions.handle ?? {};
      result.unshift({
        key: '__table_row_drag_handle__',
        title: handle.title ?? locale.dragHandle,
        width: handle.width ?? 46,
        fixed: handle.fixed ?? 'left',
        hideable: false,
        resizable: false,
        render: () => <RowDragHandle />,
      } as TableLeafColumn<RecordType>);
    }
    return result;
  }, [
    column.state,
    columns,
    locale.dragHandle,
    row.enabled,
    rowDragOptions.handle,
  ]);

  // 只向子组件共享语义样式与列操作，避免把整份表格状态放入 Context。
  const contextValue = useMemo(
    () => ({
      classNames,
      styles,
      commitColumnWidth: column.commitColumnWidth,
      cancelColumnPreview: column.cancelPreview,
    }),
    [classNames, column.cancelPreview, column.commitColumnWidth, styles],
  );

  const defaultToolbar = useMemo(
    () => (
      <Toolbar
        columns={column.columnMeta}
        visibleKeys={column.visibleKeys}
        onVisibleKeysChange={column.setVisibleKeys}
        columnSetting={columnSetting}
        extra={toolbarExtra}
      />
    ),
    [
      column.columnMeta,
      column.setVisibleKeys,
      column.visibleKeys,
      columnSetting,
      toolbarExtra,
    ],
  );
  const toolbar = toolbarRender
    ? toolbarRender(defaultToolbar)
    : defaultToolbar;
  const componentAdapters = useTableComponents(
    userComponents,
    tableProps.virtual,
  );

  // 命令式接口沿用 Antd，重置操作仍走列状态的统一提交路径。
  useImperativeHandle(
    ref,
    () => ({
      get nativeElement() {
        return tableRef.current?.nativeElement as HTMLDivElement;
      },
      scrollTo: (config) => tableRef.current?.scrollTo(config),
      resetColumnState: column.reset,
    }),
    [column.reset],
  );

  // Provider 的层级保持稳定，切换拖拽模式时不重建表格及业务单元格。
  return (
    <TableContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        data-table-root=""
        data-table-prefix={`${antdPrefix}-table`}
        className={cx(tableStyles.wrapper, className)}
        style={style}
      >
        {toolbar}
        <ColumnDragProvider
          enabled={columnDrag}
          rootRef={rootRef}
          scrollVirtual={scrollVirtual}
          columns={column.columnMeta}
          orderedKeys={column.orderedKeys}
          committedState={column.committedState}
          onPreview={column.previewColumnOrder}
          onCommit={column.commitColumnOrder}
          onCancel={column.cancelPreview}
        >
          <RowDragProvider
            {...row.providerProps}
            rootRef={rootRef}
            rowComponent={componentAdapters.bodyRow}
          >
            <TableCellAdapterProvider
              zebraStripe={zebraStripe}
              columns={column.columnMeta}
              resizeEnabled={columnResize}
              dragEnabled={columnDrag}
              headerCell={componentAdapters.headerCell}
              bodyCell={componentAdapters.bodyCell}
            >
              <AntdTable<RecordType>
                {...tableProps}
                ref={tableRef}
                className={cx(prefixCls, classNames?.table, {
                  zebra: zebraStripe,
                  'row-drag-tree':
                    row.enabled && rowDragOptions.mode === 'tree',
                })}
                style={
                  {
                    '--table-tree-indent-size': `${
                      row.expandable?.indentSize ?? 24
                    }px`,
                    ...styles?.table,
                  } as React.CSSProperties
                }
                columns={processedColumns as ColumnsType<RecordType>}
                components={componentAdapters.components}
                tableLayout={columnResize ? 'fixed' : tableProps.tableLayout}
                rowKey={rowKey}
                rowHoverable={
                  hoverHighlight && tableProps.rowHoverable !== false
                }
                dataSource={row.dataSource}
                expandable={{
                  ...row.expandable,
                  childrenColumnName: row.childrenKey,
                }}
                childrenColumnName={row.childrenKey}
              />
            </TableCellAdapterProvider>
          </RowDragProvider>
        </ColumnDragProvider>
      </div>
    </TableContext.Provider>
  );
}

const Table = forwardRef(InternalTable) as <
  RecordType = Record<string, unknown>,
>(
  props: TableProps<RecordType> & { ref?: React.Ref<TableRef> },
) => React.ReactElement;

export default memo(Table) as typeof Table;
export type {
  ColumnSettingOptions,
  RowDragEndEvent,
  RowDragHandleOptions,
  RowDragOptions,
  RowDropEvent,
  RowDropPlacement,
  RowDropTarget,
  TableClassNames,
  TableColumn,
  TableColumnGroup,
  TableColumnKey,
  TableColumnState,
  TableColumnStateItem,
  TableLeafColumn,
  TableProps,
  TableRef,
  TableRowKey,
  TableSlot,
  TableStyles,
} from './type';
