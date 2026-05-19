import { ReactNode } from 'react';

export interface DefaultOptionType {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  [key: string]: any;
}

export interface BasePopoverSelectProps<OptionType = DefaultOptionType> {
  /**
   * @description 样式类名
   */
  className?: string;
  /**
   * @description 内联样式
   */
  style?: React.CSSProperties;
  /**
   * @description 数据配置选项
   * @default []
   */
  options?: OptionType[];
  /**
   * @description 选择框默认提示文字
   */
  placeholder?: ReactNode;
  /**
   * @description 是否显示搜索框
   * @default false
   */
  showSearch?: boolean;
  /**
   * @description 是否允许清除
   * @default false
   */
  allowClear?: boolean;
  /**
   * @description 多选模式下是否显示确认提交按钮
   * @default true
   */
  showConfirm?: boolean;
  /**
   * @description 是否开启虚拟滚动
   * @default true
   */
  virtual?: boolean;
}
// 保证主定义的联合类型能被正常读取
