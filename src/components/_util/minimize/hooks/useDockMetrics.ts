import type React from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface DockCardMetrics {
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
  revision: string;
  fallbackHeight: number;
}

const sameCardMetrics = (
  left: Map<string, DockCardMetrics>,
  right: Map<string, DockCardMetrics>,
): boolean => {
  if (left.size !== right.size) return false;

  for (const [id, metrics] of left) {
    const next = right.get(id);
    if (
      !next ||
      next.top !== metrics.top ||
      next.width !== metrics.width ||
      next.height !== metrics.height
    ) {
      return false;
    }
  }

  return true;
};

const useDockMetrics = ({
  contentRef,
  itemIds,
  revision,
  fallbackHeight,
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
    itemIds.forEach((id) => {
      const card = cardNodesRef.current.get(id);
      if (!card) return;
      cards.set(id, {
        top: card.offsetTop,
        width: card.offsetWidth,
        height: card.offsetHeight,
      });
    });

    const latestHeight = cards.get(itemIds[0])?.height || fallbackHeight;
    const contentHeight =
      content.offsetHeight || content.scrollHeight || latestHeight;

    setMetrics((current) =>
      current.contentHeight === contentHeight &&
      current.latestHeight === latestHeight &&
      sameCardMetrics(current.cards, cards)
        ? current
        : { contentHeight, latestHeight, cards },
    );
  }, [contentRef, fallbackHeight, itemIds]);

  useLayoutEffect(() => {
    measure();
  }, [measure, revision]);

  useLayoutEffect(() => {
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
  }, [contentRef, itemIds, measure, revision]);

  return { ...metrics, getCardRef };
};

export default useDockMetrics;
