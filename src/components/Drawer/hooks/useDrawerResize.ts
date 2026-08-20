import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawerPlacement, DrawerResizableConfig } from '../type';
import { getDrawerAxis } from '../utils/placement';
import {
  clampSize,
  DEFAULT_DRAWER_SIZE,
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
  panelRef?: React.RefObject<HTMLDivElement | null>;
  currentSize?: number | string;
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
  panelRef,
  currentSize,
  onSizeChange,
}: UseDrawerResizeOptions) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const optionsRef = useRef({
    placement,
    minSize,
    maxSize,
    config,
    panelRef,
    currentSize,
    onSizeChange,
  });
  optionsRef.current = {
    placement,
    minSize,
    maxSize,
    config,
    panelRef,
    currentSize,
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
      //当前面板的打开方式
      const currentPlacement = optionsRef.current.placement;
      const axis = getDrawerAxis(currentPlacement);

      const contentWrapper = optionsRef.current.panelRef?.current;

      const rawWrapperRect = contentWrapper?.getBoundingClientRect();
      const rawWrapperSize = rawWrapperRect
        ? getAxisSize(rawWrapperRect, axis)
        : undefined;

      const numericCurrentSize =
        typeof optionsRef.current.currentSize === 'number'
          ? optionsRef.current.currentSize
          : undefined;

      const wrapperSize =
        rawWrapperSize && rawWrapperSize > 20
          ? rawWrapperSize
          : numericCurrentSize ?? DEFAULT_DRAWER_SIZE;
      // 测量抽屉可用的最大容器尺寸。
      // contentWrapper 是 .ant-drawer-content，其 offsetParent 是
      // .ant-drawer-content-wrapper（抽屉面板自身，宽度即当前抽屉宽度），
      // 再往上一层才是 .ant-drawer 根节点——全屏抽屉时为视口，
      // 局部挂载(getContainer={false})时为宿主容器。
      const wrapperEl = contentWrapper?.offsetParent as HTMLElement | null;
      const containerEl =
        (wrapperEl?.offsetParent as HTMLElement | null) ??
        wrapperEl?.parentElement ??
        document.documentElement;

      const containerRect = containerEl?.getBoundingClientRect();
      const fallbackContainerSize =
        axis === 'horizontal'
          ? window.innerWidth || document.documentElement.clientWidth
          : window.innerHeight || document.documentElement.clientHeight;

      const measuredContainerSize = containerRect
        ? getAxisSize(containerRect, axis)
        : undefined;

      const containerSize =
        measuredContainerSize && measuredContainerSize > 50
          ? measuredContainerSize
          : fallbackContainerSize;

      event.preventDefault();
      event.stopPropagation();

      const rawMinSize = toValidNumber(optionsRef.current.minSize);
      const configuredMinSize =
        rawMinSize !== undefined && rawMinSize > 0
          ? rawMinSize
          : DEFAULT_MIN_DRAWER_SIZE;

      const rawMaxSize = toValidNumber(optionsRef.current.maxSize);
      const configuredMaxSize =
        rawMaxSize !== undefined && rawMaxSize > 0 ? rawMaxSize : containerSize;

      const effectiveMinSize = Math.max(
        10,
        Math.min(configuredMinSize, containerSize),
      );
      const effectiveMaxSize = Math.max(
        effectiveMinSize,
        Math.min(configuredMaxSize, containerSize),
      );
      const startSize = clampSize(
        wrapperSize,
        effectiveMinSize,
        effectiveMaxSize,
      );

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
        startSize,
        minSize: effectiveMinSize,
        maxSize: effectiveMaxSize,
        lastSize: startSize,
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
