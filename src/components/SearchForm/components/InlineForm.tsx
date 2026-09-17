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
  onRemove: (field: SearchFormFieldItem<Values>) => void;
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
  onRemove,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: InlineFormProps<Values>) => {
  const { styles: formStyles, cx } = useStyles();

  // 计算可见字段：未展开时只显示前 defaultVisibleCount 个，或者带 pinned 的
  const limit = Number.isFinite(defaultVisibleCount)
    ? Math.max(0, Math.floor(defaultVisibleCount))
    : 4;
  const hasThreshold =
    fields.length >
    Math.max(limit, fields.filter((field) => field.pinned).length);
  const visibleFields = React.useMemo(() => {
    if (!hasThreshold || expanded) {
      return fields;
    }
    let remaining = Math.max(
      0,
      limit - fields.filter((field) => field.pinned).length,
    );
    return fields.filter((field) => field.pinned || remaining-- > 0);
  }, [limit, expanded, fields, hasThreshold]);

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
                onRemove={onRemove}
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
                <button
                  type="button"
                  disabled={disabled}
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
                </button>
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
