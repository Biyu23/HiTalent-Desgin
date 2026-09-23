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
import { SearchActions } from './components/SearchActions';
import { useActiveFilters } from './hooks/useActiveFilters';
import { useSearchFormActions } from './hooks/useSearchFormActions';
import { useSearchFormFields } from './hooks/useSearchFormFields';
import { useStyles } from './style';
import type { SearchFormProps, SearchFormRef } from './type';

export type * from './type';

const InternalSearchForm = <Values extends object = Record<string, unknown>>(
  props: SearchFormProps<Values>,
  ref: React.Ref<SearchFormRef<Values>>,
) => {
  const {
    mode = 'inline',
    inlineLayout = 'popover',
    inlineMinWidth = 200,
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
  const [expanded, setExpanded] = useMergeState<boolean>({
    defaultValue: defaultExpanded,
    ...(controlledExpanded !== undefined ? { value: controlledExpanded } : {}),
    onChange: onExpandedChange,
  });

  // combined 模式下的高级筛选抽屉状态。
  const [menuOpen, setMenuOpen] = useState(false);

  const { defaults, currentValues, visibleFields } = useSearchFormFields({
    fields,
    initialValues,
    form,
  });
  const [validationAttempt, setValidationAttempt] = useState(0);
  const handleValidationFailed = useCallback(() => {
    if (mode !== 'menu' && inlineLayout === 'form') setExpanded(true);
    if (mode === 'combined') setMenuOpen(true);
    setValidationAttempt((attempt) => attempt + 1);
  }, [mode, inlineLayout, setExpanded]);
  const {
    handleSubmit,
    handleReset,
    handleValuesChange,
    handleRemove,
    handleFieldConfirm,
  } = useSearchFormActions({
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
    onValidationFailed: handleValidationFailed,
  });

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

  return (
    <div
      className={cx(
        prefixCls,
        `${prefixCls}-${mode}`,
        formStyles.root,
        className,
      )}
      style={style}
    >
      <Form
        form={form}
        initialValues={defaults}
        onValuesChange={handleValuesChange}
        disabled={disabled}
        layout="vertical"
        component={false}
      >
        {/* 平铺模式及联合模式下的顶部平铺表单 */}
        {(mode === 'inline' || mode === 'combined') && (
          <InlineForm
            prefixCls={prefixCls}
            form={form}
            fields={visibleFields}
            mode={mode}
            inlineLayout={inlineLayout}
            inlineMinWidth={inlineMinWidth}
            showSearchButton={showSearchButton}
            showResetButton={showResetButton}
            searchText={searchText}
            resetText={resetText}
            onSubmit={handleSubmit}
            onReset={handleReset}
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
            validationAttempt={validationAttempt}
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
            forceRender={inlineLayout === 'popover'}
            validationAttempt={validationAttempt}
            prefixCls={prefixCls}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            form={form}
            fields={visibleFields}
            groups={groups}
            menuTitle={menuTitle}
            actionExtra={actionExtra}
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
            actionExtra={actionExtra}
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
