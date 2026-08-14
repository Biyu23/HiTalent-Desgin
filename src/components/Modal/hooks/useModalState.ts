import { useCallback, useRef, useState } from 'react';
import { useMinimizeState } from '../../_util/minimize/useMinimizeState';
import type { ModalProps } from '../type';

type UseModalStateOptions = Pick<
  ModalProps,
  'minimized' | 'maximized' | 'onMinimizeChange' | 'onMaximizedChange'
>;

interface UseModalStateReturn {
  isMinimized: boolean;
  isMaximized: boolean;
  handleMinimize: () => void;
  handleRestore: () => void;
  handleToggleMaximize: () => void;
  handleMaximize: () => void;
  handleUnmaximize: () => void;
  handleReset: () => void;
}

/** 管理 Modal 的最小化与最大化状态及其互斥规则。 */
export const useModalState = (
  options: UseModalStateOptions,
): UseModalStateReturn => {
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
  const internalMaximizedRef = useRef(internalMaximized);
  internalMaximizedRef.current = internalMaximized;
  const onMaximizedChangeRef = useRef(onMaximizedChange);
  onMaximizedChangeRef.current = onMaximizedChange;

  const isMaximized = isControlledMaximized
    ? !!controlledMaximized
    : internalMaximized;

  const setMaximized = useCallback(
    (next: boolean) => {
      if (!isControlledMaximized) {
        internalMaximizedRef.current = next;
        setInternalMaximized(next);
      }
      if (next) resetMinimized();
      onMaximizedChangeRef.current?.(next);
    },
    [isControlledMaximized, resetMinimized],
  );

  const handleToggleMaximize = useCallback(() => {
    const current = isControlledMaximized
      ? !!controlledMaximized
      : internalMaximizedRef.current;
    setMaximized(!current);
  }, [controlledMaximized, isControlledMaximized, setMaximized]);

  const handleMaximize = useCallback(() => {
    setMaximized(true);
  }, [setMaximized]);

  const handleUnmaximize = useCallback(() => {
    setMaximized(false);
  }, [setMaximized]);

  const handleReset = useCallback(() => {
    resetMinimized();
    internalMaximizedRef.current = false;
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
