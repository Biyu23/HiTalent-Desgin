import { useCallback, useEffect, useRef, useState } from 'react';

interface UseColumnResizeOptions {
  columnId: string;
  minWidth?: number;
  currentWidth?: number;
  onResize: (columnId: string, width: number) => void;
  onResizeEnd?: (columnId: string, width: number) => void;
}

interface ResizeState {
  startX: number;
  startWidth: number;
  lastWidth: number;
  bodyUserSelect: string;
  bodyCursor: string;
}

export function useColumnResize(options: UseColumnResizeOptions) {
  const resizeStateRef = useRef<ResizeState | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const restoreBodyStyle = useCallback((state: ResizeState) => {
    document.body.style.userSelect = state.bodyUserSelect;
    document.body.style.cursor = state.bodyCursor;
  }, []);

  const finishResize = useCallback(
    (commit: boolean) => {
      const state = resizeStateRef.current;
      if (!state) return;
      if (commit && Number.isFinite(state.lastWidth)) {
        optionsRef.current.onResizeEnd?.(
          optionsRef.current.columnId,
          state.lastWidth,
        );
      }
      resizeStateRef.current = null;
      setIsResizing(false);
      restoreBodyStyle(state);
    },
    [restoreBodyStyle],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const header = event.currentTarget.closest('th');
      if (!header) return;
      const configuredWidth = optionsRef.current.currentWidth;
      const measuredWidth = header.getBoundingClientRect().width;
      const startWidth =
        typeof configuredWidth === 'number' && Number.isFinite(configuredWidth)
          ? configuredWidth
          : measuredWidth;
      if (!Number.isFinite(startWidth)) return;

      resizeStateRef.current = {
        startX: event.clientX,
        startWidth,
        lastWidth: startWidth,
        bodyUserSelect: document.body.style.userSelect,
        bodyCursor: document.body.style.cursor,
      };
      setIsResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;
      const configuredMin = optionsRef.current.minWidth;
      const safeMin =
        typeof configuredMin === 'number' && Number.isFinite(configuredMin)
          ? Math.max(0, configuredMin)
          : 80;
      const width = Math.max(
        safeMin,
        state.startWidth + event.clientX - state.startX,
      );
      if (!Number.isFinite(width)) return;
      state.lastWidth = width;
      optionsRef.current.onResize(optionsRef.current.columnId, width);
    };
    const handlePointerUp = () => finishResize(true);
    const handlePointerCancel = () => finishResize(false);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handlePointerCancel);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handlePointerCancel);
      const state = resizeStateRef.current;
      if (state) restoreBodyStyle(state);
    };
  }, [finishResize, restoreBodyStyle]);

  return { isResizing, handlePointerDown };
}
