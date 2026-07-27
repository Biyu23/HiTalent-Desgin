import { useCallback, useEffect, useRef, useState } from 'react';

interface UseColumnResizeOptions {
  /** 列 key */
  columnKey: string;
  /** 最小宽度 */
  minWidth?: number;
  /** 当前的受控设定宽度 */
  currentWidth?: number;
  /** 列宽变更回调（mousemove 实时触发） */
  onResize: (columnKey: string, width: number) => void;
  /** 列宽拖拽结束回调（mouseup 触发，用于通知 onColumnsChange） */
  onResizeEnd?: (columnKey: string, width: number) => void;
}

interface ResizeState {
  isResizing: boolean;
  startX: number;
  startWidth: number;
}

export function useColumnResize(options: UseColumnResizeOptions) {
  const {
    columnKey,
    minWidth = 80,
    currentWidth,
    onResize,
    onResizeEnd,
  } = options;

  const resizeStateRef = useRef<ResizeState | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const headerRef = useRef<HTMLTableCellElement | null>(null);

  const columnKeyRef = useRef(columnKey);
  columnKeyRef.current = columnKey;
  const minWidthRef = useRef(minWidth);
  minWidthRef.current = minWidth;
  const currentWidthRef = useRef(currentWidth);
  currentWidthRef.current = currentWidth;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;
  const lastWidthRef = useRef<number>(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 阻止事件冒泡到 dnd-kit 的 Sortable 容器以及默认选中行为
      e.preventDefault();
      e.stopPropagation();

      const th = (e.target as HTMLElement).closest('th');
      if (!th) return;

      const startWidth =
        currentWidthRef.current ?? th.getBoundingClientRect().width;
      lastWidthRef.current = startWidth;

      resizeStateRef.current = {
        isResizing: true,
        startX: e.clientX,
        startWidth,
      };
      setIsResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [],
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || !state.isResizing) return;
      const diff = e.clientX - state.startX;
      const newWidth = Math.max(minWidthRef.current, state.startWidth + diff);
      lastWidthRef.current = newWidth;
      onResizeRef.current(columnKeyRef.current, newWidth);
    };

    const handlePointerUp = () => {
      const state = resizeStateRef.current;
      if (!state || !state.isResizing) return;

      onResizeEndRef.current?.(columnKeyRef.current, lastWidthRef.current);
      resizeStateRef.current = null;
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return {
    isResizing,
    headerRef,
    handlePointerDown,
  };
}
