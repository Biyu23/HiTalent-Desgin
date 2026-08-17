import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawerPlacement, DrawerResizableConfig } from '../type';
import { getDrawerAxis } from '../utils/placement';
import {
  clampSize,
  DEFAULT_MIN_DRAWER_SIZE,
  getAxisSize,
  getPointerPosition,
  getResizeCursor,
  toValidNumber,
} from '../utils/resize';

interface UseDrawerResizeOptions {
  placement: DrawerPlacement;
  minSize?: number;
  maxSize?: number;
  active: boolean;
  config: DrawerResizableConfig;
  onSizeChange: (size: number) => void;
}

interface ResizeState {
  handleEl?: HTMLElement;
  pointerId: number;
  startPosition: number;
  startSize: number;
  minSize: number;
  maxSize: number;
  lastSize: number;
  bodyUserSelect: string;
  bodyCursor: string;
  cleanupListeners: () => void;
  onResizeEnd?: () => void;
}

/** 处理 Drawer 单轴缩放，包括展开方向、容器边界与全局样式恢复。 */
export const useDrawerResize = ({
  placement,
  minSize,
  maxSize,
  active,
  config,
  onSizeChange,
}: UseDrawerResizeOptions) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const optionsRef = useRef({
    placement,
    minSize,
    maxSize,
    config,
    onSizeChange,
  });
  optionsRef.current = {
    placement,
    minSize,
    maxSize,
    config,
    onSizeChange,
  };

  const finishResize = useCallback(() => {
    const state = resizeStateRef.current;
    if (!state) return;

    resizeStateRef.current = null;
    state.cleanupListeners();
    try {
      state.handleEl?.releasePointerCapture?.(state.pointerId);
    } catch {
      // ignore
    }
    document.body.style.userSelect = state.bodyUserSelect;
    document.body.style.cursor = state.bodyCursor;
    setIsResizing(false);
    state.onResizeEnd?.();
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const state = resizeStateRef.current;
    if (!state || event.pointerId !== state.pointerId) return;

    const currentPlacement = optionsRef.current.placement;
    const axis = getDrawerAxis(currentPlacement);
    const delta = getPointerPosition(event, axis) - state.startPosition;
    const direction =
      currentPlacement === 'right' || currentPlacement === 'bottom' ? -1 : 1;
    const nextSize = clampSize(
      state.startSize + delta * direction,
      state.minSize,
      state.maxSize,
    );

    if (nextSize === state.lastSize) return;
    state.lastSize = nextSize;
    optionsRef.current.onSizeChange(nextSize);
    optionsRef.current.config.onResize?.(nextSize);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!active || resizeStateRef.current) return;

      const handleEl = event.currentTarget;
      const contentWrapper =
        handleEl.closest<HTMLElement>('.ant-drawer-content-wrapper') ??
        handleEl.parentElement;
      if (!contentWrapper) return;

      const currentPlacement = optionsRef.current.placement;
      const axis = getDrawerAxis(currentPlacement);
      const wrapperSize = getAxisSize(
        contentWrapper.getBoundingClientRect(),
        axis,
      );

      // 测量抽屉根容器或视口容器尺寸
      const drawerRoot = handleEl.closest<HTMLElement>('.ant-drawer');
      const rootRect = drawerRoot?.getBoundingClientRect();
      const parentRect = drawerRoot?.parentElement?.getBoundingClientRect();

      const measuredContainerSize =
        rootRect && rootRect.width > 0 && rootRect.height > 0
          ? getAxisSize(rootRect, axis)
          : parentRect && parentRect.width > 0 && parentRect.height > 0
          ? getAxisSize(parentRect, axis)
          : undefined;

      const fallbackContainerSize =
        axis === 'horizontal'
          ? document.documentElement.clientWidth
          : document.documentElement.clientHeight;
      const containerSize =
        toValidNumber(measuredContainerSize) || fallbackContainerSize;

      if (toValidNumber(wrapperSize) === undefined || !containerSize) return;

      event.preventDefault();
      event.stopPropagation();

      const rawMinSize = toValidNumber(optionsRef.current.minSize);
      const configuredMinSize =
        rawMinSize !== undefined && rawMinSize > 0
          ? rawMinSize
          : DEFAULT_MIN_DRAWER_SIZE;
      const configuredMaxSize = toValidNumber(optionsRef.current.maxSize);
      const effectiveMaxSize = Math.min(
        configuredMaxSize ?? containerSize,
        containerSize,
      );
      const effectiveMinSize = Math.min(configuredMinSize, effectiveMaxSize);
      const handlePointerUp = (pointerEvent: PointerEvent) => {
        if (pointerEvent.pointerId === event.pointerId) finishResize();
      };
      const handleBlur = () => finishResize();
      const cleanupListeners = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        window.removeEventListener('blur', handleBlur);
      };

      resizeStateRef.current = {
        handleEl,
        pointerId: event.pointerId,
        startPosition: getPointerPosition(event.nativeEvent, axis),
        startSize: wrapperSize,
        minSize: effectiveMinSize,
        maxSize: effectiveMaxSize,
        lastSize: wrapperSize,
        bodyUserSelect: document.body.style.userSelect,
        bodyCursor: document.body.style.cursor,
        cleanupListeners,
        onResizeEnd: optionsRef.current.config.onResizeEnd,
      };

      setIsResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = getResizeCursor(axis);
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('blur', handleBlur);
      try {
        handleEl.setPointerCapture?.(event.pointerId);
      } catch {
        // ignore
      }
      try {
        optionsRef.current.config.onResizeStart?.();
      } catch (error) {
        finishResize();
        throw error;
      }
    },
    [active, finishResize, handlePointerMove],
  );

  useEffect(() => {
    if (!active) finishResize();
  }, [active, finishResize]);

  useEffect(() => finishResize, [finishResize]);

  useEffect(() => {
    finishResize();
  }, [placement, finishResize]);

  return { isResizing, handlePointerDown };
};
