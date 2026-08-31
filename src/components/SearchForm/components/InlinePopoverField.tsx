import { DownOutlined } from '@ant-design/icons';
import { Button, Form, Popover, type FormInstance } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type { SearchFormFieldItem } from '../type';

interface InlinePopoverFieldProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  disabled?: boolean;
  locale: SearchFormLocale;
  onConfirm: (fieldName: string, value: unknown) => void;
  className?: string;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export const InlinePopoverField = <Values extends object>({
  field,
  form,
  disabled,
  locale,
  onConfirm,
  className,
}: InlinePopoverFieldProps<Values>) => {
  const { name, label, children, formItemProps, hidden } = field;
  const { styles: formStyles, cx } = useStyles();

  const [open, setOpen] = useState(false);
  const currentValue = form.getFieldValue(name as never);
  const hasValue = !isEmptyValue(currentValue);

  const [popoverForm] = Form.useForm();

  useEffect(() => {
    if (open) {
      const val = form.getFieldValue(name as never);
      popoverForm.setFieldsValue({ [name]: val });
    }
  }, [form, name, open, popoverForm]);

  const handleConfirm = useCallback(async () => {
    try {
      const values = await popoverForm.validateFields([name]);
      const confirmedVal = values[name];
      form.setFieldValue(name as never, confirmedVal as never);
      onConfirm(name, confirmedVal);
      setOpen(false);
    } catch {
      // 校验未通过，保留在弹层中展示错误提示
    }
  }, [form, name, onConfirm, popoverForm]);

  const handleClear = useCallback(() => {
    if (field.onClear) {
      field.onClear(form);
    } else {
      form.setFieldValue(name as never, undefined as never);
    }
    popoverForm.setFieldValue(name, undefined);
    onConfirm(name, undefined);
    setOpen(false);
  }, [field, form, name, onConfirm, popoverForm]);

  const isHidden =
    typeof hidden === 'function'
      ? hidden(form.getFieldsValue(), form)
      : !!hidden;

  if (isHidden) {
    return null;
  }

  // 渲染 children 控件
  const renderControl = () => {
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

  const popoverContent = (
    <div className={formStyles.popoverPanel}>
      <Form
        form={popoverForm}
        component={false}
        initialValues={{ [name]: currentValue }}
      >
        <div className={formStyles.popoverPanelContent}>
          <Form.Item name={name} {...formItemProps}>
            {renderControl()}
          </Form.Item>
        </div>
      </Form>
      <div className={formStyles.popoverPanelFooter}>
        <Button size="small" onClick={handleClear}>
          {locale.clear}
        </Button>
        <Button size="small" type="primary" onClick={handleConfirm}>
          {locale.confirm}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
      }}
      placement="bottomLeft"
      destroyTooltipOnHide
    >
      <span
        className={cx(
          formStyles.fieldTrigger,
          open && formStyles.fieldTriggerActive,
          hasValue && formStyles.fieldTriggerHasValue,
          className,
        )}
      >
        <span>{label}</span>
        <DownOutlined
          className={cx(
            formStyles.fieldTriggerArrow,
            open && formStyles.fieldTriggerArrowOpen,
          )}
        />
      </span>
    </Popover>
  );
};
