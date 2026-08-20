import React, { createContext, useContext } from 'react';
import type { ModalProps } from './type';
import type { ModalWindowPosition, ModalWindowSize } from './types/internal';

export interface ModalContextValue {
  /** 组件类名前缀（如 'htd-modal'） */
  prefixCls: string;
  /** CSS-in-JS hash id，所有子组件需附加到 className 上以匹配样式规则 */
  hashId: string;
  /** 是否开启拖拽 */
  draggable: boolean;
  /** 是否开启尺寸调整 */
  resizable: boolean | ModalProps['resizable'];
  /** 是否支持最小化 */
  minimizable: boolean;
  /** 是否支持最大化 */
  maximizable: boolean;
  /** 是否显示关闭按钮 */
  closable: boolean;
  /** 弹窗是否处于开启状态（来自父组件控制的 open prop） */
  open?: boolean;
  /** 是否使用 Ant Design 居中布局 */
  centered: boolean;
  /** 是否处于最大化状态 */
  isMaximized: boolean;
  /** 是否处于最小化状态 */
  isMinimized: boolean;
  /** 当前普通窗口位置 */
  windowPosition: ModalWindowPosition;
  /** 当前普通窗口位置的同步引用 */
  windowPositionRef: React.MutableRefObject<ModalWindowPosition>;
  /** 用户手动调整后的尺寸；null 表示沿用传入尺寸 */
  windowSize: ModalWindowSize | null;
  /** 是否正在调整尺寸 */
  isResizing: boolean;
  /** 更新普通窗口位置 */
  setWindowPosition: (position: ModalWindowPosition) => void;
  /** 更新普通窗口尺寸 */
  setWindowSize: (size: ModalWindowSize) => void;
  /** 更新 resize 交互状态 */
  setResizing: (resizing: boolean) => void;
  /** 重置普通窗口位置 */
  resetPosition: () => void;
  /** 重置手动调整后的尺寸 */
  resetSize: () => void;
  /** 最小化 */
  onMinimize: () => void;
  /** 切换最大化/还原 */
  onToggleMaximize: () => void;
  /** 关闭弹窗（按钮点击、ESC 按键或程序化销毁） */
  onClose: NonNullable<ModalProps['onCancel']>;
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
