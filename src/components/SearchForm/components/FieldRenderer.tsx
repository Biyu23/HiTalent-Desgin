import { Form, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormFieldItem } from '../type';

interface FieldRendererProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  disabled?: boolean;
  showLabel?: boolean;
}

export const FieldRenderer = <Values extends object>({
  field,
  form,
  disabled,
  showLabel = true,
}: FieldRendererProps<Values>) => {
  const control =
    typeof field.children === 'function'
      ? field.children(form)
      : field.children;
  return (
    <Form.Item
      {...field.formItemProps}
      name={field.name}
      label={showLabel ? field.label : undefined}
    >
      {(disabled || field.disabled) &&
      React.isValidElement<{ disabled?: boolean }>(control)
        ? React.cloneElement(control, { disabled: true })
        : control}
    </Form.Item>
  );
};
