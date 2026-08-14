import { useCallback, useRef, useState } from 'react';
import type {
  ModalWindowPosition,
  ModalWindowSize,
  ModalWindowState,
} from '../types/internal';

/**
 * 管理普通窗口的位置和手动尺寸。
 *
 * 状态只随组件实例卸载而销毁；关闭、最小化和最大化均不会重置，
 * 从而保证重新打开或恢复普通窗口时延续用户上一次的调整结果。
 */
export const useModalWindowState = (): ModalWindowState => {
  const [position, updatePosition] = useState<ModalWindowPosition>({
    x: 0,
    y: 0,
  });
  const [size, updateSize] = useState<ModalWindowSize | null>(null);
  const [isResizing, updateResizing] = useState(false);
  const positionRef = useRef(position);
  positionRef.current = position;

  const setPosition = useCallback((next: ModalWindowPosition) => {
    positionRef.current = next;
    updatePosition(next);
  }, []);

  const setSize = useCallback((next: ModalWindowSize) => {
    updateSize(next);
  }, []);

  const setResizing = useCallback((resizing: boolean) => {
    updateResizing(resizing);
  }, []);

  return {
    position,
    positionRef,
    size,
    isResizing,
    setPosition,
    setSize,
    setResizing,
  };
};
