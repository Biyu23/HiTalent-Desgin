import { Collapse, type FormInstance } from 'antd';
import React, { useMemo } from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type {
  SearchFieldGroup,
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormStyles,
  SearchSearchInfo,
} from '../type';
import { MenuFieldItem } from './MenuFieldItem';

interface MenuFormViewProps<Values extends object> {
  prefixCls?: string;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  groups?: SearchFieldGroup[];
  currentValues: Partial<Values>;
  searchMode?: 'submit' | 'change';
  onSearch?: (values: Values, info: SearchSearchInfo) => void;
  disabled?: boolean;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const MenuFormView = <Values extends object>({
  form,
  fields,
  groups,
  currentValues,
  searchMode,
  onSearch,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: MenuFormViewProps<Values>) => {
  const { styles: menuStyles, cx } = useStyles();

  // 分组解析逻辑：支持用户自定义 groups，未分配的归入默认分组或保留
  const collapseItems = useMemo(() => {
    if (!groups || groups.length === 0) {
      // 未定义 groups 时，将所有字段归于统一的基础分组
      return [
        {
          key: 'default-all',
          label: locale.basicInfo,
          children: fields.map((field) => (
            <MenuFieldItem
              key={field.name}
              field={field}
              form={form}
              currentValues={currentValues}
              searchMode={searchMode}
              onSearch={onSearch}
              disabled={disabled}
            />
          )),
        },
      ];
    }

    const groupMap = new Map<string, SearchFormFieldItem<Values>[]>();
    groups.forEach((g) => groupMap.set(g.key, []));
    const ungrouped: SearchFormFieldItem<Values>[] = [];

    fields.forEach((field) => {
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
        <MenuFieldItem
          key={field.name}
          field={field}
          form={form}
          currentValues={currentValues}
          searchMode={searchMode}
          onSearch={onSearch}
          disabled={disabled}
        />
      )),
    }));

    // 若有未在 groups 中声明 group key 的字段，作为追加分组展示
    if (ungrouped.length > 0) {
      items.push({
        key: 'ungrouped',
        label: locale.searchCriteria,
        extra: undefined,
        children: ungrouped.map((field) => (
          <MenuFieldItem
            key={field.name}
            field={field}
            form={form}
            currentValues={currentValues}
            searchMode={searchMode}
            onSearch={onSearch}
            disabled={disabled}
          />
        )),
      });
    }

    return items;
  }, [
    currentValues,
    disabled,
    fields,
    form,
    groups,
    locale.basicInfo,
    locale.searchCriteria,
    onSearch,
    searchMode,
  ]);

  // 默认展开所有声明为 defaultExpanded 或默认全部展开的分组
  const defaultActiveKeys = useMemo(() => {
    if (!groups || groups.length === 0) {
      return ['default-all'];
    }
    return groups
      .filter((g) => g.defaultExpanded !== false)
      .map((g) => g.key)
      .concat(['ungrouped']);
  }, [groups]);

  return (
    <div
      className={cx(menuStyles.menuContainer, classNames?.menu)}
      style={customStyles?.menu}
    >
      <Collapse
        defaultActiveKey={defaultActiveKeys}
        ghost
        className={cx(menuStyles.menuCollapse, classNames?.group)}
        style={customStyles?.group}
        items={collapseItems}
      />
    </div>
  );
};
