import { Button } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import { attachPropertiesToComponent } from '../../utils';
import PopoverSelectContent from './components/PopoverSelectContent';
import PopoverSelectLabel from './components/PopoverSelectLabel';
import Selector from './components/PopoverSelector';
import { useNormalizedOptions } from './hooks/useNormalizedOptions';
import { useStyles } from './style';
import type {
  DefaultOptionType,
  PopoverSelectComponent,
  PopoverSelectProps,
  RawValueType,
} from './type';
import { parseExternalValue } from './utils';

export type * from './type';
export { Selector };

type ExternalValue<ValueType extends RawValueType> =
  | ValueType
  | ValueType[]
  | string
  | undefined;

function InternalPopoverSelect<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
>(
  props: PopoverSelectProps<ValueType, OptionType>,
  ref: React.Ref<HTMLDivElement>,
) {
  const componentLocale = useLocale('PopoverSelect');
  const prefixCls = props.prefixCls;
  const resolvedPrefixCls = usePrefixCls('popover-select', prefixCls);
  const { styles: popoverStyles, cx } = useStyles();

  const {
    options: optionSource = [],
    fieldNames,
    mode = 'single',
    placeholder = componentLocale.placeholder,
    allowClear = false,
    showConfirm = mode === 'multiple',
    showCancelBtn = false,
    showClearBtn = false,
    separator = ', ',
    valueSeparator = ',',
    maxTagCount,
    virtual = true,
    listHeight = 150,
    listItemHeight = 34,
    showSearch = false,
    showSelectAll = false,
    showArrow = true,
    disabled = false,
    ellipsis = true,
    open: openProp,
    onOpenChange,
    className,
    style,
    rootClassName,
    classNames,
    styles,
  } = props;

  const valueType = mode === 'multiple' ? props.valueType : undefined;
  const [searchValue, setSearchValue] = useState('');

  // 规范化选项与建立快速索引 Map
  const { options, optionMap, stringValueMap, displayOptions } =
    useNormalizedOptions<ValueType, OptionType>(
      optionSource,
      fieldNames,
      searchValue,
    );

  const transformToOrigin = useCallback(
    (value: ExternalValue<ValueType>) =>
      parseExternalValue<ValueType>(
        value,
        mode,
        valueType,
        valueSeparator,
        stringValueMap,
      ),
    [mode, stringValueMap, valueSeparator, valueType],
  );

  const transformToResult = useCallback(
    (values: ValueType[]): ExternalValue<ValueType> => {
      if (mode === 'single') return values[0];
      return valueType === 'string' ? values.join(valueSeparator) : values;
    },
    [mode, valueSeparator, valueType],
  );

  const handleValueChange = useCallback(
    (value: ExternalValue<ValueType>, selectedOptions: OptionType[]) => {
      if (props.mode === 'multiple') {
        if (props.valueType === 'string') {
          props.onChange?.(value as string, selectedOptions);
        } else {
          props.onChange?.(value as ValueType[], selectedOptions);
        }
      } else {
        props.onChange?.(value as ValueType | undefined, selectedOptions);
      }
    },
    [props.mode, props.onChange, props.valueType],
  );

  const [selectedValues, { set: setSelectedValues }] = useMergeState<
    ValueType[],
    ExternalValue<ValueType>,
    [OptionType[]]
  >({
    value: props.value,
    controlled: Object.prototype.hasOwnProperty.call(props, 'value'),
    defaultValue: props.defaultValue,
    onChange: handleValueChange,
    transformToOrigin,
    transformToResult,
  });

  // 弹层展开/收起状态
  const [open, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChange,
  });

  // 多选确认模式下：内部维护草稿值，仅在确认后对外提交
  const isConfirmedMode = mode === 'multiple' && showConfirm;
  const [draftValue, setDraftValue] = useState<ValueType[]>(selectedValues);
  const targetValues = isConfirmedMode ? draftValue : selectedValues;
  useEffect(() => {
    if (open) setDraftValue(selectedValues);
    else setSearchValue('');
  }, [open, selectedValues]);

  /**
   * 提交选中值及其对应的完整选项
   */
  const emitValue = useCallback(
    (nextValues: ValueType[]) => {
      const selectedOptions = nextValues
        .map((value) => optionMap.get(value)?.source)
        .filter((option): option is OptionType => option !== undefined);

      setSelectedValues(nextValues, selectedOptions);
    },
    [optionMap, setSelectedValues],
  );

  /**
   * 点击单项时的选中/取消切换逻辑
   */
  const toggleValue = useCallback(
    (value: ValueType) => {
      const next =
        mode === 'multiple'
          ? targetValues.includes(value)
            ? targetValues.filter((item) => item !== value)
            : [...targetValues, value]
          : [value];

      if (isConfirmedMode) {
        setDraftValue(next);
      } else {
        emitValue(next);
      }

      // 单选模式选择后自动关闭弹层
      if (mode === 'single') {
        setOpen(false);
      }
    },
    [emitValue, isConfirmedMode, mode, setOpen, targetValues],
  );

  /**
   * 全选/取消全选切换逻辑：
   * 全选当前过滤出的所有非禁用项（增量合并到现有选择），取消全选则从现有选择中剔除当前可见项
   */
  const handleSelectAll = useCallback(
    (event: { target: { checked: boolean } }) => {
      const enabledValues = displayOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value);
      const enabledSet = new Set(enabledValues);

      const next = event.target.checked
        ? Array.from(new Set([...targetValues, ...enabledValues]))
        : targetValues.filter((value) => !enabledSet.has(value));

      if (isConfirmedMode) {
        setDraftValue(next);
      } else {
        emitValue(next);
      }
    },
    [displayOptions, emitValue, isConfirmedMode, targetValues],
  );

  // 底部按钮组（清空、取消、确认）
  const footerActions = [
    showClearBtn && (
      <Button
        key="clear"
        size="small"
        onClick={() => {
          if (isConfirmedMode) setDraftValue([]);
          else emitValue([]);
        }}
      >
        {componentLocale.clearAll}
      </Button>
    ),
    showCancelBtn && (
      <Button key="cancel" size="small" onClick={() => setOpen(false)}>
        {componentLocale.cancel}
      </Button>
    ),
    isConfirmedMode && (
      <Button
        key="confirm"
        type="primary"
        size="small"
        onClick={() => {
          emitValue(draftValue);
          setOpen(false);
        }}
      >
        {componentLocale.confirm}
      </Button>
    ),
  ].filter((node): node is React.ReactElement => Boolean(node));

  // 弹层内容区节点
  const content = (
    <PopoverSelectContent
      prefixCls={resolvedPrefixCls}
      options={options}
      displayOptions={displayOptions}
      selectedValues={targetValues}
      mode={mode}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      showSelectAll={showSelectAll}
      onSelectAll={handleSelectAll}
      onToggle={toggleValue}
      optionRender={props.optionRender}
      dropdownRender={props.dropdownRender}
      footerActions={footerActions}
      virtual={virtual}
      listHeight={listHeight}
      listItemHeight={listItemHeight}
      locale={componentLocale}
      classNames={classNames}
      styles={styles}
    />
  );

  return (
    <div
      ref={ref}
      className={cx(
        resolvedPrefixCls,
        popoverStyles.root,
        className,
        rootClassName,
        classNames?.root,
      )}
      style={{ ...styles?.root, ...style }}
    >
      <Selector
        prefixCls={resolvedPrefixCls}
        autoAdjustOverflow={props.autoAdjustOverflow}
        afterOpenChange={props.afterOpenChange}
        placement={props.placement}
        getPopupContainer={props.getPopupContainer}
        destroyTooltipOnHide={props.destroyTooltipOnHide}
        content={content}
        open={open}
        onOpenChange={setOpen}
        allowClear={allowClear}
        hasValue={selectedValues.length > 0}
        onClear={(event) => {
          event.stopPropagation();
          emitValue([]);
          setDraftValue([]);
        }}
        showArrow={showArrow}
        ellipsis={ellipsis !== false}
        disabled={disabled}
        classNames={classNames}
        styles={styles}
      >
        <PopoverSelectLabel
          selectedValues={selectedValues}
          optionMap={optionMap}
          mode={mode}
          placeholder={placeholder}
          separator={separator}
          maxTagCount={maxTagCount}
          ellipsis={ellipsis}
        />
      </Selector>
    </div>
  );
}

const ForwardPopoverSelect = forwardRef(
  InternalPopoverSelect as never,
) as unknown as PopoverSelectComponent;

const PopoverSelect = memo(
  ForwardPopoverSelect as React.ComponentType<
    PopoverSelectProps<RawValueType, DefaultOptionType>
  >,
) as unknown as PopoverSelectComponent;

export default attachPropertiesToComponent(PopoverSelect, { Selector });
