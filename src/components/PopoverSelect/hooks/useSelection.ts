import type { CheckboxChangeEvent } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RawValueType } from '../type';

interface UseSelectionParams<
  ValueType extends RawValueType,
  MappedOption extends Record<string, any>,
> {
  /** 单选 / 多选模式 */
  mode: 'single' | 'multiple';
  /** 多选 + showConfirm=true 时启用确认模式 */
  realShowConfirm: boolean;
  /** 已确认的选中值（来自 useMergeState） */
  internalValue: ValueType[];
  /** 映射后的完整选项列表 */
  options: MappedOption[];
  /** 快速查找 Map */
  optionMap: Map<ValueType, MappedOption>;
  /** 搜索过滤后的显示选项列表（用于全选判断与操作） */
  displayOptions: MappedOption[];
  /** Popover 开关状态 */
  open: boolean;
  /** Popover 开关控制 */
  setOpen: (open: boolean) => void;
  /** useMergeState actions.set */
  setValue: (val: ValueType[], options: MappedOption[]) => void;
  /** useMergeState actions.clear */
  clearValue: (emptyValue: ValueType[]) => void;
}

/**
 * 选择状态管理与事件处理
 *
 * 管理草稿值（draftValue）、确认/单选模式下直接同步选中值的完整逻辑。
 * 所有 handler 通过 useRef 追踪最新状态，避免闭包陷阱与不必要重渲染。
 */
export function useSelection<
  ValueType extends RawValueType = RawValueType,
  MappedOption extends Record<string, any> = Record<string, any>,
>(params: UseSelectionParams<ValueType, MappedOption>) {
  const {
    mode,
    realShowConfirm,
    internalValue,
    optionMap,
    displayOptions,
    open,
    setOpen,
    setValue,
    clearValue,
  } = params;

  const [draftValue, setDraftValue] = useState<ValueType[]>([]);

  const internalValueRef = React.useRef(internalValue);
  internalValueRef.current = internalValue;
  const draftValueRef = React.useRef(draftValue);
  draftValueRef.current = draftValue;
  const realShowConfirmRef = React.useRef(realShowConfirm);
  realShowConfirmRef.current = realShowConfirm;
  const modeRef = React.useRef(mode);
  modeRef.current = mode;
  const optionMapRef = React.useRef(optionMap);
  optionMapRef.current = optionMap;
  const displayOptionsRef = React.useRef(displayOptions);
  displayOptionsRef.current = displayOptions;
  const setValueRef = React.useRef(setValue);
  setValueRef.current = setValue;
  const clearValueRef = React.useRef(clearValue);
  clearValueRef.current = clearValue;
  const setOpenRef = React.useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (open) {
      setDraftValue(internalValueRef.current);
    }
  }, [open]);

  const targetValueList = realShowConfirm ? draftValue : internalValue;
  const targetValueSet = useMemo(
    () => new Set(targetValueList),
    [targetValueList],
  );

  const enabledDisplayOptions = useMemo(
    () => displayOptions.filter((o: MappedOption) => !o.disabled),
    [displayOptions],
  );

  const isAllSelected = useMemo(
    () =>
      enabledDisplayOptions.length > 0 &&
      enabledDisplayOptions.every((o: MappedOption) =>
        targetValueSet.has(o.value),
      ),
    [enabledDisplayOptions, targetValueSet],
  );

  const isPartiallySelected = useMemo(
    () =>
      !isAllSelected &&
      enabledDisplayOptions.some((o: MappedOption) =>
        targetValueSet.has(o.value),
      ),
    [enabledDisplayOptions, targetValueSet, isAllSelected],
  );

  const getSelectedOptionObjects = useCallback((values: ValueType[]) => {
    return values
      .map((val) => optionMapRef.current.get(val))
      .filter(Boolean) as MappedOption[];
  }, []);

  const handleValueToggle = useCallback(
    (itemValue: ValueType) => {
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
        const newOptions = getSelectedOptionObjects(newValues);
        setValueRef.current(newValues, newOptions);
        if (modeRef.current === 'single') {
          setOpenRef.current(false);
        }
      }
    },
    [getSelectedOptionObjects],
  );

  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent) => {
      const checked = e.target.checked;
      const enabledOpts = displayOptionsRef.current.filter(
        (o: MappedOption) => !o.disabled,
      );
      const enabledValues = enabledOpts.map((o: MappedOption) => o.value);
      const currentTarget = realShowConfirmRef.current
        ? draftValueRef.current
        : internalValueRef.current;
      let newValues: ValueType[];
      if (checked) {
        newValues = Array.from(new Set([...currentTarget, ...enabledValues]));
      } else {
        const enabledValueSet = new Set(enabledValues);
        newValues = currentTarget.filter((v) => !enabledValueSet.has(v));
      }
      if (realShowConfirmRef.current) {
        setDraftValue(newValues);
      } else {
        const newOptions = getSelectedOptionObjects(newValues);
        setValueRef.current(newValues, newOptions);
      }
    },
    [getSelectedOptionObjects],
  );

  const handleConfirm = useCallback(() => {
    const newOptions = getSelectedOptionObjects(draftValueRef.current);
    setValueRef.current(draftValueRef.current, newOptions);
    setOpenRef.current(false);
  }, [getSelectedOptionObjects]);

  const handleCancel = useCallback(() => setOpenRef.current(false), []);

  const handleDraftClear = useCallback(() => setDraftValue([]), []);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearValueRef.current([] as ValueType[]);
    setDraftValue([]);
  }, []);

  return {
    draftValue,
    setDraftValue,
    targetValueList,
    targetValueSet,
    enabledDisplayOptions,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleValueToggle,
    handleConfirm,
    handleCancel,
    handleDraftClear,
    handleClear,
  };
}
