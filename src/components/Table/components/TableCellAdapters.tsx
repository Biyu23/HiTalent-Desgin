import type { TableProps as AntdTableProps } from 'antd';
import React, { useContext, useMemo } from 'react';
import type { ColumnMeta, InternalLeafColumn } from '../internal';
import { INTERNAL_CELL_COLUMN, INTERNAL_COLUMN_KEY } from '../internal';
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
    [INTERNAL_CELL_COLUMN]?: InternalLeafColumn<unknown>;
  },
) {
  const context = useContext(AdapterContext);
  const { [INTERNAL_CELL_COLUMN]: column, ...cellProps } = props;
  const key = column?.[INTERNAL_COLUMN_KEY];
  const meta = key === undefined ? undefined : context.metaMap.get(key);
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
    [INTERNAL_CELL_COLUMN]?: InternalLeafColumn<unknown>;
  },
) {
  const adapter = useContext(AdapterContext);
  const rowRuntime = useContext(RowRuntimeContext);
  const { [INTERNAL_CELL_COLUMN]: column, ...cellProps } = props;
  const key = column?.[INTERNAL_COLUMN_KEY];
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
      data-table-column-fixed={column?.fixed ? '' : undefined}
    />
  );
}

export function useTableComponents<RecordType>(
  components: AntdTableProps<RecordType>['components'],
  rowDragEnabled: boolean,
  virtual = false,
) {
  return useMemo(() => {
    const header =
      typeof components?.header === 'object' ? { ...components.header } : {};
    const body =
      typeof components?.body === 'object' ? { ...components.body } : {};
    const headerCell = header.cell;
    const bodyCell = body.cell ?? (virtual ? 'div' : 'td');
    const bodyRow = body.row ?? (virtual ? 'div' : 'tr');
    header.cell = HeaderCellAdapter;
    body.cell = BodyCellAdapter;
    if (rowDragEnabled) body.row = RowAdapter;
    return {
      components: {
        ...components,
        header,
        body: typeof components?.body === 'function' ? components.body : body,
      },
      headerCell,
      bodyCell,
      bodyRow,
    };
  }, [components, rowDragEnabled, virtual]);
}
