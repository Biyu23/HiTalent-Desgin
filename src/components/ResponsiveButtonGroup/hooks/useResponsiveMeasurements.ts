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

/** Observe only the container and hidden measurement nodes; resize entries already contain widths. */
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
        ':scope > [aria-hidden] > [data-rbg-measure]',
      ),
    );
    const keys = new Map(
      nodes
        .slice(0, items.length)
        .map((node, index) => [node, keysInOrder[index]]),
    );
    const overflow = nodes[keysInOrder.length];
    // This snapshot belongs to this subscription; removed keys never survive a new item list.
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
