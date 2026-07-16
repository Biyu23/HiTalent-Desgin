import type { MinimizePosition } from '../type';

/**
 * 容器引用计数表：追踪每个容器中挂载的 dock 实例数量。
 * 当计数归零时才真正移除 DOM 节点，避免 React 并发模式下
 * 多个实例同时卸载时的竞态条件。
 */
const containerRefCount = new Map<string, number>();

export const incrementRefCount = (containerId: string): void => {
  containerRefCount.set(
    containerId,
    (containerRefCount.get(containerId) || 0) + 1,
  );
};

export const decrementRefCount = (containerId: string): number => {
  const next = (containerRefCount.get(containerId) || 1) - 1;
  if (next <= 0) {
    containerRefCount.delete(containerId);
    return 0;
  }
  containerRefCount.set(containerId, next);
  return next;
};

/**
 * 获取已存在的 scroll wrapper 元素。
 * 每个容器内部包含一个 scroll wrapper 用于溢出滚动，
 * 所有 dock 通过 portal 渲染进 scroll wrapper 而非直接渲染进容器。
 */
export const getExistingScrollWrapper = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const containerId = `${prefixCls}-minimize-container-${position}`;
  const container = document.getElementById(containerId);
  if (!container) return null;
  return container.querySelector(
    `.${prefixCls}-minimize-scroll-wrapper`,
  ) as HTMLElement | null;
};

/**
 * 确保容器及其 scroll wrapper 存在，返回 scroll wrapper。
 *
 * DOM 结构：
 *   container (position:fixed, pointer-events:none)
 *     └── scroll-wrapper (overflow-y:auto, pointer-events:auto)
 *           ├── dock-1  ← portal target
 *           ├── dock-2
 *           └── dock-N
 */
export const ensureScrollWrapper = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const existing = getExistingScrollWrapper(position, prefixCls);
  if (existing) return existing;

  const containerId = `${prefixCls}-minimize-container-${position}`;
  const container = document.createElement('div');
  container.id = containerId;
  container.className = `${prefixCls}-minimize-dock-container ${prefixCls}-minimize-dock-${position}`;

  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = `${prefixCls}-minimize-scroll-wrapper`;
  container.appendChild(scrollWrapper);

  document.body.appendChild(container);
  return scrollWrapper;
};
