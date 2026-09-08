import { usePointerResize } from '../../../hooks';
import type { TableColumnKey } from '../type';

interface UseColumnResizeOptions {
  columnKey: TableColumnKey;
  minWidth?: number;
  onResize: (key: TableColumnKey, width: number) => void;
  onResizeEnd: (key: TableColumnKey, width: number) => void;
  onCancel: () => void;
}

interface ColumnResizeValue {
  width: number;
  minWidth: number;
}

export function useColumnResize(options: UseColumnResizeOptions) {
  return usePointerResize<ColumnResizeValue>({
    cursor: 'col-resize',
    getInitialValue: (event) => {
      const header = event.currentTarget.closest('th');
      if (!header) throw new Error('Table resize handle has no header cell.');
      const measuredWidth = header.getBoundingClientRect().width;
      return {
        width: measuredWidth,
        minWidth: Math.max(0, options.minWidth ?? 80),
      };
    },
    getNextValue: (initial, start, current) => ({
      ...initial,
      width: Math.max(
        initial.minWidth,
        initial.width + current.clientX - start.clientX,
      ),
    }),
    onMove: (value) => options.onResize(options.columnKey, value.width),
    onCommit: (value) => options.onResizeEnd(options.columnKey, value.width),
    onCancel: options.onCancel,
  });
}
