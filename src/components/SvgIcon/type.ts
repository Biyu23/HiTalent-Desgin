import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type React from 'react';
import type { NativeProps } from '../../types';

export interface SvgIconProps extends NativeProps {
  /**
   * @description 自定义 SVG 元素节点，直接放置 <svg>...</svg>
   */
  children?: React.ReactNode;

  /**
   * @description 自定义 SVG 组件，接收 Antd Icon 传入的 props
   */
  component?: React.ComponentType<
    CustomIconComponentProps | React.SVGProps<SVGSVGElement>
  >;

  /**
   * @description 图标尺寸，支持数字（默认单位 px）或 CSS 尺寸字符串（如 '20px', '1.5em'）
   */
  size?: number | string;

  /**
   * @description 图标颜色，设置后会作为字体颜色生效（配合 SVG 的 currentColor）
   */
  color?: string;

  /**
   * @description 是否有旋转加载动画
   * @default false
   */
  spin?: boolean;

  /**
   * @description 图标旋转角度 (deg)
   */
  rotate?: number;

  /**
   * @description 自定义前缀
   */
  prefixCls?: string;

  /**
   * @description 点击事件
   */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}
