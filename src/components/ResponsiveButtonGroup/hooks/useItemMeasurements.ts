import React, { useCallback, useEffect, useRef, useState } from 'react';
import { areMapsEqual } from '../../../util';

export interface ItemMeasurements {
  containerWidth: number | null;
  itemWidths: ReadonlyMap<React.Key, number>;
  overflowWidths: ReadonlyMap<number, number>;
}

interface UseItemMeasurementsResult extends ItemMeasurements {
  setContainerRef: (node: HTMLDivElement | null) => void;
  getItemMeasureRef: (key: React.Key) => (node: HTMLElement | null) => void;
  getOverflowMeasureRef: (count: number) => (node: HTMLElement | null) => void;
}

const initialMeasurements: ItemMeasurements = {
  containerWidth: null,
  itemWidths: new Map(),
  overflowWidths: new Map(),
};

export function useItemMeasurements(): UseItemMeasurementsResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemNodesRef = useRef(new Map<React.Key, HTMLElement>());
  const overflowNodesRef = useRef(new Map<number, HTMLElement>());
  const itemCallbacksRef = useRef(
    new Map<React.Key, (node: HTMLElement | null) => void>(),
  );
  const overflowCallbacksRef = useRef(
    new Map<number, (node: HTMLElement | null) => void>(),
  );
  const observerRef = useRef<ResizeObserver | null>(null);
  const frameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const [measurements, setMeasurements] =
    useState<ItemMeasurements>(initialMeasurements);

  const measure = useCallback(() => {
    if (!mountedRef.current) return;

    let containerWidth: number | null = null;
    if (containerRef.current) {
      const style = window.getComputedStyle(containerRef.current);
      const horizontalPadding =
        parseFloat(style.paddingLeft || '0') +
        parseFloat(style.paddingRight || '0');
      containerWidth = Math.max(
        0,
        containerRef.current.clientWidth - horizontalPadding,
      );
    }
    const itemWidths = new Map<React.Key, number>();
    const overflowWidths = new Map<number, number>();

    itemNodesRef.current.forEach((node, key) => {
      itemWidths.set(key, node.getBoundingClientRect().width);
    });
    overflowNodesRef.current.forEach((node, count) => {
      overflowWidths.set(count, node.getBoundingClientRect().width);
    });

    setMeasurements((previous) => {
      if (
        previous.containerWidth === containerWidth &&
        areMapsEqual(previous.itemWidths, itemWidths) &&
        areMapsEqual(previous.overflowWidths, overflowWidths)
      ) {
        return previous;
      }

      return { containerWidth, itemWidths, overflowWidths };
    });
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (typeof window === 'undefined' || frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  const replaceObservedNode = useCallback(
    <Key>(nodes: Map<Key, HTMLElement>, key: Key, node: HTMLElement | null) => {
      const previousNode = nodes.get(key);
      if (previousNode === node) return;

      if (previousNode) observerRef.current?.unobserve(previousNode);

      if (node) {
        nodes.set(key, node);
        observerRef.current?.observe(node);
      } else {
        nodes.delete(key);
      }

      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      const previousNode = containerRef.current;
      if (previousNode === node) return;

      if (previousNode) observerRef.current?.unobserve(previousNode);
      containerRef.current = node;
      if (node) observerRef.current?.observe(node);
      scheduleMeasure();
    },
    [scheduleMeasure],
  );

  const setItemMeasureRef = useCallback(
    (key: React.Key, node: HTMLElement | null) => {
      replaceObservedNode(itemNodesRef.current, key, node);
    },
    [replaceObservedNode],
  );

  const setOverflowMeasureRef = useCallback(
    (count: number, node: HTMLElement | null) => {
      replaceObservedNode(overflowNodesRef.current, count, node);
    },
    [replaceObservedNode],
  );

  const getItemMeasureRef = useCallback(
    (key: React.Key) => {
      const cached = itemCallbacksRef.current.get(key);
      if (cached) return cached;

      const callback = (node: HTMLElement | null) => {
        setItemMeasureRef(key, node);
        if (!node) itemCallbacksRef.current.delete(key);
      };
      itemCallbacksRef.current.set(key, callback);
      return callback;
    },
    [setItemMeasureRef],
  );

  const getOverflowMeasureRef = useCallback(
    (count: number) => {
      const cached = overflowCallbacksRef.current.get(count);
      if (cached) return cached;

      const callback = (node: HTMLElement | null) => {
        setOverflowMeasureRef(count, node);
        if (!node) overflowCallbacksRef.current.delete(count);
      };
      overflowCallbacksRef.current.set(count, callback);
      return callback;
    },
    [setOverflowMeasureRef],
  );

  useEffect(() => {
    mountedRef.current = true;
    const handleResize = () => scheduleMeasure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(scheduleMeasure);
      observerRef.current = observer;
      if (containerRef.current) observer.observe(containerRef.current);
      itemNodesRef.current.forEach((node) => observer.observe(node));
      overflowNodesRef.current.forEach((node) => observer.observe(node));
    } else {
      window.addEventListener('resize', handleResize);
    }

    scheduleMeasure();

    return () => {
      mountedRef.current = false;
      observerRef.current?.disconnect();
      observerRef.current = null;
      window.removeEventListener('resize', handleResize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [scheduleMeasure]);

  return {
    ...measurements,
    setContainerRef,
    getItemMeasureRef,
    getOverflowMeasureRef,
  };
}
