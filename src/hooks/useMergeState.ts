import { useCallback, useMemo, useRef, useState } from 'react';

export interface UseMergeStateProps<
  TOrigin,
  TResult = TOrigin,
  ChangeArgs extends unknown[] = unknown[],
> {
  /**
   * 外部传入的值 (受控)。
   * 传入 value 属性即为受控模式（包括 undefined）；省略该属性则为非受控模式。
   */
  value?: TResult;

  /**
   * 默认初始值 (非受控)
   */
  defaultValue?: TResult | (() => TResult);

  /**
   * 值改变时的回调
   */
  onChange?: (value: TResult, ...args: ChangeArgs) => void;

  /**
   * 将外部传入的 TResult 转换为组件内部使用的 TOrigin
   */
  transformToOrigin?: (value: TResult | undefined) => TOrigin;

  /**
   * 将内部使用的 TOrigin 转换为输出给外部的 TResult
   */
  transformToResult?: (value: TOrigin) => TResult;
}

/**
 * Defaults and value conversions, separate from the original component props.
 * props.defaultValue takes precedence; conversion functions in options override props.
 */
export type UseMergeStateOptions<TOrigin, TResult = TOrigin> = Pick<
  UseMergeStateProps<TOrigin, TResult>,
  'defaultValue' | 'transformToOrigin' | 'transformToResult'
>;

/**
 * Pass original props to preserve controlled undefined without conditional spreads.
 * @example useMergeState(props, { defaultValue: 0 })
 * The one-argument form remains supported.
 */
export function useMergeState<
  TOrigin,
  TResult = TOrigin,
  ChangeArgs extends unknown[] = unknown[],
>(
  props: UseMergeStateProps<TOrigin, TResult, ChangeArgs> = {},
  options: UseMergeStateOptions<TOrigin, TResult> = {},
) {
  const { value, onChange, transformToOrigin, transformToResult } = {
    ...props,
    ...options,
  };
  const defaultValue =
    props.defaultValue === undefined
      ? options.defaultValue
      : props.defaultValue;

  // 属性是否存在决定受控语义，undefined 可以作为合法的受控空值。
  const isControlled = Object.prototype.hasOwnProperty.call(props, 'value');

  // 使用 useRef 缓存转换函数、控制模式与回调，避免无意义的闭包依赖
  const transformResultRef = useRef(transformToResult);
  const onChangeRef = useRef(onChange);
  const isControlledRef = useRef(isControlled);
  transformResultRef.current = transformToResult;
  onChangeRef.current = onChange;
  isControlledRef.current = isControlled;

  const controlledOriginValue = useMemo(
    () =>
      transformToOrigin
        ? transformToOrigin(value)
        : (value as unknown as TOrigin),
    [value, transformToOrigin],
  );

  // 初始化非受控内部状态 (TOrigin)
  const [internalValue, setInternalValue] = useState<TOrigin>(() => {
    if (isControlled) {
      return controlledOriginValue;
    }
    const initVal =
      typeof defaultValue === 'function'
        ? (defaultValue as () => TResult)()
        : defaultValue;
    return transformToOrigin
      ? transformToOrigin(initVal)
      : (initVal as unknown as TOrigin);
  });

  // 受控值或受控模式变化时同步回退 state，避免之后切回非受控读取陈旧值
  const prevValueRef = useRef(value);
  const prevIsControlledRef = useRef(isControlled);
  if (
    isControlled &&
    (!prevIsControlledRef.current || !Object.is(prevValueRef.current, value))
  ) {
    setInternalValue(controlledOriginValue);
  }
  prevValueRef.current = value;
  prevIsControlledRef.current = isControlled;

  // 当前生效的内部值：受控模式直接使用受控值转换结果，非受控模式使用内部 state
  const mergedValue = isControlled ? controlledOriginValue : internalValue;

  const internalValueRef = useRef<TOrigin>(mergedValue);
  internalValueRef.current = mergedValue;

  const triggerChange = useCallback(
    (nextValue: TOrigin, ...args: ChangeArgs) => {
      if (!isControlledRef.current) {
        setInternalValue(nextValue);
      }
      internalValueRef.current = nextValue;

      if (onChangeRef.current) {
        const resultValue = transformResultRef.current
          ? transformResultRef.current(nextValue)
          : (nextValue as unknown as TResult);
        onChangeRef.current(resultValue, ...args);
      }
    },
    [],
  );

  const set = useCallback(
    (val: TOrigin | ((prev: TOrigin) => TOrigin), ...args: ChangeArgs) => {
      const nextValue =
        typeof val === 'function'
          ? (val as (prev: TOrigin) => TOrigin)(internalValueRef.current)
          : val;
      triggerChange(nextValue, ...args);
    },
    [triggerChange],
  );

  return [mergedValue, set] as const;
}
