import { usePointerResize } from '../../../hooks';
import type { ModalResizableConfig } from '../type';
import type { ModalWindowSize } from '../types/internal';

interface ResizeValue extends ModalWindowSize {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 200;

export function useModalPointerResize(options: {
  modal: HTMLElement | null;
  antdPrefixCls: string;
  resizable?: boolean | ModalResizableConfig;
  active: boolean;
  setSize: (size: ModalWindowSize) => void;
}) {
  const { modal, antdPrefixCls, resizable, active, setSize } = options;
  const config = typeof resizable === 'object' ? resizable : undefined;
  return usePointerResize<ResizeValue>({
    cursor: 'nwse-resize',
    disabled: !active,
    getInitialValue: () => {
      // 缩放把手仅在内容节点挂载后渲染。
      const rect = modal!.getBoundingClientRect();
      const root =
        modal!.closest(`.${antdPrefixCls}-modal-root`) ||
        modal!.closest(`.${antdPrefixCls}-modal-wrap`);
      const container = root?.parentElement;
      let bounds = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      if (
        container &&
        container !== document.body &&
        container !== document.documentElement
      ) {
        const containerRect = container.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
          bounds = containerRect;
        }
      }
      const maxWidth = Math.max(
        1,
        Math.min(
          config?.maxWidth ?? bounds.width,
          bounds.width,
          bounds.right - rect.left,
        ),
      );
      const maxHeight = Math.max(
        1,
        Math.min(
          config?.maxHeight ?? bounds.height,
          bounds.height,
          bounds.bottom - rect.top,
        ),
      );
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        minWidth: Math.min(config?.minWidth ?? DEFAULT_MIN_WIDTH, maxWidth),
        minHeight: Math.min(config?.minHeight ?? DEFAULT_MIN_HEIGHT, maxHeight),
        maxWidth,
        maxHeight,
      };
    },
    getNextValue: (initial, start, current) => ({
      ...initial,
      width: Math.min(
        initial.maxWidth,
        Math.max(
          initial.minWidth,
          Math.round(initial.width + current.clientX - start.clientX),
        ),
      ),
      height: Math.min(
        initial.maxHeight,
        Math.max(
          initial.minHeight,
          Math.round(initial.height + current.clientY - start.clientY),
        ),
      ),
    }),
    onStart: config?.onResizeStart,
    onMove: (value) => {
      const size = { width: value.width, height: value.height };
      setSize(size);
      config?.onResize?.(size);
    },
    onCommit: config?.onResizeEnd,
    onCancel: config?.onResizeEnd,
  });
}
