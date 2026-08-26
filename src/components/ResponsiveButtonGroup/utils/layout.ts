interface LayoutItem {
  priority?: number;
}

/** 规范化优先级数值，缺省或无效值默认为 0 */
export function normalizePriority(priority?: number): number {
  return Number.isFinite(priority) ? (priority as number) : 0;
}

/** 规范化最小平铺按钮数，约束在 [0, itemCount] 范围内 */
export function normalizeMinVisibleCount(
  count: number | undefined,
  itemCount: number,
): number {
  if (!Number.isFinite(count)) return 0;
  return Math.min(itemCount, Math.max(0, Math.floor(count as number)));
}

/** 规范化间距，默认为 8px */
export function normalizeGap(gap?: number): number {
  return Number.isFinite(gap) && (gap as number) >= 0 ? (gap as number) : 8;
}

/**
 * 计算按钮折叠优先级顺序索引列表：
 * 1. 优先级数值较小的项先折叠。
 * 2. 优先级相同时，数组靠后的项（靠近“更多”按钮的一侧）先折叠。
 */
export function getCollapseOrder(items: readonly LayoutItem[]): number[] {
  return items
    .map((item, index) => ({
      index,
      priority: normalizePriority(item.priority),
    }))
    .sort((a, b) => a.priority - b.priority || b.index - a.index)
    .map((item) => item.index);
}
