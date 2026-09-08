import type { TableProps as AntdTableProps } from 'antd';
import React, { useContext, useMemo } from 'react';
import type { ColumnMeta, InternalLeafColumn } from '../internal';
import { INTERNAL_COLUMN_KEY } from '../internal';
import { RowAdapter, RowRuntimeContext } from '../rowDrag/SortableRow';
import type { TableColumnKey } from '../type';
import EnhancedHeaderCell from './EnhancedHeaderCell';

interface AdapterContextValue {
  metaMap: ReadonlyMap<TableColumnKey, ColumnMeta<unknown>>;
  resizeEnabled: boolean;
  dragEnabled: boolean;
  headerCell?: React.ElementType;
  bodyCell?: React.ElementType;
}

const AdapterContext = React.createContext<AdapterContextValue>({
  metaMap: new Map(),
  resizeEnabled: false,
  dragEnabled: false,
});

interface TableCellAdapterProviderProps<RecordType> {
  children: React.ReactNode;
  columns: readonly ColumnMeta<RecordType>[];
  resizeEnabled: boolean;
  dragEnabled: boolean;
  headerCell?: React.ElementType;
  bodyCell?: React.ElementType;
}

export function TableCellAdapterProvider<RecordType>({
  children,
  columns,
  resizeEnabled,
  dragEnabled,
  headerCell,
  bodyCell,
}: TableCellAdapterProviderProps<RecordType>) {
  const value = useMemo(
    () => ({
      metaMap: new Map(columns.map((item) => [item.key, item])) as ReadonlyMap<
        TableColumnKey,
        ColumnMeta<unknown>
      >,
      resizeEnabled,
      dragEnabled,
      headerCell,
      bodyCell,
    }),
    [bodyCell, columns, dragEnabled, headerCell, resizeEnabled],
  );
  return (
    <AdapterContext.Provider value={value}>{children}</AdapterContext.Provider>
  );
}

function HeaderCellAdapter(
  props: React.ThHTMLAttributes<HTMLTableCellElement> & {
    column?: InternalLeafColumn<unknown>;
  },
) {
  const context = useContext(AdapterContext);
  const { column, ...cellProps } = props;
  const key = column?.[INTERNAL_COLUMN_KEY];
  const meta = key ? context.metaMap.get(key) : undefined;
  if (!meta) {
    const Cell = context.headerCell ?? 'th';
    return <Cell {...cellProps} />;
  }
  return (
    <EnhancedHeaderCell
      {...cellProps}
      meta={meta}
      resizeEnabled={context.resizeEnabled}
      dragEnabled={context.dragEnabled}
      cellComponent={context.headerCell}
    />
  );
}

function BodyCellAdapter(
  props: React.TdHTMLAttributes<HTMLTableCellElement> & {
    column?: InternalLeafColumn<unknown>;
  },
) {
  const adapter = useContext(AdapterContext);
  const rowRuntime = useContext(RowRuntimeContext);
  const key = props.column?.[INTERNAL_COLUMN_KEY];
  const cellProps = { ...props };
  delete cellProps.column;
  const treeCell =
    rowRuntime?.treeMode &&
    props.className
      ?.split(' ')
      .some((name) => name.endsWith('-cell-with-append'));
  if (treeCell && Array.isArray(props.children)) {
    const [controls, ...content] = props.children;
    cellProps.children = (
      <div data-table-tree-cell="">
        {controls}
        <div data-table-tree-content="">{content}</div>
      </div>
    );
  }
  const Cell = adapter.bodyCell ?? 'td';
  return (
    <Cell
      {...cellProps}
      data-table-column-key={adapter.dragEnabled ? key : undefined}
      data-table-column-fixed={props.column?.fixed ? '' : undefined}
    />
  );
}

export function useTableComponents<RecordType>(
  components: AntdTableProps<RecordType>['components'],
  rowDragEnabled: boolean,
) {
  return useMemo(() => {
    const header =
      typeof components?.header === 'object' ? { ...components.header } : {};
    const body =
      typeof components?.body === 'object' ? { ...components.body } : {};
    const headerCell = header.cell;
    const bodyCell = body.cell;
    const bodyRow = body.row;
    header.cell = HeaderCellAdapter;
    body.cell = BodyCellAdapter;
    if (rowDragEnabled) body.row = RowAdapter;
    return {
      components: { ...components, header, body },
      headerCell,
      bodyCell,
      bodyRow,
    };
  }, [components, rowDragEnabled]);
}
