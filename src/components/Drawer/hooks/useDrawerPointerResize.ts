import { useEffect } from 'react';
import { usePointerResize } from '../../../hooks';
import type { DrawerPlacement, DrawerResizableConfig } from '../type';
import { getDrawerAxis } from '../utils/placement';
import {
  clampSize,
  DEFAULT_DRAWER_SIZE,
  DEFAULT_MIN_DRAWER_SIZE,
  toValidNumber,
} from '../utils/resize';

interface DrawerResizeValue {
  size: number;
  min: number;
  max: number;
}

interface UseDrawerPointerResizeOptions {
  placement: DrawerPlacement;
  minSize?: number;
  maxSize?: number;
  active: boolean;
  config?: DrawerResizableConfig;
  currentSize: number | string;
  onSizeChange: (size: number) => void;
}

export interface UseDrawerPointerResizeResult {
  isResizing: boolean;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

export function useDrawerPointerResize(
  options: UseDrawerPointerResizeOptions,
): UseDrawerPointerResizeResult {
  const {
    placement,
    minSize,
    maxSize,
    active,
    config,
    currentSize,
    onSizeChange,
  } = options;
  const axis = getDrawerAxis(placement);
  const dimension = axis === 'horizontal' ? 'width' : 'height';
  const resize = usePointerResize<DrawerResizeValue>({
    cursor: axis === 'horizontal' ? 'col-resize' : 'row-resize',
    disabled: !active,
    getInitialValue: (event) => {
      // 把手固定挂在内容容器下，不受 drawerRender 内部结构影响。
      const wrapper = event.currentTarget.parentElement!;
      const measuredSize = wrapper.getBoundingClientRect()[dimension];
      const startSize =
        measuredSize ||
        (typeof currentSize === 'number' ? currentSize : DEFAULT_DRAWER_SIZE);
      const rect = wrapper.parentElement!.getBoundingClientRect();
      const fallback =
        axis === 'horizontal' ? window.innerWidth : window.innerHeight;
      const containerSize = Math.max(1, rect[dimension] || fallback);
      const configuredMin = toValidNumber(minSize);
      const configuredMax = toValidNumber(maxSize);
      const min = Math.max(
        10,
        Math.min(configuredMin || DEFAULT_MIN_DRAWER_SIZE, containerSize),
      );
      const max = Math.max(
        min,
        Math.min(configuredMax || containerSize, containerSize),
      );
      return { size: clampSize(startSize, min, max), min, max };
    },
    getNextValue: (initial, start, current) => {
      const pointerDelta =
        axis === 'horizontal'
          ? current.clientX - start.clientX
          : current.clientY - start.clientY;
      const direction =
        placement === 'right' || placement === 'bottom' ? -1 : 1;
      return {
        ...initial,
        size: clampSize(
          initial.size + pointerDelta * direction,
          initial.min,
          initial.max,
        ),
      };
    },
    onStart: config?.onResizeStart,
    onMove: (value) => {
      onSizeChange(value.size);
      config?.onResize?.(value.size);
    },
    onCommit: config?.onResizeEnd,
    onCancel: config?.onResizeEnd,
  });

  useEffect(() => resize.cancel, [placement, resize.cancel]);

  return {
    isResizing: resize.resizing,
    handlePointerDown: resize.onPointerDown,
  };
}
