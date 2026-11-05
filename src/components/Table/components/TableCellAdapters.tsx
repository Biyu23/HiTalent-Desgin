import type { TableProps as AntdTableProps } from 'antd';
import clsx from 'clsx';
import React, { useContext, useMemo } from 'react';
import type { ColumnMeta, InternalLeafColumn } from '../internal';
import { INTERNAL_CELL_COLUMN, INTERNAL_COLUMN_KEY } from '../internal';
import { RowRuntimeContext } from '../rowDrag/RowDragContext';
import { RowAdapter } from '../rowDrag/SortableRow';
import { useStyles } from '../style';
import type { TableColumnKey } from '../type';
import EnhancedHeaderCell from './EnhancedHeaderCell';

interface AdapterContextValue {
  metaMap: ReadonlyMap<TableColumnKey, ColumnMeta<unknown>>;
  resizeEnabled: boolean;
  dragEnabled: boolean;
  headerCell?: React.ElementType;
  bodyCell?: React.ElementType;
  bodyCellClassName?: string;
  headerCellClassName?: string;
  treeCellClassName?: string;
}

const AdapterContext = React.createContext<AdapterContextValue>({
  metaMap: new Map(),
  resizeEnabled: false,
  dragEnabled: false,
});

interface TableCellAdapterProviderProps<RecordType> {
  zebraStripe: boolean;
  children: React.ReactNode;
  columns: readonly ColumnMeta<RecordType>[];
  resizeEnabled: boolean;
  dragEnabled: boolean;
  headerCell?: React.ElementType;
  bodyCell?: React.ElementType;
}

/** 只提供单元格增强配置，业务自定义组件仍接收原始属性。 */
export function TableCellAdapterProvider<RecordType>({
  zebraStripe,
  children,
  columns,
  resizeEnabled,
  dragEnabled,
  headerCell,
  bodyCell,
}: TableCellAdapterProviderProps<RecordType>) {
  const { styles, cx } = useStyles();
  const bodyCellClassName = cx(
    styles.bodyCell,
    zebraStripe && styles.zebraCell,
  );
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
      bodyCellClassName,
      headerCellClassName: styles.fixedHeaderCell,
      treeCellClassName: styles.treeCell,
    }),
    [
      bodyCell,
      bodyCellClassName,
      columns,
      dragEnabled,
      headerCell,
      resizeEnabled,
      styles.fixedHeaderCell,
      styles.treeCell,
    ],
  );
  return (
    <AdapterContext.Provider value={value}>{children}</AdapterContext.Provider>
  );
}

/** 私有列字段在此消化；选择列、分组标题等无元数据的单元格直接透传。 */
function HeaderCellAdapter(
  props: React.ThHTMLAttributes<HTMLTableCellElement> & {
    [INTERNAL_CELL_COLUMN]?: InternalLeafColumn<unknown>;
  },
) {
  const context = useContext(AdapterContext);
  const { [INTERNAL_CELL_COLUMN]: column, ...cellProps } = props;
  cellProps.className = clsx(cellProps.className, context.headerCellClassName);
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

/** 表体适配：合并样式与列标记，并在树形模式下安排缩进和正文。 */
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
      className={clsx(
        cellProps.className,
        adapter.bodyCellClassName,
        treeCell && adapter.treeCellClassName,
      )}
      data-table-column-key={adapter.dragEnabled ? key : undefined}
      data-table-column-fixed={column?.fixed ? '' : undefined}
    />
  );
}

/** 固定适配器组件身份，配置变化通过 Context 传递，保留单元格内部状态。 */
export function useTableComponents<RecordType>(
  components: AntdTableProps<RecordType>['components'],
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
    body.row = RowAdapter;
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
  }, [components, virtual]);
}
