import type { DataIndex } from 'rc-table/lib/interface';
import type {
  ColumnId,
  ColumnState,
  ColumnStateItem,
  EnhancedColumnGroupType,
  EnhancedColumnType,
  EnhancedLeafColumnType,
} from '../type';

const EXTENDED_PROPS = new Set([
  'id',
  'hideable',
  'resizable',
  'cellPreset',
  'cellPresetProps',
]);

function encodePart(value: string | number): string {
  return `${typeof value}:${JSON.stringify(value)}`;
}

function encodeDataIndex(dataIndex: DataIndex | undefined): string | null {
  if (dataIndex === undefined || dataIndex === null) return null;
  if (Array.isArray(dataIndex)) {
    return `path:${dataIndex.map((part) => encodePart(part)).join('/')}`;
  }
  return `field:${encodePart(dataIndex as string | number)}`;
}

export function isColumnGroup<RecordType>(
  column: EnhancedColumnType<RecordType>,
): column is EnhancedColumnGroupType<RecordType> {
  return Array.isArray(
    (column as EnhancedColumnGroupType<RecordType>).children,
  );
}

export function resolveColumnId<RecordType>(
  column: EnhancedColumnType<RecordType>,
  path: readonly number[],
): { id: ColumnId; stable: boolean } {
  if (!isColumnGroup(column) && column.id !== undefined && column.id !== '') {
    return { id: column.id, stable: true };
  }
  if (column.key !== undefined && column.key !== null) {
    return { id: `key:${encodePart(column.key)}`, stable: true };
  }
  if (!isColumnGroup(column)) {
    const dataIndexId = encodeDataIndex(column.dataIndex);
    if (dataIndexId) return { id: dataIndexId, stable: true };
  }
  return { id: `index:${path.join('.')}`, stable: false };
}

export interface ColumnMeta<RecordType> {
  id: ColumnId;
  column: EnhancedLeafColumnType<RecordType>;
  stable: boolean;
  path: readonly number[];
}

export function collectColumnMeta<RecordType>(
  columns: readonly EnhancedColumnType<RecordType>[],
): ColumnMeta<RecordType>[] {
  const result: ColumnMeta<RecordType>[] = [];
  const visit = (
    items: readonly EnhancedColumnType<RecordType>[],
    parentPath: readonly number[],
  ) => {
    items.forEach((column, index) => {
      const path = [...parentPath, index];
      if (isColumnGroup(column)) {
        visit(column.children, path);
        return;
      }
      const resolved = resolveColumnId(column, path);
      result.push({ ...resolved, column, path });
    });
  };
  visit(columns, []);
  return result;
}

function normalizeWidth(width: unknown): number | undefined {
  return typeof width === 'number' && Number.isFinite(width)
    ? width
    : undefined;
}

export function createColumnState<RecordType>(
  columns: readonly EnhancedColumnType<RecordType>[],
  state?: ColumnState,
): ColumnStateItem[] {
  const meta = collectColumnMeta(columns);
  const duplicateIds = new Set<ColumnId>();
  const metaMap = new Map<ColumnId, ColumnMeta<RecordType>>();
  meta.forEach((item) => {
    if (metaMap.has(item.id)) duplicateIds.add(item.id);
    else metaMap.set(item.id, item);
  });
  if (process.env.NODE_ENV !== 'production' && duplicateIds.size > 0) {
    console.warn('[Table] 已忽略重复 column id：', [...duplicateIds]);
  }
  duplicateIds.forEach((id) => metaMap.delete(id));
  const validMeta = meta.filter((item) => metaMap.has(item.id));
  const seen = new Set<ColumnId>();
  const normalized: ColumnStateItem[] = [];

  state?.forEach((item) => {
    const columnMeta = metaMap.get(item.id);
    if (!columnMeta || seen.has(item.id)) return;
    seen.add(item.id);
    const width = normalizeWidth(item.width);
    normalized.push({
      id: item.id,
      ...(columnMeta.column.hideable === false
        ? { hidden: false }
        : item.hidden !== undefined
        ? { hidden: item.hidden }
        : {}),
      ...(width !== undefined ? { width } : {}),
    });
  });

  validMeta.forEach((item) => {
    if (seen.has(item.id)) return;
    const width = normalizeWidth(item.column.width);
    normalized.push({
      id: item.id,
      hidden: false,
      ...(width !== undefined ? { width } : {}),
    });
  });

  return normalized;
}

export function sanitizeColumn<RecordType>(
  column: EnhancedLeafColumnType<RecordType>,
): EnhancedLeafColumnType<RecordType> {
  const clean: Record<string, unknown> = {};
  Object.keys(column).forEach((key) => {
    if (!EXTENDED_PROPS.has(key)) {
      clean[key] = (column as Record<string, unknown>)[key];
    }
  });
  return clean as EnhancedLeafColumnType<RecordType>;
}

export function getValueByDataIndex(
  record: unknown,
  dataIndex: DataIndex | undefined,
): unknown {
  if (dataIndex === undefined || dataIndex === null) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  let current: unknown = record;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}
