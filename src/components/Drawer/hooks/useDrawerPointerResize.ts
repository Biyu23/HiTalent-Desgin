import { useEffect } from 'react';
import { usePointerResize } from '../../_util/usePointerResize';
import type { DrawerPlacement, DrawerResizableConfig } from '../type';
import { getDrawerAxis } from '../utils/placement';
import {
  clampSize,
  DEFAULT_DRAWER_SIZE,
  DEFAULT_MIN_DRAWER_SIZE,
  getAxisSize,
  getResizeCursor,
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
  config: DrawerResizableConfig;
  panelRef: React.RefObject<HTMLDivElement | null>;
  currentSize?: number | string;
  onSizeChange: (size: number) => void;
}

export function useDrawerPointerResize(options: UseDrawerPointerResizeOptions) {
  const {
    placement,
    minSize,
    maxSize,
    active,
    config,
    panelRef,
    currentSize,
    onSizeChange,
  } = options;
  const axis = getDrawerAxis(placement);
  const resize = usePointerResize<DrawerResizeValue>({
    cursor: getResizeCursor(axis),
    disabled: !active,
    getInitialValue: () => {
      const panel = panelRef.current;
      const panelRect = panel?.getBoundingClientRect();
      const measuredSize = panelRect ? getAxisSize(panelRect, axis) : undefined;
      const startSize =
        measuredSize && measuredSize > 20
          ? measuredSize
          : typeof currentSize === 'number'
          ? currentSize
          : DEFAULT_DRAWER_SIZE;
      const wrapper = panel?.offsetParent as HTMLElement | null;
      const container =
        (wrapper?.offsetParent as HTMLElement | null) ||
        wrapper?.parentElement ||
        document.documentElement;
      const rect = container.getBoundingClientRect();
      const fallback =
        axis === 'horizontal' ? window.innerWidth : window.innerHeight;
      const containerSize = Math.max(1, getAxisSize(rect, axis) || fallback);
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
    onStart: () => config.onResizeStart?.(),
    onMove: (value) => {
      onSizeChange(value.size);
      config.onResize?.(value.size);
    },
    onCommit: () => config.onResizeEnd?.(),
    onCancel: () => config.onResizeEnd?.(),
  });

  useEffect(() => resize.cancel, [placement, resize.cancel]);

  return {
    isResizing: resize.resizing,
    handlePointerDown: resize.onPointerDown,
  };
}
