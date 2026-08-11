import { ModalProps as AntdModalProps } from 'antd';
import React from 'react';

export type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface ModalResizableConfig {
  /**
   * @description 最小宽度，单位 px
   * @default 320
   */
  minWidth?: number;
  /**
   * @description 最小高度，单位 px
   * @default 200
   */
  minHeight?: number;
  /**
   * @description 最大宽度，单位 px，最终仍受当前视口限制
   */
  maxWidth?: number;
  /**
   * @description 最大高度，单位 px，最终仍受当前视口限制
   */
  maxHeight?: number;
}

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

/**
 * Modal 组件暴露的静态方法
 */
export interface ModalStaticMethods {
  /** 销毁所有已打开的 Modal 实例（包括最小化状态的弹窗） */
  destroyAll: () => void;
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
   * @description 关闭回调。注意：事件可能来自按钮点击（MouseEvent）或 ESC 按键（KeyboardEvent）。
   * 通过 Modal.destroyAll() 程序化关闭时，event 为 undefined。
   */
  onCancel?: (
    e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void;
  /**
   * @description 是否允许拖拽（把手为标题栏）
   * @default false
   */
  draggable?: boolean;
  /**
   * @description 是否允许通过右下角调整弹窗尺寸。传入对象时可配置最小和最大宽高
   * @default false
   */
  resizable?: boolean | ModalResizableConfig;
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
