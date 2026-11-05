import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMergeState } from '../../../hooks';
import type {
  MappedOption,
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
        if (props.valueType === 'string') {
          props.onChange?.(value as string, selectedOptions);
        } else {
          props.onChange?.(value as V[], selectedOptions);
        }
      } else {
        props.onChange?.(value as V | undefined, selectedOptions);
      }
    },
    [props.mode, props.onChange, props.valueType],
  );

  const [storedValues, setSelectedValues] = useMergeState<
    V[],
    ExternalValue<V>,
    [O[]]
  >({
    ...props,
    onChange,
    transformToOrigin,
    transformToResult,
  });

  const normalizeValues = useCallback(
    (values: V[]) =>
      valueType === 'string'
        ? Array.from(
            new Set(
              values.map((value) => stringValueMap.get(String(value)) ?? value),
            ),
          )
        : values,
    [stringValueMap, valueType],
  );
  const selectedValues = useMemo(
    () => normalizeValues(storedValues),
    [storedValues, normalizeValues],
  );

  const [requestedOpen, setOpen] = useMergeState<boolean>({
    defaultValue: props.defaultOpen ?? false,
    ...(props.open !== undefined ? { value: props.open } : {}),
    onChange: props.onOpenChange,
  });
  const open = requestedOpen && !disabled;

  const [draftValues, setDraftValues] = useState(selectedValues);
  const previous = useRef({ open: false, selectedValues, confirmRequired });

  useEffect(() => {
    const last = previous.current;
    const changed =
      last.selectedValues.length !== selectedValues.length ||
      last.selectedValues.some((value, index) =>
        valueType === 'string'
          ? String(value) !== String(selectedValues[index])
          : value !== selectedValues[index],
      );

    // 重排 options 会重新解析 value；等值结果不覆盖未确认的草稿。
    if (
      open &&
      (!last.open || changed || confirmRequired !== last.confirmRequired)
    ) {
      setDraftValues(selectedValues);
    }

    if (!open) {
      setSearchValue('');
    }

    previous.current = { open, selectedValues, confirmRequired };
  }, [open, selectedValues, confirmRequired, valueType]);

  useEffect(() => {
    if (disabled && requestedOpen) {
      setOpen(false);
    }
  }, [disabled, requestedOpen, setOpen]);

  const normalizedDraftValues = useMemo(
    () => normalizeValues(draftValues),
    [draftValues, normalizeValues],
  );
  const targetValues = confirmRequired ? normalizedDraftValues : selectedValues;

  const emitValue = (values: V[]) => {
    if (disabled) {
      return;
    }

    const selectedOptions = values
      .map((value) => optionMap.get(value)?.source)
      .filter((option): option is O => option !== undefined);
    setSelectedValues(values, selectedOptions);
  };

  const updateSelection = (values: V[]) => {
    if (disabled) {
      return;
    }

    if (confirmRequired) {
      setDraftValues(values);
    } else {
      emitValue(values);
    }
  };

  const sortOptions = (options: readonly MappedOption<V, O>[]) => {
    if (disabled) return;

    if (mode === 'multiple') {
      // 只调整已选值的顺序；未加载到 options 中的值保留在末尾，不丢失选择。
      const positions = new Map(
        options.map((option, index) => [option.value, index]),
      );
      const values = [...targetValues].sort(
        (a, b) =>
          (positions.get(a) ?? options.length) -
          (positions.get(b) ?? options.length),
      );
      if (values.some((value, index) => value !== targetValues[index])) {
        updateSelection(values);
      }
    }

    props.onSortChange?.(options.map((option) => option.source));
  };

  const toggleValue = (value: V) => {
    const option = optionMap.get(value);
    if (disabled || !option || option.disabled) {
      return;
    }

    updateSelection(
      mode === 'multiple'
        ? targetValues.includes(value)
          ? targetValues.filter((item) => item !== value)
          : [...targetValues, value]
        : [value],
    );
    if (mode === 'single') {
      setOpen(false);
    }
  };

  const selectAll = (checked: boolean) => {
    if (mode !== 'multiple') {
      return;
    }

    const values = displayOptions
      .filter((option) => !option.disabled)
      .map((option) => option.value);
    const enabled = new Set(values);
    updateSelection(
      checked
        ? Array.from(new Set([...targetValues, ...values]))
        : targetValues.filter((value) => !enabled.has(value)),
    );
  };

  const clearCommitted = () => {
    emitValue([]);
    setDraftValues([]);
  };

  const cancel = () => {
    setDraftValues(selectedValues);
    setOpen(false);
  };

  const confirm = () => {
    if (disabled) {
      return;
    }

    if (confirmRequired) {
      emitValue(normalizedDraftValues);
    }

    setOpen(false);
  };

  const context: PopoverSelectRenderContext<V, O> = {
    options: normalized.options,
    displayOptions,
    selectedValues: targetValues,
    searchValue,
    mode,
    confirmRequired,
    sortOptions,
    toggleValue,
    selectAll,
    clear: () => updateSelection([]),
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
