import { usePointerResize } from '../../_util/usePointerResize';

interface UseColumnPointerResizeOptions {
  columnId: string;
  minWidth?: number;
  currentWidth?: number;
  onResize: (columnId: string, width: number) => void;
  onResizeEnd?: (columnId: string, width: number) => void;
}

interface ColumnResizeValue {
  width: number;
  minWidth: number;
}

export function useColumnPointerResize(options: UseColumnPointerResizeOptions) {
  const resize = usePointerResize<ColumnResizeValue>({
    cursor: 'col-resize',
    getInitialValue: (event) => {
      const header = event.currentTarget.closest('th');
      if (!header) throw new Error('Table resize handle has no header cell.');
      const measuredWidth = header.getBoundingClientRect().width;
      const width =
        Number.isFinite(options.currentWidth) &&
        options.currentWidth !== undefined
          ? options.currentWidth
          : measuredWidth;
      return {
        width,
        minWidth:
          Number.isFinite(options.minWidth) && options.minWidth !== undefined
            ? Math.max(0, options.minWidth)
            : 80,
      };
    },
    getNextValue: (initial, start, current) => ({
      ...initial,
      width: Math.max(
        initial.minWidth,
        initial.width + current.clientX - start.clientX,
      ),
    }),
    onMove: (value) => options.onResize(options.columnId, value.width),
    onCommit: (value) => options.onResizeEnd?.(options.columnId, value.width),
  });
  return {
    isResizing: resize.resizing,
    handlePointerDown: resize.onPointerDown,
  };
}
