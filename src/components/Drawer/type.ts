import type { DrawerProps as AntdDrawerProps } from 'antd';
import type React from 'react';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerAxis = 'horizontal' | 'vertical';
export type DrawerSize = 'default' | 'large' | number | string;

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
  /** 调整尺寸把手的 className */
  dragger?: string;
}

export interface DrawerStyles extends NonNullable<AntdDrawerProps['styles']> {
  /** 调整尺寸把手的行内样式 */
  dragger?: React.CSSProperties;
}

export interface DrawerProps
  extends Omit<
    AntdDrawerProps,
    'size' | 'width' | 'height' | 'classNames' | 'styles'
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
  /** resize 时允许的最大轴向尺寸，最终仍受实际容器限制 */
  maxSize?: number;
  /** 是否允许通过内侧边缘调整尺寸，或提供生命周期回调 */
  resizable?: boolean | DrawerResizableConfig;
  /** @deprecated 请使用 size */
  width?: number | string;
  /** @deprecated 请使用 size */
  height?: number | string;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
}
