import { ButtonProps as AntdButtonProps } from 'antd';
export interface ButtonProps extends Omit<AntdButtonProps, 'iconPosition'> {
  /**
   * @description 图标展示位置 (这里写属性的中文说明)
   * @default 'left'
   */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * @description 是否自动控制 loading 状态
   * @default true
   */
  autoLoading?: boolean;

  /**
   * @description 节流间隔 (单位: 毫秒)。首次点击立即执行，冷却期内忽略后续点击；
   *              适用场景：防止表单重复提交、限制操作频率。
   *              注意：此行为是 throttle（节流）而非 debounce（防抖）。
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
