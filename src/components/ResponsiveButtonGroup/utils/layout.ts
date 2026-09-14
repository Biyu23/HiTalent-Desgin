import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupMode,
} from '../type';

interface LayoutItem {
  priority?: number;
}

export interface SplitResult<T = ResponsiveButtonGroupItem> {
  visibleItems: T[];
  collapsedItems: T[];
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

export function getCollapseOrder(items: readonly LayoutItem[]): number[] {
  return items
    .map((item, index) => ({
      index,
      priority: normalizePriority(item.priority),
    }))
    .sort((a, b) => a.priority - b.priority || b.index - a.index)
    .map((item) => item.index);
}

export function splitItems<T = ResponsiveButtonGroupItem>(
  items: readonly T[],
  collapsedIndexes: ReadonlySet<number>,
): SplitResult<T> {
  const visibleItems: T[] = [];
  const collapsedItems: T[] = [];
  items.forEach((item, index) =>
    (collapsedIndexes.has(index) ? collapsedItems : visibleItems).push(item),
  );
  return { visibleItems, collapsedItems };
}

export function calculateLayout(
  items: readonly ResponsiveButtonGroupItem[],
  mode: ResponsiveButtonGroupMode = 'responsive',
  minVisibleCount: number,
  gap: number,
  containerWidth: number | null,
  itemWidths: ReadonlyMap<string, number>,
  overflowWidth: number | null,
): SplitResult<ResponsiveButtonGroupItem> {
  // 强制全展开或无数据时全量平铺
  if (mode === 'expanded' || items.length === 0) {
    return { visibleItems: [...items], collapsedItems: [] };
  }

  const maxCollapsed = items.length - minVisibleCount;

  // 强制全收起模式：直接按优先级折叠至上限
  if (mode === 'collapsed') {
    return splitItems(
      items,
      new Set(getCollapseOrder(items).slice(0, maxCollapsed)),
    );
  }

  // 自适应模式下，未完成容器或所有按钮尺寸测量时，先平铺渲染以获取真实尺寸
  if (
    containerWidth === null ||
    items.some((item) => !Number.isFinite(itemWidths.get(item.key)))
  ) {
    return { visibleItems: [...items], collapsedItems: [] };
  }

  const itemWidthTotal = items.reduce(
    (sum, item) => sum + (itemWidths.get(item.key) || 0),
    0,
  );

  // 所有平铺按钮无需折叠即可完整容纳在容器中
  if (itemWidthTotal + gap * Math.max(0, items.length - 1) <= containerWidth) {
    return { visibleItems: [...items], collapsedItems: [] };
  }

  // 需要折叠但“更多”按钮宽度尚未就绪，暂保持平铺
  if (overflowWidth === null) {
    return { visibleItems: [...items], collapsedItems: [] };
  }

  // 逐项折叠并验证：剩余平铺按钮 + 间距 + “更多”触发器按钮总宽度 <= 容器可用宽度
  const order = getCollapseOrder(items);
  const collapsedIndexes = new Set<number>();
  let visibleWidth = itemWidthTotal;

  for (let count = 1; count <= maxCollapsed; count += 1) {
    const index = order[count - 1];
    collapsedIndexes.add(index);
    visibleWidth -= itemWidths.get(items[index].key) || 0;

    // 容纳度验证：平铺总宽 + 更多按钮宽 + 间距 <= 容器可用宽
    if (
      visibleWidth + overflowWidth + gap * (items.length - count) <=
      containerWidth
    ) {
      return splitItems(items, collapsedIndexes);
    }
  }

  return splitItems(items, collapsedIndexes);
}
