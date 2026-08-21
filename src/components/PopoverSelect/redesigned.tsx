import {
  CloseCircleOutlined,
  DownOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd';
import { Button, Checkbox, Empty, Input, Popover, Space, Tooltip } from 'antd';
import clsx from 'clsx';
import VirtualList from 'rc-virtual-list';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ConfigContext, useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import type { PopoverSelectLocale } from '../../locales';
import { attachPropertiesToComponent, withNativeProps } from '../../util';
import {
  ComponentNamespaceProvider,
  useComponentNamespace,
  useResolvedComponentNamespace,
} from '../_util/namespace';
import type {
  DefaultOptionType,
  PopoverSelectFieldNames,
  PopoverSelectMultipleArrayProps,
  PopoverSelectMultipleStringProps,
  PopoverSelectProps,
  PopoverSelectSingleProps,
  RawValueType,
  SelectorProps,
} from './publicTypes';
import { useStyle } from './style';
import type { MappedOption } from './types/internal';

function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return '';
  return React.Children.toArray(node.props.children).map(getNodeText).join('');
}

function readField<OptionType extends object>(
  option: OptionType,
  key: PropertyKey,
): unknown {
  return (option as Record<PropertyKey, unknown>)[key];
}

function useNormalizedOptions<
  ValueType extends RawValueType,
  OptionType extends object,
>(
  source: readonly OptionType[],
  fieldNames: PopoverSelectFieldNames<OptionType> | undefined,
  searchValue: string,
) {
  const options = useMemo(() => {
    const result: Array<MappedOption<ValueType, OptionType>> = [];
    const values = new Set<RawValueType>();
    const labelKey = fieldNames?.label ?? 'label';
    const valueKey = fieldNames?.value ?? 'value';
    const disabledKey = fieldNames?.disabled ?? 'disabled';

    source.forEach((option, index) => {
      const value = readField(option, valueKey);
      if (typeof value !== 'string' && typeof value !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `PopoverSelect ignored option at index ${index}: value must be a string or number.`,
          );
        }
        return;
      }
      if (values.has(value)) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `PopoverSelect ignored duplicate option value "${String(value)}".`,
          );
        }
        return;
      }
      values.add(value);
      result.push({
        label: readField(option, labelKey) as React.ReactNode,
        value: value as ValueType,
        disabled: Boolean(readField(option, disabledKey)),
        source: option,
      });
    });
    return result;
  }, [fieldNames, source]);

  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );
  const displayOptions = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        getNodeText(option.label).toLocaleLowerCase().includes(query) ||
        String(option.value).toLocaleLowerCase().includes(query),
    );
  }, [options, searchValue]);

  return { options, optionMap, displayOptions };
}

interface PopoverSelectContentProps<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  options: Array<MappedOption<ValueType, OptionType>>;
  displayOptions: Array<MappedOption<ValueType, OptionType>>;
  selectedValues: ValueType[];
  mode: 'single' | 'multiple';
  showSearch: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showSelectAll: boolean;
  onSelectAll: (event: CheckboxChangeEvent) => void;
  onToggle: (value: ValueType) => void;
  optionRender?: (option: OptionType) => React.ReactNode;
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  footerActions: React.ReactNode[];
  virtual: boolean;
  listHeight: number;
  listItemHeight: number;
  locale: PopoverSelectLocale;
  classNames: PopoverSelectProps<ValueType, OptionType>['classNames'];
  styles: PopoverSelectProps<ValueType, OptionType>['styles'];
}

function PopoverSelectContent<
  ValueType extends RawValueType,
  OptionType extends object,
>(props: PopoverSelectContentProps<ValueType, OptionType>) {
  const namespace = useComponentNamespace();
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
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const enabledOptions = useMemo(
    () => displayOptions.filter((option) => !option.disabled),
    [displayOptions],
  );
  const allSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((option) => selectedSet.has(option.value));
  const partiallySelected =
    !allSelected &&
    enabledOptions.some((option) => selectedSet.has(option.value));

  const renderOption = useCallback(
    (option: MappedOption<ValueType, OptionType>) => {
      const content = optionRender ? optionRender(option.source) : option.label;
      const itemClassName = clsx(
        namespace.element(mode === 'multiple' ? 'menu-checkbox' : 'menu-radio'),
        classNames?.item,
      );
      if (mode === 'multiple') {
        return (
          <Checkbox
            key={option.value}
            checked={selectedSet.has(option.value)}
            disabled={option.disabled}
            className={itemClassName}
            style={styles?.item}
            onChange={() => onToggle(option.value)}
          >
            {content}
          </Checkbox>
        );
      }
      return (
        <div
          key={option.value}
          role="option"
          aria-selected={selectedSet.has(option.value)}
          aria-disabled={option.disabled}
          className={clsx(itemClassName, {
            [namespace.elementModifier('menu-radio', 'active')]:
              selectedSet.has(option.value),
            [namespace.elementModifier('menu-radio', 'disabled')]:
              option.disabled,
          })}
          style={styles?.item}
          onClick={() => !option.disabled && onToggle(option.value)}
        >
          {content}
        </div>
      );
    },
    [
      classNames?.item,
      mode,
      namespace,
      onToggle,
      optionRender,
      selectedSet,
      styles?.item,
    ],
  );

  const empty = (description: string) => (
    <div
      className={clsx(namespace.element('empty'), classNames?.empty)}
      style={styles?.empty}
    >
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    </div>
  );

  if (options.length === 0) {
    return (
      <div className={namespace.element('dropdown')}>
        {empty(locale.noData)}
      </div>
    );
  }

  const actualHeight = Math.min(
    displayOptions.length * listItemHeight,
    listHeight,
  );
  const menu = (
    <div
      role="listbox"
      aria-multiselectable={mode === 'multiple' || undefined}
      className={clsx(namespace.element('menu'), classNames?.menu)}
      style={{
        ...styles?.menu,
        ...(!virtual ? { maxHeight: listHeight } : undefined),
      }}
    >
      {virtual ? (
        <VirtualList
          data={displayOptions}
          height={actualHeight}
          itemHeight={listItemHeight}
          itemKey="value"
        >
          {renderOption}
        </VirtualList>
      ) : (
        displayOptions.map(renderOption)
      )}
    </div>
  );
  const renderedMenu = dropdownRender ? dropdownRender(menu) : menu;

  return (
    <div className={namespace.element('dropdown')}>
      {showSearch && (
        <div
          className={clsx(namespace.element('search'), classNames?.search)}
          style={styles?.search}
        >
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
        <div
          className={clsx(
            namespace.element('select-all'),
            classNames?.selectAll,
          )}
          style={styles?.selectAll}
        >
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
      {displayOptions.length > 0 ? renderedMenu : empty(locale.noMatch)}
      {footerActions.length > 0 && (
        <div
          className={clsx(namespace.element('footer'), classNames?.footer)}
          style={styles?.footer}
        >
          <Space>{footerActions}</Space>
        </div>
      )}
    </div>
  );
}

const Selector = forwardRef<React.ComponentRef<typeof Button>, SelectorProps>(
  (props, ref) => {
    const namespace = useComponentNamespace();
    const {
      content,
      autoAdjustOverflow = true,
      afterOpenChange,
      placement = 'bottomLeft',
      getPopupContainer,
      destroyTooltipOnHide,
      children,
      open: openProp,
      onOpenChange: onOpenChangeProp,
      allowClear = true,
      hasValue,
      showArrow = true,
      disabled = false,
      onClear,
      className,
      style,
      classNames,
      styles,
    } = props;
    const [open, { set: setOpen }] = useMergeState<boolean>({
      defaultValue: false,
      value: openProp,
      onChange: onOpenChangeProp,
    });
    const hasClear = Boolean(allowClear && hasValue && !disabled);

    const trigger = withNativeProps(
      props,
      <Button
        ref={ref}
        type="text"
        disabled={disabled}
        className={clsx(
          namespace.element('selector-btn'),
          namespace.hashId,
          classNames?.trigger,
          className,
          {
            [namespace.elementModifier('selector-btn', 'active')]: hasValue,
            [namespace.elementModifier('selector-btn', 'open')]: open,
            [namespace.elementModifier('selector-btn', 'empty')]: !hasValue,
          },
        )}
        style={{ ...styles?.trigger, ...style }}
      >
        <span
          className={clsx(
            namespace.element('selector-text'),
            classNames?.triggerText,
          )}
          style={styles?.triggerText}
        >
          {children}
        </span>
        {(hasClear || showArrow) && (
          <span
            className={clsx(
              namespace.element('selector-actions'),
              classNames?.actions,
            )}
            style={styles?.actions}
          >
            {hasClear && (
              <CloseCircleOutlined
                className={namespace.element('selector-clear')}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear?.(event);
                }}
              />
            )}
            {showArrow && <DownOutlined />}
          </span>
        )}
      </Button>,
    );

    return (
      <Popover
        trigger="click"
        placement={placement}
        getPopupContainer={getPopupContainer}
        destroyTooltipOnHide={destroyTooltipOnHide}
        autoAdjustOverflow={autoAdjustOverflow}
        rootClassName={clsx(
          namespace.element('selector'),
          namespace.hashId,
          classNames?.popup,
        )}
        styles={{ root: styles?.popup }}
        afterOpenChange={afterOpenChange}
        open={disabled ? false : open}
        content={
          disabled ? null : typeof content === 'function' ? content() : content
        }
        onOpenChange={disabled ? undefined : setOpen}
      >
        {trigger}
      </Popover>
    );
  },
);

Selector.displayName = 'PopoverSelect.Selector';

function parseExternalValue<ValueType extends RawValueType>(
  value: unknown,
  mode: 'single' | 'multiple',
  valueType: 'array' | 'string' | undefined,
): ValueType[] {
  if (value === undefined || value === null || value === '') return [];
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
      // Invalid external input is reported below and treated as no selection.
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
  const { antdPrefixCls } = React.useContext(ConfigContext);
  const resolvedPrefixCls = usePrefixCls('popover-select', prefixCls);
  const { wrapSSR, hashId } = useStyle(resolvedPrefixCls, antdPrefixCls);
  const namespace = useResolvedComponentNamespace(
    'popover-select',
    prefixCls,
    hashId,
  );
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

  const handleSelectAll = useCallback(
    (event: CheckboxChangeEvent) => {
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

  return wrapSSR(
    <ComponentNamespaceProvider value={namespace}>
      <div
        ref={ref}
        className={clsx(
          namespace.prefixCls,
          namespace.hashId,
          rootClassName,
          classNames?.root,
        )}
        style={styles?.root}
      >
        <Selector
          content={props.dropdownRender ? () => content : content}
          open={open}
          onOpenChange={setOpen}
          afterOpenChange={props.afterOpenChange}
          placement={props.placement}
          getPopupContainer={props.getPopupContainer}
          autoAdjustOverflow={props.autoAdjustOverflow}
          destroyTooltipOnHide={props.destroyTooltipOnHide}
          allowClear={allowClear}
          hasValue={selectedValues.length > 0}
          onClear={(event) => {
            event.stopPropagation();
            emitValue([]);
            setDraftValue([]);
          }}
          showArrow={showArrow}
          disabled={disabled}
          className={props.className}
          style={props.style}
          classNames={classNames}
          styles={styles}
        >
          {displayNode}
        </Selector>
      </div>
    </ComponentNamespaceProvider>,
  );
}

type PopoverSelectRefProps = { ref?: React.Ref<HTMLDivElement> };

interface PopoverSelectComponent {
  <ValueType extends RawValueType, OptionType extends object>(
    props: PopoverSelectSingleProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <ValueType extends RawValueType, OptionType extends object>(
    props: PopoverSelectMultipleArrayProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <OptionType extends object>(
    props: PopoverSelectMultipleStringProps<OptionType> & PopoverSelectRefProps,
  ): React.ReactElement | null;
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
