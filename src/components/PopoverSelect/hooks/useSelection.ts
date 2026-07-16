import type { CheckboxChangeEvent, CheckboxProps } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
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
  /** 映射后的选项列表 */
  options: MappedOption[];
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
 * 所有 handler 通过 useRef 追踪最新状态，避免 React 18 自动批处理下的闭包陷阱。
 */
export function useSelection<
  ValueType extends RawValueType = RawValueType,
  MappedOption extends Record<string, any> = Record<string, any>,
>(params: UseSelectionParams<ValueType, MappedOption>) {
  const {
    mode,
    realShowConfirm,
    internalValue,
    options,
    open,
    setOpen,
    setValue,
    clearValue,
  } = params;

  const [draftValue, setDraftValue] = useState<ValueType[]>([]);

  // ---- Ref 缓存：避免 useCallback 闭包陷阱（必须在 useEffect 之前声明） ----
  const internalValueRef = React.useRef(internalValue);
  internalValueRef.current = internalValue;
  const draftValueRef = React.useRef(draftValue);
  draftValueRef.current = draftValue;
  const realShowConfirmRef = React.useRef(realShowConfirm);
  realShowConfirmRef.current = realShowConfirm;
  const modeRef = React.useRef(mode);
  modeRef.current = mode;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const setValueRef = React.useRef(setValue);
  setValueRef.current = setValue;
  const clearValueRef = React.useRef(clearValue);
  clearValueRef.current = clearValue;
  const setOpenRef = React.useRef(setOpen);
  setOpenRef.current = setOpen;

  // 每次打开弹窗时用当前已确认值初始化草稿
  useEffect(() => {
    if (open) {
      setDraftValue(internalValueRef.current);
    }
  }, [open]);

  // ---- 计算派生状态 ----
  const targetValueList = realShowConfirm ? draftValue : internalValue;
  const enabledOptions = options.filter((o: MappedOption) => !o.disabled);
  const isAllSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((o: MappedOption) =>
      targetValueList.includes(o.value),
    );
  const isPartiallySelected =
    enabledOptions.some((o: MappedOption) =>
      targetValueList.includes(o.value),
    ) && !isAllSelected;

  // ---- 事件处理（全部通过 Ref 访问最新值） ----

  /** 核心：切换某个选项的选中状态 */
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
      setValueRef.current(newValues, newOptions);
      if (modeRef.current === 'single') {
        setOpenRef.current(false);
      }
    }
  }, []);

  /** 全选 / 取消全选 */
  const handleSelectAll = useCallback((e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    const enabledOpts = optionsRef.current.filter(
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
      newValues = currentTarget.filter((v) => !enabledValues.includes(v));
    }
    if (realShowConfirmRef.current) {
      setDraftValue(newValues);
    } else {
      const newOptions = optionsRef.current.filter((opt: MappedOption) =>
        newValues.includes(opt.value),
      );
      setValueRef.current(newValues, newOptions);
    }
  }, []);

  /** Checkbox onChange 包装：从事件中提取 value 并委托给 handleValueToggle */
  const handleChange: CheckboxProps['onChange'] = useCallback(
    (event) => {
      handleValueToggle(event.target.value as ValueType);
    },
    [handleValueToggle],
  );

  /** 多选确认模式：提交草稿值 */
  const handleConfirm = useCallback(() => {
    const newOptions = optionsRef.current.filter((opt: MappedOption) =>
      draftValueRef.current.includes(opt.value),
    );
    setValueRef.current(draftValueRef.current, newOptions);
    setOpenRef.current(false);
  }, []);

  /** 取消：仅关闭弹窗，不提交 */
  const handleCancel = useCallback(() => setOpenRef.current(false), []);

  /** 清空当前草稿 */
  const handleDraftClear = useCallback(() => setDraftValue([]), []);

  /** 清除所有已选值（触发 onChange） */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearValueRef.current([] as ValueType[]);
    setDraftValue([]);
  }, []);

  return {
    draftValue,
    setDraftValue,
    targetValueList,
    enabledOptions,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleValueToggle,
    handleChange,
    handleConfirm,
    handleCancel,
    handleDraftClear,
    handleClear,
  };
}
