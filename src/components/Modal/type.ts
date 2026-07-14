import { ModalProps as AntdModalProps } from 'antd';
import React from 'react';

export type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Modal 组件暴露的命令式方法
 */
export interface ModalRef {
  /** 恢复最小化的弹窗 */
  restore: () => void;
  /** 最大化弹窗 */
  maximize: () => void;
  /** 取消最大化（恢复普通尺寸） */
  unmaximize: () => void;
  /** 最小化弹窗 */
  minimize: () => void;
}

export interface ModalProps
  extends Omit<AntdModalProps, 'closable' | 'title' | 'onCancel'> {
  /**
   * @description 是否显示关闭按钮
   * @default true
   */
  closable?: boolean;
  /**
   * @description 弹窗标题
   */
  title?: React.ReactNode;
  /**
   * @description 关闭回调。注意：事件可能来自按钮点击（MouseEvent）或 ESC 按键（KeyboardEvent）
   */
  onCancel?: (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void;
  /**
   * @description 是否允许拖拽（把手为标题栏）
   * @default false
   */
  draggable?: boolean;
  /**
   * @description 是否支持最小化（折叠到全局悬浮窗，不销毁 DOM）
   * @default false
   */
  minimizable?: boolean;
  /**
   * @description 是否支持最大化（全屏沉浸式）
   * @default false
   */
  maximizable?: boolean;
  /**
   * @description 最小化悬浮窗的位置
   * @default 'bottom-right'
   */
  minimizePosition?: MinimizePosition;
  /**
   * @description 是否最小化（受控）
   */
  minimized?: boolean;
  /**
   * @description 是否最大化（受控）
   */
  maximized?: boolean;
  /**
   * @description 最小化状态变化回调
   */
  onMinimizeChange?: (minimized: boolean) => void;
  /**
   * @description 最大化状态变化回调
   */
  onMaximizedChange?: (maximized: boolean) => void;
}

export interface MinimizedDockProps {
  /** 自定义额外 className */
  className?: string;
}

export interface ModalHeaderProps {
  /** 弹窗标题（ReactNode 以支持富文本标题） */
  title?: React.ReactNode;
  /** 自定义额外 className */
  className?: string;
}
