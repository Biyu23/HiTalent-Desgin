import { DownOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, Divider, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type {
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormMode,
  SearchFormStyles,
} from '../type';
import { InlinePopoverField } from './InlinePopoverField';

interface InlineFormProps<Values extends object> {
  prefixCls?: string;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  mode: SearchFormMode;
  expanded: boolean;
  onToggleExpand: () => void;
  defaultVisibleCount: number;
  menuTrigger?: React.ReactNode;
  onOpenMenu?: () => void;
  actionExtra?: React.ReactNode;
  onFieldConfirm: (name: string, value: unknown) => void;
  disabled?: boolean;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const InlineForm = <Values extends object>({
  form,
  fields,
  mode,
  expanded,
  onToggleExpand,
  defaultVisibleCount,
  menuTrigger,
  onOpenMenu,
  actionExtra,
  onFieldConfirm,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: InlineFormProps<Values>) => {
  const { styles: formStyles, cx } = useStyles();

  // 计算可见字段：未展开时只显示前 defaultVisibleCount 个，或者带 pinned 的
  const hasThreshold = fields.length > defaultVisibleCount;
  const visibleFields = React.useMemo(() => {
    if (!hasThreshold || expanded) {
      return fields;
    }
    const pinnedFields = fields.filter((f) => f.pinned);
    const normalFields = fields.filter((f) => !f.pinned);
    const takeNormalCount = Math.max(
      0,
      defaultVisibleCount - pinnedFields.length,
    );
    return [...pinnedFields, ...normalFields.slice(0, takeNormalCount)];
  }, [defaultVisibleCount, expanded, fields, hasThreshold]);

  return (
    <div
      className={cx(formStyles.inlineForm, classNames?.form)}
      style={customStyles?.form}
    >
      <div className={formStyles.inlineFieldsWrapper}>
        {visibleFields.map((field, index) => (
          <React.Fragment key={field.name}>
            {index > 0 && (
              <Divider type="vertical" className={formStyles.fieldDivider} />
            )}
            <div className={formStyles.inlineFieldItem}>
              <InlinePopoverField
                field={field}
                form={form}
                disabled={disabled}
                locale={locale}
                onConfirm={onFieldConfirm}
              />
            </div>
          </React.Fragment>
        ))}

        {/* 右侧/尾部展开与操作：紧跟左侧筛选条件，平级对齐 */}
        {(hasThreshold || mode === 'combined' || actionExtra) && (
          <>
            {visibleFields.length > 0 && (
              <Divider type="vertical" className={formStyles.fieldDivider} />
            )}
            <div
              className={cx(formStyles.actionsWrapper, classNames?.actions)}
              style={customStyles?.actions}
            >
              {hasThreshold && (
                <span
                  className={cx(formStyles.toggleButton)}
                  onClick={onToggleExpand}
                >
                  <span>{expanded ? locale.collapse : locale.expand}</span>
                  <DownOutlined
                    className={cx(
                      formStyles.toggleButtonArrow,
                      expanded && formStyles.toggleButtonArrowExpanded,
                    )}
                  />
                </span>
              )}

              {mode === 'combined' && (
                <Button
                  size="small"
                  type="link"
                  icon={<FilterOutlined />}
                  onClick={onOpenMenu}
                  disabled={disabled}
                >
                  {menuTrigger || locale.advancedSearch}
                </Button>
              )}

              {actionExtra}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
