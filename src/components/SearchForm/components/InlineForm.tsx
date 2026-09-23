import { DownOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, type FormInstance } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type {
  SearchFormClassNames,
  SearchFormFieldItem,
  SearchFormInlineLayout,
  SearchFormMode,
  SearchFormStyles,
} from '../type';
import { FieldRenderer } from './FieldRenderer';
import { InlinePopoverField } from './InlinePopoverField';
import { SearchActions } from './SearchActions';

interface InlineFormProps<Values extends object> {
  prefixCls?: string;
  form: FormInstance<Values>;
  fields: SearchFormFieldItem<Values>[];
  mode: SearchFormMode;
  inlineLayout: SearchFormInlineLayout;
  inlineMinWidth: number;
  expanded: boolean;
  onToggleExpand: () => void;
  defaultVisibleCount: number;
  menuTrigger?: React.ReactNode;
  onOpenMenu?: () => void;
  actionExtra?: React.ReactNode;
  onFieldConfirm: (name: string, value: unknown) => void;
  onRemove: (field: SearchFormFieldItem<Values>) => void;
  onSubmit: () => void;
  onReset: () => void;
  showSearchButton?: boolean;
  showResetButton?: boolean;
  searchText?: React.ReactNode;
  resetText?: React.ReactNode;
  disabled?: boolean;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const InlineForm = <Values extends object>({
  form,
  fields,
  mode,
  inlineLayout,
  inlineMinWidth,
  expanded,
  onToggleExpand,
  defaultVisibleCount,
  menuTrigger,
  onOpenMenu,
  actionExtra,
  onFieldConfirm,
  onRemove,
  onSubmit,
  onReset,
  showSearchButton,
  showResetButton,
  searchText,
  resetText,
  disabled,
  locale,
  classNames,
  styles: customStyles,
}: InlineFormProps<Values>) => {
  const { styles, cx } = useStyles();
  const direct = inlineLayout === 'form';
  const limit = Number.isFinite(defaultVisibleCount)
    ? Math.max(0, Math.floor(defaultVisibleCount))
    : 4;
  const pinnedCount = fields.filter((field) => field.pinned).length;
  const hasThreshold = fields.length > Math.max(limit, pinnedCount);
  let remaining = Math.max(0, limit - pinnedCount);
  const collapsedFields = new Set(
    fields
      .filter((field) => field.pinned || remaining-- > 0)
      .map((field) => field.name),
  );
  const visibleFields = fields.filter(
    (field) => expanded || collapsedFields.has(field.name),
  );
  const minWidth =
    Number.isFinite(inlineMinWidth) && inlineMinWidth > 0
      ? inlineMinWidth
      : 200;

  const extra = (
    <>
      {hasThreshold && (
        <button
          type="button"
          disabled={disabled}
          aria-expanded={expanded}
          className={styles.toggleButton}
          onClick={onToggleExpand}
        >
          <span>{expanded ? locale.collapse : locale.expand}</span>
          <DownOutlined
            className={cx(
              styles.toggleButtonArrow,
              expanded && styles.toggleButtonArrowExpanded,
            )}
          />
        </button>
      )}
      {mode === 'combined' && (
        <Button
          type="link"
          icon={<FilterOutlined />}
          onClick={onOpenMenu}
          disabled={disabled}
        >
          {menuTrigger ?? locale.advancedSearch}
        </Button>
      )}
      {actionExtra}
    </>
  );

  return (
    <div
      className={cx(styles.inlineForm, classNames?.form)}
      style={customStyles?.form}
    >
      <div
        className={direct ? styles.inlineGrid : styles.inlineFieldsWrapper}
        style={
          direct
            ? {
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minWidth}px), 1fr))`,
              }
            : undefined
        }
      >
        {/* 直接表单折叠时保留字段挂载，避免丢值和重复注册。 */}
        {(direct ? fields : visibleFields).map((field) => (
          <div
            key={field.name}
            className={direct ? styles.inlineControl : styles.inlineFieldItem}
            style={
              direct && !expanded && !collapsedFields.has(field.name)
                ? { display: 'none' }
                : undefined
            }
          >
            {direct ? (
              <FieldRenderer field={field} form={form} disabled={disabled} />
            ) : (
              <InlinePopoverField
                field={field}
                form={form}
                disabled={disabled}
                locale={locale}
                onConfirm={onFieldConfirm}
                onRemove={onRemove}
              />
            )}
          </div>
        ))}
        {!direct &&
          (hasThreshold ||
            mode === 'combined' ||
            (actionExtra !== null && actionExtra !== undefined)) && (
            <div
              className={cx(styles.actionsWrapper, classNames?.actions)}
              style={customStyles?.actions}
            >
              {extra}
            </div>
          )}
      </div>
      {direct && (
        <SearchActions
          variant="inline"
          showSearchButton={showSearchButton}
          showResetButton={showResetButton}
          searchText={searchText}
          resetText={resetText}
          disabled={disabled}
          classNames={classNames}
          styles={customStyles}
          onSubmit={onSubmit}
          onReset={onReset}
          locale={locale}
          actionExtra={
            hasThreshold ||
            mode === 'combined' ||
            (actionExtra !== null && actionExtra !== undefined)
              ? extra
              : undefined
          }
        />
      )}
    </div>
  );
};
