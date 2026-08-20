import { Empty } from 'antd';
import clsx from 'clsx';
import VirtualList from 'rc-virtual-list';
import React, { memo, useCallback, useMemo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import type { RawValueType } from '../type';
import FooterActions from './FooterActions';
import ListItem from './ListItem';
import SearchInput from './SearchInput';
import SelectAllCheckbox from './SelectAllCheckbox';

interface DropdownContentProps<ValueType extends RawValueType = RawValueType> {
  /** CSS 前缀 */
  prefixCls: string;
  /** CSS-in-JS hash id，需附加到所有子元素 className 上 */
  hashId?: string;
  /** 国际化文案 */
  componentLocale: Record<string, any>;
  /** 是否有原始选项 */
  hasOptions: boolean;
  /** 搜索过滤后是否有匹配项 */
  hasDisplayOptions: boolean;
  /** 过滤后的显示选项 */
  displayOptions: Record<string, any>[];
  /** 当前判断选中的目标值列表 */
  targetValueList: ValueType[];
  /** 单选 / 多选 */
  mode: 'single' | 'multiple';
  /** 搜索相关 */
  showSearch: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  /** 全选相关 */
  showSelectAll: boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: (e: any) => void;
  /** 底部操作 */
  footerActions: React.ReactNode[];
  /** 自定义渲染 */
  optionRender?: (item: any) => React.ReactNode;
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  /** 选项切换回调 */
  onItemToggle: (value: ValueType) => void;
  /** 虚拟滚动 */
  virtual: boolean;
  listHeight: number;
  listItemHeight: number;
}

/**
 * 下拉面板完整内容
 *
 * 组合搜索框、全选、列表（含虚拟滚动）、空状态和底部按钮。
 * 通过 memo 避免父组件无意义重渲染。
 */
function DropdownContentInner<ValueType extends RawValueType = RawValueType>(
  props: DropdownContentProps<ValueType>,
) {
  const {
    prefixCls,
    hashId,
    componentLocale,
    hasOptions,
    hasDisplayOptions,
    displayOptions,
    targetValueList,
    mode,
    showSearch,
    searchValue,
    onSearchChange,
    showSelectAll,
    isAllSelected,
    isPartiallySelected,
    onSelectAll,
    footerActions,
    optionRender,
    dropdownRender,
    onItemToggle,
    virtual,
    listHeight,
    listItemHeight,
  } = props;

  const { e } = useNamespace('popover-select', prefixCls);

  const targetValueSet = useMemo(
    () => new Set(targetValueList),
    [targetValueList],
  );

  const isAllDisabled = useMemo(
    () =>
      displayOptions.length > 0 &&
      displayOptions.every((item: Record<string, any>) => item.disabled),
    [displayOptions],
  );

  const renderItemInner = useCallback(
    (item: Record<string, any>) => {
      const isChecked = targetValueSet.has(item.value);
      return (
        <ListItem
          key={item.value}
          item={item}
          isChecked={isChecked}
          mode={mode}
          prefixCls={prefixCls}
          hashId={hashId}
          optionRender={optionRender}
          onToggle={onItemToggle}
        />
      );
    },
    [targetValueSet, mode, prefixCls, hashId, optionRender, onItemToggle],
  );

  const renderMenu = useCallback(() => {
    if (!hasDisplayOptions) return null;
    const actualHeight = Math.min(
      displayOptions.length * listItemHeight,
      listHeight,
    );
    return (
      <div
        className={clsx(e('menu'), hashId, {
          [e('menu-scroll')]: !virtual,
        })}
        style={!virtual ? { maxHeight: listHeight } : undefined}
      >
        {virtual ? (
          <VirtualList
            className={clsx(e('menu-virtual-list'), hashId)}
            data={displayOptions}
            height={actualHeight}
            itemHeight={listItemHeight}
            itemKey="value"
          >
            {(item: Record<string, any>) => renderItemInner(item)}
          </VirtualList>
        ) : (
          displayOptions.map((item: Record<string, any>) =>
            renderItemInner(item),
          )
        )}
      </div>
    );
  }, [
    hasDisplayOptions,
    displayOptions,
    listItemHeight,
    listHeight,
    e,
    hashId,
    virtual,
    renderItemInner,
  ]);

  if (!hasOptions) {
    return (
      <div className={clsx(e('dropdown'), hashId)}>
        <div className={clsx(e('empty'), hashId)}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={componentLocale.noData}
          />
        </div>
      </div>
    );
  }

  const menuNode = renderMenu();
  const finalMenuNode = dropdownRender
    ? dropdownRender(menuNode as React.ReactElement)
    : menuNode;

  return (
    <div className={clsx(e('dropdown'), hashId)}>
      {showSearch && (
        <SearchInput
          prefixCls={prefixCls}
          hashId={hashId}
          placeholder={componentLocale.searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      )}

      {mode === 'multiple' && showSelectAll && hasDisplayOptions && (
        <SelectAllCheckbox
          prefixCls={prefixCls}
          hashId={hashId}
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          disabled={isAllDisabled}
          label={componentLocale.selectAll}
          onChange={onSelectAll}
        />
      )}

      {hasDisplayOptions ? (
        finalMenuNode
      ) : (
        <div className={clsx(e('empty'), hashId)}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={componentLocale.noMatch}
          />
        </div>
      )}

      <FooterActions
        prefixCls={prefixCls}
        hashId={hashId}
        actions={footerActions}
      />
    </div>
  );
}

const DropdownContent = memo(
  DropdownContentInner,
) as typeof DropdownContentInner;
export default DropdownContent;
