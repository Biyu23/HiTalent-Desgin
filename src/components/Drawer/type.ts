import type { DrawerProps as AntdDrawerProps } from 'antd';
import type React from 'react';
import type { MinimizePosition } from '../_util/minimize/type';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerAxis = 'horizontal' | 'vertical';
export type DrawerSize = 'default' | 'large' | number | string;

export interface DrawerRef {
  /** 最小化 Drawer */
  minimize: () => void;
  /** 从最小化 Dock 恢复 Drawer */
  restore: () => void;
}

export interface DrawerResizableConfig {
  /** 开始调整尺寸时触发 */
  onResizeStart?: () => void;
  /** 调整尺寸过程中触发，参数为当前轴向像素尺寸 */
  onResize?: (size: number) => void;
  /** 结束调整尺寸时触发 */
  onResizeEnd?: () => void;
}

export interface DrawerClassNames
  extends NonNullable<AntdDrawerProps['classNames']> {
  /** 最小化按钮的 className */
  minimizeButton?: string;
  /** 最小化 Dock 卡片的 className */
  minimizedDock?: string;
  /** 调整尺寸把手的 className */
  dragger?: string;
}

export interface DrawerStyles extends NonNullable<AntdDrawerProps['styles']> {
  /** 最小化按钮的行内样式 */
  minimizeButton?: React.CSSProperties;
  /** 最小化 Dock 卡片的行内样式 */
  minimizedDock?: React.CSSProperties;
  /** 调整尺寸把手的行内样式 */
  dragger?: React.CSSProperties;
}

export interface DrawerProps
  extends Omit<
    AntdDrawerProps,
    'size' | 'width' | 'height' | 'classNames' | 'styles' | 'onClose'
  > {
  /**
   * Drawer 的轴向尺寸。left/right 表示宽度，top/bottom 表示高度。
   * 传入时为受控模式。
   * @default 'default'
   */
  size?: DrawerSize;
  /**
   * 非受控模式的初始轴向尺寸。
   * @default 378
   */
  defaultSize?: number | string;
  /**
   * resize 时允许的最小轴向尺寸。
   * @default 100
   */
  minSize?: number;
  /** resize 时允许的最大轴向尺寸，最终仍受实际容器限制 */
  maxSize?: number;
  /** 是否允许通过内侧边缘调整尺寸，或提供生命周期回调 */
  resizable?: boolean | DrawerResizableConfig;
  /**
   * 是否支持最小化到全局 Dock。
   * @default false
   */
  minimizable?: boolean;
  /** 受控最小化状态 */
  minimized?: boolean;
  /**
   * 最小化卡片的停靠位置。
   * @default 'bottom-right'
   */
  minimizePosition?: MinimizePosition;
  /** 最小化状态变化回调 */
  onMinimizeChange?: (minimized: boolean) => void;
  /**
   * 关闭回调。从最小化 Dock 程序化关闭时 event 为 undefined。
   */
  onClose?: (
    event?: React.MouseEvent<Element> | React.KeyboardEvent<Element>,
  ) => void;
  /** @deprecated 请使用 size */
  width?: number | string;
  /** @deprecated 请使用 size */
  height?: number | string;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
}
