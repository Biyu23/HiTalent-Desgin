import { useCallback, useRef, useState } from 'react';
import { useMinimizeState } from '../../../hooks';
import type { ModalProps } from '../type';

type UseModalStateOptions = Pick<
  ModalProps,
  'minimized' | 'maximized' | 'onMinimizeChange' | 'onMaximizedChange'
>;

/** 管理 Modal 的最小化与最大化状态及其互斥规则。 */
export const useModalState = (options: UseModalStateOptions) => {
  const {
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
  } = options;
  const {
    isMinimized,
    minimize: handleMinimize,
    restore: handleRestore,
    reset: resetMinimized,
  } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });
  const isControlledMaximized = controlledMaximized !== undefined;
  const [internalMaximized, setInternalMaximized] = useState(false);
  const onMaximizedChangeRef = useRef(onMaximizedChange);
  onMaximizedChangeRef.current = onMaximizedChange;

  const isMaximized = controlledMaximized ?? internalMaximized;

  const setMaximized = useCallback(
    (next: boolean) => {
      if (!isControlledMaximized) {
        setInternalMaximized(next);
      }
      if (next) resetMinimized();
      onMaximizedChangeRef.current?.(next);
    },
    [isControlledMaximized, resetMinimized],
  );

  const handleToggleMaximize = useCallback(() => {
    setMaximized(!isMaximized);
  }, [isMaximized, setMaximized]);

  const handleMaximize = useCallback(() => {
    setMaximized(true);
  }, [setMaximized]);

  const handleUnmaximize = useCallback(() => {
    setMaximized(false);
  }, [setMaximized]);

  const handleReset = useCallback(() => {
    resetMinimized();
    setInternalMaximized(false);
  }, [resetMinimized]);

  return {
    isMinimized,
    isMaximized,
    handleMinimize,
    handleRestore,
    handleToggleMaximize,
    handleMaximize,
    handleUnmaximize,
    handleReset,
  };
};
