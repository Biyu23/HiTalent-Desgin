import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input } from 'antd';
import React, { useMemo } from 'react';
import { usePrefixCls } from '../../../configProvider';
import { useStyles } from '../style';
import type { RawValueType } from '../type';
import PopoverSelectFooter from './PopoverSelectFooter';
import PopoverSelectList, { PopoverSelectListProps } from './PopoverSelectList';

/** 面板布局与渲染插槽，不管理选择或拖拽状态。 */
export default function PopoverSelectContent<
  V extends RawValueType,
  O extends object,
>({
  config,
  context,
  locale,
  active,
  onSearchChange,
}: PopoverSelectListProps<V, O> & { onSearchChange: (value: string) => void }) {
  const prefixCls = usePrefixCls('popover-select', config.prefixCls);
  const { styles, cx } = useStyles();
  const { classNames } = config;
  const selected = useMemo(
    () => new Set(context.selectedValues),
    [context.selectedValues],
  );
  const enabledOptions = useMemo(
    () => context.displayOptions.filter((option) => !option.disabled),
    [context.displayOptions],
  );
  const selectedCount = enabledOptions.filter((option) =>
    selected.has(option.value),
  ).length;
  const menu = (
    <PopoverSelectList
      config={config}
      context={context}
      locale={locale}
      active={active}
    />
  );
  const defaultFooter =
    config.showClearBtn || config.showCancelBtn || context.confirmRequired ? (
      <PopoverSelectFooter
        context={context}
        locale={locale}
        showClear={config.showClearBtn}
        showCancel={config.showCancelBtn}
      />
    ) : null;
  const footer = config.footerRender
    ? config.footerRender(defaultFooter, context)
    : defaultFooter;
  return (
    <div
      className={cx(prefixCls + '-dropdown', styles.dropdown)}
      style={
        {
          '--popover-select-item-height': (config.listItemHeight ?? 34) + 'px',
        } as React.CSSProperties
      }
    >
      {config.showSearch && (
        <div className={cx(styles.search, classNames?.search)}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={locale.searchPlaceholder}
            value={context.searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            allowClear
          />
        </div>
      )}
      {context.mode === 'multiple' &&
        config.showSelectAll &&
        context.displayOptions.length > 0 && (
          <div className={cx(styles.selectAll, classNames?.selectAll)}>
            <Checkbox
              checked={
                enabledOptions.length > 0 &&
                selectedCount === enabledOptions.length
              }
              indeterminate={
                selectedCount > 0 && selectedCount < enabledOptions.length
              }
              disabled={!enabledOptions.length || config.disabled}
              onChange={(event) => context.selectAll(event.target.checked)}
            >
              {locale.selectAll}
            </Checkbox>
          </div>
        )}
      {menu}
      {footer !== null && footer !== undefined && footer !== false && (
        <div className={cx(styles.footer, classNames?.footer)}>{footer}</div>
      )}
    </div>
  );
}
