import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupMode,
} from '../type';

interface LayoutItem {
  priority?: number;
}

export interface SplitResult<T = ResponsiveButtonGroupItem> {
  /** 保持平铺展示的按钮列表 */
  visibleItems: T[];
  /** 折叠收起至“更多”下拉菜单的项列表 */
  collapsedItems: T[];
}

/** 规范化优先级数值，缺省或无效值默认为 0 */
export function normalizePriority(priority?: number): number {
  return Number.isFinite(priority) ? (priority as number) : 0;
}

/**
 * 规范化最小平铺按钮数：
 * - 约束在 [0, itemCount] 闭区间内
 * - 向上取整/向下取整保证为合法整数
 */
export function normalizeMinVisibleCount(
  count: number | undefined,
  itemCount: number,
): number {
  if (!Number.isFinite(count)) return 0;
  return Math.min(itemCount, Math.max(0, Math.floor(count as number)));
}

/** 规范化间距数值，缺省或负数时默认为 8px */
export function normalizeGap(gap?: number): number {
  return Number.isFinite(gap) && (gap as number) >= 0 ? (gap as number) : 8;
}

/**
 * 计算按钮折叠优先级顺序索引列表：
 * 1. 权重排序：优先级数值较小（priority 较低）的项先折叠。
 * 2. 稳定折叠：优先级相同时，数组靠后（靠近“更多”按钮右侧）的项优先折叠。
 *
 * @param items 操作项列表
 * @returns 折叠顺序索引数组（首项最先被折叠）
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

/**
 * 根据折叠索引集合将所有操作项拆分为【平铺可见项】与【折叠菜单项】
 *
 * @param items 全量操作项列表
 * @param collapsedIndexes 需折叠的项索引 Set 集合
 */
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

/**
 * 自适应排版核心计算：
 *
 * 1. mode 为 'expanded' 或 items 为空：全部平铺展示。
 * 2. mode 为 'collapsed'：按优先级折叠至保留 minVisibleCount 个平铺项。
 * 3. mode 为 'responsive'：
 *    - 若尚未完成初次尺寸测量，先全量平铺以获取各按钮的实际渲染宽度。
 *    - 若全量平铺总宽度 <= 容器可用宽度，无需折叠，全量展示。
 *    - 若空间不足，按折叠优先级从低到高逐个折叠，并在每一步验证剩余空间：
 *      方程：平铺项宽度和 + 更多按钮宽度 + 元素间隙总宽 <= 容器内容宽度
 *      间隙数推导：剩余 (items.length - count) 个平铺项 + 1 个“更多”按钮，
 *      共有 (N - count + 1) 个元素，其间隙总数为 (N - count + 1) - 1 = (N - count)。
 *
 * @param items 全量按钮操作项
 * @param mode 展示模式
 * @param minVisibleCount 强制保留的最小平铺按钮数
 * @param gap 按钮间距（px）
 * @param containerWidth 容器内容区可用宽度（px）
 * @param itemWidths 各平铺项在 DOM 中的实测宽度 Map
 * @param overflowWidth “更多”触发器按钮的实测宽度
 */
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

  const order = getCollapseOrder(items);
  const maxCollapsed = items.length - minVisibleCount;

  // 强制全收起模式：直接按优先级折叠至上限
  if (mode === 'collapsed') {
    return splitItems(items, new Set(order.slice(0, maxCollapsed)));
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
