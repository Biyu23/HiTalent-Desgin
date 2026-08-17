import type { ModalProps as AntdModalProps } from 'antd';
import React from 'react';
import type { MinimizePosition } from '../_util/minimize/type';

export type { MinimizePosition } from '../_util/minimize/type';

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

/**
 * Modal 缩放配置
 */
export interface ModalResizableConfig {
  /** 最小宽度，单位 px @default 320 */
  minWidth?: number;
  /** 最小高度，单位 px @default 200 */
  minHeight?: number;
  /** 最大宽度，单位 px */
  maxWidth?: number;
  /** 最大高度，单位 px */
  maxHeight?: number;
  /** 开始缩放时触发 */
  onResizeStart?: () => void;
  /** 缩放过程中触发 */
  onResize?: (size: { width: number; height: number }) => void;
  /** 结束缩放时触发 */
  onResizeEnd?: () => void;
}

export interface ModalClassNames
  extends NonNullable<AntdModalProps['classNames']> {
  /** 最小化 Dock 卡片的 className */
  minimizedDock?: string;
}

export interface ModalStyles extends NonNullable<AntdModalProps['styles']> {
  /** 最小化 Dock 卡片的行内样式 */
  minimizedDock?: React.CSSProperties;
}

export interface ModalProps
  extends Omit<
    AntdModalProps,
    'closable' | 'title' | 'onCancel' | 'classNames' | 'styles'
  > {
  classNames?: ModalClassNames;
  styles?: ModalStyles;
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
   * @description 是否允许缩放，或提供缩放配置
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
