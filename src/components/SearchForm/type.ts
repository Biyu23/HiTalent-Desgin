import type { FormInstance, FormItemProps } from 'antd';
import type React from 'react';
import type { NativeProps } from '../../types';
import type {
  SemanticClassNames,
  SemanticStyleProps,
  SemanticStyles,
} from '../_util/semanticStyles';

export type SearchFormMode = 'inline' | 'menu' | 'combined';

export type SearchTriggerMode = 'submit' | 'change';

export interface SearchFieldGroup {
  /** 分组唯一标识 */
  key: string;
  /** 分组标题 */
  title: React.ReactNode;
  /** 是否默认展开，默认为 true */
  defaultExpanded?: boolean;
  /** 分组右侧扩展内容 */
  extra?: React.ReactNode;
}

export interface SearchFormFieldItem<
  Values extends object = Record<string, unknown>,
> {
  /** 字段唯一标识，对应 Form 的 name */
  name: string;
  /** 字段标签文案 */
  label: React.ReactNode;
  /**
   * 字段表单控件渲染内容
   * 可以直接传入 React 元素（如 <Input />、<Select />、<PopoverSelect /> 等），
   * 也可以是接收 form 实例并返回 React 元素的函数
   */
  children?:
    | React.ReactNode
    | ((form: FormInstance<Values>) => React.ReactNode);
  /** 字段在 Form.Item 上的额外配置（如 rules, dependencies, valuePropName 等） */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'children'>;
  /** 初始默认值 */
  initialValue?: unknown;
  /** 字段所占的栅格列数（24栅格制），不传则根据布局自适应 */
  span?: number;
  /** 分组标识（在 menu 模式下归属的分组 key） */
  group?: string;
  /** 是否作为快捷筛选（在 menu 模式下呈现在顶部的 Quick Filters 快速勾选区） */
  quick?: boolean;
  /** 是否固定展示（在平铺收起状态下始终展示） */
  pinned?: boolean;
  /** 在 menu 模式下，该字段的组件区域是否默认展开，默认 false */
  defaultExpanded?: boolean;
  /** 在 menu 模式下，label 下方最多展示的 Tag 数量，超出折叠为 popover，默认 3 */
  maxTagCount?: number;
  /**
   * 自定义该字段在“已选条件区 (Active Filters)”生成的标签文案
   * - 返回 string / ReactNode 时，显示对应文案；
   * - 返回 false / null / undefined 时，该字段不生成标签
   */
  formatTag?: (
    value: unknown,
    allValues: Values,
    form: FormInstance<Values>,
  ) => React.ReactNode | false | null;
  /** 自定义单个 Tag 清空时的逻辑，默认执行 form.setFieldValue(name, undefined) */
  onClear?: (form: FormInstance<Values>) => void;
  /** 是否隐藏该字段 */
  hidden?: boolean | ((values: Values, form: FormInstance<Values>) => boolean);
}

export interface SearchSearchInfo {
  source: 'submit' | 'change' | 'tag-remove' | 'reset';
}

export interface SearchFormRef<
  Values extends object = Record<string, unknown>,
> {
  /** 访问内部的 Ant Design Form 实例 */
  form: FormInstance<Values>;
  /** 手动触发提交查询 */
  submit: () => void;
  /** 重置所有字段到初始值并触发查询 */
  resetFields: () => void;
  /** 打开菜单/抽屉面板（在 menu 或 combined 模式下有效） */
  openMenu: () => void;
  /** 关闭菜单/抽屉面板 */
  closeMenu: () => void;
}

export type SearchFormSlot =
  | 'form'
  | 'actions'
  | 'activeFilters'
  | 'menu'
  | 'drawer'
  | 'quickFilters'
  | 'group';

export type SearchFormClassNames = SemanticClassNames<SearchFormSlot>;
export type SearchFormStyles = SemanticStyles<SearchFormSlot>;

export interface SearchFormProps<
  Values extends object = Record<string, unknown>,
> extends NativeProps,
    SemanticStyleProps<SearchFormSlot> {
  /**
   * 展示模式：
   * - 'inline': 平铺模式
   * - 'menu': 菜单模式（在页面中如侧边菜单般展示全部条件）
   * - 'combined': 联合协同模式（平铺高频项 + 侧边抽屉高级筛选）
   * @default 'inline'
   */
  mode?: SearchFormMode;
  /** 筛选项字段定义列表 */
  fields: SearchFormFieldItem<Values>[];
  /** 字段业务分组配置（menu 模式下有效） */
  groups?: SearchFieldGroup[];
  /** 外部传入的 Ant Design Form 实例（支持外层受控，非必填，未传内部自动使用 Form.useForm） */
  form?: FormInstance<Values>;
  /** 初始默认表单值 */
  initialValues?: Partial<Values>;
  /** 表单值变更回调 */
  onValuesChange?: (changedValues: Partial<Values>, allValues: Values) => void;
  /**
   * 触发搜索查询回调
   * @param values 当前表单的所有字段值
   * @param info 查询触发的来源信息
   */
  onSearch?: (values: Values, info: SearchSearchInfo) => void;
  /** 触发重置回调 */
  onReset?: () => void;
  /**
   * 查询触发模式：
   * - 'submit': 仅点击“搜索”或平铺弹窗点击“确定”时触发
   * - 'change': 表单项值变更即自动触发
   * @default 'submit'
   */
  searchMode?: SearchTriggerMode;
  /**
   * 平铺展示模式下默认显示的字段数量阈值，超出部分支持展开/收起
   * @default 4
   */
  defaultVisibleCount?: number;
  /** 是否默认展开全部平铺字段，默认 false */
  defaultExpanded?: boolean;
  /** 是否受控展开状态 */
  expanded?: boolean;
  /** 展开/收起状态变化回调 */
  onExpandedChange?: (expanded: boolean) => void;
  /** 是否展示已选条件区（Active Filters Bar），默认 true */
  showActiveFilters?: boolean;
  /** 是否展示搜索操作按钮（MenuDrawer 中），默认 true */
  showSearchButton?: boolean;
  /** 是否展示重置操作按钮（MenuDrawer 中），默认 true */
  showResetButton?: boolean;
  /** 搜索按钮文案，默认 "搜索" */
  searchText?: React.ReactNode;
  /** 重置按钮文案，默认 "重置" */
  resetText?: React.ReactNode;
  /** 抽屉面板标题（combined 模式下的侧抽屉），默认 "搜索条件" */
  menuTitle?: React.ReactNode;
  /** 唤起抽屉的按钮文案或节点（combined 模式），默认 "高级筛选" */
  menuTrigger?: React.ReactNode;
  /** 自定义操作区额外内容渲染 */
  actionExtra?: React.ReactNode;
  /** 组件类名前缀 */
  prefixCls?: string;
  /** 是否禁用全部字段 */
  disabled?: boolean;
}
