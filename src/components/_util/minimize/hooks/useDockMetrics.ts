import type React from 'react';
import { useCallback, useLayoutEffect, useState } from 'react';

export interface DockMetrics {
  contentHeight: number;
  latestHeight: number;
}

export interface UseDockMetricsOptions {
  contentRef: React.RefObject<HTMLElement>;
  latestRef: React.RefObject<HTMLElement>;
  revision: string;
  fallbackHeight: number;
}

const useDockMetrics = ({
  contentRef,
  latestRef,
  revision,
  fallbackHeight,
}: UseDockMetricsOptions): DockMetrics => {
  const [metrics, setMetrics] = useState<DockMetrics>(() => ({
    contentHeight: fallbackHeight,
    latestHeight: fallbackHeight,
  }));

  const measure = useCallback(() => {
    const content = contentRef.current;
    const latest = latestRef.current;
    if (!content || !latest) return;

    const latestHeight = latest.offsetHeight || fallbackHeight;
    const contentHeight =
      content.scrollHeight || content.offsetHeight || latestHeight;

    setMetrics((current) =>
      current.contentHeight === contentHeight &&
      current.latestHeight === latestHeight
        ? current
        : { contentHeight, latestHeight },
    );
  }, [contentRef, fallbackHeight, latestRef]);

  useLayoutEffect(measure, [measure, revision]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const latest = latestRef.current;
    if (!content || !latest) return undefined;

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(content);
      observer.observe(latest);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [contentRef, latestRef, measure]);

  return metrics;
};

export default useDockMetrics;
