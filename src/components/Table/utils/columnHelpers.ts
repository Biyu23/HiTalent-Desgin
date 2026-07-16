import type { EnhancedColumnType } from '../type';

/** 需要从 EnhancedColumnType 中剥离的自定义扩展属性 */
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
  'editable',
  'editComponent',
  'editRules',
]);

/**
 * 从 EnhancedColumn 中提取 antd 兼容的纯列定义
 * 剥离自定义扩展属性（hideable/resizable/searchable/cellPreset 等）
 */
export function sanitizeColumn<RecordType>(
  col: EnhancedColumnType<RecordType>,
): EnhancedColumnType<RecordType> {
  const clean: Record<string, any> = {};

  for (const key of Object.keys(col as Record<string, unknown>)) {
    if (!EXTENDED_PROPS.has(key)) {
      clean[key] = (col as Record<string, any>)[key];
    }
  }

  // 保留 width 如果 defaultWidth 存在且 width 未设置
  if (col.defaultWidth !== undefined && clean.width === undefined) {
    clean.width = col.defaultWidth;
  }

  return clean as EnhancedColumnType<RecordType>;
}

/**
 * 获取列的稳定 key
 */
export function getColumnKey<RecordType>(
  col: EnhancedColumnType<RecordType>,
  index: number,
): string {
  return (col.key as string) || col.dataIndex?.toString() || `col_${index}`;
}

/**
 * 根据 visibleKeys 过滤列
 */
export function filterVisibleColumns<RecordType>(
  columns: EnhancedColumnType<RecordType>[],
  visibleKeys: string[],
): EnhancedColumnType<RecordType>[] {
  return columns.filter((col, index) =>
    visibleKeys.includes(getColumnKey(col, index)),
  );
}

/**
 * 根据 orderedKeys 排序列
 */
export function sortColumnsByOrder<RecordType>(
  columns: EnhancedColumnType<RecordType>[],
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

/**
 * 获取默认可见列 keys（不包括 hidden 的列）
 */
export function getDefaultVisibleKeys<RecordType>(
  columns: EnhancedColumnType<RecordType>[],
): string[] {
  return columns
    .filter((col) => {
      // hideable 为 false 的列始终可见，hidden 的列默认隐藏
      if (col.hideable === false) return true;
      return !col.hidden;
    })
    .map((col, index) => getColumnKey(col, index));
}

/**
 * 获取默认列顺序
 */
export function getDefaultOrderedKeys<RecordType>(
  columns: EnhancedColumnType<RecordType>[],
): string[] {
  return columns.map((col, index) => getColumnKey(col, index));
}
