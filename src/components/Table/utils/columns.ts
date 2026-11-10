import { areArraysEqual } from '../../../utils';
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

/** Antd 分组列以 children 数组区分，统一在这里收窄联合类型。 */
export function isColumnGroup<RecordType>(
  column: TableColumn<RecordType>,
): column is TableColumnGroup<RecordType> {
  return Array.isArray((column as TableColumnGroup<RecordType>).children);
}

/** 收集可参与增强的叶子列，继承分组固定属性并排除业务隐藏列。 */
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
      // 业务侧隐藏的列不参与用户列配置，分组隐藏同样生效。
      if (column.hidden) return;
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

/** 状态输入边界：剔除失效键、重复项与无效宽度，并补齐新增列。 */
export function normalizeColumnState<RecordType>(
  meta: readonly ColumnMeta<RecordType>[],
  state?: TableColumnState,
): TableColumnStateItem[] {
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
    const width =
      typeof item.width === 'number' &&
      Number.isFinite(item.width) &&
      item.width >= 0
        ? item.width
        : undefined;
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

/** 比较正式状态的三个字段，避免无变化的交互重复通知调用方。 */
export function areColumnStatesEqual(
  left: TableColumnState,
  right: TableColumnState,
): boolean {
  return areArraysEqual(
    left,
    right,
    (a, b) => a.key === b.key && a.visible === b.visible && a.width === b.width,
  );
}

/** 按列状态生成 Antd 列配置，保留分组结构和业务单元格回调，不修改原始 columns。 */
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
        if (column.hidden) return null;
        if (isColumnGroup(column)) {
          const children = visit(
            column.children,
            column.fixed ?? inheritedFixed,
          );
          return children.length ? { ...column, children } : null;
        }

        const item = stateMap.get(column.key);
        if (!item || item.visible === false) return null;
        // 仅在交给 Antd 前移除本组件的扩展属性，业务回调与原始列保持不变。
        const clean: InternalLeafColumn<RecordType> = { ...column };
        delete clean.hideable;
        delete clean.resizable;
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
