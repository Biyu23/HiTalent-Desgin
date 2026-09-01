import { SearchOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd';
import { Checkbox, Empty, Input, Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useCallback, useMemo } from 'react';
import { usePrefixCls } from '../../../configProvider';
import type { PopoverSelectLocale } from '../../../locales';
import { useStyles } from '../style';
import type { MappedOption, PopoverSelectProps, RawValueType } from '../type';

export interface PopoverSelectContentProps<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  prefixCls?: string;
  options: Array<MappedOption<ValueType, OptionType>>;
  displayOptions: Array<MappedOption<ValueType, OptionType>>;
  selectedValues: ValueType[];
  mode: 'single' | 'multiple';
  showSearch: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showSelectAll: boolean;
  onSelectAll: (event: CheckboxChangeEvent) => void;
  onToggle: (value: ValueType) => void;
  optionRender?: (option: OptionType) => React.ReactNode;
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  footerActions: React.ReactNode[];
  virtual: boolean;
  listHeight: number;
  listItemHeight: number;
  locale: PopoverSelectLocale;
  classNames?: PopoverSelectProps<ValueType, OptionType>['classNames'];
  styles?: PopoverSelectProps<ValueType, OptionType>['styles'];
}

export function PopoverSelectContent<
  ValueType extends RawValueType,
  OptionType extends object,
>(props: PopoverSelectContentProps<ValueType, OptionType>) {
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles: popoverStyles, cx } = useStyles(prefixCls);
  const {
    options,
    displayOptions,
    selectedValues,
    mode,
    showSearch,
    searchValue,
    onSearchChange,
    showSelectAll,
    onSelectAll,
    onToggle,
    optionRender,
    dropdownRender,
    footerActions,
    virtual,
    listHeight,
    listItemHeight,
    locale,
    classNames,
    styles,
  } = props;

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const enabledOptions = useMemo(
    () => displayOptions.filter((option) => !option.disabled),
    [displayOptions],
  );

  const allSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((option) => selectedSet.has(option.value));

  const partiallySelected =
    !allSelected &&
    enabledOptions.some((option) => selectedSet.has(option.value));

  const renderOption = useCallback(
    (option: MappedOption<ValueType, OptionType>) => {
      const content = optionRender ? (
        optionRender(option.source)
      ) : (
        <span
          className={popoverStyles.menuItemText}
          title={typeof option.label === 'string' ? option.label : undefined}
        >
          {option.label}
        </span>
      );

      if (mode === 'multiple') {
        return (
          <Checkbox
            key={option.value}
            value={option.value}
            checked={selectedSet.has(option.value)}
            disabled={option.disabled}
            className={cx(popoverStyles.menuCheckbox, classNames?.item)}
            onChange={() => onToggle(option.value)}
          >
            {content}
          </Checkbox>
        );
      }

      return (
        <div
          key={option.value}
          className={cx(
            popoverStyles.menuRadio,
            selectedSet.has(option.value) && popoverStyles.menuRadioActive,
            option.disabled && popoverStyles.menuRadioDisabled,
            classNames?.item,
          )}
          onClick={() => !option.disabled && onToggle(option.value)}
        >
          {content}
        </div>
      );
    },
    [
      classNames?.item,
      cx,
      mode,
      onToggle,
      optionRender,
      popoverStyles,
      selectedSet,
    ],
  );

  const empty = (description: string) => (
    <div className={cx(popoverStyles.empty, classNames?.empty)}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    </div>
  );

  if (options.length === 0) {
    return <div className={popoverStyles.dropdown}>{empty(locale.noData)}</div>;
  }

  const actualHeight = Math.min(
    displayOptions.length * listItemHeight,
    listHeight,
  );

  const menu = (
    <div
      className={cx(
        popoverStyles.menu,
        !virtual && popoverStyles.menuScroll,
        classNames?.menu,
      )}
      style={{
        ...styles?.menu,
        ...(!virtual ? { maxHeight: listHeight } : undefined),
      }}
    >
      {virtual ? (
        <VirtualList
          data={displayOptions}
          height={actualHeight}
          itemHeight={listItemHeight}
          itemKey="value"
        >
          {renderOption}
        </VirtualList>
      ) : (
        displayOptions.map(renderOption)
      )}
    </div>
  );

  const renderedMenu = dropdownRender ? dropdownRender(menu) : menu;

  return (
    <div className={popoverStyles.dropdown}>
      {showSearch && (
        <div className={cx(popoverStyles.search, classNames?.search)}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={locale.searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            allowClear
          />
        </div>
      )}
      {mode === 'multiple' && showSelectAll && displayOptions.length > 0 && (
        <div className={cx(popoverStyles.selectAll, classNames?.selectAll)}>
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            disabled={enabledOptions.length === 0}
            onChange={onSelectAll}
          >
            {locale.selectAll}
          </Checkbox>
        </div>
      )}
      {displayOptions.length > 0 ? renderedMenu : empty(locale.noMatch)}
      {footerActions.length > 0 && (
        <div className={cx(popoverStyles.footer, classNames?.footer)}>
          <Space>{footerActions}</Space>
        </div>
      )}
    </div>
  );
}

export default PopoverSelectContent;
