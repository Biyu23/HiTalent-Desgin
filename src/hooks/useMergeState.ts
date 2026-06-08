import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMergeStateProps<TOrigin, TResult> {
  /**
   * 外部传入的值 (受控)
   */
  value?: TResult;

  /**
   * 默认初始值 (非受控)
   */
  defaultValue?: TResult;

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
  props: UseMergeStateProps<TOrigin, TResult>,
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

  // 判断是否为受控模式（使用 useRef 在首次渲染时记录，避免 StrictMode 双重 effect 误报）
  const isControlled = 'value' in props;

  // 在 effect 之外用 ref 记录初始状态，dev 环境检测模式切换
  const controlledRef = useRef<boolean | null>(null);
  if (controlledRef.current === null) {
    // 仅在首次渲染时记录（StrictMode 也不会重复执行 ref 初始化）
    controlledRef.current = isControlled;
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const currentlyControlled = 'value' in props;
      if (controlledRef.current !== currentlyControlled) {
        // console.warn(
        //   '[useMergeState] 组件在受控/非受控模式之间切换，React 不支持此行为。' +
        //     '请确保始终传入 value（受控）或始终不传 value（非受控）。',
        // );
        controlledRef.current = currentlyControlled;
      }
    }
  });

  // 使用 useRef 缓存转换函数，防止外部传入内联函数导致无意义的重渲染
  const transformOriginRef = useRef(transformToOrigin);
  const transformResultRef = useRef(transformToResult);
  transformOriginRef.current = transformToOrigin;
  transformResultRef.current = transformToResult;

  // 初始化内部状态 (TOrigin)
  const [internalValue, setInternalValue] = useState<TOrigin>(() => {
    const initVal = isControlled ? value : defaultValue;
    return transformOriginRef.current(initVal);
  });

  // 使用 useRef 跟踪最新内部值，解决闭包陷阱
  const internalValueRef = useRef<TOrigin>(internalValue);
  internalValueRef.current = internalValue;

  // 同步受控模式的外部值变化
  useEffect(() => {
    if (isControlled) {
      const nextInternalVal = transformOriginRef.current(value);
      setInternalValue(nextInternalVal);
      internalValueRef.current = nextInternalVal;
    }
  }, [value, isControlled]);

  // 核心触发器：更新内部状态并向外抛出事件
  const triggerChange = useCallback(
    (nextValue: TOrigin, ...args: any[]) => {
      // 1. 如果是非受控模式，内部才自己更新 State；受控模式下只触发 onChange 等待外部回传
      if (!isControlled) {
        setInternalValue(nextValue);
        internalValueRef.current = nextValue;
      }

      // 2. 触发 onChange，先将其转换为外部需要的格式 (TResult)
      if (onChange) {
        const resultValue = transformResultRef.current(nextValue);
        onChange(resultValue, ...args);
      }
    },
    [isControlled, onChange],
  );

  // ================= 暴露给组件使用的操作方法 =================

  // 1. 直接设置新值
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

  // 2. 合并对象属性 (应对表单/复杂配置场景)
  const merge = useCallback(
    (patch: Partial<TOrigin>, ...args: any[]) => {
      const current = internalValueRef.current;
      // 只有当前值是对象时才执行 merge，否则降级为覆盖
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

  // 3. 一键清空
  const clear = useCallback(
    (emptyValue?: TOrigin, ...args: any[]) => {
      // 允许传入自定义的空状态（比如空数组 []，空字符串 ''，或默认 undefined）
      triggerChange(emptyValue as TOrigin, ...args);
    },
    [triggerChange],
  );

  // 4. 刷新：不改变值的情况下重新触发 onChange 回调
  // 典型场景：表单重新验证、强制同步数据到外部
  const refresh = useCallback(
    (...args: any[]) => {
      triggerChange(internalValueRef.current, ...args);
    },
    [triggerChange],
  );

  // 返回元组：[当前内部值, 操作方法集合]
  return [internalValue, { set, merge, clear, refresh }] as const;
}
