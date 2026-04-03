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
import { usePrefixCls } from 'myui/configProvider/usePrefixCls';
import { useFieldNames, useMergeState } from 'myui/hooks';
import { attachPropertiesToComponent, withNativeProps } from 'myui/util';
import VirtualList from 'rc-virtual-list';
import React, { memo, useEffect, useMemo, useState } from 'react';
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
  const {
    options: optionsProp = [],
    fieldNames: customFieldNames,
    mode = 'single',
    dropdownRender,
    placeholder = '请选择',
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

  const mergeStateConfig: any = {
    defaultValue: props.defaultValue,
    onChange: props.onChange as any,
    transformToOrigin: (externalVal: any) => {
      if (externalVal == null) return [];
      if (typeof externalVal === 'string' && valueType === 'string') {
        if (mode === 'multiple') {
          return externalVal
            .split(valueSeparator)
            .filter(Boolean) as ValueType[];
        }
        return [externalVal] as ValueType[];
      }
      return Array.isArray(externalVal) ? externalVal : [externalVal];
    },
    transformToResult: (internalArray: any) => {
      if (mode === 'single') {
        return internalArray[0] as ValueType;
      }
      if (valueType === 'string') {
        return internalArray.join(valueSeparator) as unknown as ValueType;
      }
      return internalArray as ValueType[];
    },
  };

  //fix bug  受控非受控判断问题
  if ('value' in props) {
    mergeStateConfig.value = props.value;
  }
  //实际提交值
  const [internalValue, actions] = useMergeState<
    ValueType[],
    ValueType | ValueType[]
  >(mergeStateConfig);

  useEffect(() => {
    if (open) {
      setDraftValue(internalValue);
    } else {
      setSearchValue('');
    }
  }, [open, internalValue]);

  const options = useMemo(() => {
    return optionsProp.map((item) => {
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
      return mappedItem as OptionType & {
        label: React.ReactNode;
        value: ValueType;
        disabled?: boolean;
      };
    });
  }, [optionsProp, fieldNames, getFieldValue]);

  const displayOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter((item) => {
      const labelStr = String(item.label || '').toLowerCase();
      return labelStr.includes(searchValue.toLowerCase());
    });
  }, [options, searchValue]);

  const targetValueList = realShowConfirm ? draftValue : internalValue;
  const enabledOptions = displayOptions.filter((o) => !o.disabled);
  const isAllSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((o) => targetValueList.includes(o.value));

  const isPartiallySelected =
    enabledOptions.some((o) => targetValueList.includes(o.value)) &&
    !isAllSelected;

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    const enabledValues = enabledOptions.map((o) => o.value);
    let newValues: ValueType[];
    if (checked) {
      newValues = Array.from(new Set([...targetValueList, ...enabledValues]));
    } else {
      newValues = targetValueList.filter((v) => !enabledValues.includes(v));
    }
    if (realShowConfirm) {
      setDraftValue(newValues);
    } else {
      const newOptions = options.filter((opt) => newValues.includes(opt.value));
      actions.set(newValues, newOptions);
    }
  };

  const handleChange: CheckboxProps['onChange'] = (event) => {
    const itemValue = event.target.value;
    const targetValueList = realShowConfirm ? draftValue : internalValue;
    let newValues: ValueType[];
    if (mode === 'multiple') {
      const isSelected = targetValueList.includes(itemValue);
      newValues = isSelected
        ? targetValueList.filter((v) => v !== itemValue)
        : [...targetValueList, itemValue];
    } else {
      newValues = [itemValue];
    }
    if (realShowConfirm) {
      setDraftValue(newValues);
    } else {
      const newOptions = options.filter((opt) => newValues.includes(opt.value));
      actions.set(newValues, newOptions);
      if (mode === 'single') {
        setOpen(false);
      }
    }
  };

  const handleConfirm = () => {
    const newOptions = options.filter((opt) => draftValue.includes(opt.value));
    actions.set(draftValue, newOptions);
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);
  const handleDraftClear = () => setDraftValue([]);

  const renderItem = (item: OptionType) => {
    const targetValueList = realShowConfirm ? draftValue : internalValue;
    const isChecked = targetValueList.includes(item.value);
    const labelNode = optionRender ? optionRender(item) : item.label;
    return mode === 'multiple' ? (
      <Checkbox
        key={item.value}
        value={item.value}
        checked={isChecked}
        disabled={item?.disabled}
        onChange={handleChange}
        className={`${prefixCls}-menu-checkbox`}
      >
        <Typography.Text ellipsis={{ tooltip: item.label }}>
          {labelNode}
        </Typography.Text>
      </Checkbox>
    ) : (
      <div
        key={item.value}
        onClick={() =>
          !item?.disabled &&
          handleChange({ target: { value: item.value } } as any)
        }
        className={clsx({
          [`${prefixCls}-menu-radio`]: true,
          [`${prefixCls}-menu-radio-disabled`]: item?.disabled,
          [`${prefixCls}-menu-radio-active`]: isChecked,
        })}
      >
        <Typography.Text
          ellipsis={{ tooltip: item.label }}
          style={{ color: 'inherit' }}
        >
          {labelNode}
        </Typography.Text>
      </div>
    );
  };
  const renderMenu = () => {
    if (displayOptions.length === 0) return null;
    const actualHeight = Math.min(options.length * listItemHeight, listHeight);
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
            {(item) => renderItem(item)}
          </VirtualList>
        ) : (
          displayOptions.map((item) => renderItem(item))
        )}
      </div>
    );
  };

  const renderContent = () => {
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
          清空
        </Button>
      ),
      showCancelBtn && (
        <Button key="cancel" size="small" onClick={handleCancel}>
          取消
        </Button>
      ),
      realShowConfirm && (
        <Button
          key="confirm"
          type="primary"
          size="small"
          onClick={handleConfirm}
        >
          确认
        </Button>
      ),
    ].filter(Boolean);

    return (
      <div className={`${prefixCls}-dropdown-content`}>
        {showSearch && (
          <div className={`${prefixCls}-search`}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入搜索内容"
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
              全选
            </Checkbox>
          </div>
        )}

        {displayOptions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="无匹配结果"
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
  };

  const hasValue = internalValue.length > 0;
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.clear([]);
    setDraftValue([]);
  };

  const getDisplayText = () => {
    if (internalValue.length === 0) return placeholder;
    const selectedOptions = options.filter((opt) =>
      internalValue.includes(opt.value),
    );
    const fullText = selectedOptions.map((opt) => opt.label).join(separator);
    if (
      mode === 'multiple' &&
      maxTagCount &&
      selectedOptions.length > maxTagCount
    ) {
      const visibleOptions = selectedOptions.slice(0, maxTagCount);
      const omittedCount = selectedOptions.length - maxTagCount;
      const visibleText = visibleOptions
        .map((opt) => opt.label)
        .join(separator);
      const displayText = `${visibleText}${separator}... (+${omittedCount})`;
      return (
        <Tooltip title={fullText} placement="topLeft">
          <span>{displayText}</span>
        </Tooltip>
      );
    }
    return selectedOptions.map((opt) => opt.label).join(separator);
  };

  console.log('====================================');
  console.log(internalValue, draftValue);
  console.log('====================================');

  return withNativeProps(
    props,
    <div className={clsx(prefixCls, className)} style={style}>
      <Selector
        content={renderContent()}
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
