import type {
  Button as AntdButton,
  ButtonProps as AntdButtonProps,
  TooltipProps,
} from 'antd';
import type React from 'react';

export type ButtonRef = React.ComponentRef<typeof AntdButton>;

export interface ButtonProps extends Omit<AntdButtonProps, 'onClick'> {
  /**
   * @description 是否自动控制 loading 状态——当 onClick 返回 Promise 时自动进入 loading 态，Promise 落定后自动退出
   * @default true
   */
  autoLoading?: boolean;

  /**
   * @description 节流间隔 (单位: 毫秒)。第一次点击立即触发，冷却期内后续点击被忽略
   * @default 0
   */
  throttle?: number;

  /**
   * @description Tooltip 提示配置，与 antd TooltipProps 一致（不含 children）。传 ReactNode 时作为 `title` 快捷设置
   */
  tooltip?: React.ReactNode | Omit<TooltipProps, 'children'>;

  /**
   * @description 点击事件，支持返回 Promise 自动触发 loading
   */
  onClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void | Promise<unknown>;
}
