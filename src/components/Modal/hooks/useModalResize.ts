import { useCallback, useEffect, useRef } from 'react';
import type { ModalResizableConfig } from '../type';
import type { ModalWindowSize } from './useModalWindowState';

interface UseModalResizeOptions {
  modalRef: React.RefObject<HTMLElement>;
  resizable: ModalResizableConfig | null;
  active: boolean;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
}

interface ResizeState {
  startX: number;
  startY: number;
  startRect: DOMRect;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  lastSize: ModalWindowSize;
  bodyUserSelect: string;
  bodyCursor: string;
  cleanupListeners: () => void;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 200;

const toSafeNumber = (value: number | undefined): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, Math.min(min, max)), max);

/**
 * 处理 Modal 右下角缩放，包含尺寸边界、视口约束与全局样式恢复。
 */
export const useModalResize = ({
  modalRef,
  resizable,
  active,
  setSize,
  setResizing,
}: UseModalResizeOptions) => {
  const resizeStateRef = useRef<ResizeState | null>(null);
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
    resizeStateRef.current = null;
    state.cleanupListeners();
    optionsRef.current.setResizing(false);
    restoreBodyStyle(state);
  }, [restoreBodyStyle]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;

    const width = clamp(
      state.startRect.width + event.clientX - state.startX,
      state.minWidth,
      state.maxWidth,
    );
    const height = clamp(
      state.startRect.height + event.clientY - state.startY,
      state.minHeight,
      state.maxHeight,
    );

    if (width !== state.lastSize.width || height !== state.lastSize.height) {
      state.lastSize = { width, height };
      optionsRef.current.setSize(state.lastSize);
    }
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const config = optionsRef.current.resizable;
      if (!active || !config) return;
      const modal = modalRef.current;
      if (!modal) return;

      event.preventDefault();
      event.stopPropagation();
      const rect = modal.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;

      const viewportMaxWidth = document.documentElement.clientWidth - rect.left;
      const viewportMaxHeight =
        document.documentElement.clientHeight - rect.top;
      const configuredMinWidth =
        toSafeNumber(config.minWidth) ?? DEFAULT_MIN_WIDTH;
      const configuredMinHeight =
        toSafeNumber(config.minHeight) ?? DEFAULT_MIN_HEIGHT;
      const minWidth = Math.min(configuredMinWidth, viewportMaxWidth);
      const minHeight = Math.min(configuredMinHeight, viewportMaxHeight);
      const maxWidth = Math.min(
        Math.max(toSafeNumber(config.maxWidth) ?? viewportMaxWidth, minWidth),
        viewportMaxWidth,
      );
      const maxHeight = Math.min(
        Math.max(
          toSafeNumber(config.maxHeight) ?? viewportMaxHeight,
          minHeight,
        ),
        viewportMaxHeight,
      );
      const handlePointerUp = () => finishResize();
      const cleanupListeners = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointercancel', handlePointerUp);
        window.removeEventListener('blur', handlePointerUp);
      };

      resizeStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startRect: rect,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        lastSize: { width: rect.width, height: rect.height },
        bodyUserSelect: document.body.style.userSelect,
        bodyCursor: document.body.style.cursor,
        cleanupListeners,
      };
      optionsRef.current.setResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('blur', handlePointerUp);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [active, finishResize, handlePointerMove, modalRef],
  );

  useEffect(() => {
    if (!active) finishResize();
  }, [active, finishResize]);

  useEffect(() => () => finishResize(), [finishResize]);

  return { handlePointerDown };
};
