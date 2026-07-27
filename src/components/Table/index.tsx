import type { TableProps as AntdTableProps } from 'antd';
import { Table as AntdTable } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
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
  EnhancedColumnType,
  RowDragConfig,
  TableProps,
  TableRef,
} from './type';
import {
  filterVisibleColumns,
  getColumnKey,
  sanitizeColumn,
  sortColumnsByOrder,
} from './utils/columnHelpers';

// 暴露手柄给外部，实现终极灵活性
export { RowDragHandle };

const DEFAULT_TABLE_PROPS = {
  showColumnSetting: true,
  enableColumnResize: true,
  enableColumnDrag: false,
  enableRowDrag: false,
  enableInlineEdit: false,
  zebraStripe: true,
  hoverHighlight: true,
} as const;

function InternalTable<
  RecordType extends Record<string, unknown> = Record<string, unknown>,
>(props: TableProps<RecordType>, ref: React.Ref<TableRef>) {
  const {
    columns: columnsProp,
    showColumnSetting = DEFAULT_TABLE_PROPS.showColumnSetting,
    enableColumnResize = DEFAULT_TABLE_PROPS.enableColumnResize,
    enableColumnDrag = DEFAULT_TABLE_PROPS.enableColumnDrag,
    onColumnsChange,
    enableRowDrag: enableRowDragProp = DEFAULT_TABLE_PROPS.enableRowDrag,
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

  const columnConfigMap = useMemo(() => {
    const map = new Map<string, EnhancedColumnType<RecordType>>();
    columnsProp.forEach((col, index) => {
      map.set(getColumnKey(col, index), col);
    });
    return map;
  }, [columnsProp]);

  const {
    visibleKeys,
    columnWidths,
    orderedKeys,
    setVisibleKeys,
    setColumnWidth,
    setOrderedKeys,
    commitResize,
    resetAll,
  } = useColumnConfig<RecordType>({
    columns: columnsProp,
    onColumnsChange,
    showColumnSetting,
    enableColumnResize,
    enableColumnDrag,
  });

  const { HeaderWrapper, HeaderCellWrapper, ColumnDragContextWrapper } =
    useColumnDrag<RecordType>({
      orderedKeys,
      onReorder: setOrderedKeys,
      columns: columnsProp,
      enabled: enableColumnDrag,
    });

  const rowDragConfig: RowDragConfig<RecordType> = useMemo(() => {
    if (typeof enableRowDragProp === 'object') return enableRowDragProp;
    return { treeMode: false };
  }, [enableRowDragProp]);

  const isRowDragEnabled =
    typeof enableRowDragProp === 'object' ? true : !!enableRowDragProp;

  const { BodyWrapper, RowWrapper, RowDragContextWrapper } =
    useRowDrag<RecordType>({
      dataSource: dataSource || [],
      rowKey: rowKeyProp || 'key',
      enabled: isRowDragEnabled,
      config: rowDragConfig,
      onDragEnd: (result) => {
        onRowDragEnd?.(result);
      },
    });

  const rowKey = useMemo(() => rowKeyProp || 'key', [rowKeyProp]);

  const processedColumns = useMemo(() => {
    let sanitized = columnsProp.map((col) => sanitizeColumn(col));
    sanitized = filterVisibleColumns(sanitized, visibleKeys);
    sanitized = sortColumnsByOrder(sanitized, orderedKeys);

    const mapped = sanitized.map((col, index) => {
      const key = getColumnKey(col, index);
      const width = columnWidths[key];
      const enhancedCol = { ...col };

      if (width !== undefined) {
        enhancedCol.width = width;
      }

      const originalOnHeaderCell = col.onHeaderCell;
      enhancedCol.onHeaderCell = (columnType) => {
        const originalProps = originalOnHeaderCell
          ? originalOnHeaderCell(columnType)
          : {};
        return { ...originalProps, column: enhancedCol };
      };

      const originalOnCell = col.onCell;
      enhancedCol.onCell = (record, rowIndex) => {
        const originalProps = originalOnCell
          ? originalOnCell(record, rowIndex)
          : {};
        return { ...originalProps, column: enhancedCol, record };
      };

      return enhancedCol;
    });

    // ---- 注入拖拽手柄列 ----
    if (isRowDragEnabled && rowDragConfig.handleColumn !== false) {
      const handleCfg = rowDragConfig.handleColumn || {};
      mapped.unshift({
        key: '__drag_handle__',
        dataIndex: '__drag_handle__',
        title: handleCfg.title || '',
        width: handleCfg.width || 46,
        align: handleCfg.align || 'center',
        fixed: handleCfg.fixed !== undefined ? handleCfg.fixed : 'left',
        render: () => <RowDragHandle />,
      } as EnhancedColumnType<RecordType>);
    }

    return mapped;
  }, [
    columnsProp,
    visibleKeys,
    orderedKeys,
    columnWidths,
    isRowDragEnabled,
    rowDragConfig,
  ]);

  const columnConfigMapRef = useRef(columnConfigMap);
  columnConfigMapRef.current = columnConfigMap;

  type TableComponentsType = NonNullable<
    AntdTableProps<RecordType>['components']
  >;
  const tableComponents = useMemo(() => {
    const comps: TableComponentsType = {};
    const headerComps: NonNullable<TableComponentsType['header']> = {};

    if (enableColumnDrag) {
      headerComps.wrapper = HeaderWrapper;
    }

    headerComps.cell = (
      cellProps: React.ThHTMLAttributes<HTMLTableCellElement> & {
        column?: EnhancedColumnType<RecordType>;
      },
    ) => {
      const { children, column: antdColumn, ...rest } = cellProps;
      const colKey = antdColumn?.key || antdColumn?.dataIndex?.toString() || '';
      const originalCol = columnConfigMapRef.current.get(colKey as string);

      if (!originalCol) {
        const wrappedContent =
          enableColumnDrag && colKey !== '__drag_handle__' ? (
            <HeaderCellWrapper columnKey={colKey as string}>
              {children}
            </HeaderCellWrapper>
          ) : (
            children
          );
        return <th {...rest}>{wrappedContent}</th>;
      }

      return (
        <EnhancedHeaderCell
          {...rest}
          column={originalCol}
          columnKey={colKey as string}
          enableColumnResize={enableColumnResize}
          enableColumnDrag={enableColumnDrag}
          HeaderCellWrapper={HeaderCellWrapper}
        >
          {children}
        </EnhancedHeaderCell>
      );
    };

    comps.header = headerComps;

    const bodyComps: NonNullable<TableComponentsType['body']> = {};

    if (isRowDragEnabled) {
      bodyComps.wrapper = BodyWrapper;
      bodyComps.row = RowWrapper;
    }

    bodyComps.cell = (
      cellProps: React.TdHTMLAttributes<HTMLTableCellElement> & {
        column?: EnhancedColumnType<RecordType>;
        record?: RecordType;
        'data-row-key'?: React.Key;
      },
    ) => {
      const { children, column: antdColumn, record, ...rest } = cellProps;
      const colKey = antdColumn?.key || antdColumn?.dataIndex?.toString() || '';
      const originalCol = columnConfigMapRef.current.get(colKey as string);
      const rowKeyValue = rest['data-row-key'];

      let cellContent = children;

      if (originalCol?.cellPreset || originalCol?.editable) {
        cellContent = (
          <PresetBodyCell
            record={record as RecordType}
            column={originalCol}
            rowKey={rowKeyValue!}
            columnKey={colKey as string}
          >
            {children}
          </PresetBodyCell>
        );
      }

      if (enableColumnDrag && colKey && colKey !== '__drag_handle__') {
        return (
          <SortableBodyCell id={colKey as string} {...rest}>
            {cellContent}
          </SortableBodyCell>
        );
      }
      return <td {...rest}>{cellContent}</td>;
    };

    comps.body = bodyComps;
    return comps;
  }, [
    enableColumnResize,
    enableColumnDrag,
    isRowDragEnabled,
    HeaderWrapper,
    HeaderCellWrapper,
    BodyWrapper,
    RowWrapper,
  ]);

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

  const handleEndEdit = useCallback(() => setEditingCell(null), []);

  const contextValue = useMemo(
    () => ({
      columnWidths,
      onColumnWidthChange: setColumnWidth,
      onColumnResizeEnd: commitResize,
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
      commitResize,
      editingCell,
      handleStartEdit,
      handleEndEdit,
      enableInlineEdit,
      onCellEdit,
      onColumnSearch,
    ],
  );

  const defaultToolbar = useMemo(
    () => (
      <Toolbar
        columns={columnsProp as EnhancedColumnType<RecordType>[]}
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

  useImperativeHandle(ref, () => ({ resetAll }), [resetAll]);

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
  RecordType extends Record<string, unknown> = Record<string, unknown>,
>(
  props: TableProps<RecordType> & { ref?: React.Ref<TableRef> },
) => React.ReactElement;

export default memo(TableWithRef) as typeof TableWithRef;
