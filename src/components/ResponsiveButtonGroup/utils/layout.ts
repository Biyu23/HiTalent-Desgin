import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupMode,
} from '../type';

interface LayoutResult {
  visibleItems: readonly ResponsiveButtonGroupItem[];
  collapsedItems: ResponsiveButtonGroupItem[];
  ready: boolean;
}

export function calculateLayout(
  items: readonly ResponsiveButtonGroupItem[],
  mode: ResponsiveButtonGroupMode,
  minVisibleCount: number,
  gap: number,
  containerWidth: number | null,
  itemWidths: ReadonlyMap<string, number>,
  overflowWidth: number | null,
): LayoutResult {
  const ready =
    mode !== 'responsive' ||
    items.length === 0 ||
    (containerWidth !== null &&
      overflowWidth !== null &&
      items.every((item) => itemWidths.has(item.key)));
  // 测量前只临时平铺，调用方据 ready 决定是否通知布局变化。
  if (!ready || mode === 'expanded' || items.length <= minVisibleCount) {
    return { visibleItems: items, collapsedItems: [], ready };
  }

  let visibleWidth =
    mode === 'responsive'
      ? items.reduce((sum, item) => sum + itemWidths.get(item.key)!, 0)
      : 0;
  if (
    mode === 'responsive' &&
    visibleWidth + gap * (items.length - 1) <= containerWidth!
  ) {
    return { visibleItems: items, collapsedItems: [], ready };
  }

  const order = items
    .map(({ priority = 0 }, index) => ({
      index,
      priority: Number.isFinite(priority) ? priority : 0,
    }))
    .sort((a, b) => a.priority - b.priority || b.index - a.index);
  const collapsedIndexes = new Set<number>();
  for (const { index } of order.slice(0, items.length - minVisibleCount)) {
    collapsedIndexes.add(index);
    if (mode === 'responsive') {
      visibleWidth -= itemWidths.get(items[index].key)!;
      if (
        visibleWidth +
          overflowWidth! +
          gap * (items.length - collapsedIndexes.size) <=
        containerWidth!
      )
        break;
    }
  }

  const visibleItems: ResponsiveButtonGroupItem[] = [];
  const collapsedItems: ResponsiveButtonGroupItem[] = [];
  items.forEach((item, index) =>
    (collapsedIndexes.has(index) ? collapsedItems : visibleItems).push(item),
  );
  return { visibleItems, collapsedItems, ready };
}
