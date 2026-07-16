import React, { createContext, useContext } from 'react';
import type { MinimizePosition } from './type';
export interface ModalContextValue {
  /** 组件类名前缀（如 'htd-modal'） */
  prefixCls: string;
  /** 是否开启拖拽 */
  draggable: boolean;
  /** 是否支持最小化 */
  minimizable: boolean;
  /** 是否支持最大化 */
  maximizable: boolean;
  /** 是否显示关闭按钮 */
  closable: boolean;
  /** 最小化悬浮窗停靠位置 */
  minimizePosition: MinimizePosition;
  /** 弹窗是否处于开启状态（来自父组件控制的 open prop） */
  open?: boolean;
  /** 是否处于最大化状态 */
  isMaximized: boolean;
  /** 是否处于最小化状态 */
  isMinimized: boolean;
  /** 拖拽是否被禁用（最大化时强制禁用，非拖拽态时默认禁用） */
  disabledDrag: boolean;
  /** 弹窗标题（同时用于 ModalHeader 和 MinimizedDock 展示） */
  title: React.ReactNode;
  /** 最小化 */
  onMinimize: () => void;
  /** 从最小化恢复 */
  onRestore: () => void;
  /** 切换最大化/还原 */
  onToggleMaximize: () => void;
  /** 关闭弹窗（按钮点击或 ESC 按键） */
  onClose: (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void;
  /** 设置拖拽禁用状态 */
  setDisabledDrag: (disabled: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * 在 Modal 子组件内部获取共享状态与操作方法。
 */
export const useModalContext = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  return ctx!;
};

export default ModalContext;
