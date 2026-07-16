import { Button } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { useFieldNames, useMergeState } from '../../hooks';
import type { UseMergeStateProps } from '../../hooks/useMergeState';
import {
  attachPropertiesToComponent,
  isNullOrBlank,
  withNativeProps,
} from '../../util';
import DropdownContent from './components/DropdownContent';
import { useDisplayText } from './hooks/useDisplayText';
import { useOptions } from './hooks/useOptions';
import { useSelection } from './hooks/useSelection';
import './index.less';
import Selector from './selector';
import { DefaultOptionType, PopoverSelectProps, RawValueType } from './type';

const Component = <
  ValueType extends RawValueType = RawValueType,
  OptionType extends Record<string, any> = DefaultOptionType,
>(
  props: PopoverSelectProps<ValueType, OptionType>,
) => {
  const prefixCls = usePrefixCls('popover-select');
  const componentLocale = useLocale('PopoverSelect');

  type MappedOption = OptionType & {
    label: React.ReactNode;
    value: ValueType;
    disabled?: boolean;
  };

  // ---- 解构 Props ----
  const {
    options: optionsProp = [],
    fieldNames: customFieldNames,
    mode = 'single',
    dropdownRender,
    placeholder = componentLocale.placeholder,
    allowClear = false,
    showConfirm = mode === 'multiple',
    className,
    style,
    showCancelBtn = false,
    showClearBtn = false,
    optionRender,
    separator = ', ',
    maxTagCount,
    virtual = true,
    listHeight = 150,
    listItemHeight = 32,
    valueType = 'string',
    valueSeparator = ',',
    showSearch = false,
    showSelectAll = false,
  } = props;

  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const { fieldNames, getFieldValue } = useFieldNames(customFieldNames);
  const realShowConfirm = mode === 'multiple' && showConfirm;

  // 弹窗关闭时清空搜索关键词
  useEffect(() => {
    if (!open) setSearchValue('');
  }, [open]);

  // ---- 选中值状态管理（useMergeState） ----
  const mergeStateConfig: UseMergeStateProps<
    ValueType[],
    ValueType | ValueType[]
  > = {
    defaultValue: props.defaultValue,
    onChange: props.onChange,
    transformToOrigin: (externalVal) => {
      if (isNullOrBlank(externalVal)) return [];
      if (typeof externalVal === 'string' && valueType === 'string') {
        if (mode === 'multiple') {
          return externalVal
            .split(valueSeparator)
            .filter(Boolean) as ValueType[];
        }
        return [externalVal] as ValueType[];
      }
      return (
        Array.isArray(externalVal) ? externalVal : [externalVal]
      ) as ValueType[];
    },
    transformToResult: (internalArray) => {
      if (mode === 'single') {
        return internalArray[0] as ValueType;
      }
      if (valueType === 'string') {
        return internalArray.join(valueSeparator) as unknown as ValueType;
      }
      return internalArray as ValueType[];
    },
  };
  if ('value' in props) {
    mergeStateConfig.value = props.value;
  }
  const [internalValue, actions] = useMergeState<
    ValueType[],
    ValueType | ValueType[]
  >(mergeStateConfig);

  // ---- 选项映射 & 搜索过滤 ----
  const { options, displayOptions, hasOptions, hasDisplayOptions } = useOptions<
    OptionType,
    MappedOption
  >(optionsProp, fieldNames, getFieldValue, searchValue);

  // ---- 选择逻辑 & Handlers ----
  const {
    isAllSelected,
    isPartiallySelected,
    targetValueList,
    handleSelectAll,
    handleValueToggle,
    handleConfirm,
    handleCancel,
    handleDraftClear,
    handleClear,
  } = useSelection<ValueType, MappedOption>({
    mode,
    realShowConfirm,
    internalValue,
    options,
    open,
    setOpen,
    setValue: actions.set,
    clearValue: actions.clear,
  });

  // ---- 展示文本 ----
  const { displayTextNode, hasValue } = useDisplayText<ValueType, MappedOption>(
    {
      internalValue,
      options,
      mode,
      maxTagCount,
      separator,
      placeholder,
    },
  );

  // ---- 底部操作按钮 ----
  const footerActions = useMemo(() => {
    return [
      showClearBtn && (
        <Button key="clear" size="small" onClick={handleDraftClear}>
          {componentLocale.clearAll}
        </Button>
      ),
      showCancelBtn && (
        <Button key="cancel" size="small" onClick={handleCancel}>
          {componentLocale.cancel}
        </Button>
      ),
      realShowConfirm && (
        <Button
          key="confirm"
          type="primary"
          size="small"
          onClick={handleConfirm}
        >
          {componentLocale.confirm}
        </Button>
      ),
    ].filter(Boolean) as React.ReactNode[];
  }, [
    showClearBtn,
    showCancelBtn,
    realShowConfirm,
    componentLocale,
    handleDraftClear,
    handleCancel,
    handleConfirm,
  ]);

  // ---- 下拉内容渲染函数 ----
  const renderContent = useCallback(
    () => (
      <DropdownContent
        prefixCls={prefixCls}
        componentLocale={componentLocale}
        hasOptions={hasOptions}
        hasDisplayOptions={hasDisplayOptions}
        displayOptions={displayOptions}
        targetValueList={targetValueList}
        mode={mode}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showSelectAll={showSelectAll}
        isAllSelected={isAllSelected}
        isPartiallySelected={isPartiallySelected}
        onSelectAll={handleSelectAll}
        footerActions={footerActions}
        optionRender={optionRender}
        dropdownRender={dropdownRender}
        onItemToggle={handleValueToggle}
        virtual={virtual}
        listHeight={listHeight}
        listItemHeight={listItemHeight}
      />
    ),
    [
      prefixCls,
      componentLocale,
      hasOptions,
      hasDisplayOptions,
      displayOptions,
      targetValueList,
      mode,
      showSearch,
      searchValue,
      showSelectAll,
      isAllSelected,
      isPartiallySelected,
      handleSelectAll,
      footerActions,
      optionRender,
      dropdownRender,
      handleValueToggle,
      virtual,
      listHeight,
      listItemHeight,
    ],
  );

  // ---- 渲染 ----
  return withNativeProps(
    props,
    <div className={clsx(prefixCls, className)} style={style}>
      <Selector
        content={renderContent}
        open={open}
        rootClassName={`${prefixCls}-selector`}
        onOpenChange={setOpen}
        allowClear={allowClear}
        hasValue={hasValue}
        onClear={handleClear}
      >
        {displayTextNode}
      </Selector>
    </div>,
  );
};

const Select = memo(Component) as typeof Component;
const PopoverSelector = attachPropertiesToComponent(Select, { Selector });
export default PopoverSelector;
