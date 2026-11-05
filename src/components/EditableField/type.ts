import type { PopoverProps } from 'antd';
import type React from 'react';
import type { CSSPropertiesWithVars } from '../../types';

/** popup 对应浮层外框，其他插槽对应组件内部区域。 */
export type EditableFieldSlot =
  | 'root'
  | 'action'
  | 'editor'
  | 'footer'
  | 'popup';
export type EditableFieldStyles = Partial<
  Record<EditableFieldSlot, CSSPropertiesWithVars>
>;
export type EditableFieldClassNames = Partial<
  Record<EditableFieldSlot, string>
>;

export interface EditableFieldEditorContext<Value> {
  /** 当前草稿；对象和数组请通过 onChange 返回新值，不要原地修改。 */
  value: Value;
  onChange: (value: Value) => void;
  /** 校验和保存期间编辑器应禁用输入。 */
  saving: boolean;
}

export interface EditableFieldProps<Value>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
  > {
  /** 已提交的受控值。 */
  value: Value;
  /** 保存成功后通知业务更新 value；取消、保存失败均不触发。 */
  onChange: (value: Value) => void;
  /** 渲染原有只读内容，链接等交互保持可用。 */
  renderValue: (value: Value) => React.ReactNode;
  /** 仅在编辑时渲染；可接入任意受控编辑器。 */
  renderEditor: (context: EditableFieldEditorContext<Value>) => React.ReactNode;
  /** 调用方负责校验和保存：resolve 后提交并关闭，reject 保留草稿；错误提示由业务处理。不传时直接提交。 */
  onSave?: (value: Value) => Promise<unknown>;
  /** popup 不改变原布局；inline 原位替换，高度由编辑器决定。 */
  mode?: 'popup' | 'inline';
  /** 禁止编辑，仍显示原只读内容。 */
  disabled?: boolean;
  /** 默认悬停显示；always 适合需要常驻编辑入口的页面。 */
  actionVisibility?: 'hover' | 'always';
  /** 浮层编辑区宽度，默认 320px，不超过视口宽度。 */
  popupWidth?: number;
  /** 浮层位置，默认 bottomLeft。 */
  placement?: PopoverProps['placement'];
  /** 自定义浮层挂载位置。 */
  getPopupContainer?: PopoverProps['getPopupContainer'];
  /** 容器样式，可设置 --editable-field-hover-bg 和 --editable-field-action-bg。 */
  style?: CSSPropertiesWithVars;
  /** 各区域的样式覆盖，优先于默认样式。 */
  styles?: EditableFieldStyles;
  /** 各区域的自定义类名。 */
  classNames?: EditableFieldClassNames;
  prefixCls?: string;
}
