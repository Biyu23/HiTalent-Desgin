import { useCallback, useReducer, useRef } from 'react';
import type { ModalProps } from '../type';

// ======== State & Action 定义 ========

/**
 * Modal 内部状态——两个互相关联的布尔标志。
 * 合并为一个对象以避免多次 setState 调度和中间无效态。
 */
interface ModalState {
  internalMinimized: boolean;
  internalMaximized: boolean;
}

type ModalAction =
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'SET_MAXIMIZED'; payload: boolean }
  | { type: 'RESET_ALL' };

/**
 * 状态机 reducer。
 *
 * 关键规则：
 * 1. 最小化 → 保持最大化状态（恢复时还原到之前的尺寸）
 * 2. 最大化 → 自动退出最小化
 * 3. RESET_ALL → 关闭弹窗时重置所有状态
 *
 * 这些互斥规则放在 reducer 中集中管理，避免散落在各个 useCallback 里。
 */
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SET_MINIMIZED':
      return {
        ...state,
        internalMinimized: action.payload,
        // 最小化/恢复时保持最大化状态不变
      };
    case 'SET_MAXIMIZED':
      return {
        ...state,
        internalMaximized: action.payload,
        // 最大化时自动退出最小化
        internalMinimized: action.payload ? false : state.internalMinimized,
      };
    case 'RESET_ALL':
      return {
        internalMinimized: false,
        internalMaximized: false,
      };
    default:
      return state;
  }
}

// ======== Hook ========

type UseModalStateOptions = Pick<
  ModalProps,
  'minimized' | 'maximized' | 'onMinimizeChange' | 'onMaximizedChange'
>;

interface UseModalStateReturn {
  /** 合并后的最小化状态（受控优先） */
  isMinimized: boolean;
  /** 合并后的最大化状态（受控优先） */
  isMaximized: boolean;
  /** 最小化 */
  handleMinimize: () => void;
  /** 从最小化恢复 */
  handleRestore: () => void;
  /** 切换最大化 */
  handleToggleMaximize: () => void;
  /** 最大化 */
  handleMaximize: () => void;
  /** 取消最大化 */
  handleUnmaximize: () => void;
  /** 关闭时重置状态 */
  handleReset: () => void;
}

export const useModalState = (
  options: UseModalStateOptions,
): UseModalStateReturn => {
  const {
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
  } = options;

  // ✅ 受控检测：使用 !== undefined 而非 'prop' in options，
  // 避免 React JSX 编译时 `minimized={undefined}` 被误判为受控模式。
  const isControlledMinimized = controlledMinimized !== undefined;
  const isControlledMaximized = controlledMaximized !== undefined;

  const [state, dispatch] = useReducer(modalReducer, {
    internalMinimized: false,
    internalMaximized: false,
  });

  // ✅ 通过 ref 镜像 reducer 中的 internal 状态，供回调函数闭包中读取最新值，
  // 避免 React 18 自动批处理下连续调用时的闭包陷阱。
  const stateRef = useRef(state);
  stateRef.current = state;

  const onMinimizeChangeRef = useRef(onMinimizeChange);
  onMinimizeChangeRef.current = onMinimizeChange;
  const onMaximizedChangeRef = useRef(onMaximizedChange);
  onMaximizedChangeRef.current = onMaximizedChange;

  const isMinimized = isControlledMinimized
    ? !!controlledMinimized
    : state.internalMinimized;
  const isMaximized = isControlledMaximized
    ? !!controlledMaximized
    : state.internalMaximized;

  // ---- 稳定的回调（引用在组件生命周期内不变） ----
  const handleMinimize = useCallback(() => {
    if (!isControlledMinimized)
      dispatch({ type: 'SET_MINIMIZED', payload: true });
    onMinimizeChangeRef.current?.(true);
  }, [isControlledMinimized]);

  const handleRestore = useCallback(() => {
    if (!isControlledMinimized)
      dispatch({ type: 'SET_MINIMIZED', payload: false });
    onMinimizeChangeRef.current?.(false);
  }, [isControlledMinimized]);

  const handleToggleMaximize = useCallback(() => {
    // ✅ 通过 stateRef 读取最新值，避免闭包陷阱。
    // 即使 React 18 自动批处理合并了多次 dispatch，ref.current 始终是最新的。
    const currentMaximized = isControlledMaximized
      ? !!controlledMaximized
      : stateRef.current.internalMaximized;
    const next = !currentMaximized;
    if (!isControlledMaximized)
      dispatch({ type: 'SET_MAXIMIZED', payload: next });
    onMaximizedChangeRef.current?.(next);
  }, [isControlledMaximized, controlledMaximized]);

  const handleMaximize = useCallback(() => {
    if (!isControlledMaximized)
      dispatch({ type: 'SET_MAXIMIZED', payload: true });
    onMaximizedChangeRef.current?.(true);
  }, [isControlledMaximized]);

  const handleUnmaximize = useCallback(() => {
    if (!isControlledMaximized)
      dispatch({ type: 'SET_MAXIMIZED', payload: false });
    onMaximizedChangeRef.current?.(false);
  }, [isControlledMaximized]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

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
