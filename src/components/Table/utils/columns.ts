import type { ColumnMeta, InternalLeafColumn } from '../internal';
import { INTERNAL_CELL_COLUMN, INTERNAL_COLUMN_KEY } from '../internal';
import type {
  TableColumn,
  TableColumnGroup,
  TableColumnKey,
  TableColumnState,
  TableColumnStateItem,
  TableLeafColumn,
} from '../type';

export function isColumnGroup<RecordType>(
  column: TableColumn<RecordType>,
): column is TableColumnGroup<RecordType> {
  return Array.isArray((column as TableColumnGroup<RecordType>).children);
}

export function collectColumnMeta<RecordType>(
  columns: readonly TableColumn<RecordType>[],
): ColumnMeta<RecordType>[] {
  const result: ColumnMeta<RecordType>[] = [];

  const visit = (
    items: readonly TableColumn<RecordType>[],
    parentPath: readonly number[],
    inheritedFixed?: TableLeafColumn<RecordType>['fixed'],
  ) => {
    items.forEach((column, index) => {
      if (isColumnGroup(column)) {
        visit(
          column.children,
          [...parentPath, index],
          column.fixed ?? inheritedFixed,
        );
        return;
      }
      result.push({
        key: column.key,
        column: { ...column, fixed: column.fixed ?? inheritedFixed },
        groupPath: parentPath.join('.'),
        hideable: column.hideable !== false,
        resizable: column.resizable !== false,
      });
    });
  };

  visit(columns, []);
  return result;
}

function normalizeWidth(width: unknown): number | undefined {
  return typeof width === 'number' && Number.isFinite(width) && width >= 0
    ? width
    : undefined;
}

export function normalizeColumnState<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  state?: TableColumnState,
): TableColumnStateItem[] {
  const meta = collectColumnMeta(columns);
  const metaMap = new Map<TableColumnKey, ColumnMeta<RecordType>>();

  meta.forEach((item) => {
    if (!metaMap.has(item.key)) metaMap.set(item.key, item);
  });

  const seen = new Set<TableColumnKey>();
  const normalized: TableColumnStateItem[] = [];
  state?.forEach((item) => {
    const columnMeta = metaMap.get(item.key);
    if (!columnMeta || seen.has(item.key)) return;
    seen.add(item.key);
    const width = normalizeWidth(item.width);
    normalized.push({
      key: item.key,
      visible: columnMeta.hideable ? item.visible !== false : true,
      ...(width === undefined ? {} : { width }),
    });
  });

  meta.forEach((item) => {
    if (seen.has(item.key)) return;
    normalized.push({
      key: item.key,
      visible: true,
    });
  });

  return normalized;
}

export function areColumnStatesEqual(
  left: TableColumnState,
  right: TableColumnState,
): boolean {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return (
        item.key === other?.key &&
        item.visible === other.visible &&
        item.width === other.width
      );
    })
  );
}

function sanitizeLeafColumn<RecordType>(
  column: TableLeafColumn<RecordType>,
): InternalLeafColumn<RecordType> {
  const clean: InternalLeafColumn<RecordType> = { ...column };
  delete clean.hideable;
  delete clean.resizable;
  return clean;
}

export function processColumns<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  state: TableColumnState,
): TableColumn<RecordType>[] {
  const stateMap = new Map(state.map((item) => [item.key, item]));
  const orderMap = new Map(state.map((item, index) => [item.key, index]));

  const visit = (
    items: readonly TableColumn<RecordType>[],
    inheritedFixed?: TableLeafColumn<RecordType>['fixed'],
  ): TableColumn<RecordType>[] => {
    const result = items
      .map((column): TableColumn<RecordType> | null => {
        if (isColumnGroup(column)) {
          const children = visit(
            column.children,
            column.fixed ?? inheritedFixed,
          );
          return children.length ? { ...column, children } : null;
        }

        const item = stateMap.get(column.key);
        if (!item || item.visible === false) return null;
        const clean = sanitizeLeafColumn(column);
        clean.fixed = column.fixed ?? inheritedFixed;
        clean[INTERNAL_COLUMN_KEY] = column.key;
        if (item.width !== undefined) clean.width = item.width;
        const originalOnHeaderCell = column.onHeaderCell;
        clean.onHeaderCell = (columnType) => ({
          ...(originalOnHeaderCell?.(columnType) ?? {}),
          [INTERNAL_CELL_COLUMN]: clean,
        });
        const originalOnCell = column.onCell;
        clean.onCell = (record, rowIndex) => ({
          ...(originalOnCell?.(record, rowIndex) ?? {}),
          [INTERNAL_CELL_COLUMN]: clean,
        });
        return clean;
      })
      .filter((column): column is TableColumn<RecordType> => column !== null);

    const firstLeafOrder = (column: TableColumn<RecordType>): number => {
      if (isColumnGroup(column)) {
        return Math.min(...column.children.map(firstLeafOrder));
      }
      return orderMap.get(column.key) ?? Number.POSITIVE_INFINITY;
    };

    return result.sort(
      (left, right) => firstLeafOrder(left) - firstLeafOrder(right),
    );
  };

  return visit(columns);
}
