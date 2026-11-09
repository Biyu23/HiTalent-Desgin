import { useCallback, useState } from 'react';
import type { ModalWindowPosition, ModalWindowSize } from '../types/internal';

/**
 * 管理普通窗口的位置和手动尺寸。
 *
 * 状态只随组件实例卸载而销毁；关闭、最小化和最大化均不会重置，
 * 从而保证重新打开或恢复普通窗口时延续用户上一次的调整结果。
 */
export const useModalWindowState = () => {
  const [position, setPosition] = useState<ModalWindowPosition>({
    x: 0,
    y: 0,
  });
  const [size, setSize] = useState<ModalWindowSize | null>(null);
  const [isResizing, setResizing] = useState(false);

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  const resetSize = useCallback(() => {
    setSize(null);
  }, []);

  return {
    position,
    size,
    isResizing,
    setPosition,
    setSize,
    setResizing,
    resetPosition,
    resetSize,
  };
};
