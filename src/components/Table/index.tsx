import type { TableProps as AntdTableProps } from 'antd';
import { Table as AntdTable } from 'antd';
import type { TableRef as AntdTableRef } from 'antd/es/table';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import EnhancedHeaderCell from './components/EnhancedHeaderCell';
import PresetBodyCell from './components/PresetBodyCell';
import Toolbar from './components/Toolbar';
import { useColumnConfig } from './hooks/useColumnConfig';
import { SortableBodyCell, useColumnDrag } from './hooks/useColumnDrag';
import { RowDragHandle, useRowDrag } from './hooks/useRowDrag';
import './index.less';
import TableContext from './TableContext';
import type {
  ColumnId,
  EnhancedColumnType,
  EnhancedLeafColumnType,
  RowDragConfig,
  TableProps,
  TableRef,
} from './type';
import {
  isColumnGroup,
  resolveColumnId,
  sanitizeColumn,
} from './utils/columnHelpers';

export { RowDragHandle };

const ROW_DRAG_HANDLE_KEY = '__htd_internal_row_drag_handle__';

const DEFAULT_TABLE_PROPS = {
  showColumnSetting: true,
  enableColumnResize: true,
  enableColumnDrag: false,
  enableRowDrag: false,
  zebraStripe: true,
  hoverHighlight: true,
} as const;

type InternalLeafColumn<RecordType> = EnhancedLeafColumnType<RecordType> & {
  __htdColumnId?: ColumnId;
};

function processColumns<RecordType>(
  columns: readonly EnhancedColumnType<RecordType>[],
  visibleIds: readonly ColumnId[],
  orderedIds: readonly ColumnId[],
  widths: Readonly<Record<ColumnId, number>>,
): EnhancedColumnType<RecordType>[] {
  const visibleSet = new Set(visibleIds);
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

  const visit = (
    items: readonly EnhancedColumnType<RecordType>[],
    parentPath: readonly number[],
  ): EnhancedColumnType<RecordType>[] => {
    const processed = items
      .map((column, index) => {
        const path = [...parentPath, index];
        if (isColumnGroup(column)) {
          const children = visit(column.children, path);
          return children.length ? { ...column, children } : null;
        }
        const id = resolveColumnId(column, path).id;
        if (!visibleSet.has(id)) return null;
        const clean = sanitizeColumn(column) as InternalLeafColumn<RecordType>;
        const width = widths[id];
        if (width !== undefined) clean.width = width;
        clean.__htdColumnId = id;
        return clean;
      })
      .filter(
        (column): column is EnhancedColumnType<RecordType> => column !== null,
      );

    const minOrder = (column: EnhancedColumnType<RecordType>): number => {
      if (isColumnGroup(column)) {
        return Math.min(...column.children.map(minOrder));
      }
      return (
        orderMap.get(
          (column as InternalLeafColumn<RecordType>).__htdColumnId!,
        ) ?? Infinity
      );
    };
    return processed.sort((left, right) => minOrder(left) - minOrder(right));
  };

  return visit(columns, []);
}

function InternalTable<RecordType = Record<string, unknown>>(
  props: TableProps<RecordType>,
  ref: React.Ref<TableRef>,
) {
  const {
    columns: columnsProp,
    columnState,
    defaultColumnState,
    onColumnStateChange,
    showColumnSetting = DEFAULT_TABLE_PROPS.showColumnSetting,
    columnSettingTitle,
    columnSettingLoading,
    enableColumnResize = DEFAULT_TABLE_PROPS.enableColumnResize,
    enableColumnDrag = DEFAULT_TABLE_PROPS.enableColumnDrag,
    enableRowDrag: enableRowDragProp = DEFAULT_TABLE_PROPS.enableRowDrag,
    onRowDragEnd,
    zebraStripe = DEFAULT_TABLE_PROPS.zebraStripe,
    hoverHighlight = DEFAULT_TABLE_PROPS.hoverHighlight,
    toolbarRender,
    toolbarExtra,
    className,
    style,
    rowKey: rowKeyProp,
    dataSource,
    components: userComponents,
    ...restProps
  } = props;
  const prefixCls = usePrefixCls('table');
  const antdTableRef = useRef<AntdTableRef>(null);
  const controlled = 'columnState' in props;

  const {
    columnMeta,
    visibleIds,
    columnWidths,
    orderedIds,
    setVisibleIds,
    previewColumnWidth,
    commitColumnWidth,
    previewColumnOrder,
    commitColumnOrder,
    cancelColumnOrder,
    resetColumnState,
  } = useColumnConfig<RecordType>({
    columns: columnsProp,
    columnState,
    defaultColumnState,
    controlled,
    onColumnStateChange,
  });

  const leafMap = useMemo(
    () => new Map(columnMeta.map((item) => [item.id, item.column])),
    [columnMeta],
  );
  const columnDragItems = useMemo(
    () =>
      columnMeta.map((item, index) => ({
        id: item.id,
        title: item.column.title,
        fixed: Boolean(item.column.fixed) || !item.stable,
        domToken: `c${index}`,
      })),
    [columnMeta],
  );

  const { HeaderWrapper, HeaderCellWrapper, ColumnDragContextWrapper } =
    useColumnDrag({
      orderedIds,
      onPreview: previewColumnOrder,
      onCommit: commitColumnOrder,
      onCancel: cancelColumnOrder,
      columns: columnDragItems,
      enabled: enableColumnDrag,
    });

  const rowDragConfig = useMemo<RowDragConfig<RecordType>>(() => {
    return typeof enableRowDragProp === 'object'
      ? enableRowDragProp
      : { treeMode: false };
  }, [enableRowDragProp]);
  const isRowDragEnabled =
    typeof enableRowDragProp === 'object' || Boolean(enableRowDragProp);
  const rowKey = rowKeyProp || ('key' as keyof RecordType);

  const { BodyWrapper, RowWrapper, RowDragContextWrapper } = useRowDrag({
    dataSource: dataSource || [],
    rowKey,
    enabled: isRowDragEnabled,
    config: rowDragConfig,
    onDragEnd: (result) => onRowDragEnd?.(result),
  });

  const processedColumns = useMemo(() => {
    const columns = processColumns(
      columnsProp,
      visibleIds,
      orderedIds,
      columnWidths,
    );

    const decorate = (
      items: readonly EnhancedColumnType<RecordType>[],
    ): EnhancedColumnType<RecordType>[] =>
      items.map((column) => {
        if (isColumnGroup(column)) {
          return { ...column, children: decorate(column.children) };
        }
        const internalColumn = column as InternalLeafColumn<RecordType>;
        const id = internalColumn.__htdColumnId!;
        const original = leafMap.get(id);
        if (!original) return column;
        const enhanced: InternalLeafColumn<RecordType> = { ...column };
        const originalOnHeaderCell = original.onHeaderCell;
        enhanced.onHeaderCell = (columnType) => ({
          ...(originalOnHeaderCell?.(columnType) || {}),
          column: enhanced,
        });
        const originalOnCell = original.onCell;
        enhanced.onCell = (record, rowIndex) => ({
          ...(originalOnCell?.(record, rowIndex) || {}),
          column: enhanced,
          record,
        });
        return enhanced;
      });

    const decorated = decorate(columns);
    if (isRowDragEnabled && rowDragConfig.handleColumn !== false) {
      const config = rowDragConfig.handleColumn || {};
      decorated.unshift({
        key: ROW_DRAG_HANDLE_KEY,
        dataIndex: ROW_DRAG_HANDLE_KEY,
        title: config.title || '',
        width: config.width || 46,
        align: config.align || 'center',
        fixed: config.fixed === undefined ? 'left' : config.fixed,
        render: () => <RowDragHandle />,
      });
    }
    return decorated;
  }, [
    columnWidths,
    columnsProp,
    isRowDragEnabled,
    leafMap,
    orderedIds,
    rowDragConfig,
    visibleIds,
  ]);

  type TableComponents = NonNullable<AntdTableProps<RecordType>['components']>;
  const tableComponents = useMemo<TableComponents>(() => {
    const header =
      typeof userComponents?.header === 'object'
        ? { ...userComponents.header }
        : {};
    const body =
      typeof userComponents?.body === 'object'
        ? { ...userComponents.body }
        : {};

    if (enableColumnDrag) header.wrapper = HeaderWrapper;
    const UserHeaderCell = header.cell;
    header.cell = (
      cellProps: React.ThHTMLAttributes<HTMLTableCellElement> & {
        column?: InternalLeafColumn<RecordType>;
      },
    ) => {
      const { children, column, ...rest } = cellProps;
      const id = column?.__htdColumnId;
      const original = id ? leafMap.get(id) : undefined;
      if (!original || !id) {
        return UserHeaderCell ? (
          React.createElement(UserHeaderCell, rest, children)
        ) : (
          <th {...rest}>{children}</th>
        );
      }
      return (
        <EnhancedHeaderCell
          {...rest}
          column={original}
          columnId={id}
          enableColumnResize={enableColumnResize}
          enableColumnDrag={enableColumnDrag}
          HeaderCellWrapper={HeaderCellWrapper}
        >
          {children}
        </EnhancedHeaderCell>
      );
    };

    if (isRowDragEnabled) {
      body.wrapper = BodyWrapper;
      body.row = RowWrapper;
    }
    const UserBodyCell = body.cell;
    body.cell = (
      cellProps: React.TdHTMLAttributes<HTMLTableCellElement> & {
        column?: InternalLeafColumn<RecordType>;
        record?: RecordType;
      },
    ) => {
      const { children, column, record, ...rest } = cellProps;
      const id = column?.__htdColumnId;
      const original = id ? leafMap.get(id) : undefined;
      const content =
        original?.cellPreset && record !== undefined ? (
          <PresetBodyCell record={record} column={original} />
        ) : (
          children
        );
      if (enableColumnDrag && id) {
        return (
          <SortableBodyCell columnId={id} {...rest}>
            {content}
          </SortableBodyCell>
        );
      }
      return UserBodyCell ? (
        React.createElement(UserBodyCell, rest, content)
      ) : (
        <td {...rest}>{content}</td>
      );
    };

    return { ...userComponents, header, body };
  }, [
    BodyWrapper,
    HeaderCellWrapper,
    HeaderWrapper,
    RowWrapper,
    enableColumnDrag,
    enableColumnResize,
    isRowDragEnabled,
    leafMap,
    userComponents,
  ]);

  const contextValue = useMemo(
    () => ({
      columnWidths,
      onColumnWidthChange: previewColumnWidth,
      onColumnResizeEnd: commitColumnWidth,
    }),
    [columnWidths, commitColumnWidth, previewColumnWidth],
  );
  const defaultToolbar = useMemo(
    () => (
      <Toolbar
        columns={columnsProp}
        visibleIds={visibleIds}
        onVisibleIdsChange={setVisibleIds}
        showColumnSetting={showColumnSetting}
        columnSettingTitle={columnSettingTitle}
        toolbarExtra={toolbarExtra}
        columnSettingLoading={columnSettingLoading}
      />
    ),
    [
      columnSettingLoading,
      columnSettingTitle,
      columnsProp,
      setVisibleIds,
      showColumnSetting,
      toolbarExtra,
      visibleIds,
    ],
  );
  const finalToolbar = toolbarRender
    ? toolbarRender(defaultToolbar)
    : defaultToolbar;

  useImperativeHandle(
    ref,
    () => ({
      get nativeElement() {
        return antdTableRef.current?.nativeElement as HTMLDivElement;
      },
      scrollTo: (config) => antdTableRef.current?.scrollTo(config),
      resetColumnState,
    }),
    [resetColumnState],
  );

  const mergedClassName = clsx(prefixCls, className, {
    [`${prefixCls}-zebra`]: zebraStripe,
    [`${prefixCls}-no-hover`]: !hoverHighlight,
  });

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`${prefixCls}-wrapper`}>
        {finalToolbar}
        <ColumnDragContextWrapper>
          <RowDragContextWrapper>
            <AntdTable<RecordType>
              {...restProps}
              ref={antdTableRef}
              className={mergedClassName}
              style={style}
              columns={processedColumns}
              rowKey={rowKey}
              dataSource={dataSource}
              components={tableComponents}
              tableLayout={enableColumnResize ? 'fixed' : restProps.tableLayout}
            />
          </RowDragContextWrapper>
        </ColumnDragContextWrapper>
      </div>
    </TableContext.Provider>
  );
}

const TableWithRef = forwardRef(InternalTable) as <
  RecordType = Record<string, unknown>,
>(
  props: TableProps<RecordType> & { ref?: React.Ref<TableRef> },
) => React.ReactElement;

export default memo(TableWithRef) as typeof TableWithRef;
