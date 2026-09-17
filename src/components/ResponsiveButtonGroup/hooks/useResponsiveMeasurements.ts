import { useEffect, useRef, useState } from 'react';
import type { ResponsiveButtonGroupItem } from '../type';

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

/** 仅监听容器与隐藏测量节点，尺寸变化记录中已包含宽度。 */
export function useResponsiveMeasurements(
  enabled: boolean,
  items: readonly ResponsiveButtonGroupItem[],
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measurements, setMeasurements] = useState(initialMeasurements);

  const itemKeys = JSON.stringify(items.map((item) => item.key));

  useEffect(() => {
    const container = containerRef.current;
    setMeasurements(initialMeasurements);
    const keysInOrder: string[] = JSON.parse(itemKeys);
    if (
      !enabled ||
      !container ||
      keysInOrder.length === 0 ||
      typeof ResizeObserver === 'undefined'
    )
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
  }, [enabled, itemKeys]);

  return { ...measurements, containerRef };
}
