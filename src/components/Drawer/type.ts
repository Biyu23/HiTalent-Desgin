import type { DrawerProps as AntdDrawerProps } from 'antd';
import type React from 'react';
import type { MinimizePosition, MinimizeStack } from '../_util/minimize/type';

export type {
  MinimizePosition,
  MinimizeStackConfig,
} from '../_util/minimize/type';
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerAxis = 'horizontal' | 'vertical';
export type DrawerSize = 'default' | 'large' | number | string;

/**
 * Drawer 命令式控制 Ref 接口
 */
export interface DrawerRef {
  /**
   * @description 底层 DOM 容器节点
   */
  nativeElement: HTMLDivElement | null;
  /**
   * @description 最小化 Drawer 到全局 Dock
   */
  minimize: () => void;
  /**
   * @description 从全局 Dock 恢复 Drawer
   */
  restore: () => void;
}

/**
 * Drawer 尺寸调整配置
 */
export interface DrawerResizableConfig {
  /**
   * @description 开始调整尺寸时触发
   */
  onResizeStart?: () => void;
  /**
   * @description 调整尺寸过程中触发，参数为当前轴向像素尺寸
   */
  onResize?: (size: number) => void;
  /**
   * @description 结束调整尺寸时触发
   */
  onResizeEnd?: () => void;
}

/**
 * Drawer 自定义类名配置
 */
export interface DrawerClassNames
  extends NonNullable<AntdDrawerProps['classNames']> {
  /**
   * @description 标题栏最小化按钮的 className
   */
  minimizeButton?: string;
  /**
   * @description 最小化 Dock 卡片的 className
   */
  minimizedDock?: string;
  /**
   * @description 拖拽调整尺寸把手的 className
   */
  dragger?: string;
}

/**
 * Drawer 自定义样式配置
 */
export interface DrawerStyles extends NonNullable<AntdDrawerProps['styles']> {
  /**
   * @description 最小化 Dock 卡片的行内样式
   */
  minimizedDock?: React.CSSProperties;
  /**
   * @description 拖拽调整尺寸把手的行内样式
   */
  dragger?: React.CSSProperties;
}

/**
 * Drawer 组件属性接口
 */
export interface DrawerProps
  extends Omit<
    AntdDrawerProps,
    'size' | 'width' | 'height' | 'classNames' | 'styles' | 'onClose'
  > {
  /**
   * @description Drawer 的轴向尺寸。left/right 表示宽度，top/bottom 表示高度。传入时为受控模式。
   * @default 'default'
   */
  size?: DrawerSize;
  /**
   * @description 非受控模式下的初始轴向尺寸。
   * @default 378
   */
  defaultSize?: number | string;
  /**
   * @description 调整尺寸时允许的最小像素尺寸。
   * @default 100
   */
  minSize?: number;
  /**
   * @description 调整尺寸时允许的最大像素尺寸，同时受限于实际容器可用边界。
   */
  maxSize?: number;
  /**
   * @description 是否允许通过内侧边缘拖拽调整尺寸，或提供生命周期回调配置。
   * @default false
   */
  resizable?: boolean | DrawerResizableConfig;
  /**
   * @description 是否支持最小化到全局 Dock（自动保留 DOM 与表单状态）。
   * @default false
   */
  minimizable?: boolean;
  /**
   * @description 受控最小化状态。
   */
  minimized?: boolean;
  /**
   * @description 最小化卡片停靠位置。
   * @default 'bottom-right'
   */
  minimizePosition?: MinimizePosition;
  /**
   * @description 最小化卡片堆叠配置。超过 threshold 后折叠，传入 false 时始终展开。
   * @default { threshold: 3 }
   */
  minimizeStack?: MinimizeStack;
  /**
   * @description 最小化状态变化回调。
   */
  onMinimizeChange?: (minimized: boolean) => void;
  /**
   * @description 关闭回调。从最小化 Dock 程序化关闭时 event 为 undefined。
   */
  onClose?: (
    event?: React.MouseEvent<Element> | React.KeyboardEvent<Element>,
  ) => void;
  /**
   * @description 自定义类名配置，扩展 `dragger`、`minimizeButton`、`minimizedDock`
   */
  classNames?: DrawerClassNames;
  /**
   * @description 自定义样式配置，扩展 `dragger`、`minimizedDock`
   */
  styles?: DrawerStyles;
  /**
   * @deprecated 请使用 size
   */
  width?: number | string;
  /**
   * @deprecated 请使用 size
   */
  height?: number | string;
}
