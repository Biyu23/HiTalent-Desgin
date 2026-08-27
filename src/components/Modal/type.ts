import type { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd';
import type React from 'react';
import type { MinimizePosition } from '../_util/minimize/type';

export type { MinimizePosition } from '../_util/minimize/type';

/**
 * Modal 组件暴露的命令式方法
 */
export interface ModalRef {
  /**
   * @description 底层 DOM 容器节点
   */
  nativeElement: HTMLDivElement | null;
  /**
   * @description 恢复最小化的弹窗
   */
  restore: () => void;
  /**
   * @description 最大化弹窗
   */
  maximize: () => void;
  /**
   * @description 取消最大化（恢复普通尺寸）
   */
  unmaximize: () => void;
  /**
   * @description 最小化弹窗
   */
  minimize: () => void;
  /**
   * @description 重置拖拽位置居中
   */
  resetPosition: () => void;
  /**
   * @description 重置手动调整的尺寸
   */
  resetSize: () => void;
}

/**
 * Modal 组件暴露的静态方法
 */
export type ModalStaticMethods = Pick<
  typeof AntdModal,
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'warn'
  | 'confirm'
  | 'useModal'
  | 'destroyAll'
  | 'config'
>;

/**
 * Modal 缩放配置
 */
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
   * @description 最大宽度，单位 px，受视口与容器限制
   */
  maxWidth?: number;
  /**
   * @description 最大高度，单位 px，受视口与容器限制
   */
  maxHeight?: number;
  /**
   * @description 开始缩放拖动时触发
   */
  onResizeStart?: () => void;
  /**
   * @description 缩放过程中的实时回调
   */
  onResize?: (size: { width: number; height: number }) => void;
  /**
   * @description 结束缩放拖动时触发
   */
  onResizeEnd?: () => void;
}

/**
 * Modal 自定义类名配置
 */
export interface ModalClassNames
  extends NonNullable<AntdModalProps['classNames']> {
  /**
   * @description 弹窗标题区域的 className
   */
  title?: string;
  /**
   * @description 标题栏操作按钮区域的 className
   */
  actions?: string;
  /**
   * @description 拖拽调整尺寸把手的 className
   */
  resizeHandle?: string;
  /**
   * @description 最小化 Dock 卡片的 className
   */
  minimizedDock?: string;
}

/**
 * Modal 自定义样式配置
 */
export interface ModalStyles extends NonNullable<AntdModalProps['styles']> {
  /**
   * @description 拖拽调整尺寸把手的行内样式
   */
  resizeHandle?: React.CSSProperties;
  /**
   * @description 最小化 Dock 卡片的行内样式
   */
  minimizedDock?: React.CSSProperties;
}

/**
 * Modal 组件属性
 */
export interface ModalProps
  extends Omit<AntdModalProps, 'title' | 'onCancel' | 'classNames' | 'styles'> {
  /**
   * @description 自定义类名配置，扩展 `title`、`actions`、`resizeHandle`、`minimizedDock`
   */
  classNames?: ModalClassNames;
  /**
   * @description 自定义样式配置，扩展 `resizeHandle`、`minimizedDock`
   */
  styles?: ModalStyles;
  /**
   * @description 是否显示右上角的关闭按钮，或提供配置对象
   * @default true
   */
  closable?: AntdModalProps['closable'];
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
   * @description 是否允许拖拽（把手为标题栏与底部）
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
  /**
   * @description 最大化状态变化回调（同 `onMaximizedChange`）
   */
  onMaximizeChange?: (maximized: boolean) => void;
}
