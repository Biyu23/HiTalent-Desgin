import { Collapse, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
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
import { MenuFieldItem } from './MenuFieldItem';

interface MenuFormViewProps<Values extends object> {
  prefixCls?: string;
  validationAttempt: number;
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
  validationAttempt,
  fields,
  groups,
  currentValues,
  onRemove,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: MenuFormViewProps<Values>) => {
  const { styles, cx } = useStyles();
  const { quickFields, sections } = useSearchFormGroups(
    fields,
    groups,
    locale.basicInfo,
  );
  // 只为显式配置的业务分组显示分组标题，普通字段直接作为一级菜单项。
  const groupedSections = sections.filter((group) => group.key !== 'ungrouped');
  const ungroupedFields =
    sections.find((group) => group.key === 'ungrouped')?.fields ?? [];
  const groupCollapse = useValidationExpand(
    groupedSections
      .filter((group) => group.defaultExpanded !== false)
      .map((group) => group.key),
    groupedSections.map((group) => group.key),
    validationAttempt,
  );
  const quickCollapse = useValidationExpand([], ['quick'], validationAttempt);

  return (
    <div
      className={cx(styles.menuContainer, classNames?.menu)}
      style={customStyles?.menu}
    >
      {quickFields.length > 0 && (
        <Collapse
          {...quickCollapse}
          ghost
          expandIconPosition="end"
          className={cx(styles.menuCollapse, classNames?.quickFilters)}
          style={customStyles?.quickFilters}
          items={[
            {
              key: 'quick',
              forceRender: true,
              label: locale.quickFilters,
              children: (
                <div className={styles.menuQuickFields}>
                  {quickFields.map((field) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      form={form}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
      {groupedSections.length > 0 && (
        <Collapse
          {...groupCollapse}
          expandIconPosition="end"
          ghost
          className={cx(styles.menuCollapse, classNames?.group)}
          style={customStyles?.group}
          items={groupedSections.map((group) => ({
            key: group.key,
            forceRender: true,
            label: group.title,
            extra: group.extra,
            children: group.fields.map((field) => (
              <MenuFieldItem
                validationAttempt={validationAttempt}
                key={field.name}
                field={field}
                form={form}
                currentValues={currentValues}
                onRemove={onRemove}
                disabled={disabled}
              />
            )),
          }))}
        />
      )}
      {ungroupedFields.map((field) => (
        <MenuFieldItem
          validationAttempt={validationAttempt}
          key={field.name}
          field={field}
          form={form}
          currentValues={currentValues}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
