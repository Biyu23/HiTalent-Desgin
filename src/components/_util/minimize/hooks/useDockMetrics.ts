import type React from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { areMapsEqual } from '../../../../utils';

export interface DockCardMetrics {
  // 距离停靠边缘的累计偏移，与卡片动画中的实际位置解耦。
  top: number;
  width: number;
  height: number;
}

interface DockMetricsState {
  contentHeight: number;
  latestHeight: number;
  cards: Map<string, DockCardMetrics>;
}

export interface DockMetrics extends DockMetricsState {
  getCardRef: (id: string) => React.RefCallback<HTMLDivElement>;
}

export interface UseDockMetricsOptions {
  contentRef: React.RefObject<HTMLElement>;
  itemIds: string[];
  fallbackHeight: number;
  gap: number;
}

const sameCardMetrics = (
  left: Map<string, DockCardMetrics>,
  right: Map<string, DockCardMetrics>,
): boolean =>
  areMapsEqual(
    left,
    right,
    (a, b) => a.top === b.top && a.width === b.width && a.height === b.height,
  );

const useDockMetrics = ({
  contentRef,
  itemIds,
  fallbackHeight,
  gap,
}: UseDockMetricsOptions): DockMetrics => {
  const cardNodesRef = useRef(new Map<string, HTMLDivElement>());
  const cardCallbacksRef = useRef(
    new Map<string, React.RefCallback<HTMLDivElement>>(),
  );
  const [metrics, setMetrics] = useState<DockMetricsState>(() => ({
    contentHeight: fallbackHeight,
    latestHeight: fallbackHeight,
    cards: new Map(),
  }));

  const getCardRef = useCallback((id: string) => {
    let callback = cardCallbacksRef.current.get(id);
    if (!callback) {
      callback = (node) => {
        if (node) cardNodesRef.current.set(id, node);
        else cardNodesRef.current.delete(id);
      };
      cardCallbacksRef.current.set(id, callback);
    }
    return callback;
  }, []);

  const measure = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    const cards = new Map<string, DockCardMetrics>();
    let contentHeight = 0;
    itemIds.forEach((id) => {
      const card = cardNodesRef.current.get(id);
      if (!card) return;
      const height = card.offsetHeight;
      cards.set(id, {
        top: contentHeight,
        width: card.offsetWidth,
        height,
      });
      contentHeight += height + gap;
    });

    const latestHeight = cards.get(itemIds[0])?.height || fallbackHeight;
    contentHeight = cards.size ? contentHeight - gap : latestHeight;

    setMetrics((current) =>
      current.contentHeight === contentHeight &&
      current.latestHeight === latestHeight &&
      sameCardMetrics(current.cards, cards)
        ? current
        : { contentHeight, latestHeight, cards },
    );
  }, [contentRef, fallbackHeight, gap, itemIds]);

  useLayoutEffect(() => {
    measure();
    const content = contentRef.current;
    if (!content) return undefined;

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(content);
      itemIds.forEach((id) => {
        const card = cardNodesRef.current.get(id);
        if (card) observer.observe(card);
      });
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [contentRef, itemIds, measure]);

  return { ...metrics, getCardRef };
};

export default useDockMetrics;
