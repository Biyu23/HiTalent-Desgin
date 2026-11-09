import { useEffect, useMemo, useRef, useState } from 'react';
import { areArraysEqual } from '../../../utils';
import type { ResponsiveButtonGroupProps } from '../type';
import { calculateLayout } from '../utils/layout';

interface Measurements {
  containerWidth: number | null;
  itemWidths: ReadonlyMap<string, number>;
  overflowWidth: number | null;
}

const initialMeasurements: Measurements = {
  containerWidth: null,
  itemWidths: new Map(),
  overflowWidth: null,
};

/** 测量按钮尺寸，计算布局并通知实际发生的可见项变化。 */
export function useResponsiveLayout({
  items,
  mode = 'responsive',
  gap: gapProp = 8,
  minVisibleCount: minVisibleCountProp = 0,
  onVisibleChange,
}: Pick<
  ResponsiveButtonGroupProps,
  'items' | 'mode' | 'gap' | 'minVisibleCount' | 'onVisibleChange'
>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const previousKeysRef = useRef<{ visible: string[]; collapsed: string[] }>();
  const measuring = mode === 'responsive' && items.length > 0;

  const gap = Number.isFinite(gapProp) && gapProp >= 0 ? gapProp : 8;
  const minVisibleCount = Number.isFinite(minVisibleCountProp)
    ? Math.min(items.length, Math.max(0, Math.floor(minVisibleCountProp)))
    : 0;

  const itemKeys = JSON.stringify(items.map((item) => item.key));

  useEffect(() => {
    const container = containerRef.current;
    setMeasurements(initialMeasurements);
    const keysInOrder: string[] = JSON.parse(itemKeys);
    if (!measuring || !container || typeof ResizeObserver === 'undefined')
      return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>(
        ':scope > [data-rbg-measure-container] > [data-rbg-measure]',
      ),
    );
    const keys = new Map(
      nodes
        .slice(0, keysInOrder.length)
        .map((node, index) => [node, keysInOrder[index]]),
    );
    const overflow = nodes[keysInOrder.length];
    // 快照仅属于当前订阅，操作项列表变化后不保留已删除的键。
    let current = initialMeasurements;
    const observer = new ResizeObserver((entries) => {
      let { containerWidth, overflowWidth } = current;
      const itemWidths = new Map(current.itemWidths);
      let changed = false;
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (entry.target === container) {
          changed ||= containerWidth !== width;
          containerWidth = width;
        } else if (entry.target === overflow) {
          changed ||= overflowWidth !== width;
          overflowWidth = width;
        } else {
          const key = keys.get(entry.target as HTMLElement);
          if (key !== undefined) {
            changed ||= itemWidths.get(key) !== width;
            itemWidths.set(key, width);
          }
        }
      }
      if (changed) {
        current = { containerWidth, itemWidths, overflowWidth };
        setMeasurements(current);
      }
    });
    observer.observe(container);
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [measuring, itemKeys]);

  const layout = useMemo(
    () =>
      calculateLayout(
        items,
        mode,
        minVisibleCount,
        gap,
        measurements.containerWidth,
        measurements.itemWidths,
        measurements.overflowWidth,
      ),
    [items, mode, minVisibleCount, gap, measurements],
  );

  useEffect(() => {
    if (!layout.ready) return;
    const visible = layout.visibleItems.map((item) => item.key);
    const collapsed = layout.collapsedItems.map((item) => item.key);
    const previous = previousKeysRef.current;
    if (
      previous &&
      areArraysEqual(previous.visible, visible) &&
      areArraysEqual(previous.collapsed, collapsed)
    )
      return;
    previousKeysRef.current = { visible, collapsed };
    onVisibleChange?.(visible, collapsed);
  }, [layout, onVisibleChange]);

  return { ...layout, gap, measuring, containerRef };
}
