import { Button, Tooltip } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import { attachPropertiesToComponent, isNullOrBlank } from '../../utils';
import PopoverSelectContent from './components/PopoverSelectContent';
import Selector from './components/PopoverSelector';
import { useNormalizedOptions } from './hooks/useNormalizedOptions';
import { useStyles } from './style';
import type {
  DefaultOptionType,
  PopoverSelectMultipleArrayProps,
  PopoverSelectMultipleStringProps,
  PopoverSelectProps,
  PopoverSelectSingleProps,
  RawValueType,
} from './type';
import { getNodeText } from './utils';

export type * from './type';
export { Selector };

/**
 * 将外部传入的受控/非受控值解析为内部统一的数组格式
 */
function parseExternalValue<ValueType extends RawValueType>(
  value: unknown,
  mode: 'single' | 'multiple',
  valueType: 'array' | 'string' | undefined,
): ValueType[] {
  if (isNullOrBlank(value)) return [];
  if (mode === 'multiple' && valueType === 'string') {
    try {
      const parsed: unknown = JSON.parse(String(value));
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) => typeof item === 'string' || typeof item === 'number',
        )
      ) {
        return parsed as ValueType[];
      }
    } catch {
      // 容错处理并在开发环境提示
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        'PopoverSelect string mode expects a JSON array string containing only string or number values.',
      );
    }
    return [];
  }
  if (Array.isArray(value)) return value as ValueType[];
  return [value as ValueType];
}

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
  const { styles: popoverStyles, cx } = useStyles(resolvedPrefixCls);

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
  const controlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const [searchValue, setSearchValue] = useState('');
  const { options, optionMap, displayOptions } = useNormalizedOptions<
    ValueType,
    OptionType
  >(optionSource, fieldNames, searchValue);

  const [uncontrolledValue, setUncontrolledValue] = useState<ValueType[]>(() =>
    parseExternalValue(props.defaultValue, mode, valueType),
  );
  const controlledValue = useMemo(
    () => parseExternalValue<ValueType>(props.value, mode, valueType),
    [mode, props.value, valueType],
  );
  const selectedValues = controlled ? controlledValue : uncontrolledValue;

  const [open, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChange,
  });

  // showConfirm 开启时在弹层内维护草稿值，确认后才提交
  const [draftValue, setDraftValue] = useState<ValueType[]>(selectedValues);
  const confirmedSelection = mode === 'multiple' && showConfirm;
  const targetValues = confirmedSelection ? draftValue : selectedValues;

  useEffect(() => {
    if (open) setDraftValue(selectedValues);
    else setSearchValue('');
  }, [open, selectedValues]);

  const emitValue = useCallback(
    (nextValues: ValueType[]) => {
      if (!controlled) setUncontrolledValue(nextValues);
      const selectedOptions = nextValues
        .map((value) => optionMap.get(value)?.source)
        .filter((option): option is OptionType => option !== undefined);

      if (props.mode === 'multiple') {
        if (props.valueType === 'string') {
          props.onChange?.(JSON.stringify(nextValues), selectedOptions);
        } else {
          props.onChange?.(nextValues, selectedOptions);
        }
      } else {
        props.onChange?.(nextValues[0], selectedOptions);
      }
    },
    [controlled, optionMap, props],
  );

  const toggleValue = useCallback(
    (value: ValueType) => {
      const next =
        mode === 'multiple'
          ? targetValues.includes(value)
            ? targetValues.filter((item) => item !== value)
            : [...targetValues, value]
          : [value];

      if (confirmedSelection) setDraftValue(next);
      else emitValue(next);

      if (mode === 'single') setOpen(false);
    },
    [confirmedSelection, emitValue, mode, setOpen, targetValues],
  );

  // 全选逻辑：全选操作选中当前过滤结果中的未禁用项（追加到已有选择），取消全选则剔除当前过滤结果中的项
  const handleSelectAll = useCallback(
    (event: { target: { checked: boolean } }) => {
      const enabledValues = displayOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value);
      const enabledSet = new Set(enabledValues);
      const next = event.target.checked
        ? Array.from(new Set([...targetValues, ...enabledValues]))
        : targetValues.filter((value) => !enabledSet.has(value));

      if (confirmedSelection) setDraftValue(next);
      else emitValue(next);
    },
    [confirmedSelection, displayOptions, emitValue, targetValues],
  );

  const labels = selectedValues.map(
    (value) => optionMap.get(value)?.label ?? String(value),
  );

  const visibleLabels =
    mode === 'multiple' && maxTagCount !== undefined
      ? labels.slice(0, maxTagCount)
      : labels;

  const displayNode = labels.length ? (
    <Tooltip
      title={
        ellipsis === false
          ? undefined
          : typeof ellipsis === 'object' && ellipsis.tooltip
          ? ellipsis.tooltip
          : labels.map(getNodeText).join(separator)
      }
    >
      <span>
        {visibleLabels.map((label, index) => (
          <React.Fragment key={index}>
            {index > 0 && separator}
            {label}
          </React.Fragment>
        ))}
        {visibleLabels.length < labels.length &&
          `${separator}... (+${labels.length - visibleLabels.length})`}
      </span>
    </Tooltip>
  ) : (
    <>{placeholder}</>
  );

  const footerActions = [
    showClearBtn && (
      <Button
        key="clear"
        size="small"
        onClick={() => {
          if (confirmedSelection) setDraftValue([]);
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
    confirmedSelection && (
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

  const content = (
    <PopoverSelectContent
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
        autoAdjustOverflow={props.autoAdjustOverflow}
        afterOpenChange={props.afterOpenChange}
        placement={props.placement}
        getPopupContainer={props.getPopupContainer}
        destroyTooltipOnHide={props.destroyTooltipOnHide}
        content={props.dropdownRender ? () => content : content}
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
        disabled={disabled}
        classNames={classNames}
        styles={styles}
      >
        {displayNode}
      </Selector>
    </div>
  );
}

type PopoverSelectRefProps = { ref?: React.Ref<HTMLDivElement> };

export interface PopoverSelectComponent {
  <
    ValueType extends RawValueType = RawValueType,
    OptionType extends object = DefaultOptionType,
  >(
    props: PopoverSelectSingleProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <
    ValueType extends RawValueType = RawValueType,
    OptionType extends object = DefaultOptionType,
  >(
    props: PopoverSelectMultipleArrayProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <OptionType extends object = DefaultOptionType>(
    props: PopoverSelectMultipleStringProps<OptionType> & PopoverSelectRefProps,
  ): React.ReactElement | null;
  displayName?: string;
  Selector: typeof Selector;
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
