import { Collapse, type FormInstance } from 'antd';
import React, { useMemo } from 'react';
import type { SearchFormLocale } from '../../../locales';
import Drawer from '../../Drawer';
import { useStyles } from '../style';
import type {
  SearchFieldGroup,
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormStyles,
} from '../type';
import { groupFields } from '../utils';
import { FieldRenderer } from './FieldRenderer';
import { SearchActions } from './SearchActions';

interface MenuDrawerProps<Values extends object> {
  prefixCls?: string;
  open: boolean;
  onClose: () => void;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  groups?: SearchFieldGroup[];
  menuTitle?: React.ReactNode;
  showSearchButton?: boolean;
  showResetButton?: boolean;
  searchText?: React.ReactNode;
  resetText?: React.ReactNode;
  onSubmit: () => void;
  onReset: () => void;
  disabled?: boolean;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const MenuDrawer = <Values extends object>({
  open,
  onClose,
  form,
  fields,
  groups,
  menuTitle,
  showSearchButton = true,
  showResetButton = true,
  searchText,
  resetText,
  onSubmit,
  onReset,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: MenuDrawerProps<Values>) => {
  const { styles: drawerStyles, cx } = useStyles();

  // 快捷筛选字段
  const quickFields = useMemo(() => {
    return fields.filter((field) => field.quick);
  }, [fields]);

  // 非快捷字段，用于分组
  const nonQuickFields = useMemo(() => {
    return fields.filter((field) => !field.quick);
  }, [fields]);

  const sections = useMemo(
    () => groupFields(nonQuickFields, groups, locale.basicInfo),
    [nonQuickFields, groups, locale.basicInfo],
  );
  const collapseItems = sections.map((group) => ({
    key: group.key,
    label: group.title,
    extra: group.extra,
    children: group.fields.map((field) => (
      <FieldRenderer
        key={field.name}
        field={field}
        form={form}
        disabled={disabled}
      />
    )),
  }));
  const defaultActiveKeys = sections
    .filter((group) => group.defaultExpanded !== false)
    .map((group) => group.key);

  const handleSearchClick = () => {
    onSubmit();
    onClose();
  };

  return (
    <Drawer
      title={menuTitle || locale.searchCriteria}
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      classNames={{
        wrapper: classNames?.drawer,
      }}
      styles={{
        wrapper: customStyles?.drawer,
      }}
    >
      <div className={drawerStyles.drawerBody}>
        {/* 快捷筛选 */}
        {quickFields.length > 0 && (
          <div
            className={cx(
              drawerStyles.quickFiltersSection,
              classNames?.quickFilters,
            )}
            style={customStyles?.quickFilters}
          >
            <div className={drawerStyles.quickFiltersTitle}>
              {locale.quickFilters}
            </div>
            <div className={drawerStyles.quickFiltersList}>
              {quickFields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  form={form}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* 业务分组折叠面板 */}
        <Collapse
          defaultActiveKey={defaultActiveKeys}
          ghost
          className={cx(drawerStyles.groupsAccordion, classNames?.group)}
          style={customStyles?.group}
          items={collapseItems}
        />
      </div>

      {/* 底部操作条 */}
      <SearchActions
        showSearchButton={showSearchButton}
        showResetButton={showResetButton}
        searchText={searchText}
        resetText={resetText}
        disabled={disabled}
        classNames={classNames}
        styles={customStyles}
        onSubmit={handleSearchClick}
        onReset={onReset}
        locale={locale}
      />
    </Drawer>
  );
};
