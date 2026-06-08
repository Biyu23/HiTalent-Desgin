import { ButtonProps as AntdButtonProps } from 'antd';
export interface ButtonProps extends Omit<AntdButtonProps, 'iconPosition'> {
  /**
   * @description 图标展示位置
   * @default 'left'
   */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * @description 是否自动控制 loading 状态——当 onClick 返回 Promise 时
   *              自动进入 loading 态，Promise 落定后自动退出
   * @default true
   */
  autoLoading?: boolean;

  /**
   * @description 防抖间隔 (单位: 毫秒)。连续点击时重置计时器，最后一次点击后
   *              等待指定时间才触发 onClick。适用场景：搜索框输入触发、窗口 resize 回调。
   * @default 0
   */
  debounce?: number;

  /**
   * @description 点击事件，支持返回 Promise 自动触发 loading
   */
  onClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void | Promise<any>;
}
