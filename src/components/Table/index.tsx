import { Table as AntdTable } from 'antd';
import type { TableRef as AntdTableRef, ColumnsType } from 'antd/es/table';
import React, {
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
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
    rootClassName,
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
  const { styles: tableStyles, cx } = useStyles();
  const locale = useLocale('Table');
  const tableRef = useRef<AntdTableRef>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const column = useColumnState({
    columns,
    value: columnState,
    defaultValue: defaultColumnState,
    onChange: onColumnStateChange,
  });
  const rowDragEnabled = Boolean(rowDragProp);
  const rowDragOptions = useMemo<RowDragOptions<RecordType>>(() => {
    const options = typeof rowDragProp === 'object' ? rowDragProp : {};
    return {
      ...options,
      childrenKey: options.childrenKey ?? childrenColumnName ?? 'children',
    };
  }, [childrenColumnName, rowDragProp]);
  const rowKey = rowKeyProp ?? ('key' as keyof RecordType);
  const row = useRowDrag({
    dataSource: dataSource ?? [],
    rowKey,
    enabled: rowDragEnabled,
    options: rowDragOptions,
    expandable,
    onDragEnd: onRowDragEnd,
  });

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

  const contextValue = useMemo(
    () => ({
      classNames,
      styles,
      previewColumnWidth: column.previewColumnWidth,
      commitColumnWidth: column.commitColumnWidth,
      cancelColumnPreview: column.cancelPreview,
    }),
    [
      classNames,
      column.cancelPreview,
      column.commitColumnWidth,
      column.previewColumnWidth,
      styles,
    ],
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
  const componentAdapters = useTableComponents(userComponents, row.enabled);

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

  return (
    <TableContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        className={cx(tableStyles.wrapper, rootClassName, classNames?.root)}
        style={styles?.root}
      >
        {toolbar}
        <ColumnDragProvider
          enabled={columnDrag}
          rootRef={rootRef}
          columns={column.columnMeta}
          orderedKeys={column.orderedKeys}
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
              columns={column.columnMeta}
              resizeEnabled={columnResize}
              dragEnabled={columnDrag}
              headerCell={componentAdapters.headerCell}
              bodyCell={componentAdapters.bodyCell}
            >
              <AntdTable<RecordType>
                {...tableProps}
                ref={tableRef}
                className={cx(
                  prefixCls,
                  tableStyles.root,
                  classNames?.table,
                  className,
                  {
                    zebra: zebraStripe,
                    'no-hover': !hoverHighlight,
                    'row-drag-tree':
                      row.enabled && rowDragOptions.mode === 'tree',
                  },
                )}
                style={
                  {
                    '--table-tree-indent-size': `${
                      row.expandable?.indentSize ?? 24
                    }px`,
                    ...styles?.table,
                    ...style,
                  } as React.CSSProperties
                }
                columns={processedColumns as ColumnsType<RecordType>}
                components={componentAdapters.components}
                tableLayout={columnResize ? 'fixed' : tableProps.tableLayout}
                rowKey={rowKey}
                dataSource={row.dataSource}
                expandable={row.expandable}
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
  TableClassNameSlot,
  TableColumn,
  TableColumnGroup,
  TableColumnKey,
  TableColumnState,
  TableColumnStateItem,
  TableLeafColumn,
  TableProps,
  TableRef,
  TableRowKey,
  TableStyles,
  TableStyleSlot,
} from './type';
