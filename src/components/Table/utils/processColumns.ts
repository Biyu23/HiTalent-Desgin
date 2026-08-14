import type { ColumnId, EnhancedColumnType } from '../type';
import type { InternalLeafColumn } from '../types/internal';
import {
  isColumnGroup,
  resolveColumnId,
  sanitizeColumn,
} from './columnHelpers';

export function processColumns<RecordType>(
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
