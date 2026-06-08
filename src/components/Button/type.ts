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
   * @description 防抖时间 (单位: 毫秒)，首次点击立即执行，冷却期内忽略后续点击
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
