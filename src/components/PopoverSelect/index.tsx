import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  CheckboxChangeEvent,
  CheckboxProps,
  Empty,
  Input,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import clsx from 'clsx';
import VirtualList from 'rc-virtual-list';
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
import './index.less';
import Selector from './selector';
import {
  DefaultOptionType,
  FieldNames,
  PopoverSelectProps,
  RawValueType,
} from './type';

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
  const [draftValue, setDraftValue] = useState<ValueType[]>([]);
  const { fieldNames, getFieldValue } = useFieldNames(customFieldNames);

  const realShowConfirm = mode === 'multiple' && showConfirm;

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

  // 使用 ref 追踪可变状态以避免 callback 闭包陷阱
  const internalValueRef = React.useRef(internalValue);
  internalValueRef.current = internalValue;
  const draftValueRef = React.useRef(draftValue);
  draftValueRef.current = draftValue;
  const realShowConfirmRef = React.useRef(realShowConfirm);
  realShowConfirmRef.current = realShowConfirm;
  const modeRef = React.useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (open) {
      setDraftValue(internalValueRef.current);
    } else {
      setSearchValue('');
    }
  }, [open]);

  const options = useMemo(() => {
    return optionsProp.map((item: OptionType) => {
      const mappedItem: Record<string, any> = { ...item };
      Object.entries(fieldNames).forEach(([standardKey, customKey]) => {
        if (customKey && typeof customKey === 'string') {
          const fieldValue = getFieldValue(
            item,
            standardKey as keyof FieldNames,
          );
          if (fieldValue !== undefined) {
            mappedItem[standardKey] = fieldValue;
          }
        }
      });
      return mappedItem as MappedOption;
    });
  }, [optionsProp, fieldNames, getFieldValue]);

  const displayOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter((item: MappedOption) => {
      const labelStr = String(item.label || '').toLowerCase();
      return labelStr.includes(searchValue.toLowerCase());
    });
  }, [options, searchValue]);

  const targetValueList = realShowConfirm ? draftValue : internalValue;
  const enabledOptions = displayOptions.filter(
    (o: MappedOption) => !o.disabled,
  );
  const isAllSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((o: MappedOption) =>
      targetValueList.includes(o.value),
    );

  const isPartiallySelected =
    enabledOptions.some((o: MappedOption) =>
      targetValueList.includes(o.value),
    ) && !isAllSelected;

  // 使用 ref 缓存 options 和 actions，保证回调引用稳定
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const actionsRef = React.useRef(actions);
  actionsRef.current = actions;
  const setOpenRef = React.useRef(setOpen);
  setOpenRef.current = setOpen;

  const handleSelectAll = useCallback((e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    const enabledOptions = optionsRef.current.filter(
      (o: MappedOption) => !o.disabled,
    );
    const enabledValues = enabledOptions.map((o: MappedOption) => o.value);
    const currentTarget = realShowConfirmRef.current
      ? draftValueRef.current
      : internalValueRef.current;
    let newValues: ValueType[];
    if (checked) {
      newValues = Array.from(new Set([...currentTarget, ...enabledValues]));
    } else {
      newValues = currentTarget.filter((v) => !enabledValues.includes(v));
    }
    if (realShowConfirmRef.current) {
      // 使用函数式更新以避免 setState 闭包问题
      setDraftValue(newValues);
    } else {
      const newOptions = optionsRef.current.filter((opt: MappedOption) =>
        newValues.includes(opt.value),
      );
      actionsRef.current.set(newValues, newOptions);
    }
  }, []);

  const handleValueToggle = useCallback((itemValue: ValueType) => {
    const currentTargetList = realShowConfirmRef.current
      ? draftValueRef.current
      : internalValueRef.current;
    let newValues: ValueType[];

    if (modeRef.current === 'multiple') {
      const isSelected = currentTargetList.includes(itemValue);
      newValues = isSelected
        ? currentTargetList.filter((v) => v !== itemValue)
        : [...currentTargetList, itemValue];
    } else {
      newValues = [itemValue];
    }

    if (realShowConfirmRef.current) {
      setDraftValue(newValues);
    } else {
      const newOptions = optionsRef.current.filter((opt: MappedOption) =>
        newValues.includes(opt.value),
      );
      actionsRef.current.set(newValues, newOptions);
      if (modeRef.current === 'single') {
        setOpenRef.current(false);
      }
    }
  }, []);

  const handleChange: CheckboxProps['onChange'] = useCallback(
    (event) => {
      handleValueToggle(event.target.value as ValueType);
    },
    [handleValueToggle],
  );

  const handleConfirm = useCallback(() => {
    const newOptions = optionsRef.current.filter((opt: MappedOption) =>
      draftValueRef.current.includes(opt.value),
    );
    actionsRef.current.set(draftValueRef.current, newOptions);
    setOpenRef.current(false);
  }, []);

  const handleCancel = useCallback(() => setOpenRef.current(false), []);
  const handleDraftClear = useCallback(() => setDraftValue([]), []);

  const renderItem = useCallback(
    (item: OptionType) => {
      const currentTargetList = realShowConfirmRef.current
        ? draftValueRef.current
        : internalValueRef.current;
      const isChecked = currentTargetList.includes(item.value);
      const labelNode = optionRender ? (
        optionRender(item)
      ) : (
        <Typography.Text ellipsis={{ tooltip: item.label }}>
          {item.label}
        </Typography.Text>
      );
      return mode === 'multiple' ? (
        <Checkbox
          key={item.value}
          value={item.value}
          checked={isChecked}
          disabled={item?.disabled}
          onChange={handleChange}
          className={`${prefixCls}-menu-checkbox`}
        >
          {labelNode}
        </Checkbox>
      ) : (
        <div
          key={item.value}
          onClick={() => !item?.disabled && handleValueToggle(item.value)}
          className={clsx({
            [`${prefixCls}-menu-radio`]: true,
            [`${prefixCls}-menu-radio-disabled`]: item?.disabled,
            [`${prefixCls}-menu-radio-active`]: isChecked,
          })}
        >
          {labelNode}
        </div>
      );
    },
    [handleChange, handleValueToggle, optionRender, mode, prefixCls],
  );

  const renderMenu = useCallback(() => {
    if (displayOptions.length === 0) return null;
    const actualHeight = Math.min(
      displayOptions.length * listItemHeight,
      listHeight,
    );
    return (
      <div className={`${prefixCls}-menu`}>
        {virtual ? (
          <VirtualList
            className={`${prefixCls}-menu-virtual-list`}
            data={displayOptions}
            height={actualHeight}
            itemHeight={listItemHeight}
            itemKey="value"
          >
            {(item: MappedOption) => renderItem(item)}
          </VirtualList>
        ) : (
          displayOptions.map((item: MappedOption) => renderItem(item))
        )}
      </div>
    );
  }, [
    displayOptions,
    listItemHeight,
    listHeight,
    virtual,
    prefixCls,
    renderItem,
  ]);

  const renderContent = useCallback(() => {
    if (!options.length)
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '16px 0' }}
        />
      );
    const menuNode = renderMenu();
    const finalMenuNode = dropdownRender
      ? dropdownRender(menuNode as React.ReactElement)
      : menuNode;
    const actionsBtn = [
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
    ].filter(Boolean);

    return (
      <div className={`${prefixCls}-dropdown-content`}>
        {showSearch && (
          <div className={`${prefixCls}-search`}>
            <Input
              prefix={
                <SearchOutlined
                  style={{
                    color: 'var(--popover-select-search-icon, #bfbfbf)',
                  }}
                />
              }
              placeholder={componentLocale.searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              variant="borderless"
            />
          </div>
        )}

        {mode === 'multiple' && showSelectAll && displayOptions.length > 0 && (
          <div className={`${prefixCls}-select-all`}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onChange={handleSelectAll}
            >
              {componentLocale.selectAll}
            </Checkbox>
          </div>
        )}

        {displayOptions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={componentLocale.noMatch}
            style={{ padding: '16px 0' }}
          />
        ) : (
          finalMenuNode
        )}

        {realShowConfirm && !!actionsBtn.length && (
          <div className={`${prefixCls}-footer`}>
            <Space>{actionsBtn}</Space>
          </div>
        )}
      </div>
    );
  }, [
    options,
    renderMenu,
    dropdownRender,
    showClearBtn,
    showCancelBtn,
    realShowConfirm,
    showSearch,
    mode,
    showSelectAll,
    displayOptions.length,
    isAllSelected,
    isPartiallySelected,
    searchValue,
    componentLocale,
    prefixCls,
    handleDraftClear,
    handleCancel,
    handleConfirm,
    handleSelectAll,
  ]);

  const hasValue = internalValue.length > 0;
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actionsRef.current.clear([]);
    setDraftValue([]);
  }, []);

  const getDisplayText = () => {
    if (internalValue.length === 0) return placeholder;
    const selectedOptions = options.filter((opt: MappedOption) =>
      internalValue.includes(opt.value),
    );
    const fullText = selectedOptions
      .map((opt: MappedOption) => opt.label)
      .join(separator);
    if (
      mode === 'multiple' &&
      maxTagCount &&
      selectedOptions.length > maxTagCount
    ) {
      const visibleOptions = selectedOptions.slice(0, maxTagCount);
      const omittedCount = selectedOptions.length - maxTagCount;
      const visibleText = visibleOptions
        .map((opt: MappedOption) => opt.label)
        .join(separator);
      const displayText = `${visibleText}${separator}... (+${omittedCount})`;
      return (
        <Tooltip title={fullText} placement="topLeft">
          <span>{displayText}</span>
        </Tooltip>
      );
    }
    return selectedOptions
      .map((opt: MappedOption) => opt.label)
      .join(separator);
  };

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
        {getDisplayText()}
      </Selector>
    </div>,
  );
};

const Select = memo(Component);
const PopoverSelector = attachPropertiesToComponent(Select, { Selector });
export default PopoverSelector;
