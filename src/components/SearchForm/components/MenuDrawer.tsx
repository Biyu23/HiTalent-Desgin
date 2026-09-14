import { Button, Collapse, type FormInstance } from 'antd';
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
import { FieldRenderer } from './FieldRenderer';

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

  // 分组解析
  const collapseItems = useMemo(() => {
    if (!groups || groups.length === 0) {
      // 未定义分组，全部归入默认“基础信息”
      return [
        {
          key: 'default',
          label: locale.basicInfo,
          children: nonQuickFields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              form={form}
              disabled={disabled}
            />
          )),
        },
      ];
    }

    const groupMap = new Map<string, SearchFormFieldItem<Values>[]>();
    groups.forEach((g) => groupMap.set(g.key, []));
    const ungrouped: SearchFormFieldItem<Values>[] = [];

    nonQuickFields.forEach((field) => {
      if (field.group && groupMap.has(field.group)) {
        groupMap.get(field.group)!.push(field);
      } else {
        ungrouped.push(field);
      }
    });

    const items = groups.map((g) => ({
      key: g.key,
      label: g.title,
      extra: g.extra,
      children: (groupMap.get(g.key) || []).map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          form={form}
          disabled={disabled}
        />
      )),
    }));

    if (ungrouped.length > 0) {
      items.push({
        key: 'other',
        label: locale.basicInfo,
        extra: undefined,
        children: ungrouped.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            form={form}
            disabled={disabled}
          />
        )),
      });
    }

    return items;
  }, [disabled, form, groups, locale.basicInfo, nonQuickFields]);

  const defaultActiveKeys = useMemo(() => {
    if (!groups || groups.length === 0) return ['default'];
    const active = groups
      .filter((g) => g.defaultExpanded !== false)
      .map((g) => g.key);
    return active.length > 0 ? active : [groups[0].key];
  }, [groups]);

  const handleSearchClick = () => {
    onSubmit();
    onClose();
  };

  const handleResetClick = () => {
    onReset();
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
      {(showResetButton || showSearchButton) && (
        <div
          className={cx(drawerStyles.drawerFooter, classNames?.actions)}
          style={customStyles?.actions}
        >
          {showResetButton && (
            <Button onClick={handleResetClick} disabled={disabled}>
              {resetText || locale.reset}
            </Button>
          )}
          {showSearchButton && (
            <Button
              type="primary"
              onClick={handleSearchClick}
              disabled={disabled}
            >
              {searchText || locale.search}
            </Button>
          )}
        </div>
      )}
    </Drawer>
  );
};
