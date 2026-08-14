import { useCallback, useRef, useState } from 'react';
import type { UseMinimizeStateOptions, UseMinimizeStateReturn } from './type';

/** 管理受控或非受控的最小化状态。 */
export const useMinimizeState = ({
  minimized: controlledMinimized,
  onMinimizeChange,
}: UseMinimizeStateOptions): UseMinimizeStateReturn => {
  const isControlled = controlledMinimized !== undefined;
  const [internalMinimized, setInternalMinimized] = useState(false);
  const onMinimizeChangeRef = useRef(onMinimizeChange);
  onMinimizeChangeRef.current = onMinimizeChange;

  const isMinimized = isControlled ? !!controlledMinimized : internalMinimized;

  const minimize = useCallback(() => {
    if (!isControlled) setInternalMinimized(true);
    onMinimizeChangeRef.current?.(true);
  }, [isControlled]);

  const restore = useCallback(() => {
    if (!isControlled) setInternalMinimized(false);
    onMinimizeChangeRef.current?.(false);
  }, [isControlled]);

  const reset = useCallback(() => {
    setInternalMinimized(false);
  }, []);

  return { isMinimized, minimize, restore, reset };
};
