import { ButtonProps } from 'antd';

export type ProButtonProps = ButtonProps & {
  /**
   * 图标位置
   * @default 'left'
   */
  IconPlacement: 'left' | 'right' | 'top' | 'bottom';
};
