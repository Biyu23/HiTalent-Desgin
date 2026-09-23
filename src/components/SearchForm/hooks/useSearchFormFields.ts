import { Form, type FormInstance } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import type { SearchFormProps } from '../type';

type Options<Values extends object> = Pick<
  SearchFormProps<Values>,
  'fields' | 'initialValues'
> & { form: FormInstance<Values> };

/** 管理默认值、新增字段初始化及依赖表单值的显隐。 */
export function useSearchFormFields<Values extends object>({
  fields,
  initialValues,
  form,
}: Options<Values>) {
  // 未挂载的弹层字段也保存在主表单中，初始值统一在此设置。
  const defaults = useMemo(
    () => ({
      ...Object.fromEntries(
        fields
          .filter((field) => field.initialValue !== undefined)
          .map((field) => [field.name, field.initialValue]),
      ),
      ...initialValues,
    }),
    [fields, initialValues],
  );
  // 初始化新增字段，不覆盖已有值或已清空的值。
  const initializedFields = useRef({ form, names: new Set<string>() });
  useEffect(() => {
    if (initializedFields.current.form !== form) {
      initializedFields.current = { form, names: new Set<string>() };
    }
    const names = initializedFields.current.names;
    const additions = fields.filter((field) => !names.has(field.name));
    fields.forEach((field) => names.add(field.name));
    additions.forEach((field) => {
      const name = field.name as never;
      const value = (defaults as Record<string, unknown>)[field.name];
      if (
        value !== undefined &&
        form.getFieldValue(name) === undefined &&
        !form.isFieldTouched(name)
      ) {
        form.setFields([{ name, value }]);
      }
    });
  }, [fields, defaults, form]);

  const watchedValues = Form.useWatch([], { form, preserve: true });
  const currentValues = (watchedValues ?? defaults) as Values;
  const visibleFields = useMemo(
    () =>
      fields.filter(
        (field) =>
          !(typeof field.hidden === 'function'
            ? field.hidden(currentValues, form)
            : field.hidden),
      ),
    [fields, currentValues, form],
  );

  return { defaults, currentValues, visibleFields };
}
