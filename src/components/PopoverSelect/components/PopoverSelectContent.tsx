import { SearchOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd';
import { Checkbox, Empty, Input, Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useCallback, useMemo } from 'react';
import { usePrefixCls } from '../../../configProvider';
import type { PopoverSelectLocale } from '../../../locales';
import { useStyles } from '../style';
import type { MappedOption, PopoverSelectProps, RawValueType } from '../type';
import { getOptionKey } from '../utils';

export interface PopoverSelectContentProps<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  /** 样式前缀 */
  prefixCls?: string;
  /** 全量可用选项列表 */
  options: Array<MappedOption<ValueType, OptionType>>;
  /** 经搜索过滤后的选项列表 */
  displayOptions: Array<MappedOption<ValueType, OptionType>>;
  /** 当前已选/草稿值列表 */
  selectedValues: ValueType[];
  /** 选择模式：单选/多选 */
  mode: 'single' | 'multiple';
  /** 是否支持搜索过滤 */
  showSearch: boolean;
  /** 当前搜索关键字 */
  searchValue: string;
  /** 搜索关键字变更回调 */
  onSearchChange: (value: string) => void;
  /** 是否展示全选复选框 */
  showSelectAll: boolean;
  /** 全选点击回调 */
  onSelectAll: (event: CheckboxChangeEvent) => void;
  /** 选项点击切换回调 */
  onToggle: (value: ValueType) => void;
  /** 自定义单个选项渲染函数 */
  optionRender?: (option: OptionType) => React.ReactNode;
  /** 自定义下拉菜单渲染函数 */
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  /** 底部操作按钮节点数组 */
  footerActions: React.ReactNode[];
  /** 是否启用虚拟滚动 */
  virtual: boolean;
  /** 列表最大高度 (px) */
  listHeight: number;
  /** 虚拟滚动单项高度 (px) */
  listItemHeight: number;
  /** 国际化文案 */
  locale: PopoverSelectLocale;
  /** 语义化类名 */
  classNames?: PopoverSelectProps<ValueType, OptionType>['classNames'];
  /** 语义化样式 */
  styles?: PopoverSelectProps<ValueType, OptionType>['styles'];
}

/**
 * 弹出面板内容组件：
 * 1. 搜索框（支持关键字即时过滤与一键清除）
 * 2. 全选复选框（与当前过滤结果及未禁用项联动）
 * 3. 选项菜单列表（支持普通列表与 VirtualList 虚拟滚动）
 * 4. 空状态提示（无数据 / 搜索无匹配）
 * 5. 底部操作栏（清空、取消、确认按钮）
 */
export function PopoverSelectContent<
  ValueType extends RawValueType,
  OptionType extends object,
>(props: PopoverSelectContentProps<ValueType, OptionType>) {
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles: popoverStyles, cx } = useStyles();
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

  // 已选值 Set 缓存，用于 O(1) 判断选项选中态
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  // 当前可见列表中未禁用的选项
  const enabledOptions = useMemo(
    () => displayOptions.filter((option) => !option.disabled),
    [displayOptions],
  );

  // 全选状态：当前过滤结果中的所有非禁用项均已被选中
  const allSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((option) => selectedSet.has(option.value));

  // 半选状态：部分非禁用项已被选中
  const partiallySelected =
    !allSelected &&
    enabledOptions.some((option) => selectedSet.has(option.value));

  /**
   * 渲染单个选项项
   */
  const renderOption = useCallback(
    (option: MappedOption<ValueType, OptionType>) => {
      const isSelected = selectedSet.has(option.value);
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

      // 多选 Checkbox 样式项
      if (mode === 'multiple') {
        return (
          <Checkbox
            key={getOptionKey(option.value)}
            value={option.value}
            checked={isSelected}
            disabled={option.disabled}
            className={cx(
              popoverStyles.menuCheckbox,
              virtual && popoverStyles.menuItemVirtual,
              classNames?.item,
            )}
            onChange={() => onToggle(option.value)}
          >
            {content}
          </Checkbox>
        );
      }

      // 单选 Radio 样式项
      return (
        <div
          key={getOptionKey(option.value)}
          className={cx(
            popoverStyles.menuRadio,
            virtual && popoverStyles.menuItemVirtual,
            isSelected && popoverStyles.menuRadioActive,
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
      virtual,
    ],
  );

  /**
   * 渲染空状态
   */
  const renderEmpty = (description: string) => (
    <div className={cx(popoverStyles.empty, classNames?.empty)}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    </div>
  );

  // 虚拟列表实际容纳高度（根据选项数与最大高度自适应）
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
        ...(!virtual ? { maxHeight: listHeight } : undefined),
        ...styles?.menu,
      }}
    >
      {virtual ? (
        <VirtualList
          data={displayOptions}
          height={actualHeight}
          itemHeight={listItemHeight}
          itemKey={(option) => getOptionKey(option.value)}
        >
          {renderOption}
        </VirtualList>
      ) : (
        displayOptions.map(renderOption)
      )}
    </div>
  );

  const emptyDescription =
    options.length === 0 ? locale.noData : locale.noMatch;
  const defaultMenu =
    displayOptions.length > 0 ? menu : renderEmpty(emptyDescription);
  const renderedMenu = dropdownRender
    ? dropdownRender(defaultMenu)
    : defaultMenu;
  const dropdownStyle = {
    '--popover-select-item-height': `${listItemHeight}px`,
  } as React.CSSProperties;

  return (
    <div
      className={cx(`${prefixCls}-dropdown`, popoverStyles.dropdown)}
      style={dropdownStyle}
    >
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
      {renderedMenu}
      {footerActions.length > 0 && (
        <div className={cx(popoverStyles.footer, classNames?.footer)}>
          <Space>{footerActions}</Space>
        </div>
      )}
    </div>
  );
}

export default PopoverSelectContent;
