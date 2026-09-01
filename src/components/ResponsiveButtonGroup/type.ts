import type { DropdownProps, MenuProps } from 'antd';
import type React from 'react';
import type { NativeProps } from '../../types';
import type { ButtonProps } from '../Button/type';

/**
 * 组件展示模式：
 * - `responsive`: 根据容器宽度自适应收起
 * - `expanded`: 强制全部平铺展示
 * - `collapsed`: 强制全部折叠收起（受 minVisibleCount 限制）
 */
export type ResponsiveButtonGroupMode = 'responsive' | 'expanded' | 'collapsed';

/** 点击事件来源：平铺按钮态或下拉菜单态 */
export type ResponsiveButtonGroupItemSource = 'button' | 'overflow';

/** 统一点击事件回调参数 */
export interface ResponsiveButtonGroupClickInfo {
  /**
   * @description 点击项的唯一标识
   */
  key: string;
  /**
   * @description 点击项的原始配置对象
   */
  item: ResponsiveButtonGroupItem;
  /**
   * @description 点击触发来源：平铺按钮态或下拉菜单态
   */
  source: ResponsiveButtonGroupItemSource;
  /**
   * @description 原生点击或键盘事件对象
   */
  event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

/** 自定义折叠菜单项渲染参数 */
export interface ResponsiveButtonGroupRenderInfo {
  /**
   * @description 当前项的原始配置对象
   */
  item: ResponsiveButtonGroupItem;
  /**
   * @description 默认生成的菜单项节点
   */
  defaultNode: React.ReactNode;
  /**
   * @description 当前项是否正处于加载中
   */
  loading: boolean;
}

/** 自定义溢出“更多”按钮渲染参数 */
export interface ResponsiveButtonGroupOverflowRenderInfo {
  /**
   * @description 当前被折叠收起的所有项列表
   */
  collapsedItems: readonly ResponsiveButtonGroupItem[];
  /**
   * @description 折叠项的数量
   */
  count: number;
  /**
   * @description 下拉菜单当前是否处于展开状态
   */
  open: boolean;
  /**
   * @description 默认生成的“更多”触发器按钮节点
   */
  defaultNode: React.ReactNode;
}

/** 平铺按钮透传属性，剔除与组配置冲突或单项专有的属性 */
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

/** 单个按钮操作项配置 */
export interface ResponsiveButtonGroupItem {
  /**
   * @description 唯一字符串标识
   */
  key: string;
  /**
   * @description 按钮及菜单项展示文案
   */
  label: React.ReactNode;
  /**
   * @description 按钮及菜单项图标
   */
  icon?: React.ReactNode;
  /**
   * @description 收起优先级，数值越小越早收起；相同权重时根据位置从后往前依次收起
   * @default 0
   */
  priority?: number;
  /**
   * @description 是否禁用该项
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 是否为危险操作项
   * @default false
   */
  danger?: boolean;
  /**
   * @description 是否处于加载中（受控）
   * @default false
   */
  loading?: boolean;
  /**
   * @description 提示气泡，平铺按钮与折叠菜单项均生效
   */
  tooltip?: ButtonProps['tooltip'];
  /**
   * @description 单项独立的 Button 属性配置
   */
  buttonProps?: ResponsiveButtonGroupButtonProps;
  /**
   * @description 自定义折叠至下拉菜单时的单项渲染
   */
  renderCollapsedItem?: (
    info: ResponsiveButtonGroupRenderInfo,
  ) => React.ReactNode;
  /**
   * @description 点击回调，返回 Promise 时将自动保持 Loading 状态并在完成后自动收起面板
   */
  onClick?: (info: ResponsiveButtonGroupClickInfo) => void | Promise<unknown>;
}

/** 组件语义化类名插槽 */
export interface ResponsiveButtonGroupClassNames {
  /**
   * @description 根容器节点类名
   */
  root?: string;
  /**
   * @description 平铺可见按钮容器类名
   */
  visible?: string;
  /**
   * @description “更多”触发器按钮类名
   */
  overflowTrigger?: string;
  /**
   * @description 溢出下拉菜单浮层类名
   */
  popup?: string;
  /**
   * @description 折叠菜单项内容类名
   */
  menuItem?: string;
}

/** 组件语义化样式插槽 */
export interface ResponsiveButtonGroupStyles {
  /**
   * @description 根容器节点行内样式
   */
  root?: React.CSSProperties;
  /**
   * @description 平铺可见按钮容器行内样式
   */
  visible?: React.CSSProperties;
  /**
   * @description “更多”触发器按钮行内样式
   */
  overflowTrigger?: React.CSSProperties;
  /**
   * @description 溢出下拉菜单浮层行内样式
   */
  popup?: React.CSSProperties;
}

/** ResponsiveButtonGroup 组件 Props */
export interface ResponsiveButtonGroupProps extends NativeProps {
  /**
   * @description 自定义组件样式前缀
   */
  prefixCls?: string;
  /**
   * @description 根节点类名
   */
  rootClassName?: string;
  /**
   * @description 语义化类名插槽
   */
  classNames?: ResponsiveButtonGroupClassNames;
  /**
   * @description 语义化样式插槽
   */
  styles?: ResponsiveButtonGroupStyles;
  /**
   * @description 操作项列表数据源
   */
  items: readonly ResponsiveButtonGroupItem[];
  /**
   * @description 展示模式：自适应、强制全部平铺、强制全部折叠
   * @default 'responsive'
   */
  mode?: ResponsiveButtonGroupMode;
  /**
   * @description 必须保持平铺的最少按钮数（不包含“更多”按钮）
   * @default 0
   */
  minVisibleCount?: number;
  /**
   * @description 按钮之间的间距，单位为像素
   * @default 8
   */
  gap?: number;
  /**
   * @description “更多”触发器按钮自定义展示文案
   */
  overflowLabel?: React.ReactNode;
  /**
   * @description “更多”触发器按钮自定义图标
   * @default <EllipsisOutlined />
   */
  overflowIcon?: React.ReactNode;
  /**
   * @description 是否在“更多”按钮上显示当前已折叠的项目数量
   * @default true
   */
  showOverflowCount?: boolean;
  /**
   * @description 透传给“更多”触发器 Button 的属性配置
   */
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
  /**
   * @description 透传给溢出 Dropdown 的属性配置
   */
  overflowDropdownProps?: Omit<DropdownProps, 'children' | 'menu'>;
  /**
   * @description 透传给溢出 Menu 的属性配置
   */
  overflowMenuProps?: Omit<MenuProps, 'items' | 'onClick'>;
  /**
   * @description 自定义“更多”触发器按钮的渲染函数
   */
  renderOverflowButton?: (
    info: ResponsiveButtonGroupOverflowRenderInfo,
  ) => React.ReactNode;
  /**
   * @description 所有操作项的统一点击回调，返回 Promise 时自动保持 Loading 状态
   */
  onItemClick?: (
    info: ResponsiveButtonGroupClickInfo,
  ) => void | Promise<unknown>;
  /**
   * @description 异步操作执行出错时的回调
   */
  onActionError?: (
    error: unknown,
    info: ResponsiveButtonGroupClickInfo,
  ) => void;
  /**
   * @description 平铺项与折叠项集合发生变化时的回调
   */
  onVisibleChange?: (visibleKeys: string[], collapsedKeys: string[]) => void;
}

/** 组件 Ref 句柄类型 */
export type ResponsiveButtonGroupRef = HTMLDivElement;
