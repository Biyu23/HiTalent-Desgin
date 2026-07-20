import { useCallback, useEffect, useRef, useState } from 'react';

interface UseColumnResizeOptions {
  /** 列 key */
  columnKey: string;
  /** 最小宽度 */
  minWidth?: number;
  /** 列宽变更回调 */
  onResize: (columnKey: string, width: number) => void;
}

interface ResizeState {
  isResizing: boolean;
  startX: number;
  startWidth: number;
}

/**
 * useColumnResize — 列宽拖拽调整 Hook
 *
 * 在 mousedown 时开始监听全局 mousemove/mouseup，
 * mouseup 或组件卸载时自动清理，避免泄漏。
 *
 * 参考 Modal 的 mouseUpManager 单例模式管理全局 mouseup。
 */
export function useColumnResize(options: UseColumnResizeOptions) {
  const { columnKey, minWidth = 80, onResize } = options;

  const resizeStateRef = useRef<ResizeState | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const headerRef = useRef<HTMLTableCellElement | null>(null);
  const columnKeyRef = useRef(columnKey);
  columnKeyRef.current = columnKey;
  const minWidthRef = useRef(minWidth);
  minWidthRef.current = minWidth;
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  // ---- mousedown: 开始调整 ----
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const th = (e.target as HTMLElement).closest('th');
    if (!th) return;

    const currentWidth = th.getBoundingClientRect().width;

    resizeStateRef.current = {
      isResizing: true,
      startX: e.clientX,
      startWidth: currentWidth,
    };

    setIsResizing(true);

    // 给 body 添加全局样式防止文本选择
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  // ---- mousemove: 全局监听 ----
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = resizeStateRef.current;
      if (!state || !state.isResizing) return;

      const diff = e.clientX - state.startX;
      const newWidth = Math.max(minWidthRef.current, state.startWidth + diff);
      onResizeRef.current(columnKeyRef.current, newWidth);
    };

    const handleMouseUp = () => {
      const state = resizeStateRef.current;
      if (!state || !state.isResizing) return;

      resizeStateRef.current = null;
      setIsResizing(false);

      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 清理全局状态
      if (resizeStateRef.current) {
        resizeStateRef.current = null;
        setIsResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, []);

  return {
    isResizing,
    headerRef,
    handleMouseDown,
  };
}
