import type React from 'react';
import type {
  ResponsiveLayoutInput,
  ResponsiveLayoutItem,
  ResponsiveLayoutResult,
} from '../types/internal';

const LAYOUT_EPSILON = 0.5;
export function normalizePriority(priority?: number): number {
  return Number.isFinite(priority) ? (priority as number) : 0;
}

export function normalizeMinVisibleCount(
  count: number | undefined,
  itemCount: number,
): number {
  if (!Number.isFinite(count)) return 0;
  return Math.min(itemCount, Math.max(0, Math.floor(count as number)));
}

export function normalizeGap(gap?: number): number {
  return Number.isFinite(gap) && (gap as number) >= 0 ? (gap as number) : 8;
}

export function getCollapseOrder(
  items: readonly ResponsiveLayoutItem[],
  direction: 'ltr' | 'rtl' = 'ltr',
): number[] {
  return items
    .map((item, index) => ({
      index,
      priority: normalizePriority(item.priority),
    }))
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        (direction === 'rtl' ? b.index - a.index : a.index - b.index),
    )
    .map((item) => item.index);
}

function splitItems(
  items: readonly ResponsiveLayoutItem[],
  collapsedIndexes: ReadonlySet<number>,
): ResponsiveLayoutResult {
  const visibleKeys: React.Key[] = [];
  const collapsedKeys: React.Key[] = [];

  items.forEach((item, index) => {
    if (collapsedIndexes.has(index)) {
      collapsedKeys.push(item.key);
    } else {
      visibleKeys.push(item.key);
    }
  });

  return { visibleKeys, collapsedKeys };
}

export function getResponsiveLayout(
  input: ResponsiveLayoutInput,
): ResponsiveLayoutResult {
  const { items, mode, direction, containerWidth, itemWidths, overflowWidths } =
    input;
  const itemCount = items.length;
  const minVisibleCount = normalizeMinVisibleCount(
    input.minVisibleCount,
    itemCount,
  );
  const gap = normalizeGap(input.gap);

  if (itemCount === 0 || mode === 'expanded') {
    return {
      visibleKeys: items.map((item) => item.key),
      collapsedKeys: [],
    };
  }

  const collapseOrder = getCollapseOrder(items, direction);
  const maxCollapsedCount = itemCount - minVisibleCount;

  if (mode === 'collapsed') {
    return splitItems(
      items,
      new Set(collapseOrder.slice(0, maxCollapsedCount)),
    );
  }

  const hasCompleteMeasurement =
    containerWidth !== null &&
    Number.isFinite(containerWidth) &&
    items.every((item) => Number.isFinite(itemWidths.get(item.key))) &&
    Array.from({ length: maxCollapsedCount }, (_, index) => index + 1).every(
      (count) => Number.isFinite(overflowWidths.get(count)),
    );

  if (!hasCompleteMeasurement) {
    return {
      visibleKeys: items.map((item) => item.key),
      collapsedKeys: [],
    };
  }

  const allItemsWidth = items.reduce(
    (sum, item) => sum + (itemWidths.get(item.key) as number),
    0,
  );
  const expandedWidth = allItemsWidth + gap * Math.max(0, itemCount - 1);

  if (expandedWidth <= (containerWidth as number) + LAYOUT_EPSILON) {
    return {
      visibleKeys: items.map((item) => item.key),
      collapsedKeys: [],
    };
  }

  const collapsedIndexes = new Set<number>();
  let visibleItemsWidth = allItemsWidth;

  for (
    let collapsedCount = 1;
    collapsedCount <= maxCollapsedCount;
    collapsedCount += 1
  ) {
    const nextIndex = collapseOrder[collapsedCount - 1];
    collapsedIndexes.add(nextIndex);
    visibleItemsWidth -= itemWidths.get(items[nextIndex].key) as number;

    const overflowWidth = overflowWidths.get(collapsedCount);
    if (!Number.isFinite(overflowWidth)) continue;

    const visibleCount = itemCount - collapsedCount;
    const totalWidth =
      visibleItemsWidth + (overflowWidth as number) + gap * visibleCount;

    if (totalWidth <= (containerWidth as number) + LAYOUT_EPSILON) {
      return splitItems(items, collapsedIndexes);
    }
  }

  return splitItems(items, collapsedIndexes);
}
