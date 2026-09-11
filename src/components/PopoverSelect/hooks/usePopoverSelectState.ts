import { useCallback, useEffect, useRef, useState } from 'react';
import { useMergeState } from '../../../hooks';
import type {
  PopoverSelectProps,
  PopoverSelectRenderContext,
  RawValueType,
} from '../type';
import { parseExternalValue } from '../utils';
import { useNormalizedOptions } from './useNormalizedOptions';

type ExternalValue<V extends RawValueType> = V | V[] | string | undefined;
const emptyOptions: never[] = [];

/** 选择、草稿和提交的唯一入口；渲染层只调用语义化操作。 */
export function usePopoverSelectState<V extends RawValueType, O extends object>(
  props: PopoverSelectProps<V, O>,
) {
  const { mode = 'single', disabled = false, valueSeparator = ',' } = props;
  const valueType = mode === 'multiple' ? props.valueType : undefined;
  const confirmRequired = mode === 'multiple' && (props.showConfirm ?? true);
  const [searchValue, setSearchValue] = useState('');
  const normalized = useNormalizedOptions<V, O>(
    props.options ?? emptyOptions,
    props.fieldNames,
    searchValue,
  );
  const { optionMap, stringValueMap, displayOptions } = normalized;
  const transformToOrigin = useCallback(
    (value: ExternalValue<V>) =>
      parseExternalValue<V>(
        value,
        mode,
        valueType,
        valueSeparator,
        stringValueMap,
      ),
    [mode, stringValueMap, valueSeparator, valueType],
  );
  const transformToResult = useCallback(
    (values: V[]): ExternalValue<V> =>
      mode === 'single'
        ? values[0]
        : valueType === 'string'
        ? values.join(valueSeparator)
        : values,
    [mode, valueSeparator, valueType],
  );
  const onChange = useCallback(
    (value: ExternalValue<V>, selectedOptions: O[]) => {
      if (props.mode === 'multiple') {
        if (props.valueType === 'string')
          props.onChange?.(value as string, selectedOptions);
        else props.onChange?.(value as V[], selectedOptions);
      } else props.onChange?.(value as V | undefined, selectedOptions);
    },
    [props.mode, props.onChange, props.valueType],
  );
  const [selectedValues, { set: setSelectedValues }] = useMergeState<
    V[],
    ExternalValue<V>,
    [O[]]
  >({
    value: props.value,
    controlled: Object.prototype.hasOwnProperty.call(props, 'value'),
    defaultValue: props.defaultValue,
    onChange,
    transformToOrigin,
    transformToResult,
  });
  const [requestedOpen, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: props.defaultOpen ?? false,
    value: props.open,
    onChange: props.onOpenChange,
  });
  const open = requestedOpen && !disabled;
  const [draftValues, setDraftValues] = useState(selectedValues);
  const previous = useRef({ open: false, selectedValues, confirmRequired });
  useEffect(() => {
    const last = previous.current;
    const changed =
      last.selectedValues.length !== selectedValues.length ||
      last.selectedValues.some(
        (value, index) => value !== selectedValues[index],
      );
    // 重排 options 会重新解析 value；等值结果不覆盖未确认的草稿。
    if (
      open &&
      (!last.open || changed || confirmRequired !== last.confirmRequired)
    )
      setDraftValues(selectedValues);
    if (!open) setSearchValue('');
    previous.current = { open, selectedValues, confirmRequired };
  }, [open, selectedValues, confirmRequired]);
  useEffect(() => {
    if (disabled && requestedOpen) setOpen(false);
  }, [disabled, requestedOpen, setOpen]);
  const targetValues = confirmRequired ? draftValues : selectedValues;
  const emitValue = useCallback(
    (values: V[]) => {
      if (disabled) return;
      const selectedOptions = values
        .map((value) => optionMap.get(value)?.source)
        .filter((option): option is O => option !== undefined);
      setSelectedValues(values, selectedOptions);
    },
    [disabled, optionMap, setSelectedValues],
  );
  const updateSelection = useCallback(
    (values: V[]) => {
      if (disabled) return;
      if (confirmRequired) setDraftValues(values);
      else emitValue(values);
    },
    [disabled, confirmRequired, emitValue],
  );
  const toggleValue = useCallback(
    (value: V) => {
      const option = optionMap.get(value);
      if (disabled || !option || option.disabled) return;
      updateSelection(
        mode === 'multiple'
          ? targetValues.includes(value)
            ? targetValues.filter((item) => item !== value)
            : [...targetValues, value]
          : [value],
      );
      if (mode === 'single') setOpen(false);
    },
    [disabled, optionMap, updateSelection, mode, targetValues, setOpen],
  );
  const selectAll = useCallback(
    (checked: boolean) => {
      if (mode !== 'multiple') return;
      const values = displayOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value);
      const enabled = new Set(values);
      updateSelection(
        checked
          ? Array.from(new Set([...targetValues, ...values]))
          : targetValues.filter((value) => !enabled.has(value)),
      );
    },
    [mode, displayOptions, targetValues, updateSelection],
  );
  const clear = useCallback(() => updateSelection([]), [updateSelection]);
  const clearCommitted = useCallback(() => {
    emitValue([]);
    setDraftValues([]);
  }, [emitValue]);
  const cancel = useCallback(() => {
    setDraftValues(selectedValues);
    setOpen(false);
  }, [selectedValues, setOpen]);
  const confirm = useCallback(() => {
    if (disabled) return;
    if (confirmRequired) emitValue(draftValues);
    setOpen(false);
  }, [disabled, confirmRequired, emitValue, draftValues, setOpen]);
  const context: PopoverSelectRenderContext<V, O> = {
    options: normalized.options,
    displayOptions,
    selectedValues: targetValues,
    searchValue,
    mode,
    confirmRequired,
    toggleValue,
    selectAll,
    clear,
    confirm,
    cancel,
  };
  return {
    ...normalized,
    selectedValues,
    open,
    setOpen,
    setSearchValue,
    clearCommitted,
    context,
  };
}
