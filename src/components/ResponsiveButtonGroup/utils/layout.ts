interface LayoutItem {
  priority?: number;
}

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
  items: readonly LayoutItem[],
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
