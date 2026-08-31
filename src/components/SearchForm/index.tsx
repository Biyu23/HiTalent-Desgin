import { Form } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { InlineForm } from './components/InlineForm';
import { MenuDrawer } from './components/MenuDrawer';
import { MenuFormView } from './components/MenuFormView';
import { useActiveFilters } from './hooks/useActiveFilters';
import { useStyles } from './style';
import type { SearchFormProps, SearchFormRef, SearchSearchInfo } from './type';

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
    rootClassName,
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

  // 抽屉菜单开启/关闭状态（在 menu 与 combined 模式下使用）
  const [menuOpen, setMenuOpen] = useState(mode === 'menu');

  // 监听当前表单值，用于驱动 ActiveFilters
  const [currentValues, setCurrentValues] = useState<Partial<Values>>(() => {
    return initialValues || {};
  });

  // 提交搜索
  const handleSubmit = useCallback(() => {
    const values = form.getFieldsValue();
    setCurrentValues(values);
    onSearch?.(values, { source: 'submit' });
  }, [form, onSearch]);

  // 重置表单
  const handleReset = useCallback(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues as never);
    } else {
      form.resetFields();
    }
    const resetVals = form.getFieldsValue();
    setCurrentValues(resetVals);
    onReset?.();
    onSearch?.(resetVals, { source: 'reset' });
  }, [form, initialValues, onReset, onSearch]);

  // 表单字段值变动
  const handleValuesChange = useCallback(
    (changedValues: Partial<Values>, allValues: Values) => {
      setCurrentValues(allValues);
      onValuesChange?.(changedValues, allValues);

      if (searchMode === 'change') {
        onSearch?.(allValues, { source: 'change' });
      }
    },
    [onSearch, onValuesChange, searchMode],
  );

  // 活跃已选条件管理
  const { activeFilters, clearAll } = useActiveFilters<Values>({
    fields,
    form,
    currentValues,
    initialValues,
    searchMode,
    onSearch: (values, info: SearchSearchInfo) => {
      setCurrentValues(values);
      onSearch?.(values, info);
    },
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
      const nextValues = {
        ...form.getFieldsValue(),
        [name]: value,
      } as Values;
      setCurrentValues(nextValues);
      onValuesChange?.({ [name]: value } as Partial<Values>, nextValues);

      if (searchMode === 'change') {
        onSearch?.(nextValues, { source: 'change' });
      }
    },
    [form, onSearch, onValuesChange, searchMode],
  );

  return (
    <div
      className={cx(
        prefixCls,
        formStyles.root,
        className,
        rootClassName,
        classNames?.root,
      )}
      style={{ ...customStyles?.root, ...style }}
    >
      <Form
        form={form}
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
        disabled={disabled}
        component={false}
      >
        {/* 平铺模式及联合模式下的顶部平铺表单 */}
        {(mode === 'inline' || mode === 'combined') && (
          <InlineForm
            prefixCls={prefixCls}
            form={form}
            fields={fields}
            mode={mode}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
            defaultVisibleCount={defaultVisibleCount}
            menuTrigger={menuTrigger}
            onOpenMenu={() => setMenuOpen(true)}
            actionExtra={actionExtra}
            onFieldConfirm={handleFieldConfirm}
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
            fields={fields}
            groups={groups}
            currentValues={currentValues}
            searchMode={searchMode}
            onSearch={onSearch}
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
            fields={fields}
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
      </Form>

      {/* 已选条件区（Active Filters Bar） */}
      {showActiveFilters && (
        <ActiveFiltersBar
          prefixCls={prefixCls}
          filters={activeFilters}
          onClearAll={clearAll}
          locale={locale}
          classNames={classNames}
          styles={customStyles}
        />
      )}
    </div>
  );
};

const ForwardSearchForm = forwardRef(
  InternalSearchForm as never,
) as unknown as <Values extends object = Record<string, unknown>>(
  props: SearchFormProps<Values> & { ref?: React.Ref<SearchFormRef<Values>> },
) => React.ReactElement | null;

const SearchForm = memo(
  ForwardSearchForm,
) as unknown as typeof ForwardSearchForm;

export default SearchForm;
