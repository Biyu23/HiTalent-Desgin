import type { MinimizePosition } from './type';

const containerRefCount = new Map<string, number>();

const getContainerId = (position: MinimizePosition, dockPrefixCls: string) =>
  `${dockPrefixCls}-container-${position}`;

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

export const getExistingScrollWrapper = (
  position: MinimizePosition,
  dockPrefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const container = document.getElementById(
    getContainerId(position, dockPrefixCls),
  );
  if (!container) return null;
  return container.querySelector(
    `.${dockPrefixCls}-scroll-wrapper`,
  ) as HTMLElement | null;
};

export const ensureScrollWrapper = (
  position: MinimizePosition,
  dockPrefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const existing = getExistingScrollWrapper(position, dockPrefixCls);
  if (existing) return existing;

  const container = document.createElement('div');
  container.id = getContainerId(position, dockPrefixCls);
  container.className = `${dockPrefixCls}-container ${dockPrefixCls}-container-${position}`;

  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = `${dockPrefixCls}-scroll-wrapper`;
  container.appendChild(scrollWrapper);

  document.body.appendChild(container);
  return scrollWrapper;
};

export const getMinimizeContainerId = getContainerId;
