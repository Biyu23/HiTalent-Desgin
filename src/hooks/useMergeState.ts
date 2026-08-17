import { useCallback, useRef, useState } from 'react';

export interface UseMergeStateProps<TOrigin, TResult = TOrigin> {
  /**
   * 外部传入的值 (受控)。
   * 当 value !== undefined 时为受控模式；当 value === undefined 时为非受控模式。
   */
  value?: TResult;

  /**
   * 默认初始值 (非受控)
   */
  defaultValue?: TResult | (() => TResult);

  /**
   * 值改变时的回调
   */
  onChange?: (value: TResult, ...args: any[]) => void;

  /**
   * 将外部传入的 TResult 转换为组件内部使用的 TOrigin
   */
  transformToOrigin?: (value: TResult | undefined) => TOrigin;

  /**
   * 将内部使用的 TOrigin 转换为输出给外部的 TResult
   */
  transformToResult?: (value: TOrigin) => TResult;
}

export function useMergeState<TOrigin, TResult = TOrigin>(
  props: UseMergeStateProps<TOrigin, TResult> = {},
) {
  const {
    value,
    defaultValue,
    onChange,
    // 如果没有传转换函数，默认原样返回。
    // 由于 TOrigin 和 TResult 可能不同，通过 unknown 作为中间桥梁
    // 绕过 TypeScript 的类型检查（当 TOrigin === TResult 时默认函数才是安全的）
    transformToOrigin = (v) => v as unknown as TOrigin,
    transformToResult = (v) => v as unknown as TResult,
  } = props;

  // 判断是否为受控模式：外部传入了非 undefined 的 value 即为受控模式
  const isControlled = value !== undefined;

  // 使用 useRef 缓存转换函数，防止外部传入内联函数导致无意义的重渲染
  const transformOriginRef = useRef(transformToOrigin);
  const transformResultRef = useRef(transformToResult);
  transformOriginRef.current = transformToOrigin;
  transformResultRef.current = transformToResult;

  // 缓存受控模式下的 origin 转换结果，避免相同 value 重新计算导致对象/数组引用发生无意义变化
  const prevControlledRef = useRef<{
    value?: TResult;
    transform?: (v: TResult | undefined) => TOrigin;
    origin: TOrigin;
  }>();

  let controlledOriginValue: TOrigin;
  if (
    prevControlledRef.current &&
    Object.is(prevControlledRef.current.value, value) &&
    prevControlledRef.current.transform === transformToOrigin
  ) {
    controlledOriginValue = prevControlledRef.current.origin;
  } else {
    controlledOriginValue = transformToOrigin(value);
    prevControlledRef.current = {
      value,
      transform: transformToOrigin,
      origin: controlledOriginValue,
    };
  }

  // 初始化非受控内部状态 (TOrigin)
  const [internalValue, setInternalValue] = useState<TOrigin>(() => {
    if (isControlled) {
      return controlledOriginValue;
    }
    const initVal =
      typeof defaultValue === 'function'
        ? (defaultValue as () => TResult)()
        : defaultValue;
    return transformToOrigin(initVal);
  });

  // 当前生效的内部值：受控模式直接使用受控值转换结果，非受控模式使用内部 state
  const mergedValue = isControlled ? controlledOriginValue : internalValue;

  const internalValueRef = useRef<TOrigin>(mergedValue);
  internalValueRef.current = mergedValue;

  const triggerChange = useCallback(
    (nextValue: TOrigin, ...args: any[]) => {
      if (!isControlled) {
        setInternalValue(nextValue);
        internalValueRef.current = nextValue;
      }

      if (onChange) {
        const resultValue = transformResultRef.current(nextValue);
        onChange(resultValue, ...args);
      }
    },
    [isControlled, onChange],
  );

  const set = useCallback(
    (val: TOrigin | ((prev: TOrigin) => TOrigin), ...args: any[]) => {
      const nextValue =
        typeof val === 'function'
          ? (val as (prev: TOrigin) => TOrigin)(internalValueRef.current)
          : val;
      triggerChange(nextValue, ...args);
    },
    [triggerChange],
  );

  const merge = useCallback(
    (patch: Partial<TOrigin>, ...args: any[]) => {
      const current = internalValueRef.current;
      const nextValue =
        typeof current === 'object' &&
        current !== null &&
        !Array.isArray(current)
          ? ({ ...current, ...patch } as TOrigin)
          : (patch as unknown as TOrigin);

      triggerChange(nextValue, ...args);
    },
    [triggerChange],
  );

  const clear = useCallback(
    (emptyValue?: TOrigin, ...args: any[]) => {
      triggerChange(emptyValue as TOrigin, ...args);
    },
    [triggerChange],
  );

  const refresh = useCallback(
    (...args: any[]) => {
      triggerChange(internalValueRef.current, ...args);
    },
    [triggerChange],
  );

  return [mergedValue, { set, merge, clear, refresh }] as const;
}
