import { ModalProps } from 'antd';
import { Omit } from 'lodash';
import React from 'react';

/**
 * 最小化悬浮窗的预设位置或自定义样式
 */
export type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ProModalProps extends Omit<ModalProps, 'closable' | 'title'> {
  /**
   * 是否显示右上角的原生关闭按钮
   */
  closable?: boolean;
  /**
   * 弹窗标题 (支持函数或 ReactNode)
   */
  title?: React.ReactNode | (() => React.ReactNode);
  /**
   * 是否允许拖拽 (拖拽把手默认为标题栏)
   * @default false
   */
  draggable?: boolean;
  /**
   * 是否支持最小化 (折叠到全局悬浮窗，不销毁 DOM)
   * @default false
   */
  minimizable?: boolean;
  /**
   * 是否支持最大化 (全屏沉浸式体验)
   * @default false
   */
  maximizable?: boolean;
  /**
   * 最小化悬浮窗的位置，支持预设字符串或自定义 CSS 样式
   * @default 'bottom-right'
   */
  minimizePosition?: MinimizePosition;
}

export interface ModalHeaderProps {
  /**
   * 弹窗标题 (支持函数或 ReactNode)
   */
  title?: React.ReactNode | (() => React.ReactNode);
  /**
   * 组件的 CSS 样式前缀
   */
  prefixCls: string;
  /**
   * 是否开启拖拽功能
   */
  draggable?: boolean;
  /**
   * 当前是否处于最大化状态
   */
  isMaximized: boolean;
  /**
   * 当前是否禁用了拖拽（用于标题栏 hover 时的交互控制）
   */
  disabledDrag: boolean;
  /**
   * 设置是否禁用拖拽状态的方法
   */
  setDisabledDrag: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * 是否开启最小化功能
   */
  minimizable?: boolean;
  /**
   * 是否开启最大化功能
   */
  maximizable?: boolean;
  /**
   * 是否显示右上角的原生关闭按钮
   */
  closable?: boolean;
  /**
   * 点击最小化(减号)按钮的回调
   */
  onMinimize: () => void;
  /**
   * 点击最大化/还原(全屏)按钮的回调
   */
  onToggleMaximize: () => void;
  /**
   * 点击关闭(叉号)按钮的回调
   */
  onClose: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

export interface MinimizedDockProps {
  /**
   * 原生 Modal 的外部 open 状态
   */
  open?: boolean;
  /**
   * 当前是否处于最小化状态
   */
  isMinimized: boolean;
  /**
   * 悬浮窗显示的标题 (与主弹窗标题保持一致)
   */
  title?: React.ReactNode | (() => React.ReactNode);
  /**
   * 组件的 CSS 样式前缀
   */
  prefixCls: string;
  /**
   * 最小化悬浮窗的全局渲染位置
   * @default 'top-right'
   */
  minimizePosition?: MinimizePosition;
  /**
   * 点击还原(放大)按钮的回调，用于恢复主弹窗
   */
  onRestore: () => void;
  /**
   * 点击关闭(叉号)按钮的回调，用于彻底销毁弹窗
   */
  onClose: (e: React.MouseEvent<HTMLSpanElement>) => void;
}
