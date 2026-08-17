import { useCallback, useEffect, useRef } from 'react';
import type { ModalResizableConfig } from '../type';
import type { ModalWindowSize } from '../types/internal';

interface UseModalResizeOptions {
  modalRef: React.RefObject<HTMLElement>;
  resizable?: boolean | ModalResizableConfig;
  active: boolean;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
}

interface ResizeState {
  handleEl?: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  lastSize: ModalWindowSize;
  bodyUserSelect: string;
  bodyCursor: string;
  cleanupListeners: () => void;
  onResizeEnd?: () => void;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 200;

/**
 * 获取 Modal 所处的容器边界（局部容器或全局视口）。
 */
const getContainerBounds = (el: HTMLElement) => {
  const modalRoot =
    el.closest('.ant-modal-root') || el.closest('.ant-modal-wrap');
  const container = modalRoot?.parentElement;
  if (
    container &&
    container !== document.body &&
    container !== document.documentElement
  ) {
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }
  }
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  return {
    left: 0,
    top: 0,
    right: viewWidth,
    bottom: viewHeight,
    width: viewWidth,
    height: viewHeight,
  };
};

/**
 * 处理 Modal 右下角缩放，严格限制在容器可用最大宽高内，包含尺寸边界与全局样式恢复。
 */
export const useModalResize = ({
  modalRef,
  resizable,
  active,
  setSize,
  setResizing,
}: UseModalResizeOptions) => {
  const resizeStateRef = useRef<ResizeState | null>(null);
  const resizingRef = useRef(false);
  const optionsRef = useRef({
    resizable,
    setSize,
    setResizing,
  });
  optionsRef.current = {
    resizable,
    setSize,
    setResizing,
  };

  const restoreBodyStyle = useCallback((state: ResizeState) => {
    document.body.style.userSelect = state.bodyUserSelect;
    document.body.style.cursor = state.bodyCursor;
  }, []);

  const finishResize = useCallback(() => {
    const state = resizeStateRef.current;
    if (!state) return;
    state.cleanupListeners();
    try {
      state.handleEl?.releasePointerCapture?.(state.pointerId);
    } catch {
      // ignore
    }
    resizeStateRef.current = null;
    resizingRef.current = false;
    optionsRef.current.setResizing(false);
    restoreBodyStyle(state);
    state.onResizeEnd?.();
  }, [restoreBodyStyle]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const state = resizeStateRef.current;
    if (
      !state ||
      (state.pointerId !== undefined && event.pointerId !== state.pointerId)
    )
      return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    const rawWidth = Math.round(state.startWidth + deltaX);
    const rawHeight = Math.round(state.startHeight + deltaY);

    const width = Math.min(Math.max(state.minWidth, rawWidth), state.maxWidth);
    const height = Math.min(
      Math.max(state.minHeight, rawHeight),
      state.maxHeight,
    );

    if (width !== state.lastSize.width || height !== state.lastSize.height) {
      state.lastSize = { width, height };
      optionsRef.current.setSize(state.lastSize);
      const resizableConfig =
        typeof optionsRef.current.resizable === 'object'
          ? optionsRef.current.resizable
          : undefined;
      resizableConfig?.onResize?.(state.lastSize);
    }
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!active || !optionsRef.current.resizable || resizeStateRef.current)
        return;
      const modal = modalRef.current;
      if (!modal) return;

      const rect = modal.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;

      const containerBounds = getContainerBounds(modal);

      const resizableConfig =
        typeof optionsRef.current.resizable === 'object'
          ? optionsRef.current.resizable
          : undefined;

      const configuredMinWidth = resizableConfig?.minWidth ?? DEFAULT_MIN_WIDTH;
      const configuredMinHeight =
        resizableConfig?.minHeight ?? DEFAULT_MIN_HEIGHT;

      // 计算弹窗在容器右侧和底部允许扩展的最大可用空间
      const maxAvailableWidth = Math.max(
        configuredMinWidth,
        Math.floor(containerBounds.right - rect.left),
      );
      const maxAvailableHeight = Math.max(
        configuredMinHeight,
        Math.floor(containerBounds.bottom - rect.top),
      );

      // 同时受限于容器自身的绝对宽高与用户配置的 maxWidth/maxHeight
      const maxContainerWidth = Math.min(
        maxAvailableWidth,
        containerBounds.width,
      );
      const maxContainerHeight = Math.min(
        maxAvailableHeight,
        containerBounds.height,
      );

      const effectiveMaxWidth =
        resizableConfig?.maxWidth !== undefined
          ? Math.min(resizableConfig.maxWidth, maxContainerWidth)
          : maxContainerWidth;
      const effectiveMaxHeight =
        resizableConfig?.maxHeight !== undefined
          ? Math.min(resizableConfig.maxHeight, maxContainerHeight)
          : maxContainerHeight;

      const minWidth = Math.min(
        configuredMinWidth,
        Math.floor(rect.width),
        effectiveMaxWidth,
      );
      const minHeight = Math.min(
        configuredMinHeight,
        Math.floor(rect.height),
        effectiveMaxHeight,
      );

      event.preventDefault();
      event.stopPropagation();

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

      const state: ResizeState = {
        handleEl: event.currentTarget,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        minWidth,
        minHeight,
        maxWidth: effectiveMaxWidth,
        maxHeight: effectiveMaxHeight,
        lastSize: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        bodyUserSelect: document.body.style.userSelect,
        bodyCursor: document.body.style.cursor,
        cleanupListeners,
        onResizeEnd: resizableConfig?.onResizeEnd,
      };
      resizeStateRef.current = state;
      resizingRef.current = true;
      optionsRef.current.setResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('blur', handleBlur);
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // ignore
      }
      try {
        resizableConfig?.onResizeStart?.();
      } catch (error) {
        finishResize();
        throw error;
      }
    },
    [active, finishResize, handlePointerMove, modalRef],
  );

  useEffect(() => {
    if (!active) finishResize();
  }, [active, finishResize]);

  useEffect(() => () => finishResize(), [finishResize]);

  return { handlePointerDown, resizingRef };
};
