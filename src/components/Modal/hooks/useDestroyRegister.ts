import { useEffect, useRef } from 'react';
import destroyFns from '../utils/destroyFns';

/**
 * 销毁函数注册 Hook。
 *
 * 当 open 变为 true 时将最新的 handleClose 推入 destroyFns 数组，
 * 组件卸载或 open 变为 false 时自动从数组中移除。
 * 使用 useRef 追踪 handleClose 引用，避免 React 18 自动批处理下的闭包陷阱。
 */
export function useDestroyRegister(
  open: boolean,
  handleClose: (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void,
) {
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (!open) return;

    const destroyFn = () => {
      handleCloseRef.current?.(
        undefined as unknown as React.MouseEvent<HTMLElement>,
      );
    };

    destroyFns.push(destroyFn);

    return () => {
      const idx = destroyFns.indexOf(destroyFn);
      if (idx >= 0) destroyFns.splice(idx, 1);
    };
  }, [open]);
}
