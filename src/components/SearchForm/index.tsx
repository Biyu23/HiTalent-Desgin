import { Form } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { InlineForm } from './components/InlineForm';
import { MenuDrawer } from './components/MenuDrawer';
import { MenuFormView } from './components/MenuFormView';
import { SearchActions } from './components/SearchActions';
import { useActiveFilters } from './hooks/useActiveFilters';
import { useStyles } from './style';
import type {
  SearchFormFieldItem,
  SearchFormProps,
  SearchFormRef,
} from './type';

export type * from './type';

const InternalSearchForm = <Values extends object = Record<string, unknown>>(
  props: SearchFormProps<Values>,
  ref: React.Ref<SearchFormRef<Values>>,
) => {
  const {
    mode = 'inline',
    fields,
    groups,
    form: customForm,
    initialValues,
    onValuesChange,
    onSearch,
    onReset,
    searchMode = 'submit',
    defaultVisibleCount = 4,
    defaultExpanded = false,
    expanded: controlledExpanded,
    onExpandedChange,
    showActiveFilters = true,
    showSearchButton = true,
    showResetButton = true,
    searchText,
    resetText,
    menuTitle,
    menuTrigger,
    actionExtra,
    disabled = false,
    prefixCls: customPrefixCls,
    className,
    style,
    classNames,
    styles: customStyles,
  } = props;

  const prefixCls = usePrefixCls('search-form', customPrefixCls);
  const locale = useLocale('SearchForm');
  const { styles: formStyles, cx } = useStyles();

  // 内部维护或使用外部传入的 Form 实例
  const [internalForm] = Form.useForm<Values>();
  const form = customForm || internalForm;

  // 平铺展开/收起状态
  const [expanded, { set: setExpanded }] = useMergeState<boolean>({
    defaultValue: defaultExpanded,
    value: controlledExpanded,
    onChange: onExpandedChange,
  });

  // combined 模式下的高级筛选抽屉状态。
  const [menuOpen, setMenuOpen] = useState(false);

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

  // 提交搜索
  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const values = form.getFieldsValue(true);
    onSearch?.(values, { source: 'submit' });
  }, [disabled, form, onSearch]);

  // 重置表单
  const handleReset = useCallback(() => {
    if (disabled) return;
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
      if (disabled) return;
      const value = form.getFieldValue(field.name as never);
      if (index !== undefined && Array.isArray(value)) {
        const next = value.filter((_, position) => position !== index);
        form.setFieldValue(field.name as never, next.length ? next : undefined);
      } else if (field.onClear) field.onClear(form);
      else form.setFieldValue(field.name as never, undefined);
      onSearch?.(form.getFieldsValue(true), { source: 'tag-remove' });
    },
    [disabled, form, onSearch],
  );
  const activeFilters = useActiveFilters({
    fields: showActiveFilters ? visibleFields : [],
    form,
    currentValues,
    onRemove: handleRemove,
  });

  // 暴露给外部的 ref 方法
  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: handleSubmit,
      resetFields: handleReset,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
    }),
    [form, handleReset, handleSubmit],
  );

  // 单个字段弹窗确认
  const handleFieldConfirm = useCallback(
    (name: string, value: unknown) => {
      if (disabled) return;
      form.setFieldValue(name as never, value);
      const nextValues = form.getFieldsValue(true);
      onValuesChange?.({ [name]: value } as Partial<Values>, nextValues);
      onSearch?.(nextValues, {
        source: searchMode === 'change' ? 'change' : 'submit',
      });
    },
    [disabled, form, onSearch, onValuesChange, searchMode],
  );

  return (
    <div className={cx(prefixCls, formStyles.root, className)} style={style}>
      <Form
        form={form}
        initialValues={defaults}
        onValuesChange={handleValuesChange}
        disabled={disabled}
        component={false}
      >
        {/* 平铺模式及联合模式下的顶部平铺表单 */}
        {(mode === 'inline' || mode === 'combined') && (
          <InlineForm
            prefixCls={prefixCls}
            form={form}
            fields={visibleFields}
            mode={mode}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
            defaultVisibleCount={defaultVisibleCount}
            menuTrigger={menuTrigger}
            onOpenMenu={() => setMenuOpen(true)}
            actionExtra={actionExtra}
            onFieldConfirm={handleFieldConfirm}
            onRemove={handleRemove}
            disabled={disabled}
            locale={locale}
            classNames={classNames}
            styles={customStyles}
          />
        )}

        {/* 菜单模式：直接在页面像侧边菜单一样渲染所有分组及字段，无弹窗抽屉 */}
        {mode === 'menu' && (
          <MenuFormView
            prefixCls={prefixCls}
            form={form}
            fields={visibleFields}
            groups={groups}
            currentValues={currentValues}
            onRemove={handleRemove}
            disabled={disabled}
            locale={locale}
            classNames={classNames}
            styles={customStyles}
          />
        )}

        {/* 联合模式下的侧边抽屉高级筛选表单 */}
        {mode === 'combined' && (
          <MenuDrawer
            prefixCls={prefixCls}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            form={form}
            fields={visibleFields}
            groups={groups}
            menuTitle={menuTitle}
            showSearchButton={showSearchButton}
            showResetButton={showResetButton}
            searchText={searchText}
            resetText={resetText}
            onSubmit={handleSubmit}
            onReset={handleReset}
            disabled={disabled}
            locale={locale}
            classNames={classNames}
            styles={customStyles}
          />
        )}
        {mode === 'menu' && (
          <SearchActions
            showSearchButton={showSearchButton}
            showResetButton={showResetButton}
            searchText={searchText}
            resetText={resetText}
            disabled={disabled}
            classNames={classNames}
            styles={customStyles}
            onSubmit={handleSubmit}
            onReset={handleReset}
            locale={locale}
          />
        )}
      </Form>

      {/* 已选条件区（Active Filters Bar） */}
      {showActiveFilters && (
        <ActiveFiltersBar
          prefixCls={prefixCls}
          filters={activeFilters}
          onClearAll={handleReset}
          disabled={disabled}
          locale={locale}
          classNames={classNames}
          styles={customStyles}
        />
      )}
    </div>
  );
};

const SearchForm = memo(forwardRef(InternalSearchForm)) as <
  Values extends object = Record<string, unknown>,
>(
  props: SearchFormProps<Values> & { ref?: React.Ref<SearchFormRef<Values>> },
) => React.ReactElement | null;

export default SearchForm;
