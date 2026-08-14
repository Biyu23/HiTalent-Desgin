import type { ButtonProps as AntdButtonProps, TooltipProps } from 'antd';

export interface ButtonProps extends AntdButtonProps {
  /**
   * @description 是否自动控制 loading 状态——当 onClick 返回 Promise 时
   *              自动进入 loading 态，Promise 落定后自动退出
   * @default true
   */
  autoLoading?: boolean;

  /**
   * @description 节流间隔 (单位: 毫秒)。第一次点击立即触发，冷却期内后续点击被忽略。
   *              适用场景：提交按钮防重复点击、抢购按钮。
   * @default 0
   */
  throttle?: number;

  /**
   * @description Tooltip 提示配置，与 antd TooltipProps 一致（不含 children）。
   *              传 ReactNode 时作为 `title` 快捷设置。
   *              设置后始终展示，不受按钮状态影响。
   */
  tooltip?: React.ReactNode | Omit<TooltipProps, 'children'>;

  /**
   * @description 点击事件，支持返回 Promise 自动触发 loading
   */
  onClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void | Promise<unknown>;
}
