import { useCallback, useEffect, useRef } from 'react';

import type { ModalWindowSize } from './useModalWindowState';

interface UseModalResizeOptions {
  modalRef: React.RefObject<HTMLElement>;
  resizable: boolean;
  active: boolean;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
}

interface ResizeState {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  minWidth: number;
  minHeight: number;
  lastSize: ModalWindowSize;
  bodyUserSelect: string;
  bodyCursor: string;
  cleanupListeners: () => void;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 200;

/**
 * 处理 Modal 右下角缩放，包含尺寸边界与全局样式恢复。
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
    resizeStateRef.current = null;
    resizingRef.current = false;
    optionsRef.current.setResizing(false);
    restoreBodyStyle(state);
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

    const width = Math.max(state.minWidth, rawWidth);
    const height = Math.max(state.minHeight, rawHeight);

    if (width !== state.lastSize.width || height !== state.lastSize.height) {
      state.lastSize = { width, height };
      optionsRef.current.setSize(state.lastSize);
    }
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!active || !optionsRef.current.resizable || resizeStateRef.current)
        return;
      const modal = modalRef.current;
      if (!modal) return;

      event.preventDefault();
      event.stopPropagation();
      const rect = modal.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;

      const minWidth = Math.min(DEFAULT_MIN_WIDTH, Math.floor(rect.width));
      const minHeight = Math.min(DEFAULT_MIN_HEIGHT, Math.floor(rect.height));

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
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        minWidth,
        minHeight,
        lastSize: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        bodyUserSelect: document.body.style.userSelect,
        bodyCursor: document.body.style.cursor,
        cleanupListeners,
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
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [active, finishResize, handlePointerMove, modalRef],
  );

  useEffect(() => {
    if (!active) finishResize();
  }, [active, finishResize]);

  useEffect(() => () => finishResize(), [finishResize]);

  return { handlePointerDown, resizingRef };
};
