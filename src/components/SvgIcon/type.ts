import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type React from 'react';
import type { NativeProps } from '../../types';
import type {
  SemanticClassNames,
  SemanticStyleProps,
  SemanticStyles,
} from '../_util/semanticStyles';

export type SvgIconSize = 'small' | 'middle' | 'large' | number | string;

export type SvgIconSlot = 'root' | 'svg';
export type SvgIconClassNames = SemanticClassNames<SvgIconSlot>;
export type SvgIconStyles = SemanticStyles<SvgIconSlot>;

export interface SvgIconProps
  extends NativeProps,
    SemanticStyleProps<SvgIconSlot>,
    Omit<
      React.HTMLAttributes<HTMLSpanElement>,
      'color' | 'style' | 'className' | 'children' | 'onClick'
    > {
  /**
   * @description 自定义 SVG 元素节点，直接放置 <svg>...</svg>
   */
  children?: React.ReactNode;

  /**
   * @description 自定义 SVG 组件，接收 Antd Icon 传入的 props
   */
  component?: React.ComponentType<CustomIconComponentProps>;

  /**
   * @description 图标尺寸，支持预设 ('small' | 'middle' | 'large')、数字（默认单位 px）或 CSS 尺寸字符串（如 '20px', '1.5em'）
   */
  size?: SvgIconSize;

  /**
   * @description 图标颜色，设置后会作为字体颜色生效（配合 SVG 的 currentColor）
   */
  color?: string;

  /**
   * @description SVG 填充颜色（显式覆盖 SVG fill）
   */
  fill?: string;

  /**
   * @description SVG 描边颜色（显式覆盖 SVG stroke）
   */
  stroke?: string;

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
