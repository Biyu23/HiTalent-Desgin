import { Collapse, type FormInstance } from 'antd';
import React, { useMemo } from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type {
  SearchFieldGroup,
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormStyles,
} from '../type';
import { groupFields } from '../utils';
import { MenuFieldItem } from './MenuFieldItem';

interface MenuFormViewProps<Values extends object> {
  prefixCls?: string;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  groups?: SearchFieldGroup[];
  currentValues: Partial<Values>;
  onRemove: (field: SearchFormFieldItem<Values>, index?: number) => void;
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
  onRemove,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: MenuFormViewProps<Values>) => {
  const { styles: menuStyles, cx } = useStyles();

  const sections = useMemo(
    () => groupFields(fields, groups, locale.basicInfo),
    [fields, groups, locale.basicInfo],
  );
  const collapseItems = sections.map((group) => ({
    key: group.key,
    label: group.title,
    extra: group.extra,
    children: group.fields.map((field) => (
      <MenuFieldItem
        key={field.name}
        field={field}
        form={form}
        currentValues={currentValues}
        onRemove={onRemove}
        disabled={disabled}
      />
    )),
  }));
  const defaultActiveKeys = sections
    .filter((group) => group.defaultExpanded !== false)
    .map((group) => group.key);

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
