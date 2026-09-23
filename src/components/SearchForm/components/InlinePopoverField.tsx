import { DownOutlined } from '@ant-design/icons';
import { Button, Form, Popover, type FormInstance } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type { SearchFormFieldItem } from '../type';
import { formatFilterValue, isEmptyValue } from '../utils';
import { FieldRenderer } from './FieldRenderer';

interface InlinePopoverFieldProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  disabled?: boolean;
  locale: SearchFormLocale;
  onConfirm: (fieldName: string, value: unknown) => void;
  onRemove: (field: SearchFormFieldItem<Values>) => void;
  className?: string;
}

export const InlinePopoverField = <Values extends object>({
  field,
  form,
  disabled: formDisabled,
  locale,
  onConfirm,
  onRemove,
  className,
}: InlinePopoverFieldProps<Values>) => {
  const { name, label } = field;
  const disabled = formDisabled || field.disabled;
  const { styles: formStyles, cx } = useStyles();

  const [open, setOpen] = useState(false);
  const currentValue = form.getFieldValue(name as never);
  const hasValue = !isEmptyValue(currentValue);
  const summary = hasValue
    ? field.formatTag
      ? field.formatTag(currentValue, form.getFieldsValue(true), form)
      : formatFilterValue(currentValue)
    : null;

  const [popoverForm] = Form.useForm();

  useEffect(() => {
    if (open) {
      const val = form.getFieldValue(name as never);
      popoverForm.setFields([{ name, value: val, errors: [], warnings: [] }]);
    }
  }, [form, name, open, popoverForm]);

  const handleConfirm = useCallback(async () => {
    if (disabled) return;
    let values;
    try {
      values = await popoverForm.validateFields([name]);
    } catch {
      return;
    } // 校验失败时留在弹层展示错误，不吞掉业务回调异常。
    onConfirm(name, values[name]);
    setOpen(false);
  }, [disabled, name, onConfirm, popoverForm]);

  const handleClear = () => {
    if (disabled) return;
    onRemove(field);
    setOpen(false);
  };

  const popoverContent = (
    <div className={formStyles.popoverPanel}>
      <Form
        form={popoverForm}
        component={false}
        disabled={disabled}
        initialValues={{ [name]: currentValue }}
      >
        <div className={formStyles.popoverPanelContent}>
          <FieldRenderer
            field={field}
            form={form}
            disabled={disabled}
            showLabel={false}
          />
        </div>
      </Form>
      <div className={formStyles.popoverPanelFooter}>
        <Button size="small" onClick={handleClear} disabled={disabled}>
          {locale.clear}
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={handleConfirm}
          disabled={disabled}
        >
          {locale.confirm}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open && !disabled}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
      }}
      placement="bottomLeft"
      destroyTooltipOnHide
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open && !disabled}
        className={cx(
          formStyles.fieldTrigger,
          open && formStyles.fieldTriggerActive,
          hasValue && formStyles.fieldTriggerHasValue,
          className,
        )}
      >
        <span className={formStyles.fieldTriggerLabel}>{label}</span>
        {summary !== null && summary !== undefined && summary !== false && (
          <span
            className={formStyles.fieldTriggerSummary}
            title={typeof summary === 'string' ? summary : undefined}
          >
            {summary}
          </span>
        )}
        <DownOutlined
          className={cx(
            formStyles.fieldTriggerArrow,
            open && formStyles.fieldTriggerArrowOpen,
          )}
        />
      </button>
    </Popover>
  );
};
