import type { EnhancedColumnType } from '../type';

const EXTENDED_PROPS = new Set([
  'hideable',
  'hidden',
  'resizable',
  'defaultWidth',
  'minWidth',
  'searchable',
  'searchPlaceholder',
  'cellPreset',
  'cellPresetProps',
]);

export function sanitizeColumn<RecordType extends Record<string, unknown>>(
  col: EnhancedColumnType<RecordType>,
): EnhancedColumnType<RecordType> {
  const clean: Record<string, unknown> = {};

  for (const key of Object.keys(col as Record<string, unknown>)) {
    if (!EXTENDED_PROPS.has(key)) {
      clean[key] = (col as Record<string, unknown>)[key];
    }
  }

  if (col.defaultWidth !== undefined && clean.width === undefined) {
    clean.width = col.defaultWidth;
  }

  return clean as EnhancedColumnType<RecordType>;
}

export function getColumnKey<RecordType extends Record<string, unknown>>(
  col: EnhancedColumnType<RecordType>,
  index: number,
): string {
  return (col.key as string) || col.dataIndex?.toString() || `col_${index}`;
}

export function filterVisibleColumns<
  RecordType extends Record<string, unknown>,
>(
  columns: readonly EnhancedColumnType<RecordType>[],
  visibleKeys: string[],
): EnhancedColumnType<RecordType>[] {
  return columns.filter((col, index) =>
    visibleKeys.includes(getColumnKey(col, index)),
  );
}

export function sortColumnsByOrder<RecordType extends Record<string, unknown>>(
  columns: readonly EnhancedColumnType<RecordType>[],
  orderedKeys: string[],
): EnhancedColumnType<RecordType>[] {
  const keyMap = new Map<string, number>();
  orderedKeys.forEach((key, i) => keyMap.set(key, i));

  return [...columns].sort((a, b) => {
    const aIndex = columns.indexOf(a);
    const bIndex = columns.indexOf(b);
    const aKey = getColumnKey(a, aIndex);
    const bKey = getColumnKey(b, bIndex);
    const aOrder = keyMap.get(aKey) ?? Infinity;
    const bOrder = keyMap.get(bKey) ?? Infinity;
    return aOrder - bOrder;
  });
}

export function getDefaultVisibleKeys<
  RecordType extends Record<string, unknown>,
>(columns: readonly EnhancedColumnType<RecordType>[]): string[] {
  return columns
    .filter((col) => {
      if (col.hideable === false) return true;
      return !col.hidden;
    })
    .map((col, index) => getColumnKey(col, index));
}

export function getDefaultOrderedKeys<
  RecordType extends Record<string, unknown>,
>(columns: readonly EnhancedColumnType<RecordType>[]): string[] {
  return columns.map((col, index) => getColumnKey(col, index));
}
