import { usePointerResize } from '../../_util/usePointerResize';
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

function getContainerBounds(element: HTMLElement, antdPrefixCls: string) {
  const root =
    element.closest(`.${antdPrefixCls}-modal-root`) ||
    element.closest(`.${antdPrefixCls}-modal-wrap`);
  const container = root?.parentElement;
  if (
    container &&
    container !== document.body &&
    container !== document.documentElement
  ) {
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  return new DOMRect(
    0,
    0,
    window.innerWidth || document.documentElement.clientWidth,
    window.innerHeight || document.documentElement.clientHeight,
  );
}

export function useModalPointerResize(options: {
  modalRef: React.RefObject<HTMLElement>;
  antdPrefixCls: string;
  resizable?: boolean | ModalResizableConfig;
  active: boolean;
  setSize: (size: ModalWindowSize) => void;
}) {
  const { modalRef, antdPrefixCls, resizable, active, setSize } = options;
  const config = typeof resizable === 'object' ? resizable : undefined;
  return usePointerResize<ResizeValue>({
    cursor: 'nwse-resize',
    disabled: !active,
    getInitialValue: () => {
      const modal = modalRef.current;
      if (!modal) throw new Error('Modal resize target is unavailable.');
      const rect = modal.getBoundingClientRect();
      const bounds = getContainerBounds(modal, antdPrefixCls);
      const configuredMinWidth = config?.minWidth ?? DEFAULT_MIN_WIDTH;
      const configuredMinHeight = config?.minHeight ?? DEFAULT_MIN_HEIGHT;
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
        minWidth: Math.min(configuredMinWidth, maxWidth),
        minHeight: Math.min(configuredMinHeight, maxHeight),
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
    onStart: () => config?.onResizeStart?.(),
    onMove: (value) => {
      const size = { width: value.width, height: value.height };
      setSize(size);
      config?.onResize?.(size);
    },
    onCommit: () => config?.onResizeEnd?.(),
    onCancel: () => config?.onResizeEnd?.(),
  });
}
