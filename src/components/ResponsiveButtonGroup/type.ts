import type { DropdownProps, MenuProps } from 'antd';
import type React from 'react';
import type { NativeProps } from '../../types';
import type { ButtonProps } from '../Button/type';

export type ResponsiveButtonGroupMode = 'responsive' | 'expanded' | 'collapsed';

export type ResponsiveButtonGroupItemSource = 'button' | 'overflow';

export interface ResponsiveButtonGroupClickInfo {
  key: React.Key;
  item: ResponsiveButtonGroupItem;
  source: ResponsiveButtonGroupItemSource;
  event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

export interface ResponsiveButtonGroupRenderInfo {
  item: ResponsiveButtonGroupItem;
  defaultNode: React.ReactNode;
  loading: boolean;
}

export interface ResponsiveButtonGroupOverflowRenderInfo {
  collapsedItems: readonly ResponsiveButtonGroupItem[];
  count: number;
  open: boolean;
  defaultNode: React.ReactNode;
}

export type ResponsiveButtonGroupButtonProps = Omit<
  ButtonProps,
  | 'children'
  | 'icon'
  | 'onClick'
  | 'autoLoading'
  | 'id'
  | 'name'
  | 'form'
  | 'htmlType'
  | 'href'
  | 'target'
  | 'download'
  | 'block'
  | 'disabled'
  | 'danger'
  | 'loading'
  | 'tooltip'
>;

export interface ResponsiveButtonGroupItem {
  key: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** 数值越小越早收起；相同权重时左侧项先收起。 */
  priority?: number;
  disabled?: boolean;
  danger?: boolean;
  loading?: boolean;
  tooltip?: ButtonProps['tooltip'];
  buttonProps?: ResponsiveButtonGroupButtonProps;
  renderCollapsedItem?: (
    info: ResponsiveButtonGroupRenderInfo,
  ) => React.ReactNode;
  onClick?: (info: ResponsiveButtonGroupClickInfo) => void | Promise<unknown>;
}

export interface ResponsiveButtonGroupProps extends NativeProps {
  items: readonly ResponsiveButtonGroupItem[];
  mode?: ResponsiveButtonGroupMode;
  /** 必须保持平铺的最少按钮数，不包含“更多”按钮。 */
  minVisibleCount?: number;
  /** 按钮间距，单位为像素。 */
  gap?: number;
  buttonProps?: ResponsiveButtonGroupButtonProps;
  overflowLabel?: React.ReactNode;
  overflowIcon?: React.ReactNode;
  showOverflowCount?: boolean;
  overflowButtonProps?: Omit<
    ButtonProps,
    | 'children'
    | 'icon'
    | 'onClick'
    | 'id'
    | 'name'
    | 'form'
    | 'htmlType'
    | 'href'
    | 'target'
    | 'download'
    | 'block'
  >;
  overflowDropdownProps?: Omit<DropdownProps, 'children' | 'menu'>;
  overflowMenuProps?: Omit<MenuProps, 'items' | 'onClick'>;
  renderOverflowButton?: (
    info: ResponsiveButtonGroupOverflowRenderInfo,
  ) => React.ReactNode;
  onItemClick?: (
    info: ResponsiveButtonGroupClickInfo,
  ) => void | Promise<unknown>;
  onVisibleChange?: (
    visibleKeys: React.Key[],
    collapsedKeys: React.Key[],
  ) => void;
}
