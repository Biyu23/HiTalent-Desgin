import type { ColumnLayoutRect } from '../internal';
import type { TableColumnKey } from '../type';
import { tableElements } from '../utils/dragPreview';

interface ProjectColumnOrderOptions {
  order: readonly TableColumnKey[];
  activeKey: TableColumnKey;
  startRects: ReadonlyMap<TableColumnKey, ColumnLayoutRect>;
  activeRect: Pick<ColumnLayoutRect, 'left' | 'right'>;
  deltaX: number;
  fixedKeys: ReadonlySet<TableColumnKey>;
}

export function captureColumnLayout(
  root: HTMLElement | null,
): Map<TableColumnKey, ColumnLayoutRect> {
  const result = new Map<TableColumnKey, ColumnLayoutRect>();
  (root ? tableElements(root, '[data-column-drag-key]') : []).forEach(
    (element) => {
      const key = element.dataset.columnDragKey;
      if (key === undefined || result.has(key)) return;
      // The whole cell is the drag lane, including its vertical padding.
      const rect = (element.closest('th') ?? element).getBoundingClientRect();
      result.set(key, {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
    },
  );
  return result;
}

export function mergeVisibleColumnOrder(
  fullOrder: readonly TableColumnKey[],
  visibleOrder: readonly TableColumnKey[],
): TableColumnKey[] {
  const visible = new Set(visibleOrder);
  let index = 0;
  return fullOrder.map((key) =>
    visible.has(key) ? visibleOrder[index++] : key,
  );
}

export function projectColumnOrder({
  order,
  activeKey,
  startRects,
  activeRect,
  deltaX,
  fixedKeys,
}: ProjectColumnOrderOptions): TableColumnKey[] {
  const activeIndex = order.indexOf(activeKey);
  if (activeIndex < 0 || deltaX === 0) return [...order];

  const remaining = order.filter((key) => key !== activeKey);
  const probeX = deltaX > 0 ? activeRect.right : activeRect.left;
  let insertionIndex = remaining.reduce((count, key) => {
    const rect = startRects.get(key);
    if (!rect) return count;
    return rect.left + rect.width / 2 < probeX ? count + 1 : count;
  }, 0);

  const leftFixedIndex = order.reduce(
    (result, key, index) =>
      index < activeIndex && fixedKeys.has(key) ? index : result,
    -1,
  );
  const rightFixedIndex = order.findIndex(
    (key, index) => index > activeIndex && fixedKeys.has(key),
  );
  const min = leftFixedIndex + 1;
  const max = rightFixedIndex < 0 ? remaining.length : rightFixedIndex - 1;
  insertionIndex = Math.max(min, Math.min(max, insertionIndex));

  const next = [...remaining];
  next.splice(insertionIndex, 0, activeKey);
  return next;
}
