import { useCallback, useEffect, useRef, useState } from 'react';
import { areMapsEqual } from '../../../utils';

/**
 * 隐藏测量区测量结果数据结构
 */
interface Measurements {
  /** 容器内容区域可用宽度（px，已扣除左右 padding） */
  containerWidth: number | null;
  /** 所有平铺项在 DOM 中的实测宽度映射 Map<key, width> */
  itemWidths: ReadonlyMap<string, number>;
  /** “更多”触发器按钮的实测宽度（px） */
  overflowWidth: number | null;
}

const initialMeasurements: Measurements = {
  containerWidth: null,
  itemWidths: new Map(),
  overflowWidth: null,
};

/**
 * 响应式尺寸实时测量 Hook：
 *
 * 核心原理：
 * 1. 离屏测量（Offscreen Measurement）：
 *    在独立的隐藏测量区（带有 `visibility: hidden; contain: strict;`）中渲染所有操作项与“更多”按钮，
 *    获取各按钮在当前字体、图标与内边距下的物理渲染像素尺寸，不影响主界面的视觉呈现。
 *
 * 2. 批量监听与节流（ResizeObserver + requestAnimationFrame）：
 *    监听容器宽度以及测量区中各个按钮节点的尺寸变化。
 *    通过 `requestAnimationFrame` 将同一帧内的多次 resize 事件合并为单次批量读取与比对，
 *    避免引起高频的 layout thrashing（强制同步布局）。
 *
 * 3. Ref 回调缓存（Stable Ref Handlers）：
 *    通过 `callbacksRef` 缓存各 item 的 ref callback，避免每次 re-render 创建新函数导致 DOM 反复重新绑定。
 *
 * @param enabled 是否开启尺寸测量（非自适应模式下可完全停用以节省性能）
 */
export function useResponsiveMeasurements(enabled = true) {
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

  /**
   * 批量读取 DOM 真实几何尺寸并比对更新
   */
  const measure = useCallback(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const itemWidths = new Map<string, number>();

    // 批量读取各 item 的物理渲染宽度
    itemNodesRef.current.forEach((node, key) => {
      itemWidths.set(key, node.getBoundingClientRect().width);
    });

    // 计算容器内容区可用宽度（扣除 padding 干扰）
    const containerWidth = container
      ? Math.max(
          0,
          container.clientWidth -
            parseFloat(getComputedStyle(container).paddingLeft || '0') -
            parseFloat(getComputedStyle(container).paddingRight || '0'),
        )
      : null;

    // 读取“更多”按钮物理宽度
    const overflowWidth = overflowNodeRef.current
      ? overflowNodeRef.current.getBoundingClientRect().width
      : null;

    // 只有当尺寸发生实质变化时才触发 State 更新与重排计算
    setMeasurements((previous) =>
      previous.containerWidth === containerWidth &&
      previous.overflowWidth === overflowWidth &&
      areMapsEqual(previous.itemWidths, itemWidths)
        ? previous
        : { containerWidth, itemWidths, overflowWidth },
    );
  }, [enabled]);

  /**
   * 利用 requestAnimationFrame 节流调度测量任务
   */
  const schedule = useCallback(() => {
    if (!enabled || frameRef.current !== undefined) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      measure();
    });
  }, [enabled, measure]);

  /**
   * 节点替换或卸载时的 ResizeObserver 重新订阅助手
   */
  const observeReplacement = useCallback(
    (previous: HTMLElement | null, next: HTMLElement | null) => {
      if (!enabled) return;
      if (previous) observerRef.current?.unobserve(previous);
      if (next) observerRef.current?.observe(next);
      schedule();
    },
    [enabled, schedule],
  );

  /**
   * 容器 DOM 节点的绑定回调
   */
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node === containerRef.current) return;
      observeReplacement(containerRef.current, node);
      containerRef.current = node;
    },
    [observeReplacement],
  );

  /**
   * 获取指定 item key 的稳定 ref 绑定回调（带函数缓存与自动注销）
   */
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

  /**
   * “更多”触发器按钮测量 DOM 节点的绑定回调
   */
  const setOverflowRef = useCallback(
    (node: HTMLElement | null) => {
      if (node === overflowNodeRef.current) return;
      observeReplacement(overflowNodeRef.current, node);
      overflowNodeRef.current = node;
    },
    [observeReplacement],
  );

  /**
   * 初始化 ResizeObserver 监听器并绑定所有测量节点
   */
  useEffect(() => {
    if (!enabled) {
      observerRef.current?.disconnect();
      observerRef.current = undefined;
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      return;
    }

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
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [enabled, schedule]);

  return {
    ...measurements,
    setContainerRef,
    getItemRef,
    setOverflowRef,
  };
}
