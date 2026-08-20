import { Button } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { useNamespace } from '../../configProvider/usePrefixCls';
import { useFieldNames, useMergeState } from '../../hooks';
import {
  attachPropertiesToComponent,
  isNullOrBlank,
  withNativeProps,
} from '../../util';
import DropdownContent from './components/DropdownContent';
import { useDisplayText } from './hooks/useDisplayText';
import { useOptions } from './hooks/useOptions';
import { useSelection } from './hooks/useSelection';
import Selector from './selector';
import { useStyle } from './style';
import type {
  DefaultOptionType,
  PopoverSelectProps,
  RawValueType,
} from './type';

const InternalPopoverSelect = <
  ValueType extends RawValueType = RawValueType,
  OptionType extends Record<string, any> = DefaultOptionType,
>(
  props: PopoverSelectProps<ValueType, OptionType>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const { prefixCls } = useNamespace('popover-select', props.prefixCls);
  const componentLocale = useLocale('PopoverSelect');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  type MappedOption = OptionType & {
    label: React.ReactNode;
    value: ValueType;
    disabled?: boolean;
  };

  const {
    options: optionsProp = [],
    fieldNames: customFieldNames,
    mode = 'single',
    dropdownRender,
    placeholder = componentLocale.placeholder,
    allowClear = false,
    showConfirm = mode === 'multiple',
    showCancelBtn = false,
    showClearBtn = false,
    optionRender,
    separator = ', ',
    maxTagCount,
    virtual = true,
    listHeight = 150,
    listItemHeight = 34,
    valueType = 'string',
    valueSeparator = ',',
    showSearch = false,
    showSelectAll = false,
    showArrow = true,
    disabled = false,
    ellipsis = true,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    afterOpenChange,
    placement = 'bottomLeft',
    getPopupContainer,
    autoAdjustOverflow = true,
    destroyTooltipOnHide,
    rootClassName,
  } = props;

  const [searchValue, setSearchValue] = useState('');
  const [open, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });

  const { fieldNames, getFieldValue } = useFieldNames(customFieldNames);
  const realShowConfirm = mode === 'multiple' && showConfirm;

  useEffect(() => {
    if (!open && searchValue) {
      setSearchValue('');
    }
  }, [open, searchValue]);

  const [internalValue, actions] = useMergeState<
    ValueType[],
    ValueType | ValueType[]
  >({
    value: props.value,
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
  });

  const { options, optionMap, displayOptions, hasOptions, hasDisplayOptions } =
    useOptions<OptionType, MappedOption>(
      optionsProp,
      fieldNames,
      getFieldValue,
      searchValue,
    );

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
    optionMap: optionMap as Map<ValueType, MappedOption>,
    displayOptions,
    open,
    setOpen,
    setValue: actions.set,
    clearValue: actions.clear,
  });

  const { displayTextNode, hasValue } = useDisplayText<ValueType, MappedOption>(
    {
      internalValue,
      options,
      optionMap: optionMap as Map<ValueType, MappedOption>,
      mode,
      maxTagCount,
      separator,
      placeholder,
      ellipsis,
    },
  );

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

  return wrapSSR(
    withNativeProps(
      props,
      <div ref={ref} className={clsx(prefixCls, hashId)}>
        <Selector
          content={renderContent}
          open={open}
          onOpenChange={setOpen}
          afterOpenChange={afterOpenChange}
          placement={placement}
          getPopupContainer={getPopupContainer}
          autoAdjustOverflow={autoAdjustOverflow}
          destroyTooltipOnHide={destroyTooltipOnHide}
          rootClassName={rootClassName}
          allowClear={allowClear}
          hasValue={hasValue}
          onClear={handleClear}
          showArrow={showArrow}
          disabled={disabled}
        >
          {displayTextNode}
        </Selector>
      </div>,
    ),
  );
};

const ForwardRefPopoverSelect = forwardRef(InternalPopoverSelect) as <
  ValueType extends RawValueType = RawValueType,
  OptionType extends Record<string, any> = DefaultOptionType,
>(
  props: PopoverSelectProps<ValueType, OptionType> & {
    ref?: React.Ref<HTMLDivElement>;
  },
) => React.ReactElement | null;

const Select = memo(ForwardRefPopoverSelect) as typeof ForwardRefPopoverSelect;
const PopoverSelector = attachPropertiesToComponent(Select, { Selector });
export default PopoverSelector;
