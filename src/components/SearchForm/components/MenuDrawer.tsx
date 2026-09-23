import { Collapse, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
import Drawer from '../../Drawer';
import { useSearchFormGroups } from '../hooks/useSearchFormGroups';
import { useValidationExpand } from '../hooks/useValidationExpand';
import { useStyles } from '../style';
import type {
  SearchFieldGroup,
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormStyles,
} from '../type';
import { FieldRenderer } from './FieldRenderer';
import { SearchActions } from './SearchActions';

interface MenuDrawerProps<Values extends object> {
  prefixCls?: string;
  open: boolean;
  forceRender: boolean;
  onClose: () => void;
  validationAttempt: number;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  groups?: SearchFieldGroup[];
  menuTitle?: React.ReactNode;
  showSearchButton?: boolean;
  showResetButton?: boolean;
  searchText?: React.ReactNode;
  resetText?: React.ReactNode;
  actionExtra?: React.ReactNode;
  onSubmit: () => Promise<boolean>;
  onReset: () => void;
  disabled?: boolean;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const MenuDrawer = <Values extends object>({
  open,
  forceRender,
  onClose,
  form,
  validationAttempt,
  fields,
  groups,
  menuTitle,
  showSearchButton = true,
  showResetButton = true,
  searchText,
  resetText,
  onSubmit,
  onReset,
  actionExtra,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: MenuDrawerProps<Values>) => {
  const { styles: drawerStyles, cx } = useStyles();

  const { quickFields, sections } = useSearchFormGroups(
    fields,
    groups,
    locale.basicInfo,
  );
  const collapseState = useValidationExpand(
    sections
      .filter((group) => group.defaultExpanded !== false)
      .map((group) => group.key),
    sections.map((group) => group.key),
    validationAttempt,
  );
  const collapseItems = sections.map((group) => ({
    key: group.key,
    forceRender: true,
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
  const handleSearchClick = async () => {
    if (await onSubmit()) onClose();
  };

  return (
    <Drawer
      title={menuTitle ?? locale.searchCriteria}
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      forceRender={forceRender}
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
          {...collapseState}
          ghost
          className={cx(drawerStyles.groupsAccordion, classNames?.group)}
          style={customStyles?.group}
          items={collapseItems}
        />
      </div>

      {/* 底部操作条 */}
      <SearchActions
        variant="drawer"
        actionExtra={actionExtra}
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
