import { ButtonProps } from 'antd';

export type ProButtonProps = Omit<ButtonProps, 'iconPosition'> & {
  /**
   * 图标展示位置
   * @default 'left'
   */
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * 是否自动控制 loading
   * @default true
   */
  autoLoading?: boolean;
  /**
   * 防抖时间
   * @default 0
   */
  debounce?: number;
  /**
   * 点击事件
   */
  onClick?: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => void | Promise<any>;
};
