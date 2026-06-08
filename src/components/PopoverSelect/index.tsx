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

// ==================== 子组件 ====================

interface FooterActionsProps {
  prefixCls: string;
  actions: React.ReactNode[];
}

/** 底部操作区：确认/取消/清空按钮 */
const FooterActions = memo<FooterActionsProps>(({ prefixCls, actions }) => {
  if (!actions.length) return null;
  return (
    <div className={`${prefixCls}-footer`}>
      <Space>{actions}</Space>
    </div>
  );
});

interface SearchInputProps {
  prefixCls: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** 搜索输入框 */
const SearchInput = memo<SearchInputProps>(
  ({ prefixCls, placeholder, value, onChange }) => (
    <div className={`${prefixCls}-search`}>
      <Input
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        variant="borderless"
      />
    </div>
  ),
);

interface SelectAllCheckboxProps {
  prefixCls: string;
  checked: boolean;
  indeterminate: boolean;
  label: string;
  onChange: (e: CheckboxChangeEvent) => void;
}

/** 全选复选框 */
const SelectAllCheckbox = memo<SelectAllCheckboxProps>(
  ({ prefixCls, checked, indeterminate, label, onChange }) => (
    <div className={`${prefixCls}-select-all`}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={onChange}
      >
        {label}
      </Checkbox>
    </div>
  ),
);

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

  // ---- 菜单渲染部分 ----
  const hasOptions = options.length > 0;
  const hasDisplayOptions = displayOptions.length > 0;

  const renderMenu = useCallback(() => {
    if (!hasDisplayOptions) return null;
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
    hasDisplayOptions,
    displayOptions,
    listItemHeight,
    listHeight,
    virtual,
    prefixCls,
    renderItem,
  ]);

  const finalMenuNode = useMemo(() => {
    const menuNode = renderMenu();
    return dropdownRender
      ? dropdownRender(menuNode as React.ReactElement)
      : menuNode;
  }, [dropdownRender, renderMenu]);

  // 底部操作按钮收集（使用子组件 FooterActions 渲染）
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

  // ---- 展示文本：纯数据计算与 JSX 渲染分离，避免 useMemo 混合返回类型 ----
  const { selectedLabels, allLabels, isTruncated, omittedCount } =
    useMemo(() => {
      if (internalValue.length === 0) {
        return {
          selectedLabels: [],
          allLabels: [],
          isTruncated: false,
          omittedCount: 0,
        };
      }
      const selectedOptions = options.filter((opt: MappedOption) =>
        internalValue.includes(opt.value),
      );
      const labels = selectedOptions.map((opt: MappedOption) => opt.label);
      if (
        mode === 'multiple' &&
        maxTagCount &&
        selectedOptions.length > maxTagCount
      ) {
        return {
          selectedLabels: labels.slice(0, maxTagCount),
          allLabels: labels,
          isTruncated: true,
          omittedCount: selectedOptions.length - maxTagCount,
        };
      }
      return {
        selectedLabels: labels,
        allLabels: labels,
        isTruncated: false,
        omittedCount: 0,
      };
    }, [internalValue, options, maxTagCount, mode]);

  const displayTextNode = useMemo(() => {
    if (selectedLabels.length === 0) return <>{placeholder}</>;
    const visibleText = selectedLabels.join(separator);
    if (isTruncated) {
      const fullText = allLabels.join(separator);
      return (
        <Tooltip title={fullText} placement="topLeft">
          <span>{`${visibleText}${separator}... (+${omittedCount})`}</span>
        </Tooltip>
      );
    }
    return <>{visibleText}</>;
  }, [
    selectedLabels,
    allLabels,
    isTruncated,
    omittedCount,
    separator,
    placeholder,
  ]);

  const hasValue = internalValue.length > 0;
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actionsRef.current.clear([]);
    setDraftValue([]);
  }, []);

  // ---- 渲染下拉内容：拆分为独立子组件减少单函数复杂度 ----
  const renderContent = useCallback(() => {
    // 无 options 的场景（如通过 API 清空）显示空状态
    if (!hasOptions) {
      return (
        <div className={`${prefixCls}-dropdown-content`}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '16px 0' }}
          />
        </div>
      );
    }

    return (
      <div className={`${prefixCls}-dropdown-content`}>
        {showSearch && (
          <SearchInput
            prefixCls={prefixCls}
            placeholder={componentLocale.searchPlaceholder}
            value={searchValue}
            onChange={setSearchValue}
          />
        )}

        {mode === 'multiple' && showSelectAll && hasDisplayOptions && (
          <SelectAllCheckbox
            prefixCls={prefixCls}
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            label={componentLocale.selectAll}
            onChange={handleSelectAll}
          />
        )}

        {hasDisplayOptions ? (
          finalMenuNode
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={componentLocale.noMatch}
            style={{ padding: '16px 0' }}
          />
        )}

        <FooterActions prefixCls={prefixCls} actions={footerActions} />
      </div>
    );
  }, [
    hasOptions,
    hasDisplayOptions,
    prefixCls,
    showSearch,
    componentLocale,
    searchValue,
    mode,
    showSelectAll,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    finalMenuNode,
    footerActions,
  ]);

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
