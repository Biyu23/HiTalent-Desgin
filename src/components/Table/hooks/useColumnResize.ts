import { useCallback, useEffect, useRef } from 'react';
import { usePointerResize } from '../../../hooks';
import type { TableColumnKey } from '../type';
import { getTableViewport } from '../utils/dragPreview';

interface UseColumnResizeOptions {
  columnKey: TableColumnKey;
  disabled?: boolean;
  minWidth?: number;
  previewClassName: string;
  onResizeEnd: (key: TableColumnKey, width: number) => void;
  onCancel: () => void;
}

/** 单次指针会话的初始布局；移动时只由坐标差推导新宽度。 */
interface ColumnResizeValue {
  width: number;
  minWidth: number;
  direction: number;
  root: HTMLElement;
  left: number;
  top: number;
  height: number;
}

/** 拖动阶段只更新参考线 DOM，松手一次提交列宽，取消和卸载负责移除参考线。 */
export function useColumnResize(options: UseColumnResizeOptions) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const clearPreview = useCallback(() => {
    previewRef.current?.remove();
    previewRef.current = null;
  }, []);
  useEffect(() => clearPreview, [clearPreview]);
  return usePointerResize<ColumnResizeValue>({
    cursor: 'col-resize',
    disabled: options.disabled,
    getInitialValue: (event) => {
      const header = event.currentTarget.closest('th');
      if (!header) throw new Error('Table resize handle has no header cell.');
      const root = header.closest<HTMLElement>('[data-table-root]');
      if (!root) throw new Error('Table resize handle has no table root.');
      const rect = header.getBoundingClientRect();
      const bounds = root.getBoundingClientRect();
      const direction =
        header.ownerDocument.defaultView?.getComputedStyle(header).direction ===
        'rtl'
          ? -1
          : 1;
      return {
        width: rect.width,
        minWidth: Math.max(0, options.minWidth ?? 80),
        direction,
        root,
        left: (direction === 1 ? rect.left : rect.right) - bounds.left,
        top: rect.top - bounds.top,
        height: Math.max(
          rect.height,
          Math.min(
            getTableViewport(root).getBoundingClientRect().bottom,
            header.ownerDocument.defaultView?.innerHeight ?? bounds.bottom,
          ) - rect.top,
        ),
      };
    },
    onStart: (value) => {
      clearPreview();
      // 拖动仅更新参考线，松手后再交由 Antd 一次性计算列宽和固定列偏移。
      const preview = value.root.ownerDocument.createElement('div');
      preview.className = options.previewClassName;
      preview.setAttribute('data-table-resize-preview', '');
      preview.setAttribute('aria-hidden', 'true');
      preview.style.left = `${value.left}px`;
      preview.style.top = `${value.top}px`;
      preview.style.height = `${value.height}px`;
      preview.style.transform = `translateX(${
        value.width * value.direction
      }px)`;
      value.root.appendChild(preview);
      previewRef.current = preview;
    },
    getNextValue: (initial, start, current) => ({
      ...initial,
      width: Math.max(
        initial.minWidth,
        initial.width + (current.clientX - start.clientX) * initial.direction,
      ),
    }),
    onMove: (value) => {
      if (previewRef.current)
        previewRef.current.style.transform = `translateX(${
          value.width * value.direction
        }px)`;
    },
    onCommit: (value) => {
      clearPreview();
      options.onResizeEnd(options.columnKey, value.width);
    },
    onCancel: () => {
      clearPreview();
      options.onCancel();
    },
  });
}
