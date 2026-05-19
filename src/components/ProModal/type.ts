import { ModalProps } from 'antd';
import React from 'react';

export type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ProModalProps extends Omit<ModalProps, 'closable' | 'title'> {
  /**
   * @description 是否显示右上角的原生关闭按钮
   * @default true
   */
  closable?: boolean;
  /**
   * @description 弹窗标题
   */
  title?: React.ReactNode | (() => React.ReactNode);
  /**
   * @description 是否允许拖拽 (把手为标题栏)
   * @default false
   */
  draggable?: boolean;
  /**
   * @description 是否支持最小化 (折叠到全局悬浮窗，不销毁 DOM)
   * @default false
   */
  minimizable?: boolean;
  /**
   * @description 是否支持最大化 (全屏沉浸式)
   * @default false
   */
  maximizable?: boolean;
  /**
   * @description 最小化悬浮窗的位置
   * @default 'bottom-right'
   */
  minimizePosition?: MinimizePosition;
}
