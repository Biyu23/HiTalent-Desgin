import { Form, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormFieldItem } from '../type';

interface FieldRendererProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  disabled?: boolean;
}

export const FieldRenderer = <Values extends object>({
  field,
  form,
  disabled,
}: FieldRendererProps<Values>) => {
  const { name, label, children, formItemProps, initialValue, hidden } = field;

  // 判断是否隐藏
  const isHidden =
    typeof hidden === 'function'
      ? hidden(form.getFieldsValue(), form)
      : !!hidden;

  if (isHidden) {
    return null;
  }

  const renderContent = () => {
    if (typeof children === 'function') {
      return children(form);
    }
    if (React.isValidElement(children)) {
      if (disabled) {
        return React.cloneElement(children, {
          disabled: true,
          ...children.props,
        });
      }
      return children;
    }
    return children;
  };

  return (
    <Form.Item
      name={name}
      label={label}
      initialValue={initialValue}
      {...formItemProps}
    >
      {renderContent()}
    </Form.Item>
  );
};
