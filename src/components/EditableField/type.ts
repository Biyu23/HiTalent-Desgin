import type { ModalProps, PopoverProps } from 'antd';
import type React from 'react';
import type { CSSPropertiesWithVars } from '../../types';

export type EditableFieldSlot = 'root' | 'value' | 'action' | 'editor';
export type EditableFieldStyles = Partial<
  Record<EditableFieldSlot, CSSPropertiesWithVars>
>;
export type EditableFieldClassNames = Partial<
  Record<EditableFieldSlot, string>
>;

export interface EditableFieldEditorContext<Value> {
  /** 已确认的外部值；编辑器自行初始化和管理草稿。 */
  value: Value | undefined;
  /** 确认新值，触发外层 onChange 并退出编辑，不负责请求或校验。 */
  submit: (nextValue: Value) => void;
  /** 退出编辑并卸载编辑器，不触发 onChange。 */
  cancel: () => void;
}

export interface EditableFieldProps<Value>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
  > {
  /** 已确认的受控值，也可以由 Form.Item 注入。 */
  value?: Value;
  /** 仅在编辑器调用 submit 时触发；调用方负责更新受控值。 */
  onChange?: (nextValue: Value) => void;
  /** 展示值，需处理尚未初始化的 undefined。 */
  renderValue: (value: Value | undefined) => React.ReactNode;
  /** 编辑区域，负责草稿、校验、请求和操作按钮；只读时可省略。 */
  children?: (context: EditableFieldEditorContext<Value>) => React.ReactNode;
  /** 禁止整个展示区域的鼠标、键盘操作，并关闭编辑器。 */
  readOnly?: boolean;
  /** 禁用时与只读一样不可操作；默认继承 Ant Design 的全局禁用配置。 */
  disabled?: boolean;
  /** action 点击右侧按钮；value 点击展示值，不显示右侧按钮。 */
  trigger?: 'action' | 'value';
  /** 仅影响右侧按钮；hover 在鼠标移入时显示，触屏下常驻显示。 */
  actionVisibility?: 'hover' | 'always';
  /** 自定义完整按钮，将 onClick 绑定到编辑入口。 */
  renderAction?: (props: {
    onClick: React.MouseEventHandler<HTMLElement>;
  }) => React.ReactNode;
  /** inline 原位编辑；popup 浮层编辑；modal 弹窗编辑。默认 popup。 */
  mode?: 'inline' | 'popup' | 'modal';
  /** 浮层编辑区宽度，默认 320px。 */
  popupWidth?: number;
  /** 浮层外观配置，打开状态由 EditableField 管理。 */
  popoverProps?: Pick<
    PopoverProps,
    | 'title'
    | 'placement'
    | 'arrow'
    | 'getPopupContainer'
    | 'styles'
    | 'classNames'
    | 'rootClassName'
    | 'zIndex'
  >;
  /** 弹窗外观配置；关闭按钮和 Esc 执行取消，遮罩点击不关闭，不提供默认页脚。 */
  modalProps?: Pick<
    ModalProps,
    | 'title'
    | 'width'
    | 'centered'
    | 'closable'
    | 'keyboard'
    | 'getContainer'
    | 'styles'
    | 'classNames'
    | 'rootClassName'
    | 'zIndex'
  >;
  style?: CSSPropertiesWithVars;
  styles?: EditableFieldStyles;
  classNames?: EditableFieldClassNames;
  prefixCls?: string;
}
