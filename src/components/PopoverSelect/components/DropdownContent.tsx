import { Empty } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { memo, useCallback } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import type { RawValueType } from '../type';
import FooterActions from './FooterActions';
import ListItem from './ListItem';
import SearchInput from './SearchInput';
import SelectAllCheckbox from './SelectAllCheckbox';

interface DropdownContentProps<ValueType extends RawValueType = RawValueType> {
  /** CSS 前缀 */
  prefixCls: string;
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

  const renderItemInner = useCallback(
    (item: Record<string, any>) => {
      const isChecked = targetValueList.includes(item.value);
      return (
        <ListItem
          item={item}
          isChecked={isChecked}
          mode={mode}
          prefixCls={prefixCls}
          optionRender={optionRender}
          onToggle={onItemToggle}
        />
      );
    },
    [targetValueList, mode, prefixCls, optionRender, onItemToggle],
  );

  const renderMenu = useCallback(() => {
    if (!hasDisplayOptions) return null;
    const actualHeight = Math.min(
      displayOptions.length * listItemHeight,
      listHeight,
    );
    return (
      <div className={e('menu')}>
        {virtual ? (
          <VirtualList
            className={e('menu-virtual-list')}
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
    virtual,
    renderItemInner,
  ]);

  if (!hasOptions) {
    return (
      <div className={e('dropdown')}>
        <div className={e('empty')}>
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
    <div className={e('dropdown')}>
      {showSearch && (
        <SearchInput
          prefixCls={prefixCls}
          placeholder={componentLocale.searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      )}

      {mode === 'multiple' && showSelectAll && hasDisplayOptions && (
        <SelectAllCheckbox
          prefixCls={prefixCls}
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          label={componentLocale.selectAll}
          onChange={onSelectAll}
        />
      )}

      {hasDisplayOptions ? (
        finalMenuNode
      ) : (
        <div className={e('empty')}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={componentLocale.noMatch}
          />
        </div>
      )}

      <FooterActions prefixCls={prefixCls} actions={footerActions} />
    </div>
  );
}

const DropdownContent = memo(
  DropdownContentInner,
) as typeof DropdownContentInner;
export default DropdownContent;
