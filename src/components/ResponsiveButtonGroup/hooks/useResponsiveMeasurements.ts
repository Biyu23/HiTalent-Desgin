import { useCallback, useEffect, useRef, useState } from 'react';
import { areMapsEqual } from '../../../util';

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

export function useResponsiveMeasurements() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemNodesRef = useRef(new Map<string, HTMLElement>());
  const overflowNodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver>();
  const frameRef = useRef<number>();
  const callbacksRef = useRef(
    new Map<string, (node: HTMLElement | null) => void>(),
  );
  const [measurements, setMeasurements] =
    useState<Measurements>(initialMeasurements);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const itemWidths = new Map<string, number>();
    itemNodesRef.current.forEach((node, key) => {
      itemWidths.set(key, node.getBoundingClientRect().width);
    });
    const containerWidth = container
      ? Math.max(
          0,
          container.clientWidth -
            parseFloat(getComputedStyle(container).paddingLeft || '0') -
            parseFloat(getComputedStyle(container).paddingRight || '0'),
        )
      : null;
    const overflowWidth = overflowNodeRef.current
      ? overflowNodeRef.current.getBoundingClientRect().width
      : null;
    setMeasurements((previous) =>
      previous.containerWidth === containerWidth &&
      previous.overflowWidth === overflowWidth &&
      areMapsEqual(previous.itemWidths, itemWidths)
        ? previous
        : { containerWidth, itemWidths, overflowWidth },
    );
  }, []);

  const schedule = useCallback(() => {
    if (frameRef.current !== undefined) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      measure();
    });
  }, [measure]);

  const observeReplacement = useCallback(
    (previous: HTMLElement | null, next: HTMLElement | null) => {
      if (previous) observerRef.current?.unobserve(previous);
      if (next) observerRef.current?.observe(next);
      schedule();
    },
    [schedule],
  );

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node === containerRef.current) return;
      observeReplacement(containerRef.current, node);
      containerRef.current = node;
    },
    [observeReplacement],
  );

  const getItemRef = useCallback(
    (key: string) => {
      const existing = callbacksRef.current.get(key);
      if (existing) return existing;
      const callback = (node: HTMLElement | null) => {
        const previous = itemNodesRef.current.get(key) || null;
        if (node) itemNodesRef.current.set(key, node);
        else {
          itemNodesRef.current.delete(key);
          callbacksRef.current.delete(key);
        }
        observeReplacement(previous, node);
      };
      callbacksRef.current.set(key, callback);
      return callback;
    },
    [observeReplacement],
  );

  const setOverflowRef = useCallback(
    (node: HTMLElement | null) => {
      if (node === overflowNodeRef.current) return;
      observeReplacement(overflowNodeRef.current, node);
      overflowNodeRef.current = node;
    },
    [observeReplacement],
  );

  useEffect(() => {
    const onResize = () => schedule();
    if (typeof ResizeObserver === 'function') {
      observerRef.current = new ResizeObserver(schedule);
      if (containerRef.current)
        observerRef.current.observe(containerRef.current);
      itemNodesRef.current.forEach((node) =>
        observerRef.current?.observe(node),
      );
      if (overflowNodeRef.current)
        observerRef.current.observe(overflowNodeRef.current);
    } else {
      window.addEventListener('resize', onResize);
    }
    schedule();
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = undefined;
      window.removeEventListener('resize', onResize);
      if (frameRef.current !== undefined)
        cancelAnimationFrame(frameRef.current);
    };
  }, [schedule]);

  return {
    ...measurements,
    setContainerRef,
    getItemRef,
    setOverflowRef,
  };
}
