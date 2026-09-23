import type { FormInstance } from 'antd';
import { useCallback, useEffect, useRef } from 'react';
import type { SearchFormFieldItem, SearchFormProps } from '../type';

type Options<Values extends object> = Pick<
  SearchFormProps<Values>,
  'fields' | 'onSearch' | 'onReset' | 'onValuesChange'
> &
  Required<
    Pick<
      SearchFormProps<Values>,
      'mode' | 'inlineLayout' | 'searchMode' | 'disabled'
    >
  > & {
    form: FormInstance<Values>;
    visibleFields: SearchFormFieldItem<Values>[];
    onValidationFailed: () => void;
  };

/** 统一提交、重置、字段确认和标签移除的事件语义。 */
export function useSearchFormActions<Values extends object>({
  fields,
  visibleFields,
  form,
  mode,
  inlineLayout,
  searchMode,
  disabled,
  onSearch,
  onReset,
  onValuesChange,
  onValidationFailed,
}: Options<Values>) {
  const submission = useRef(0);
  useEffect(
    () => () => {
      submission.current += 1;
    },
    [form, disabled],
  );

  // 提交搜索
  const handleSubmit = useCallback(async () => {
    if (disabled) return false;
    const request = ++submission.current;
    // 菜单、抽屉和直接表单保留折叠字段的挂载，失败时展开定位错误。
    if (mode !== 'inline' || inlineLayout === 'form') {
      try {
        await form.validateFields(
          visibleFields
            .filter((field) => !field.disabled)
            .map((field) => field.name),
        );
      } catch (error) {
        if (
          request !== submission.current ||
          (error as { outOfDate?: boolean })?.outOfDate
        )
          return false;
        onValidationFailed();
        return false;
      }
    }
    if (request !== submission.current) return false;
    onSearch?.(form.getFieldsValue(true), { source: 'submit' });
    return true;
  }, [
    disabled,
    form,
    inlineLayout,
    mode,
    onSearch,
    onValidationFailed,
    visibleFields,
  ]);

  // 重置表单
  const handleReset = useCallback(() => {
    if (disabled) return;
    submission.current += 1;
    form.resetFields();
    const resetVals = form.getFieldsValue(true);
    onReset?.();
    onSearch?.(resetVals, { source: 'reset' });
  }, [disabled, form, onReset, onSearch]);

  // 表单字段值变动
  const handleValuesChange = useCallback(
    (changedValues: Partial<Values>) => {
      if (disabled) return;
      const allValues = form.getFieldsValue(true);
      onValuesChange?.(changedValues, allValues);

      if (searchMode === 'change') {
        onSearch?.(allValues, { source: 'change' });
      }
    },
    [disabled, form, onSearch, onValuesChange, searchMode],
  );

  const handleRemove = useCallback(
    (field: SearchFormFieldItem<Values>, index?: number) => {
      if (disabled || field.disabled) return;
      const before = form.getFieldsValue(true) as Values;
      const value = form.getFieldValue(field.name as never);
      if (index !== undefined && Array.isArray(value)) {
        const next = value.filter((_, position) => position !== index);
        form.setFieldValue(field.name as never, next.length ? next : undefined);
      } else if (field.onClear) field.onClear(form);
      else form.setFieldValue(field.name as never, undefined);
      const nextValues = form.getFieldsValue(true) as Values;
      const changedValues = Object.fromEntries(
        Array.from(
          new Set([...Object.keys(before), ...Object.keys(nextValues)]),
        )
          .filter(
            (key) =>
              !Object.is(
                before[key as keyof Values],
                nextValues[key as keyof Values],
              ),
          )
          .map((key) => [key, nextValues[key as keyof Values]]),
      ) as Partial<Values>;
      onValuesChange?.(changedValues, nextValues);
      onSearch?.(nextValues, { source: 'tag-remove' });
    },
    [disabled, form, onSearch, onValuesChange],
  );

  // 单个字段弹窗确认
  const handleFieldConfirm = useCallback(
    (name: string, value: unknown) => {
      if (disabled || fields.find((field) => field.name === name)?.disabled)
        return;
      form.setFieldValue(name as never, value);
      const nextValues = form.getFieldsValue(true);
      onValuesChange?.({ [name]: value } as Partial<Values>, nextValues);
      onSearch?.(nextValues, {
        source: searchMode === 'change' ? 'change' : 'submit',
      });
    },
    [disabled, fields, form, onSearch, onValuesChange, searchMode],
  );

  return {
    handleSubmit,
    handleReset,
    handleValuesChange,
    handleRemove,
    handleFieldConfirm,
  };
}
